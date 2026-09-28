// internal/mailer/mailer.go
package mailer

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"
)

//go:embed templates/tos_success.html
var templateFS embed.FS

// Mailer handles external email dispatch to the Google Apps Script webhook.
type Mailer struct {
	httpClient *http.Client
	webhookURL string
	tmpl       *template.Template
}

// emailPayload maps strictly to the expected Google Apps Script JSON contract.
type emailPayload struct {
	Recipient string `json:"recipient"`
	Subject   string `json:"subject"`
	HTMLBody  string `json:"html_body"`
}

// templateData defines the dynamic fields injected into the Jinja-style Go HTML template.
type templateData struct {
	ClientName  string
	Date        string
	DocumentURL string
}

// New initializes the mailer, pre-compiles the HTML template from the embedded filesystem 
// (preventing I/O bottlenecks and path traversal issues in production), and sets tight HTTP timeouts.
func New(webhookURL string) (*Mailer, error) {
	// Pre-compile template at startup. Fail-fast if the template is malformed.
	tmpl, err := template.ParseFS(templateFS, "templates/tos_success.html")
	if err != nil {
		return nil, fmt.Errorf("failed to parse embedded email template: %w", err)
	}

	return &Mailer{
		httpClient: &http.Client{
			// Google Apps Script heavily utilizes 302 redirects. Go's default client handles 
			// up to 10 redirects automatically, but we enforce a strict 10-second boundary.
			Timeout: 10 * time.Second, 
		},
		webhookURL: webhookURL,
		tmpl:       tmpl,
	}, nil
}

// SendTOSSuccessEmail compiles the dynamic HTML and executes a non-blocking 
// HTTP POST to the webhook infrastructure.
func (m *Mailer) SendTOSSuccessEmail(ctx context.Context, recipientEmail, clientName, documentURL string) error {
	// 1. Hydrate the HTML template with dynamic execution data
	data := templateData{
		ClientName:  clientName,
		Date:        time.Now().Format("January 02, 2006"), // e.g., "September 28, 2026"
		DocumentURL: documentURL,
	}

	var htmlBuffer bytes.Buffer
	if err := m.tmpl.Execute(&htmlBuffer, data); err != nil {
		return fmt.Errorf("failed to execute html template: %w", err)
	}

	// 2. Construct the strict JSON payload for the webhook
	payload := emailPayload{
		Recipient: recipientEmail,
		Subject:   "Heal Her - Legal Document Executed",
		HTMLBody:  htmlBuffer.String(),
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	// 3. Dispatch the HTTP Request
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, m.webhookURL, bytes.NewReader(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := m.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("mailer transport network failure: %w", err)
	}
	defer resp.Body.Close()

	// Google Apps Script usually returns 200 after its internal redirects finish successfully.
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("mailer webhook rejected payload with status: %d", resp.StatusCode)
	}

	return nil
}