// internal/handlers/middleware.go
package handlers

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// contextKey prevents key collisions in the request context.
type contextKey string

const EmailContextKey contextKey = "client_email"

// RequireTOSScope enforces the zero-trust boundary. It mathematically verifies
// the JWT signature and ensures the token contains the strict "tos_execution" scope.
func RequireTOSScope(next http.Handler) http.Handler {
	// Secret is loaded once per request lifecycle; in a high-throughput scenario,
	// this would be injected via a struct receiver, but this fits the stateless functional pattern.
	secret := []byte(os.Getenv("CONSENT_SIGNING_SECRET"))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			slog.Warn("rejected request: missing authorization header", "ip", r.RemoteAddr)
			http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			slog.Warn("rejected request: malformed authorization header", "ip", r.RemoteAddr)
			http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return secret, nil
		})

		if err != nil || !token.Valid {
			slog.Warn("rejected request: invalid or expired token", "ip", r.RemoteAddr, "error", err)
			http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			slog.Error("rejected request: failed to parse claims map", "ip", r.RemoteAddr)
			http.Error(w, `{"error":"invalid token claims structure"}`, http.StatusUnauthorized)
			return
		}

		scope, _ := claims["scope"].(string)
		if scope != "tos_execution" {
			slog.Warn("rejected request: strict scope violation", "ip", r.RemoteAddr, "provided_scope", scope)
			http.Error(w, `{"error":"insufficient token scope"}`, http.StatusForbidden)
			return
		}

		email, _ := claims["sub"].(string)
		if email == "" {
			slog.Warn("rejected request: missing subject (email) in token", "ip", r.RemoteAddr)
			http.Error(w, `{"error":"missing subject in token"}`, http.StatusUnauthorized)
			return
		}

		// Inject the cryptographically verified email into the request context
		ctx := context.WithValue(r.Context(), EmailContextKey, email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}