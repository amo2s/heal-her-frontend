package mailer

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"heal-her/inquiries/internal/domain"
	"heal-her/inquiries/internal/repository"
)

type mockRepository struct {
	mu            sync.Mutex
	dispatchedIDs []uuid.UUID
}

func (m *mockRepository) CreateInquiryWithInitialMessage(ctx context.Context, params repository.CreateInquiryParams) (*domain.ContactInquiry, *domain.InquiryMessage, error) {
	return nil, nil, nil
}

func (m *mockRepository) MarkMessageEmailDispatched(ctx context.Context, messageID uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.dispatchedIDs = append(m.dispatchedIDs, messageID)
	return nil
}

func TestRenderConfirmationEmail_XSSProtection(t *testing.T) {
	maliciousData := ConfirmationEmailData{
		FullName:     `<script>alert("hacked name")</script>`,
		Organization: `Acme Corp <img src=x onerror=alert(1)>`,
		Subject:      `Inquiry & "special" 'quotes' <test>`,
		ReferenceID:  "REF-12345678",
	}

	html, err := RenderConfirmationEmail(maliciousData)
	if err != nil {
		t.Fatalf("failed to render confirmation template: %v", err)
	}

	// Verify that raw script tags and onerror attributes are strictly neutralized
	if strings.Contains(html, "<script>") || strings.Contains(html, "</script>") {
		t.Errorf("rendered HTML contains unescaped <script> tag: %s", html)
	}

	if strings.Contains(html, "<img src=x") {
		t.Errorf("rendered HTML contains unescaped <img> tag: %s", html)
	}

	// Verify properly escaped entity representations
	if !strings.Contains(html, "&lt;script&gt;") {
		t.Errorf("expected &lt;script&gt; in rendered HTML")
	}

	if !strings.Contains(html, "&amp;") {
		t.Errorf("expected &amp; in rendered HTML for ampersand")
	}

	if !strings.Contains(html, "REF-12345678") {
		t.Errorf("missing reference ID in rendered HTML")
	}
}

func TestMailer_RelayWith302RedirectAndDispatchedCallback(t *testing.T) {
	var receivedPayload googleAppsScriptPayload
	var mu sync.Mutex
	var redirectHit, finalHit bool

	// Simulates Google Apps Script 302 Found redirect flow
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()

		if r.URL.Path == "/initial-entry" {
			redirectHit = true
			defer r.Body.Close()
			_ = json.NewDecoder(r.Body).Decode(&receivedPayload)
			// Redirect to target script execution URL via 302 Found
			http.Redirect(w, r, "/final-exec", http.StatusFound)
			return
		}

		if r.URL.Path == "/final-exec" {
			finalHit = true
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"status":"success"}`))
			return
		}

		http.NotFound(w, r)
	}))
	defer ts.Close()

	mockRepo := &mockRepository{}
	mailer := NewMailer(ts.URL+"/initial-entry", 2, 10, mockRepo)
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = mailer.Shutdown(ctx)
	}()

	msgID := uuid.New()
	job := MailJob{
		MessageID:    msgID,
		Recipient:    "director@school.edu",
		Subject:      "Partnership Program",
		FullName:     "Dr. Elizabeth Vance",
		Organization: "Oakridge Academy",
		ReferenceID:  "REF-A1B2C3D4",
	}

	enqueued := mailer.Enqueue(job)
	if !enqueued {
		t.Fatal("failed to enqueue mail job")
	}

	// Allow worker goroutine to process the job
	time.Sleep(300 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()

	if !redirectHit {
		t.Error("expected 302 redirect entrypoint to be visited")
	}
	if !finalHit {
		t.Error("expected final redirect destination /final-exec to receive payload")
	}

	if receivedPayload.Recipient != "director@school.edu" {
		t.Errorf("expected recipient 'director@school.edu', got: %s", receivedPayload.Recipient)
	}

	if !strings.Contains(receivedPayload.Subject, "REF-A1B2C3D4") {
		t.Errorf("expected subject to contain reference code, got: %s", receivedPayload.Subject)
	}

	if !strings.Contains(receivedPayload.HTMLBody, "Dr. Elizabeth Vance") {
		t.Errorf("expected HTML body to contain full name")
	}

	// Verify database dispatch callback
	mockRepo.mu.Lock()
	defer mockRepo.mu.Unlock()

	if len(mockRepo.dispatchedIDs) != 1 || mockRepo.dispatchedIDs[0] != msgID {
		t.Errorf("expected MarkMessageEmailDispatched to be called for %s, got: %v", msgID, mockRepo.dispatchedIDs)
	}
}
