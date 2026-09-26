// internal/models/payloads.go
package models

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validate is a thread-safe, cached instance of the validator.
// It is instantiated once during init() to prevent reflection overhead on every request.
var Validate *validator.Validate

func init() {
	Validate = validator.New(validator.WithRequiredStructEnabled())

	// Register the custom struct-level validation function to enforce the
	// conditional parental consent matrix defined in the architecture blueprint.
	Validate.RegisterStructValidation(signaturePayloadStructLevelValidation, SignaturePayload{})
}

// SignaturePayload defines the exact JSON contract expected from the frontend.
// Note: ClientEmail and IPAddress are intentionally omitted; they are derived 
// cryptographically from the scoped JWT and network request respectively.
type SignaturePayload struct {
	ClientName        string  `json:"client_name" validate:"required,min=2,max=255"`
	IsParentalConsent bool    `json:"is_parental_consent"`
	MinorName         *string `json:"minor_name"`
	MinorAge          *int    `json:"minor_age"`
}

// signaturePayloadStructLevelValidation acts as the secondary firewall before
// data reaches the Python rendering engine or PostgreSQL ledger.
func signaturePayloadStructLevelValidation(sl validator.StructLevel) {
	payload := sl.Current().Interface().(SignaturePayload)

	if payload.IsParentalConsent {
		// Dual-Track Logic: Parental consent IS active.
		// Minor data MUST be present and structurally valid.
		if payload.MinorName == nil || len(strings.TrimSpace(*payload.MinorName)) < 2 {
			sl.ReportError(payload.MinorName, "minor_name", "MinorName", "required_with_parental_consent", "")
		}
		if payload.MinorAge == nil || *payload.MinorAge < 0 || *payload.MinorAge > 17 {
			sl.ReportError(payload.MinorAge, "minor_age", "MinorAge", "valid_age_under_18", "")
		}
	} else {
		// Standard Logic: Parental consent is NOT active.
		// Minor data MUST be completely null to prevent conflicting ledger records.
		if payload.MinorName != nil {
			sl.ReportError(payload.MinorName, "minor_name", "MinorName", "forbidden_without_parental_consent", "")
		}
		if payload.MinorAge != nil {
			sl.ReportError(payload.MinorAge, "minor_age", "MinorAge", "forbidden_without_parental_consent", "")
		}
	}
}