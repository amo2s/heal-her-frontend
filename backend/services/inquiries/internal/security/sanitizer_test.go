package security

import (
	"strings"
	"testing"

	"heal-her/inquiries/internal/domain"
)

func TestSanitizeAndValidate(t *testing.T) {
	validReq := domain.CreateInquiryRequest{
		Name:    "Jane Doe",
		Org:     "Heal Her Foundation",
		Email:   "jane.doe@example.org",
		Subject: "Inquiry Regarding Deployment",
		Message: "Hello, we would like to deploy the Heal Her platform in our local school district. Thank you!",
		Website: "",
	}

	t.Run("valid input passes cleanly", func(t *testing.T) {
		sanitized, errs := SanitizeAndValidate(validReq)
		if len(errs) > 0 {
			t.Fatalf("expected no validation errors, got: %v", errs)
		}
		if sanitized.Name != "Jane Doe" {
			t.Errorf("expected Jane Doe, got %s", sanitized.Name)
		}
		if sanitized.Email != "jane.doe@example.org" {
			t.Errorf("expected lowercase email, got %s", sanitized.Email)
		}
	})

	t.Run("rejects display-name smuggling in email", func(t *testing.T) {
		req := validReq
		req.Email = "Evil Smuggler <evil@domain.com>"
		_, errs := SanitizeAndValidate(req)
		if _, ok := errs["email"]; !ok {
			t.Error("expected email validation error for display-name smuggling, got none")
		}
	})

	t.Run("rejects email with internal whitespace or CRLF", func(t *testing.T) {
		req := validReq
		req.Email = "jane\r\n@example.org"
		_, errs := SanitizeAndValidate(req)
		if _, ok := errs["email"]; !ok {
			t.Error("expected email validation error for CRLF injection, got none")
		}

		req.Email = "jane doe@example.org"
		_, errs2 := SanitizeAndValidate(req)
		if _, ok := errs2["email"]; !ok {
			t.Error("expected email validation error for space in email, got none")
		}
	})

	t.Run("rejects email with invalid domain or missing TLD", func(t *testing.T) {
		req := validReq
		req.Email = "jane@localhost"
		_, errs := SanitizeAndValidate(req)
		if _, ok := errs["email"]; !ok {
			t.Error("expected error for email without dot/TLD, got none")
		}

		req.Email = "plainstring"
		_, errs2 := SanitizeAndValidate(req)
		if _, ok := errs2["email"]; !ok {
			t.Error("expected error for non-email string, got none")
		}
	})

	t.Run("sanitizes subject and strips header injection CRLF", func(t *testing.T) {
		req := validReq
		req.Subject = "Urgent\r\nBcc: victim@example.com\r\nSubject: Injected"
		sanitized, errs := SanitizeAndValidate(req)
		if len(errs) > 0 {
			t.Fatalf("unexpected validation error: %v", errs)
		}
		if strings.Contains(sanitized.Subject, "\r") || strings.Contains(sanitized.Subject, "\n") {
			t.Errorf("subject still contains CRLF: %q", sanitized.Subject)
		}
		if sanitized.Subject != "Urgent Bcc: victim@example.com Subject: Injected" {
			t.Errorf("unexpected subject normalization: %q", sanitized.Subject)
		}
	})

	t.Run("normalizes message CRLF to LF and strips null bytes", func(t *testing.T) {
		req := validReq
		req.Message = "Line 1\r\nLine 2\rLine 3\x00with null\tand tab preserved"
		sanitized, errs := SanitizeAndValidate(req)
		if len(errs) > 0 {
			t.Fatalf("unexpected validation error: %v", errs)
		}
		if strings.Contains(sanitized.Message, "\r") {
			t.Errorf("message contains carriage returns: %q", sanitized.Message)
		}
		if strings.Contains(sanitized.Message, "\x00") {
			t.Errorf("message contains null bytes: %q", sanitized.Message)
		}
		if !strings.Contains(sanitized.Message, "\t") {
			t.Errorf("message did not preserve tabs: %q", sanitized.Message)
		}
	})

	t.Run("enforces length bounds", func(t *testing.T) {
		// Name too short
		req := validReq
		req.Name = "A"
		_, errs := SanitizeAndValidate(req)
		if _, ok := errs["name"]; !ok {
			t.Error("expected name min length error")
		}

		// Name too long
		req.Name = strings.Repeat("A", 121)
		_, errs = SanitizeAndValidate(req)
		if _, ok := errs["name"]; !ok {
			t.Error("expected name max length error")
		}

		// Message too short (<10)
		req = validReq
		req.Message = "Too short"
		_, errs = SanitizeAndValidate(req)
		if _, ok := errs["message"]; !ok {
			t.Error("expected message min length error")
		}

		// Message too long (>5000)
		req.Message = strings.Repeat("M", 5001)
		_, errs = SanitizeAndValidate(req)
		if _, ok := errs["message"]; !ok {
			t.Error("expected message max length error")
		}
	})
}

func TestIsHoneypotTriggered(t *testing.T) {
	if IsHoneypotTriggered("") {
		t.Error("empty website should not trigger honeypot")
	}
	if IsHoneypotTriggered("   ") {
		t.Error("whitespace website should not trigger honeypot")
	}
	if !IsHoneypotTriggered("https://spam.bot.net") {
		t.Error("populated website should trigger honeypot")
	}
}
