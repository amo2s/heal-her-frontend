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
		req := validReq
		req.Name = "A"
		_, errs := SanitizeAndValidate(req)
		if _, ok := errs["name"]; !ok {
			t.Error("expected name min length error")
		}

		req.Name = strings.Repeat("A", 121)
		_, errs = SanitizeAndValidate(req)
		if _, ok := errs["name"]; !ok {
			t.Error("expected name max length error")
		}

		req = validReq
		req.Message = "Too short"
		_, errs = SanitizeAndValidate(req)
		if _, ok := errs["message"]; !ok {
			t.Error("expected message min length error")
		}

		req.Message = strings.Repeat("M", 5001)
		_, errs = SanitizeAndValidate(req)
		if _, ok := errs["message"]; !ok {
			t.Error("expected message max length error")
		}
	})
}

func TestValidateAndSanitizeReply(t *testing.T) {
	t.Run("valid reply passes cleanly", func(t *testing.T) {
		clean, errs := ValidateAndSanitizeReply("Thank you for reaching out. We are glad to assist.\n\nBest regards,\nStaff")
		if len(errs) > 0 {
			t.Fatalf("unexpected validation errors: %v", errs)
		}
		if !strings.Contains(clean, "Thank you for reaching out.") {
			t.Errorf("unexpected reply content: %s", clean)
		}
	})

	t.Run("strips null bytes and normalizes CRLF", func(t *testing.T) {
		clean, errs := ValidateAndSanitizeReply("Line 1\r\nLine 2\x00\rLine 3\tindented")
		if len(errs) > 0 {
			t.Fatalf("unexpected validation errors: %v", errs)
		}
		if strings.Contains(clean, "\x00") || strings.Contains(clean, "\r") {
			t.Errorf("reply contains null or carriage returns: %q", clean)
		}
		if !strings.Contains(clean, "\t") {
			t.Error("reply stripped tabs")
		}
	})

	t.Run("enforces bounds [2, 10000]", func(t *testing.T) {
		// Too short (<2)
		_, errsShort := ValidateAndSanitizeReply(" ")
		if len(errsShort) == 0 {
			t.Error("expected error for empty/short reply")
		}

		// Too long (>10000)
		oversized := strings.Repeat("R", 10001)
		_, errsLong := ValidateAndSanitizeReply(oversized)
		if len(errsLong) == 0 {
			t.Error("expected error for reply > 10,000 runes")
		}
	})
}

func TestValidateStatus(t *testing.T) {
	validStatuses := []string{"OPEN", "open", "REPLIED", "replied", "CLOSED", "closed"}
	for _, s := range validStatuses {
		val, errs := ValidateStatus(s)
		if len(errs) > 0 {
			t.Errorf("expected valid status for %q, got: %v", s, errs)
		}
		if val != strings.ToUpper(s) {
			t.Errorf("expected %q, got %q", strings.ToUpper(s), val)
		}
	}

	invalidStatuses := []string{"PENDING", "DELETED", "ARCHIVED", "UNKNOWN", ""}
	for _, s := range invalidStatuses {
		_, errs := ValidateStatus(s)
		if len(errs) == 0 {
			t.Errorf("expected validation error for invalid status %q", s)
		}
	}
}

func TestEscapeSQLLike(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"normal text", "normal text"},
		{"100% discount", `100\% discount`},
		{"user_name", `user\_name`},
		{`c:\path\file`, `c:\\path\\file`},
		{`%_test\`, `\%\_test\\`},
	}

	for _, tt := range tests {
		got := EscapeSQLLike(tt.input)
		if got != tt.expected {
			t.Errorf("EscapeSQLLike(%q) = %q, expected %q", tt.input, got, tt.expected)
		}
	}
}

func TestSanitizeSearchQuery(t *testing.T) {
	query := "  special%search_term\x00\r\n  "
	sanitized := SanitizeSearchQuery(query)
	if strings.Contains(sanitized, "\x00") {
		t.Error("null bytes not stripped from search query")
	}
	if !strings.Contains(sanitized, `\%`) || !strings.Contains(sanitized, `\_`) {
		t.Errorf("expected escaped LIKE wildcards in %q", sanitized)
	}
}

func TestValidateListParams(t *testing.T) {
	t.Run("default params", func(t *testing.T) {
		st, limit, offset, search, err := ValidateListParams("", "", "", "")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if st != "" || limit != 20 || offset != 0 || search != "" {
			t.Errorf("unexpected defaults: status=%s, limit=%d, offset=%d, search=%s", st, limit, offset, search)
		}
	})

	t.Run("valid parameters with clamping", func(t *testing.T) {
		st, limit, offset, search, err := ValidateListParams("open", "200", "40", "School%")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if st != "OPEN" || limit != 100 || offset != 40 {
			t.Errorf("unexpected values: status=%s, limit=%d, offset=%d", st, limit, offset)
		}
		if search != `School\%` {
			t.Errorf("unexpected search: %s", search)
		}
	})

	t.Run("invalid status", func(t *testing.T) {
		_, _, _, _, err := ValidateListParams("INVALID", "20", "0", "")
		if err == nil {
			t.Error("expected error for invalid status")
		}
	})

	t.Run("invalid limit and offset", func(t *testing.T) {
		_, _, _, _, err := ValidateListParams("", "abc", "0", "")
		if err == nil {
			t.Error("expected error for non-integer limit")
		}

		_, _, _, _, err = ValidateListParams("", "20", "-5", "")
		if err == nil {
			t.Error("expected error for negative offset")
		}
	})
}
