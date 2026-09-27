// internal/service/orchestrator.go
package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"tos-gateway/internal/models"
	"tos-gateway/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// Orchestrator coordinates the complex, multi-system TOS execution workflow.
type Orchestrator struct {
	repo         *repository.Queries
	httpClient   *http.Client
	pythonSvcURL string
	supabaseURL  string
	supabaseKey  string
}

// NewOrchestrator initializes the service with strict timeouts to prevent resource exhaustion.
func NewOrchestrator(repo *repository.Queries) *Orchestrator {
	return &Orchestrator{
		repo: repo,
		httpClient: &http.Client{
			Timeout: 15 * time.Second, // Bounded execution window for rendering and network transit
		},
		pythonSvcURL: os.Getenv("PYTHON_RENDERER_URL"),
		supabaseURL:  os.Getenv("SUPABASE_URL"),
		supabaseKey:  os.Getenv("SUPABASE_SERVICE_ROLE_KEY"), // Required for RLS bypass on INSERT
	}
}

// ExecuteTOSWorkflow drives the phase 2.3 orchestration pipeline.
func (o *Orchestrator) ExecuteTOSWorkflow(ctx context.Context, payload models.SignaturePayload, email, ipAddress string) (*repository.TosAuditLedger, error) {
	// 1. Dispatch payload to the isolated Python rendering worker
	pdfBytes, documentHash, err := o.requestRendering(ctx, payload)
	if err != nil {
		return nil, fmt.Errorf("rendering engine failure: %w", err)
	}

	// 2. Generate a deterministic storage path to prevent collisions
	requestID := uuid.New()
	storagePath := fmt.Sprintf("%s/%s.pdf", email, requestID.String())

	// 3. Upload the strictly locked PDF to the Supabase WORM bucket
	if err := o.uploadToStorage(ctx, storagePath, pdfBytes); err != nil {
		return nil, fmt.Errorf("storage persistence failure: %w", err)
	}

	// 4. Commit the cryptographic proof and metadata to the PostgreSQL ledger
	minorName := pgtype.Text{Valid: false}
	if payload.MinorName != nil {
		minorName = pgtype.Text{String: *payload.MinorName, Valid: true}
	}

	minorAge := pgtype.Int4{Valid: false}
	if payload.MinorAge != nil {
		minorAge = pgtype.Int4{Int32: int32(*payload.MinorAge), Valid: true}
	}

	insertParams := repository.CreateAuditRecordParams{
		RequestID:         pgtype.UUID{Bytes: requestID, Valid: true},
		ClientName:        payload.ClientName,
		ClientEmail:       email,
		IsParentalConsent: payload.IsParentalConsent,
		MinorName:         minorName,
		MinorAge:          minorAge,
		IpAddress:         ipAddress,
		Sha512Hash:        documentHash,
		StoragePath:       storagePath,
	}

	ledgerRecord, err := o.repo.CreateAuditRecord(ctx, insertParams)
	if err != nil {
		// Note: A true transactional distributed saga would attempt to rollback the storage upload here.
		// Given WORM constraints and the storage path uniqueness, an orphaned file is acceptable over complexity.
		return nil, fmt.Errorf("ledger commit failure: %w", err)
	}

	return &ledgerRecord, nil
}

func (o *Orchestrator) requestRendering(ctx context.Context, payload models.SignaturePayload) ([]byte, string, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, "", fmt.Errorf("failed to encode rendering payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, o.pythonSvcURL+"/api/v1/render", bytes.NewReader(body))
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := o.httpClient.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("rendering engine returned non-200 status: %d", res.StatusCode)
	}

	hash := res.Header.Get("X-Document-Hash")
	if hash == "" {
		return nil, "", fmt.Errorf("rendering engine failed to return cryptographic hash header")
	}

	pdfBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read rendered PDF stream: %w", err)
	}

	return pdfBytes, hash, nil
}

func (o *Orchestrator) uploadToStorage(ctx context.Context, path string, data []byte) error {
	// Construct the Supabase Storage REST API endpoint
	// Blueprint references bucket: tos-documents
	url := fmt.Sprintf("%s/storage/v1/object/tos-documents/%s", o.supabaseURL, path)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+o.supabaseKey)
	req.Header.Set("Content-Type", "application/pdf")
	req.Header.Set("x-upsert", "false") // Enforce WORM: do not overwrite existing files

	res, err := o.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(res.Body)
		return fmt.Errorf("supabase storage rejected upload (status %d): %s", res.StatusCode, string(respBody))
	}

	return nil
}
