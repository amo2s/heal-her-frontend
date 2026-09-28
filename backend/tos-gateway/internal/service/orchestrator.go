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

	"tos-gateway/internal/mailer"
	"tos-gateway/internal/models"
	"tos-gateway/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// Orchestrator coordinates the complex, multi-system TOS execution workflow.
type Orchestrator struct {
	repo         *repository.Queries
	mailer       *mailer.Mailer
	httpClient   *http.Client
	pythonSvcURL string
	supabaseURL  string
	supabaseKey  string
}

// NewOrchestrator initializes the service with strict timeouts to prevent resource exhaustion.
func NewOrchestrator(repo *repository.Queries, mailerSvc *mailer.Mailer) *Orchestrator {
	return &Orchestrator{
		repo:   repo,
		mailer: mailerSvc,
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
	// 1. Generate the deterministic Request ID first so it can be embedded in the PDF
	requestID := uuid.New()

	// 2. Dispatch enriched payload to the isolated Python rendering worker
	pdfBytes, documentHash, err := o.requestRendering(ctx, payload, email, requestID)
	if err != nil {
		return nil, fmt.Errorf("rendering engine failure: %w", err)
	}

	// 3. Generate a deterministic storage path to prevent collisions
	storagePath := fmt.Sprintf("%s/%s.pdf", email, requestID.String())

	// 4. Upload the strictly locked PDF to the Supabase WORM bucket
	if err := o.uploadToStorage(ctx, storagePath, pdfBytes); err != nil {
		return nil, fmt.Errorf("storage persistence failure: %w", err)
	}

	// 5. Commit the cryptographic proof and metadata to the PostgreSQL ledger
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
		return nil, fmt.Errorf("ledger commit failure: %w", err)
	}

	// 6. Asynchronous Email Dispatch
	// Execute in a detached goroutine so the HTTP response returns immediately to the frontend.
	go o.dispatchEmailAsync(email, payload.ClientName, storagePath)

	return &ledgerRecord, nil
}

func (o *Orchestrator) dispatchEmailAsync(email, clientName, storagePath string) {
	// Construct the deterministic WORM download URL for the email CTA
	documentURL := fmt.Sprintf("%s/storage/v1/object/public/tos-documents/%s", o.supabaseURL, storagePath)

	// Create a fresh detached context with a hard 10-second deadline. 
	// Do NOT reuse the HTTP request context, as it cancels when the HTTP response is sent.
	timeoutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := o.mailer.SendTOSSuccessEmail(timeoutCtx, email, clientName, documentURL); err != nil {
		// Log infrastructure failure without interrupting the primary TOS execution flow
		fmt.Printf("[ORCHESTRATOR] Background email dispatch failed for %s: %v\n", email, err)
	} else {
		fmt.Printf("[ORCHESTRATOR] TOS success email dispatched to %s\n", email)
	}
}

func (o *Orchestrator) requestRendering(ctx context.Context, payload models.SignaturePayload, email string, requestID uuid.UUID) ([]byte, string, error) {
	// Construct the enriched payload mapping exactly to the Python Pydantic schema
	enrichedPayload := struct {
		ClientName        string  `json:"clientName"`
		ClientEmail       string  `json:"clientEmail"`
		RequestID         string  `json:"requestId"`
		IsParentalConsent bool    `json:"isParentalConsent"`
		MinorName         *string `json:"minorName"`
		MinorAge          *int    `json:"minorAge"`
	}{
		ClientName:        payload.ClientName,
		ClientEmail:       email,
		RequestID:         requestID.String(),
		IsParentalConsent: payload.IsParentalConsent,
		MinorName:         payload.MinorName,
		MinorAge:          payload.MinorAge,
	}

	body, err := json.Marshal(enrichedPayload)
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
	url := fmt.Sprintf("%s/storage/v1/object/tos-documents/%s", o.supabaseURL, path)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+o.supabaseKey)
	req.Header.Set("Content-Type", "application/pdf")
	req.Header.Set("x-upsert", "false")

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