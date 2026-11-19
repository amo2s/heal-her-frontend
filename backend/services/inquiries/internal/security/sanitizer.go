package security

import (
	"fmt"
	"net/mail"
	"strings"
	"unicode"
	"unicode/utf8"

	"heal-her/inquiries/internal/domain"
)

// SanitizedInquiryInput contains sanitized and normalized user input ready for persistence.
type SanitizedInquiryInput struct {
	Name    string
	Org     string
	Email   string
	Subject string
	Message string
}

// ValidationErrors maps invalid field names to non-leaking, human-readable error descriptions.
type ValidationErrors map[string]string

func (v ValidationErrors) Error() string {
	var sb strings.Builder
	sb.WriteString("validation failed: ")
	first := true
	for field, msg := range v {
		if !first {
			sb.WriteString(", ")
		}
		sb.WriteString(fmt.Sprintf("%s: %s", field, msg))
		first = false
	}
	return sb.String()
}

// IsHoneypotTriggered checks if the hidden bot trap field is populated.
func IsHoneypotTriggered(website string) bool {
	return strings.TrimSpace(website) != ""
}

// SanitizeAndValidate validates and cleans all fields of a CreateInquiryRequest.
// It returns the sanitized input or a structured ValidationErrors map.
func SanitizeAndValidate(req domain.CreateInquiryRequest) (*SanitizedInquiryInput, ValidationErrors) {
	errs := make(ValidationErrors)

	// 1. Name Sanitization & Validation
	cleanName := stripControlAndCRLF(req.Name)
	cleanName = collapseWhitespace(cleanName)
	nameLen := utf8.RuneCountInString(cleanName)
	if nameLen < 2 || nameLen > 120 {
		errs["name"] = "Full name must be between 2 and 120 characters"
	}

	// 2. Organization Sanitization & Validation
	cleanOrg := stripControlAndCRLF(req.Org)
	cleanOrg = collapseWhitespace(cleanOrg)
	orgLen := utf8.RuneCountInString(cleanOrg)
	if orgLen < 2 || orgLen > 150 {
		errs["org"] = "Organization must be between 2 and 150 characters"
	}

	// 3. Email Sanitization & Validation (RFC 5322 + Display-Name Smuggling Shield)
	cleanEmail, emailErr := validateAndNormalizeEmail(req.Email)
	if emailErr != "" {
		errs["email"] = emailErr
	}

	// 4. Subject Sanitization & Validation (Strict Email Header Injection Shield)
	cleanSubject := stripControlAndCRLF(req.Subject)
	cleanSubject = collapseWhitespace(cleanSubject)
	subjectLen := utf8.RuneCountInString(cleanSubject)
	if subjectLen < 3 || subjectLen > 200 {
		errs["subject"] = "Subject must be between 3 and 200 characters"
	}

	// 5. Message Sanitization & Validation
	cleanMessage := sanitizeMessageBody(req.Message)
	messageLen := utf8.RuneCountInString(cleanMessage)
	if messageLen < 10 || messageLen > 5000 {
		errs["message"] = "Message must be between 10 and 5,000 characters"
	}

	if len(errs) > 0 {
		return nil, errs
	}

	return &SanitizedInquiryInput{
		Name:    cleanName,
		Org:     cleanOrg,
		Email:   cleanEmail,
		Subject: cleanSubject,
		Message: cleanMessage,
	}, nil
}

// stripControlAndCRLF replaces \r and \n with spaces, strips null bytes and control chars,
// enabling collapseWhitespace to ensure no CRLF header injection while preserving word separation.
func stripControlAndCRLF(s string) string {
	var sb strings.Builder
	sb.Grow(len(s))
	for _, r := range s {
		if r == 0 || (r < 32 && r != ' ' && r != '\r' && r != '\n') || r == 127 {
			continue
		}
		if r == '\r' || r == '\n' {
			sb.WriteRune(' ')
			continue
		}
		sb.WriteRune(r)
	}
	return strings.TrimSpace(sb.String())
}

// collapseWhitespace reduces multiple consecutive spaces/tabs into a single space.
func collapseWhitespace(s string) string {
	fields := strings.Fields(s)
	return strings.Join(fields, " ")
}

// validateAndNormalizeEmail enforces RFC 5322 compliance, lowercase domain/address,
// zero CRLF/null bytes, and blocks display-name smuggling.
func validateAndNormalizeEmail(raw string) (string, string) {
	trimmed := strings.TrimSpace(raw)
	emailLen := utf8.RuneCountInString(trimmed)
	if emailLen < 5 || emailLen > 254 {
		return "", "Email must be between 5 and 254 characters"
	}

	// Reject any internal whitespace, null byte, \r, or \n
	for _, r := range trimmed {
		if r == 0 || r == '\r' || r == '\n' || unicode.IsSpace(r) {
			return "", "Email contains invalid characters or whitespace"
		}
	}

	// Parse with standard library net/mail
	parsed, err := mail.ParseAddress(trimmed)
	if err != nil {
		return "", "Invalid email address format"
	}

	// Strict display-name smuggling check:
	// If the user input was `Evil <admin@org.com>`, parsed.Address is `admin@org.com`,
	// but trimmed is `Evil <admin@org.com>`. They must match exactly!
	if strings.ToLower(parsed.Address) != strings.ToLower(trimmed) {
		return "", "Display-name smuggling in email address is prohibited"
	}

	// Verify domain structure: must have exactly one '@' and a dot in domain with non-empty TLD
	parts := strings.Split(trimmed, "@")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", "Invalid email address structure"
	}

	domainPart := parts[1]
	if !strings.Contains(domainPart, ".") || strings.HasPrefix(domainPart, ".") || strings.HasSuffix(domainPart, ".") {
		return "", "Email domain must contain a valid domain and TLD"
	}

	dotParts := strings.Split(domainPart, ".")
	tld := dotParts[len(dotParts)-1]
	if len(tld) < 2 {
		return "", "Email top-level domain is invalid"
	}

	// Normalized to lowercase
	return strings.ToLower(trimmed), ""
}

// sanitizeMessageBody strips null bytes and non-printable control characters,
// normalizes CRLF and lone CR to standard \n, and preserves tabs and valid multi-line structure.
func sanitizeMessageBody(s string) string {
	// Normalize \r\n to \n, then lone \r to \n
	normalized := strings.ReplaceAll(s, "\r\n", "\n")
	normalized = strings.ReplaceAll(normalized, "\r", "\n")

	var sb strings.Builder
	sb.Grow(len(normalized))

	for _, r := range normalized {
		// Null byte
		if r == 0 {
			continue
		}
		// Preserve line feeds and horizontal tabs
		if r == '\n' || r == '\t' {
			sb.WriteRune(r)
			continue
		}
		// Strip unprintable control characters
		if (r < 32 && r != ' ') || r == 127 {
			continue
		}
		sb.WriteRune(r)
	}

	return strings.TrimSpace(sb.String())
}
