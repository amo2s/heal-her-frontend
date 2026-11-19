package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/google/uuid"
	"heal-her/inquiries/internal/domain"
	"heal-her/inquiries/internal/mailer"
	"heal-her/inquiries/internal/middleware"
	"heal-her/inquiries/internal/repository"
	"heal-her/inquiries/internal/security"
)

// EmailEnqueuer abstracts the background mailer dispatch queue.
type EmailEnqueuer interface {
	Enqueue(job mailer.MailJob) bool
}

// DBPinger abstracts database connectivity checks for health endpoints.
type DBPinger interface {
	Ping(ctx context.Context) error
}

// IntakeHandler coordinates the intake lifecycle and health checks.
type IntakeHandler struct {
	repo   repository.InquiryRepository
	mailer EmailEnqueuer
	pinger DBPinger
}

// NewIntakeHandler constructs a new IntakeHandler instance.
func NewIntakeHandler(repo repository.InquiryRepository, mailer EmailEnqueuer, pinger DBPinger) *IntakeHandler {
	return &IntakeHandler{
		repo:   repo,
		mailer: mailer,
		pinger: pinger,
	}
}

// HandleIntake handles POST /api/v1/inquiries.
// It executes strict JSON decoding, honeypot mitigation, field validation, atomic persistence,
// and asynchronous confirmation email dispatch.
func (h *IntakeHandler) HandleIntake(w http.ResponseWriter, r *http.Request) {
	// 1. Strict JSON Decoding with Unknown-Field Rejection and EOF Verification
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var req domain.CreateInquiryRequest
	if err := dec.Decode(&req); err != nil {
		if middleware.HandleMaxBytesError(err) {
			RenderError(w, http.StatusRequestEntityTooLarge, "Request payload exceeds maximum allowed size of 16 KB")
			return
		}
		RenderError(w, http.StatusBadRequest, "Invalid JSON payload or unknown properties detected")
		return
	}

	// Verify stream has reached EOF (no trailing secondary JSON objects or garbage bytes)
	var trailingCheck json.RawMessage
	if err := dec.Decode(&trailingCheck); !errors.Is(err, io.EOF) {
		RenderError(w, http.StatusBadRequest, "Malformed payload: trailing data detected after JSON object")
		return
	}

	clientIP := security.ExtractClientIP(r)

	// 2. Silent Honeypot Trap
	// If the hidden 'website' field is populated, silently drop without DB or mailer activity.
	if security.IsHoneypotTriggered(req.Website) {
		slog.Warn("honeypot_triggered",
			"event", "bot_trap_intercepted",
			"client_ip", clientIP,
		)

		fakeID := uuid.New()
		RenderSuccess(w, http.StatusCreated, domain.CreateInquiryResponse{
			Status:        "success",
			InquiryID:     fakeID,
			ReferenceCode: domain.DeriveReferenceCode(fakeID),
			TicketStatus:  domain.StatusOpen,
			Message:       "Your inquiry has been securely received. A confirmation has been dispatched to your email.",
		})
		return
	}

	// 3. Strict Field Validation & Injection Neutralization
	sanitized, validationErrs := security.SanitizeAndValidate(req)
	if len(validationErrs) > 0 {
		RenderValidationErrors(w, validationErrs)
		return
	}

	// 4. Atomic PostgreSQL Persistence
	inquiry, msg, err := h.repo.CreateInquiryWithInitialMessage(r.Context(), repository.CreateInquiryParams{
		FullName:     sanitized.Name,
		Organization: sanitized.Org,
		Email:        sanitized.Email,
		Subject:      sanitized.Subject,
		Message:      sanitized.Message,
		IPAddress:    &clientIP,
	})
	if err != nil {
		slog.Error("failed to persist contact inquiry transaction",
			"error", err,
			"client_ip", clientIP,
		)
		RenderError(w, http.StatusInternalServerError, "Failed to persist inquiry. Please try again later.")
		return
	}

	referenceCode := domain.DeriveReferenceCode(inquiry.ID)

	// 5. Non-Blocking Confirmation Email Dispatch
	if h.mailer != nil {
		h.mailer.Enqueue(mailer.MailJob{
			MessageID:    msg.ID,
			Recipient:    sanitized.Email,
			Subject:      sanitized.Subject,
			FullName:     sanitized.Name,
			Organization: sanitized.Org,
			ReferenceID:  referenceCode,
		})
	}

	// 6. Return Structured HTTP 201 Created Response
	RenderSuccess(w, http.StatusCreated, domain.CreateInquiryResponse{
		Status:        "success",
		InquiryID:     inquiry.ID,
		ReferenceCode: referenceCode,
		TicketStatus:  inquiry.Status,
		Message:       "Your inquiry has been securely received. A confirmation has been dispatched to your email.",
	})
}

// HandleHealth checks database connectivity and returns service status.
func (h *IntakeHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	if h.pinger == nil {
		RenderSuccess(w, http.StatusOK, map[string]string{
			"status":    "ok",
			"service":   "inquiries",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
		return
	}

	pingCtx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := h.pinger.Ping(pingCtx); err != nil {
		slog.Error("health check failed: database ping error", "error", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status":  "degraded",
			"service": "inquiries",
			"error":   "database unavailable",
		})
		return
	}

	RenderSuccess(w, http.StatusOK, map[string]string{
		"status":    "ok",
		"service":   "inquiries",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}
