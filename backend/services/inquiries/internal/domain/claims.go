package domain

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Claims represents the strict Zero-Trust JWT Claims structure matching the Rust Auth service contract.
type Claims struct {
	Sub        uuid.UUID  `json:"sub"`
	JTI        *uuid.UUID `json:"jti,omitempty"`
	SID        *uuid.UUID `json:"sid,omitempty"`
	FID        *uuid.UUID `json:"fid,omitempty"`
	Role       string     `json:"role"`
	Dashboard  *string    `json:"dashboard,omitempty"`
	TokenType  string     `json:"token_type"`
	IAT        int64      `json:"iat"`
	EXP        int64      `json:"exp"`
	Aud        *string    `json:"aud,omitempty"`
	TosCleared bool       `json:"tos_cleared"`
	FirstName  *string    `json:"first_name,omitempty"`
}

// GetExpirationTime satisfies jwt.Claims interface for golang-jwt/jwt/v5.
func (c Claims) GetExpirationTime() (*jwt.NumericDate, error) {
	return jwt.NewNumericDate(time.Unix(c.EXP, 0)), nil
}

// GetIssuedAt satisfies jwt.Claims interface.
func (c Claims) GetIssuedAt() (*jwt.NumericDate, error) {
	return jwt.NewNumericDate(time.Unix(c.IAT, 0)), nil
}

// GetNotBefore satisfies jwt.Claims interface.
func (c Claims) GetNotBefore() (*jwt.NumericDate, error) {
	return nil, nil
}

// GetIssuer satisfies jwt.Claims interface.
func (c Claims) GetIssuer() (string, error) {
	return "", nil
}

// GetSubject satisfies jwt.Claims interface.
func (c Claims) GetSubject() (string, error) {
	return c.Sub.String(), nil
}

// GetAudience satisfies jwt.Claims interface.
// Audience validation is intentionally dynamic/permissive to maintain compatibility with Rust Auth.
func (c Claims) GetAudience() (jwt.ClaimStrings, error) {
	if c.Aud != nil && *c.Aud != "" {
		return jwt.ClaimStrings{*c.Aud}, nil
	}
	return nil, nil
}

// AuthenticatedActor holds the verified identity extracted from a management JWT.
type AuthenticatedActor struct {
	UserID    uuid.UUID `json:"user_id"`
	Role      string    `json:"role"`
	FirstName string    `json:"first_name"`
}
