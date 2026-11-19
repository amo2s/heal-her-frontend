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

func (m *mockRepository) ListInquiries(ctx context.Context, filter repository.ListInquiriesFilter) ([]domain.InquirySummary, int, error) {
	return nil, 0, nil
}

func (m *mockRepository) GetInquiryDetail(ctx context.Context, id uuid.UUID) (*domain.ContactInquiry, []domain.InquiryMessage, error) {
	return nil, nil, nil
}

func (m *mockRepository) GetInquiryStats(ctx context.Context) (*domain.InquiryStatsResponse, error) {
	return nil, nil
}

func (m *mockRepository) CreateStaffReply(ctx context.Context, params repository.CreateStaffReplyParams) (*domain.InquiryMessage, *domain.ContactInquiry, error) {
	return nil, nil, nil
}

func (m *mockRepository) UpdateInquiryStatus(ctx context.Context, id uuid.UUID, newStatus string) (*domain.ContactInquiry, error) {
	return nil, nil
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

	if strings.Contains(html, "<script>") || strings.Contains(html, "</script>") {
		t.Errorf("rendered HTML contains unescaped <script> tag: %s", html)
	}

	if strings.Contains(html, "<img src=x") {
		t.Errorf("rendered HTML contains unescaped <img> tag: %s", html)
	}

	if !strings.Contains(html, "&lt;script&gt;") {
		t.Errorf("expected &lt;script&gt; in rendered HTML")
	}

	if !strings.Contains(html, "REF-12345678") {
		t.Errorf("missing reference ID in rendered HTML")
	}
}

func TestRenderStaffReplyEmail_XSSProtection(t *testing.T) {
	maliciousData := StaffReplyEmailData{
		RecipientName: `Jane <script>alert("victim")</script>`,
		StaffName:     `Staff <b onmouseover=alert(1)>Admin</b>`,
		Subject:       `Help <svg onload=alert(1)>`,
		ReferenceID:   "REF-87654321",
		ReplyBody:     "Paragraph 1\n\n<script>maliciousCode()</script>\n\nParagraph 2 & safe",
	}

	html, err := RenderStaffReplyEmail(maliciousData)
	if err != nil {
		t.Fatalf("failed to render staff reply template: %v", err)
	}

	if strings.Contains(html, "<script>") || strings.Contains(html, "</script>") {
		t.Errorf("rendered staff reply contains unescaped <script> tag: %s", html)
	}

	if strings.Contains(html, "<svg onload") {
		t.Errorf("rendered staff reply contains unescaped <svg> tag: %s", html)
	}

	if !strings.Contains(html, "&lt;script&gt;maliciousCode()&lt;/script&gt;") {
		t.Errorf("expected escaped script in reply body")
	}

	if !strings.Contains(html, "REF-87654321") {
		t.Errorf("missing reference ID in rendered staff reply HTML")
	}
}

func TestFormatStaffReplySubject(t *testing.T) {
	tests := []struct {
		inputSubject string
		refID        string
		expected     string
	}{
		{
			inputSubject: "Partnership Program",
			refID:        "REF-12345678",
			expected:     "Re: Partnership Program [REF-12345678]",
		},
		{
			inputSubject: "Re: Re:  re: Deployment in Schools",
			refID:        "REF-ABCD1234",
			expected:     "Re: Deployment in Schools [REF-ABCD1234]",
		},
		{
			inputSubject: "Support Request\r\nInjected",
			refID:        "REF-99999999",
			expected:     "Re: Support RequestInjected [REF-99999999]",
		},
	}

	for _, tt := range tests {
		got := FormatStaffReplySubject(tt.inputSubject, tt.refID)
		if got != tt.expected {
			t.Errorf("FormatStaffReplySubject(%q, %q) = %q, expected %q", tt.inputSubject, tt.refID, got, tt.expected)
		}
	}
}

func TestMailer_StaffReplyRelayWith302RedirectAndDispatchedCallback(t *testing.T) {
	var receivedPayload googleAppsScriptPayload
	var mu sync.Mutex
	var redirectHit, finalHit bool

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()

		if r.URL.Path == "/initial-entry" {
			redirectHit = true
			defer r.Body.Close()
			_ = json.NewDecoder(r.Body).Decode(&receivedPayload)
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
		Kind:         JobKindStaffReply,
		MessageID:    msgID,
		Recipient:    "requester@domain.com",
		Subject:      "Re: School Health Workshop",
		FullName:     "Principal Skinner",
		StaffName:    "Nurse Sarah",
		ReferenceID:  "REF-A1B2C3D4",
		ReplyBody:    "We are scheduling the workshop for next Tuesday.\n\nThank you for your collaboration.",
	}

	if !mailer.Enqueue(job) {
		t.Fatal("failed to enqueue staff reply mail job")
	}

	time.Sleep(300 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()

	if !redirectHit || !finalHit {
		t.Errorf("expected redirectHit and finalHit to both be true, got redirect=%v, final=%v", redirectHit, finalHit)
	}

	if receivedPayload.Recipient != "requester@domain.com" {
		t.Errorf("expected recipient 'requester@domain.com', got: %s", receivedPayload.Recipient)
	}

	if receivedPayload.Subject != "Re: School Health Workshop [REF-A1B2C3D4]" {
		t.Errorf("expected deduplicated Re: subject line, got: %s", receivedPayload.Subject)
	}

	if !strings.Contains(receivedPayload.HTMLBody, "Nurse Sarah") {
		t.Errorf("expected HTML body to contain staff responder name")
	}

	mockRepo.mu.Lock()
	defer mockRepo.mu.Unlock()

	if len(mockRepo.dispatchedIDs) != 1 || mockRepo.dispatchedIDs[0] != msgID {
		t.Errorf("expected MarkMessageEmailDispatched to be called for %s", msgID)
	}
}
