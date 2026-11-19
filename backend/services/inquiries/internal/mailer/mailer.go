package mailer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"heal-her/inquiries/internal/repository"
)

// Supported asynchronous mail job kinds.
const (
	JobKindConfirmation = "confirmation"
	JobKindStaffReply   = "staff_reply"
)

// MailJob encapsulates the payload needed to dispatch an asynchronous email.
type MailJob struct {
	Kind         string
	MessageID    uuid.UUID
	Recipient    string
	Subject      string
	FullName     string
	Organization string
	ReferenceID  string
	StaffName    string
	ReplyBody    string
}

// Mailer manages a bounded asynchronous worker pool for relaying emails via Google Apps Script.
type Mailer struct {
	webhookURL string
	client     *http.Client
	jobQueue   chan MailJob
	repo       repository.InquiryRepository
	wg         sync.WaitGroup
	ctx        context.Context
	cancel     context.CancelFunc
}

// googleAppsScriptPayload matches Route 2 contract of the Hybrid V2 Google Apps Script Web App.
type googleAppsScriptPayload struct {
	Recipient string `json:"recipient"`
	Subject   string `json:"subject"`
	HTMLBody  string `json:"html_body"`
}

// NewMailer creates and starts a bounded worker pool for email dispatch.
func NewMailer(webhookURL string, workers int, queueSize int, repo repository.InquiryRepository) *Mailer {
	ctx, cancel := context.WithCancel(context.Background())

	client := &http.Client{
		Timeout: 15 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return fmt.Errorf("stopped after 10 redirects")
			}
			return nil
		},
	}

	m := &Mailer{
		webhookURL: webhookURL,
		client:     client,
		jobQueue:   make(chan MailJob, queueSize),
		repo:       repo,
		ctx:        ctx,
		cancel:     cancel,
	}

	for i := 0; i < workers; i++ {
		m.wg.Add(1)
		go m.workerLoop(i + 1)
	}

	slog.Info("mailer worker pool initialized",
		"workers", workers,
		"queue_size", queueSize,
	)

	return m
}

// Enqueue pushes an email job onto the bounded channel via non-blocking select.
func (m *Mailer) Enqueue(job MailJob) bool {
	select {
	case m.jobQueue <- job:
		return true
	default:
		slog.Warn("mailer job queue saturated; email dropped from async dispatch",
			"kind", job.Kind,
			"message_id", job.MessageID,
			"recipient", job.Recipient,
		)
		return false
	}
}

// Shutdown initiates graceful draining of in-flight email deliveries.
func (m *Mailer) Shutdown(ctx context.Context) error {
	m.cancel()
	close(m.jobQueue)

	done := make(chan struct{})
	go func() {
		m.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		slog.Info("mailer worker pool drained cleanly")
		return nil
	case <-ctx.Done():
		return fmt.Errorf("mailer shutdown timed out: %w", ctx.Err())
	}
}

func (m *Mailer) workerLoop(workerID int) {
	defer m.wg.Done()

	for job := range m.jobQueue {
		m.processJob(job, workerID)
	}
}

func (m *Mailer) processJob(job MailJob, workerID int) {
	var htmlBody string
	var emailSubject string
	var err error

	if job.Kind == JobKindStaffReply {
		emailSubject = FormatStaffReplySubject(job.Subject, job.ReferenceID)
		htmlBody, err = RenderStaffReplyEmail(StaffReplyEmailData{
			RecipientName: job.FullName,
			StaffName:     job.StaffName,
			Subject:       job.Subject,
			ReferenceID:   job.ReferenceID,
			ReplyBody:     job.ReplyBody,
		})
	} else {
		emailSubject = fmt.Sprintf("Heal Her — We Received Your Inquiry [%s]", job.ReferenceID)
		htmlBody, err = RenderConfirmationEmail(ConfirmationEmailData{
			FullName:     job.FullName,
			Organization: job.Organization,
			Subject:      job.Subject,
			ReferenceID:  job.ReferenceID,
		})
	}

	if err != nil {
		slog.Error("failed to render email template",
			"kind", job.Kind,
			"worker_id", workerID,
			"message_id", job.MessageID,
			"error", err,
		)
		return
	}

	payload := googleAppsScriptPayload{
		Recipient: job.Recipient,
		Subject:   emailSubject,
		HTMLBody:  htmlBody,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		slog.Error("failed to serialize mailer payload",
			"worker_id", workerID,
			"error", err,
		)
		return
	}

	reqCtx, reqCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer reqCancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, m.webhookURL, bytes.NewReader(payloadBytes))
	if err != nil {
		slog.Error("failed to build mailer HTTP request",
			"worker_id", workerID,
			"error", err,
		)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := m.client.Do(req)
	if err != nil {
		slog.Error("mailer relay transmission failed",
			"kind", job.Kind,
			"worker_id", workerID,
			"message_id", job.MessageID,
			"error", err,
		)
		return
	}
	defer func() {
		_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 8192))
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		slog.Error("mailer relay returned non-200 status code",
			"kind", job.Kind,
			"worker_id", workerID,
			"status_code", resp.StatusCode,
			"message_id", job.MessageID,
		)
		return
	}

	// 3. Mark message delivery status in PostgreSQL
	if m.repo != nil {
		dbCtx, dbCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer dbCancel()

		if err := m.repo.MarkMessageEmailDispatched(dbCtx, job.MessageID); err != nil {
			slog.Error("failed to update email_dispatched status in repository",
				"worker_id", workerID,
				"message_id", job.MessageID,
				"error", err,
			)
			return
		}
	}

	slog.Info("email successfully dispatched and recorded",
		"kind", job.Kind,
		"worker_id", workerID,
		"message_id", job.MessageID,
		"recipient", job.Recipient,
	)
}
