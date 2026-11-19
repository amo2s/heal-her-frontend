package handler

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"heal-her/inquiries/internal/domain"
	"heal-her/inquiries/internal/mailer"
	"heal-her/inquiries/internal/middleware"
	"heal-her/inquiries/internal/repository"
	"heal-her/inquiries/internal/security"
)

// ManagementHandler coordinates administrative operations.
type ManagementHandler struct {
	repo   repository.InquiryRepository
	mailer EmailEnqueuer
}

// NewManagementHandler constructs a new ManagementHandler.
func NewManagementHandler(repo repository.InquiryRepository, mailer EmailEnqueuer) *ManagementHandler {
	return &ManagementHandler{
		repo:   repo,
		mailer: mailer,
	}
}

// GetStats handles GET /api/v1/inquiries/stats.
func (h *ManagementHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.repo.GetInquiryStats(r.Context())
	if err != nil {
		slog.Error("failed to retrieve inquiry statistics", "error", err)
		RenderError(w, http.StatusInternalServerError, "Failed to retrieve executive statistics")
		return
	}

	RenderSuccess(w, http.StatusOK, stats)
}

// ListInquiries handles GET /api/v1/inquiries.
func (h *ManagementHandler) ListInquiries(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	rawStatus := q.Get("status")
	rawLimit := q.Get("limit")
	rawOffset := q.Get("offset")
	rawSearch := q.Get("search")

	status, limit, offset, search, err := security.ValidateListParams(rawStatus, rawLimit, rawOffset, rawSearch)
	if err != nil {
		RenderError(w, http.StatusBadRequest, err.Error())
		return
	}

	summaries, total, err := h.repo.ListInquiries(r.Context(), repository.ListInquiriesFilter{
		Status: status,
		Search: search,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		slog.Error("failed to list inquiries", "error", err)
		RenderError(w, http.StatusInternalServerError, "Failed to retrieve inquiries inbox")
		return
	}

	hasMore := (offset + len(summaries)) < total

	RenderSuccess(w, http.StatusOK, domain.InquiryListResponse{
		Status: "success",
		Data:   summaries,
		Pagination: domain.PaginationMeta{
			Total:   total,
			Limit:   limit,
			Offset:  offset,
			HasMore: hasMore,
		},
	})
}

// GetInquiry handles GET /api/v1/inquiries/{id}.
func (h *ManagementHandler) GetInquiry(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	inquiryID, err := uuid.Parse(idStr)
	if err != nil {
		RenderError(w, http.StatusBadRequest, "Invalid inquiry UUID parameter format")
		return
	}

	inquiry, messages, err := h.repo.GetInquiryDetail(r.Context(), inquiryID)
	if err != nil {
		if errors.Is(err, domain.ErrInquiryNotFound) {
			RenderError(w, http.StatusNotFound, "Inquiry ticket not found")
			return
		}
		slog.Error("failed to retrieve inquiry detail", "inquiry_id", inquiryID, "error", err)
		RenderError(w, http.StatusInternalServerError, "Failed to retrieve inquiry ticket")
		return
	}

	RenderSuccess(w, http.StatusOK, domain.InquiryDetailResponse{
		Status:        "success",
		Inquiry:       *inquiry,
		ReferenceCode: domain.DeriveReferenceCode(inquiry.ID),
		Messages:      messages,
	})
}

// CreateReply handles POST /api/v1/inquiries/{id}/reply.
func (h *ManagementHandler) CreateReply(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	inquiryID, err := uuid.Parse(idStr)
	if err != nil {
		RenderError(w, http.StatusBadRequest, "Invalid inquiry UUID parameter format")
		return
	}

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var req domain.StaffReplyRequest
	if err := dec.Decode(&req); err != nil {
		if middleware.HandleMaxBytesError(err) {
			RenderError(w, http.StatusRequestEntityTooLarge, "Request payload exceeds maximum allowed size of 16 KB")
			return
		}
		RenderError(w, http.StatusBadRequest, "Invalid JSON payload or unknown properties detected")
		return
	}

	var trailingCheck json.RawMessage
	if err := dec.Decode(&trailingCheck); !errors.Is(err, io.EOF) {
		RenderError(w, http.StatusBadRequest, "Malformed payload: trailing data detected after JSON object")
		return
	}

	cleanBody, validationErrs := security.ValidateAndSanitizeReply(req.Body)
	if len(validationErrs) > 0 {
		RenderValidationErrors(w, validationErrs)
		return
	}

	actor, _ := middleware.ActorFromContext(r.Context())
	senderName := "Heal Her Support"
	var senderID uuid.UUID
	if actor != nil {
		senderID = actor.UserID
		if actor.FirstName != "" {
			senderName = actor.FirstName
		}
	}

	msg, inquiry, err := h.repo.CreateStaffReply(r.Context(), repository.CreateStaffReplyParams{
		InquiryID:  inquiryID,
		SenderID:   senderID,
		SenderName: senderName,
		Body:       cleanBody,
	})
	if err != nil {
		if errors.Is(err, domain.ErrInquiryNotFound) {
			RenderError(w, http.StatusNotFound, "Inquiry ticket not found")
			return
		}
		if errors.Is(err, domain.ErrInquiryClosed) {
			RenderError(w, http.StatusConflict, "Cannot reply to a closed inquiry ticket; please reopen the ticket first")
			return
		}
		slog.Error("failed to create staff reply", "inquiry_id", inquiryID, "error", err)
		RenderError(w, http.StatusInternalServerError, "Failed to record staff reply")
		return
	}

	refCode := domain.DeriveReferenceCode(inquiry.ID)

	if h.mailer != nil {
		h.mailer.Enqueue(mailer.MailJob{
			Kind:         mailer.JobKindStaffReply,
			MessageID:    msg.ID,
			Recipient:    inquiry.Email,
			Subject:      inquiry.Subject,
			FullName:     inquiry.FullName,
			StaffName:    senderName,
			ReferenceID:  refCode,
			ReplyBody:    cleanBody,
		})
	}

	if actor != nil {
		slog.Info("staff_reply_dispatched",
			"inquiry_id", inquiryID,
			"message_id", msg.ID,
			"actor_id", actor.UserID,
			"actor_role", actor.Role,
		)
	}

	RenderSuccess(w, http.StatusCreated, map[string]interface{}{
		"status":  "success",
		"message": "Staff reply recorded and queued for email dispatch",
		"data":    msg,
	})
}

// UpdateStatus handles PATCH /api/v1/inquiries/{id}/status.
func (h *ManagementHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	inquiryID, err := uuid.Parse(idStr)
	if err != nil {
		RenderError(w, http.StatusBadRequest, "Invalid inquiry UUID parameter format")
		return
	}

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var req domain.StatusUpdateRequest
	if err := dec.Decode(&req); err != nil {
		if middleware.HandleMaxBytesError(err) {
			RenderError(w, http.StatusRequestEntityTooLarge, "Request payload exceeds maximum allowed size of 16 KB")
			return
		}
		RenderError(w, http.StatusBadRequest, "Invalid JSON payload or unknown properties detected")
		return
	}

	var trailingCheck json.RawMessage
	if err := dec.Decode(&trailingCheck); !errors.Is(err, io.EOF) {
		RenderError(w, http.StatusBadRequest, "Malformed payload: trailing data detected after JSON object")
		return
	}

	newStatus, validationErrs := security.ValidateStatus(req.Status)
	if len(validationErrs) > 0 {
		RenderValidationErrors(w, validationErrs)
		return
	}

	updatedInquiry, err := h.repo.UpdateInquiryStatus(r.Context(), inquiryID, newStatus)
	if err != nil {
		if errors.Is(err, domain.ErrInquiryNotFound) {
			RenderError(w, http.StatusNotFound, "Inquiry ticket not found")
			return
		}
		slog.Error("failed to update inquiry status", "inquiry_id", inquiryID, "error", err)
		RenderError(w, http.StatusInternalServerError, "Failed to update ticket status")
		return
	}

	if actor, ok := middleware.ActorFromContext(r.Context()); ok && actor != nil {
		slog.Info("inquiry_status_updated",
			"inquiry_id", inquiryID,
			"actor_id", actor.UserID,
			"actor_role", actor.Role,
			"new_status", newStatus,
		)
	}

	RenderSuccess(w, http.StatusOK, map[string]interface{}{
		"status":  "success",
		"message": "Ticket status updated successfully",
		"data":    updatedInquiry,
	})
}
