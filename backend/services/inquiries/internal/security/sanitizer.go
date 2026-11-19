package security

import (
	"errors"
	"fmt"
	"net/mail"
	"strconv"
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

// ValidateAndSanitizeReply sanitizes staff reply text and enforces bounds (2 to 10,000 runes).
func ValidateAndSanitizeReply(rawBody string) (string, ValidationErrors) {
	errs := make(ValidationErrors)
	cleanBody := sanitizeMessageBody(rawBody)
	bodyLen := utf8.RuneCountInString(cleanBody)

	if bodyLen < 2 || bodyLen > 10000 {
		errs["body"] = "Staff reply body must be between 2 and 10,000 characters"
		return "", errs
	}

	return cleanBody, nil
}

// ValidateStatus validates and normalizes ticket status transitions.
// Strictly allows only OPEN, REPLIED, or CLOSED.
func ValidateStatus(rawStatus string) (string, ValidationErrors) {
	errs := make(ValidationErrors)
	normalized := strings.ToUpper(strings.TrimSpace(rawStatus))

	switch normalized {
	case domain.StatusOpen, domain.StatusReplied, domain.StatusClosed:
		return normalized, nil
	default:
		errs["status"] = "Invalid ticket status; must strictly be OPEN, REPLIED, or CLOSED"
		return "", errs
	}
}

// EscapeSQLLike escapes %, _, and \ characters for safe ILIKE wildcard searches.
func EscapeSQLLike(s string) string {
	var sb strings.Builder
	sb.Grow(len(s) * 2)
	for _, r := range s {
		if r == '\\' || r == '%' || r == '_' {
			sb.WriteRune('\\')
		}
		sb.WriteRune(r)
	}
	return sb.String()
}

// SanitizeSearchQuery strips nulls and control characters, caps to 100 runes, and escapes SQL LIKE wildcards.
func SanitizeSearchQuery(raw string) string {
	trimmed := strings.TrimSpace(raw)
	var sb strings.Builder
	sb.Grow(len(trimmed))

	for _, r := range trimmed {
		if r == 0 || (r < 32 && r != ' ') || r == 127 {
			continue
		}
		sb.WriteRune(r)
	}

	cleaned := sb.String()
	if utf8.RuneCountInString(cleaned) > 100 {
		runes := []rune(cleaned)
		cleaned = string(runes[:100])
	}

	return EscapeSQLLike(cleaned)
}

// ValidateListParams checks and normalizes query parameters for the inbox listing endpoint.
func ValidateListParams(rawStatus, rawLimit, rawOffset, rawSearch string) (status string, limit int, offset int, search string, err error) {
	// Status (optional)
	if strings.TrimSpace(rawStatus) != "" {
		normalizedStatus := strings.ToUpper(strings.TrimSpace(rawStatus))
		if normalizedStatus != domain.StatusOpen && normalizedStatus != domain.StatusReplied && normalizedStatus != domain.StatusClosed {
			return "", 0, 0, "", errors.New("query param 'status' must be OPEN, REPLIED, or CLOSED")
		}
		status = normalizedStatus
	}

	// Limit (default 20, clamp between 1 and 100)
	limit = 20
	if strings.TrimSpace(rawLimit) != "" {
		parsedLimit, parseErr := strconv.Atoi(strings.TrimSpace(rawLimit))
		if parseErr != nil || parsedLimit <= 0 {
			return "", 0, 0, "", errors.New("query param 'limit' must be a positive integer between 1 and 100")
		}
		if parsedLimit > 100 {
			limit = 100
		} else {
			limit = parsedLimit
		}
	}

	// Offset (default 0, must be >= 0)
	offset = 0
	if strings.TrimSpace(rawOffset) != "" {
		parsedOffset, parseErr := strconv.Atoi(strings.TrimSpace(rawOffset))
		if parseErr != nil || parsedOffset < 0 {
			return "", 0, 0, "", errors.New("query param 'offset' must be a non-negative integer")
		}
		offset = parsedOffset
	}

	// Search (optional, sanitized)
	if strings.TrimSpace(rawSearch) != "" {
		search = SanitizeSearchQuery(rawSearch)
	}

	return status, limit, offset, search, nil
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

	for _, r := range trimmed {
		if r == 0 || r == '\r' || r == '\n' || unicode.IsSpace(r) {
			return "", "Email contains invalid characters or whitespace"
		}
	}

	parsed, err := mail.ParseAddress(trimmed)
	if err != nil {
		return "", "Invalid email address format"
	}

	if strings.ToLower(parsed.Address) != strings.ToLower(trimmed) {
		return "", "Display-name smuggling in email address is prohibited"
	}

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

	return strings.ToLower(trimmed), ""
}

// sanitizeMessageBody strips null bytes and non-printable control characters,
// normalizes CRLF and lone CR to standard \n, and preserves tabs and valid multi-line structure.
func sanitizeMessageBody(s string) string {
	normalized := strings.ReplaceAll(s, "\r\n", "\n")
	normalized = strings.ReplaceAll(normalized, "\r", "\n")

	var sb strings.Builder
	sb.Grow(len(normalized))

	for _, r := range normalized {
		if r == 0 {
			continue
		}
		if r == '\n' || r == '\t' {
			sb.WriteRune(r)
			continue
		}
		if (r < 32 && r != ' ') || r == 127 {
			continue
		}
		sb.WriteRune(r)
	}

	return strings.TrimSpace(sb.String())
}
