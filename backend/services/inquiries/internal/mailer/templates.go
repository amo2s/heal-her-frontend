package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"regexp"
	"strings"
)

// ConfirmationEmailData holds variables for safe public intake confirmation email rendering.
type ConfirmationEmailData struct {
	FullName     string
	Organization string
	Subject      string
	ReferenceID  string
}

// StaffReplyEmailData holds variables for safe staff outbound email rendering.
type StaffReplyEmailData struct {
	RecipientName string
	StaffName     string
	Subject       string
	ReferenceID   string
	ReplyBody     string
}

const confirmationEmailTemplateRaw = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received — Heal Her</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0b18; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAFAFA;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0b18; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1C1246; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #231854 0%, #1C1246 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF;">
                      Heal <span style="color: #DA8CA0;">Her</span>
                    </h1>
                    <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #DA8CA0; font-weight: 700;">
                      Administrative Helpdesk & Inquiries
                    </p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(218, 140, 160, 0.15); border: 1px solid rgba(218, 140, 160, 0.3); border-radius: 8px; font-size: 12px; font-weight: 700; color: #DA8CA0; font-family: monospace;">
                      {{.ReferenceID}}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #FFFFFF;">
                We Have Received Your Inquiry
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                Hello <strong>{{.FullName}}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                Thank you for contacting the Heal Her administration. Your inquiry regarding <em>"{{.Subject}}"</em> on behalf of <strong>{{.Organization}}</strong> has been securely logged into our support queue.
              </p>

              <!-- Ticket Badge Box -->
              <table role="presentation" width="100%" style="background-color: #140d32; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8F8FA3;">Reference Identifier</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 700; color: #FFFFFF; font-family: monospace;">{{.ReferenceID}}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                A member of our clinical or administrative team will review your message and reply directly to this email address within 24 to 48 business hours.
              </p>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                Warm regards,<br>
                <strong style="color: #FFFFFF;">The Heal Her Executive Secretariat</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #140d32; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6E6E82; line-height: 1.5;">
                This automated confirmation was sent by the Heal Her Inquiries Microservice.<br>
                Please keep this reference code for your records.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const staffReplyEmailTemplateRaw = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Response to Your Inquiry — Heal Her</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0b18; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAFAFA;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0b18; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1C1246; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #231854 0%, #1C1246 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF;">
                      Heal <span style="color: #DA8CA0;">Her</span>
                    </h1>
                    <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #DA8CA0; font-weight: 700;">
                      Staff Response & Helpdesk
                    </p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(218, 140, 160, 0.15); border: 1px solid rgba(218, 140, 160, 0.3); border-radius: 8px; font-size: 12px; font-weight: 700; color: #DA8CA0; font-family: monospace;">
                      {{.ReferenceID}}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #FFFFFF;">
                Update Regarding Your Inquiry
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                Hello <strong>{{.RecipientName}}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                A staff member has replied to your inquiry regarding <em>"{{.Subject}}"</em>:
              </p>

              <!-- Safe Multi-Paragraph Reply Box -->
              <table role="presentation" width="100%" style="background-color: #140d32; border-left: 4px solid #DA8CA0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; font-size: 14px; line-height: 1.7; color: #FAFAFA; white-space: pre-wrap; word-break: break-word;">{{.ReplyBody}}</td>
                </tr>
              </table>

              <p style="margin: 0 0 6px; font-size: 14px; line-height: 1.6; color: #CCCCD9;">
                Warm regards,<br>
                <strong style="color: #FFFFFF;">{{.StaffName}}</strong><br>
                <span style="font-size: 12px; color: #8F8FA3;">Heal Her Management & Support Team</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #140d32; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6E6E82; line-height: 1.5;">
                You are receiving this email in response to inquiry ticket {{.ReferenceID}}.<br>
                To reply or provide additional details, please submit a message referencing this code.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

var parsedConfirmationTemplate = template.Must(
	template.New("confirmationEmail").Parse(confirmationEmailTemplateRaw),
)

var parsedStaffReplyTemplate = template.Must(
	template.New("staffReplyEmail").Parse(staffReplyEmailTemplateRaw),
)

// RenderConfirmationEmail renders the safe HTML email body using html/template.
func RenderConfirmationEmail(data ConfirmationEmailData) (string, error) {
	var buf bytes.Buffer
	if err := parsedConfirmationTemplate.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to render confirmation email template: %w", err)
	}
	return buf.String(), nil
}

// RenderStaffReplyEmail renders the safe HTML email body for staff replies.
func RenderStaffReplyEmail(data StaffReplyEmailData) (string, error) {
	var buf bytes.Buffer
	if err := parsedStaffReplyTemplate.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to render staff reply email template: %w", err)
	}
	return buf.String(), nil
}

var leadingReRegex = regexp.MustCompile(`(?i)^(re:\s*)+`)

// FormatStaffReplySubject normalizes the subject line by stripping existing Re: prefixes and appending the ticket reference.
func FormatStaffReplySubject(rawSubject, refID string) string {
	clean := strings.TrimSpace(rawSubject)
	clean = strings.ReplaceAll(clean, "\r", "")
	clean = strings.ReplaceAll(clean, "\n", "")
	clean = leadingReRegex.ReplaceAllString(clean, "")
	clean = strings.TrimSpace(clean)

	return fmt.Sprintf("Re: %s [%s]", clean, refID)
}
