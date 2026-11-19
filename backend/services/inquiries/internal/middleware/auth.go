package middleware

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"heal-her/inquiries/internal/config"
	"heal-her/inquiries/internal/domain"
)

type authContextKey string

const (
	actorContextKey authContextKey = "authenticated_actor"
)

// ManagementAuth creates the Zero-Trust Management RBAC & Handshake middleware.
func ManagementAuth(cfg *config.Config) func(http.Handler) http.Handler {
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
					// Verify signing method is explicitly HMAC-SHA256
					if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("unexpected signing algorithm: %v", t.Header["alg"])
					}
					return []byte(cfg.JWTSecretKey), nil
				},
				jwt.WithValidMethods([]string{"HS256"}),
				jwt.WithoutClaimsValidation(), // We perform targeted strict manual checks below
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

			// 5. Strict Management RBAC Enforcement
			if !cfg.IsAuthorizedRole(claims.Role) {
				renderJSONError(w, http.StatusForbidden, "Forbidden: insufficient administrative clearance")
				return
			}

			// 6. Context Propagation
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

// ActorFromContext retrieves the authenticated administrative actor from the request context.
func ActorFromContext(ctx context.Context) (*domain.AuthenticatedActor, bool) {
	actor, ok := ctx.Value(actorContextKey).(*domain.AuthenticatedActor)
	return actor, ok
}

// extractToken retrieves the raw JWT string prioritizing Authorization header over cookies.
func extractToken(r *http.Request) string {
	// 1. Authorization: Bearer <token>
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		if token != "" {
			return token
		}
	}

	// 2. Cookie: admin-access-token
	if cookie, err := r.Cookie("admin-access-token"); err == nil && strings.TrimSpace(cookie.Value) != "" {
		return strings.TrimSpace(cookie.Value)
	}

	// 3. Cookie: sb-access-token
	if cookie, err := r.Cookie("sb-access-token"); err == nil && strings.TrimSpace(cookie.Value) != "" {
		return strings.TrimSpace(cookie.Value)
	}

	return ""
}
