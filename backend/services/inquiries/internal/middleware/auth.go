package middleware

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"heal-her/inquiries/internal/config"
	"heal-her/inquiries/internal/domain"
)

type authContextKey string

const (
	actorContextKey authContextKey = "authenticated_actor"
)

// SessionVerifier validates live session and user standing in PostgreSQL.
type SessionVerifier interface {
	VerifyActiveSession(ctx context.Context, sessionID, userID, role string) (bool, error)
}

// Authenticate verifies the incoming JWT, internal handshake, and live PostgreSQL session standing,
// injecting the AuthenticatedActor into the request context.
func Authenticate(cfg *config.Config, verifier SessionVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Internal Handshake Verification (if configured)
			if cfg.FrontendHandshakeSecret != "" {
				incomingHandshake := r.Header.Get("x-healher-handshake")
				if incomingHandshake == "" || subtle.ConstantTimeCompare([]byte(incomingHandshake), []byte(cfg.FrontendHandshakeSecret)) != 1 {
					renderJSONError(w, http.StatusForbidden, "Forbidden: invalid or missing frontend handshake signature")
					return
				}
			}

			// 2. Dual Token Extraction (Header -> admin-access-token cookie -> sb-access-token cookie)
			rawToken := extractToken(r)
			if rawToken == "" {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: missing access token")
				return
			}

			// 3. Strict Cryptographic Verification (HS256 Only, Skip AUD check)
			claims := &domain.Claims{}
			token, err := jwt.ParseWithClaims(
				rawToken,
				claims,
				func(t *jwt.Token) (interface{}, error) {
					if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("unexpected signing algorithm: %v", t.Header["alg"])
					}
					return []byte(cfg.JWTSecretKey), nil
				},
				jwt.WithValidMethods([]string{"HS256"}),
				jwt.WithoutClaimsValidation(),
			)

			if err != nil || !token.Valid {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: invalid or malformed cryptographic token")
				return
			}

			// 4. Token Type & Expiration Verification
			if claims.TokenType != "access" {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: token type must be 'access'")
				return
			}

			expTime, err := claims.GetExpirationTime()
			if err != nil || expTime == nil || expTime.Before(time.Now()) {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: token has expired")
				return
			}

			// 5. Fail-Closed Approval Status Gate
			if !strings.EqualFold(strings.TrimSpace(claims.ApprovalStatus), "APPROVED") {
				renderJSONError(w, http.StatusForbidden, "Forbidden: Account approval required to access management inquiries")
				return
			}

			// 6. Zero-Window Session & Account Standing Verification (SEC-003)
			if claims.SID == nil || *claims.SID == uuid.Nil {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: missing or invalid session ID")
				return
			}

			if claims.Sub == uuid.Nil {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: missing or invalid subject ID")
				return
			}

			if verifier != nil {
				active, err := verifier.VerifyActiveSession(r.Context(), claims.SID.String(), claims.Sub.String(), claims.Role)
				if err != nil {
					renderJSONError(w, http.StatusServiceUnavailable, "Service Unavailable: session verification unavailable")
					return
				}
				if !active {
					renderJSONError(w, http.StatusUnauthorized, "Unauthorized: Session revoked or account inactive")
					return
				}
			}

			// 7. Context Propagation
			firstName := ""
			if claims.FirstName != nil {
				firstName = *claims.FirstName
			}

			actor := &domain.AuthenticatedActor{
				UserID:    claims.Sub,
				Role:      claims.Role,
				FirstName: firstName,
			}

			ctx := context.WithValue(r.Context(), actorContextKey, actor)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireReadAccess enforces Tier 1: Executive Oversight & Read permission (super_admin, admin, staff).
func RequireReadAccess(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			actor, ok := ActorFromContext(r.Context())
			if !ok || actor == nil {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: authentication required")
				return
			}

			if !cfg.IsReadAuthorized(actor.Role) {
				renderJSONError(w, http.StatusForbidden, "Forbidden: insufficient administrative clearance")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireActionAccess enforces Tier 2: Operational Action permission (admin, staff).
// super_admin accounts are explicitly blocked with a clear non-leaking read-only oversight notice.
func RequireActionAccess(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			actor, ok := ActorFromContext(r.Context())
			if !ok || actor == nil {
				renderJSONError(w, http.StatusUnauthorized, "Unauthorized: authentication required")
				return
			}

			normalizedRole := strings.ToLower(strings.TrimSpace(actor.Role))
			if normalizedRole == "super_admin" {
				renderJSONError(w, http.StatusForbidden, "Forbidden: executive oversight accounts have read-only access to inquiries")
				return
			}

			if !cfg.IsActionAuthorized(actor.Role) {
				renderJSONError(w, http.StatusForbidden, "Forbidden: insufficient administrative clearance")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// ActorFromContext retrieves the authenticated administrative actor from the request context.
func ActorFromContext(ctx context.Context) (*domain.AuthenticatedActor, bool) {
	actor, ok := ctx.Value(actorContextKey).(*domain.AuthenticatedActor)
	return actor, ok
}

// extractToken retrieves the raw JWT string prioritizing Authorization header over cookies.
func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		if token != "" {
			return token
		}
	}

	if cookie, err := r.Cookie("admin-access-token"); err == nil && strings.TrimSpace(cookie.Value) != "" {
		return strings.TrimSpace(cookie.Value)
	}

	if cookie, err := r.Cookie("sb-access-token"); err == nil && strings.TrimSpace(cookie.Value) != "" {
		return strings.TrimSpace(cookie.Value)
	}

	return ""
}
