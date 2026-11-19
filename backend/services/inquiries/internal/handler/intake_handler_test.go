package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"heal-her/inquiries/internal/domain"
	"heal-her/inquiries/internal/mailer"
	"heal-her/inquiries/internal/repository"
)

type mockRepo struct {
	mu           sync.Mutex
	createCalls  int
	createParams repository.CreateInquiryParams
	shouldFail   bool
}

func (m *mockRepo) CreateInquiryWithInitialMessage(ctx context.Context, params repository.CreateInquiryParams) (*domain.ContactInquiry, *domain.InquiryMessage, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.createCalls++
	m.createParams = params

	if m.shouldFail {
		return nil, nil, errors.New("simulated database failure: connection refused")
	}

	id := uuid.New()
	msgID := uuid.New()
	now := time.Now().UTC()

	return &domain.ContactInquiry{
			ID:           id,
			FullName:     params.FullName,
			Organization: params.Organization,
			Email:        params.Email,
			Subject:      params.Subject,
			Status:       domain.StatusOpen,
			IPAddress:    params.IPAddress,
			CreatedAt:    now,
			UpdatedAt:    now,
		}, &domain.InquiryMessage{
			ID:              msgID,
			InquiryID:       id,
			SenderType:      domain.SenderTypeUser,
			SenderName:      params.FullName,
			Body:            params.Message,
			EmailDispatched: false,
			CreatedAt:       now,
		}, nil
}

func (m *mockRepo) MarkMessageEmailDispatched(ctx context.Context, messageID uuid.UUID) error {
	return nil
}

type mockMailer struct {
	mu       sync.Mutex
	enqueued []mailer.MailJob
}

func (m *mockMailer) Enqueue(job mailer.MailJob) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.enqueued = append(m.enqueued, job)
	return true
}

type mockPinger struct {
	shouldFail bool
}

func (p *mockPinger) Ping(ctx context.Context) error {
	if p.shouldFail {
		return errors.New("db down")
	}
	return nil
}

