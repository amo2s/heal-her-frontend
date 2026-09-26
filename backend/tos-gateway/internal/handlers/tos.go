// internal/handlers/tos.go
package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"tos-gateway/internal/models"
	"tos-gateway/internal/service"
)

// TOSHandler encapsulates the transport layer dependencies.
type TOSHandler struct {
	Orchestrator *service.Orchestrator
}

// NewTOSHandler creates a new instance of the TOSHandler.
func NewTOSHandler(orchestrator *service.Orchestrator) *TOSHandler {
	return &TOSHandler{Orchestrator: orchestrator}
}

// GenerateTOS handles the HTTP POST request to execute the TOS generation workflow.
func (h *TOSHandler) GenerateTOS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Extract cryptographically verified email from the zero-trust middleware context
	email, ok := r.Context().Value(EmailContextKey).(string)
	if !ok || email == "" {
		slog.Error("GenerateTOS failed: missing email in security context", "ip", r.RemoteAddr)
		http.Error(w, `{"error":"internal server error: missing security context"}`, http.StatusInternalServerError)
		return
	}

	// 2. Decode the incoming JSON payload with strict schema enforcement
	var payload models.SignaturePayload
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields() // Reject unmapped fields to prevent injection
	if err := decoder.Decode(&payload); err != nil {
		slog.Warn("GenerateTOS failed: malformed JSON payload", "ip", r.RemoteAddr, "error", err)
		http.Error(w, `{"error":"malformed or unexpected JSON payload"}`, http.StatusBadRequest)
		return
	}

	// 3. Execute conditional struct validation (Parental Consent Matrix)
	if err := models.Validate.Struct(payload); err != nil {
		slog.Warn("GenerateTOS failed: schema validation rejected", "ip", r.RemoteAddr, "error", err)
		http.Error(w, `{"error":"schema validation failed: verify parental consent constraints"}`, http.StatusUnprocessableEntity)
		return
	}

	// 4. Extract IP address for the audit ledger (populated by chi's RealIP middleware)
	ipAddress := r.RemoteAddr

	// 5. Dispatch validated data to the Orchestrator
	ledgerRecord, err := h.Orchestrator.ExecuteTOSWorkflow(r.Context(), payload, email, ipAddress)
	if err != nil {
		slog.Error("GenerateTOS workflow orchestration failed", "email", email, "error", err)
		http.Error(w, `{"error":"failed to generate and cryptographically secure TOS document"}`, http.StatusInternalServerError)
		return
	}

	// 6. Return successful execution metadata
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(ledgerRecord); err != nil {
		slog.Error("GenerateTOS response encoding failed", "error", err)
	}
}