func TestIntakeHandler_HandleIntake(t *testing.T) {
	validBody := map[string]string{
		"name":    "Eleanor Roosevelt",
		"org":     "United Nations Outreach",
		"email":   "eleanor@un.org",
		"subject": "Adolescent Health Support Initiative",
		"message": "We would like to establish an official institutional partnership for regional schools.",
	}

	t.Run("valid submission succeeds with 201, commits to DB and enqueues email", func(t *testing.T) {
		repo := &mockRepo{}
		mailerMock := &mockMailer{}
		pinger := &mockPinger{}
		h := NewIntakeHandler(repo, mailerMock, pinger)

		bodyBytes, _ := json.Marshal(validBody)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		h.HandleIntake(rr, req)

		if rr.Code != http.StatusCreated {
			t.Fatalf("expected 201 Created, got: %d (body: %s)", rr.Code, rr.Body.String())
		}

		var resp domain.CreateInquiryResponse
		if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if resp.Status != "success" || resp.TicketStatus != "OPEN" {
			t.Errorf("unexpected response status: %+v", resp)
		}
		if !strings.HasPrefix(resp.ReferenceCode, "REF-") {
			t.Errorf("invalid reference code: %s", resp.ReferenceCode)
		}

		if repo.createCalls != 1 {
			t.Errorf("expected 1 repo call, got: %d", repo.createCalls)
		}

		if len(mailerMock.enqueued) != 1 {
			t.Errorf("expected 1 mailer enqueue, got: %d", len(mailerMock.enqueued))
		}
	})

	t.Run("silent honeypot returns 201 with zero DB and zero mailer calls", func(t *testing.T) {
		repo := &mockRepo{}
		mailerMock := &mockMailer{}
		pinger := &mockPinger{}
		h := NewIntakeHandler(repo, mailerMock, pinger)

		botBody := map[string]string{
			"name":    "Bot Name",
			"org":     "Bot Org",
			"email":   "bot@spam.com",
			"subject": "Spam Subject",
			"message": "Visit our casino at example.com right now!",
			"website": "http://spambot-trap.com",
		}

		bodyBytes, _ := json.Marshal(botBody)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		h.HandleIntake(rr, req)

		if rr.Code != http.StatusCreated {
			t.Fatalf("expected 201 Created for honeypot, got: %d", rr.Code)
		}

		var resp domain.CreateInquiryResponse
		_ = json.Unmarshal(rr.Body.Bytes(), &resp)
		if resp.Status != "success" || resp.TicketStatus != "OPEN" {
			t.Errorf("expected convincing success response, got: %+v", resp)
		}

		// Ensure ZERO database and ZERO mailer interactions took place
		if repo.createCalls != 0 {
			t.Errorf("expected 0 repo calls for honeypot bot, got %d", repo.createCalls)
		}
		if len(mailerMock.enqueued) != 0 {
			t.Errorf("expected 0 mailer dispatches for honeypot bot, got %d", len(mailerMock.enqueued))
		}
	})

	t.Run("unknown JSON property rejected with 400 Bad Request", func(t *testing.T) {
		repo := &mockRepo{}
		h := NewIntakeHandler(repo, nil, nil)

		unknownFieldBody := map[string]interface{}{
			"name":            "Jane Doe",
			"org":             "Acme",
			"email":           "jane@example.com",
			"subject":         "Topic",
			"message":         "Message body for testing purposes.",
			"injected_field":  "malicious payload",
		}

		bodyBytes, _ := json.Marshal(unknownFieldBody)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		h.HandleIntake(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("expected 400 Bad Request for unknown fields, got: %d", rr.Code)
		}
	})

	t.Run("trailing data after JSON object rejected with 400 Bad Request", func(t *testing.T) {
		repo := &mockRepo{}
		h := NewIntakeHandler(repo, nil, nil)

		payload := `{"name":"Jane Doe","org":"Acme","email":"jane@example.com","subject":"Topic","message":"Message body long enough."}{"secondary":"object"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", strings.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		h.HandleIntake(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("expected 400 for trailing data, got: %d", rr.Code)
		}
	})

	t.Run("validation failure returns 422 with field errors", func(t *testing.T) {
		repo := &mockRepo{}
		h := NewIntakeHandler(repo, nil, nil)

		invalidBody := map[string]string{
			"name":    "A", // Too short
			"org":     "Acme",
			"email":   "not-an-email", // Malformed
			"subject": "Hi",           // Too short
			"message": "Short",        // Too short (<10)
		}

		bodyBytes, _ := json.Marshal(invalidBody)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()

		h.HandleIntake(rr, req)

		if rr.Code != http.StatusUnprocessableEntity {
			t.Errorf("expected 422 Unprocessable Entity, got: %d", rr.Code)
		}

		var errResp StandardErrorResponse
		_ = json.Unmarshal(rr.Body.Bytes(), &errResp)
		if len(errResp.Errors) == 0 {
			t.Error("expected non-empty errors map in 422 response")
		}
	})
}

func TestIntakeHandler_HandleHealth(t *testing.T) {
	t.Run("returns 200 OK when database ping succeeds", func(t *testing.T) {
		h := NewIntakeHandler(nil, nil, &mockPinger{shouldFail: false})
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rr := httptest.NewRecorder()

		h.HandleHealth(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got: %d", rr.Code)
		}
	})

	t.Run("returns 503 Service Unavailable when database ping fails", func(t *testing.T) {
		h := NewIntakeHandler(nil, nil, &mockPinger{shouldFail: true})
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rr := httptest.NewRecorder()

		h.HandleHealth(rr, req)

		if rr.Code != http.StatusServiceUnavailable {
			t.Errorf("expected 503 Service Unavailable, got: %d", rr.Code)
		}
	})
}
