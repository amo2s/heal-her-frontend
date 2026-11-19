package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"heal-her/inquiries/internal/config"
	"heal-her/inquiries/internal/domain"
)

func createTestToken(t *testing.T, secret string, role string, tokenType string, expOffset time.Duration, method jwt.SigningMethod) string {
	t.Helper()
	now := time.Now()
	claims := domain.Claims{
		Sub:       uuid.New(),
		Role:      role,
		TokenType: tokenType,
		IAT:       now.Unix(),
		EXP:       now.Add(expOffset).Unix(),
	}

	token := jwt.NewWithClaims(method, claims)
	tokenStr, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("failed to sign test token: %v", err)
	}
	return tokenStr
}

func TestManagementAuthMiddleware(t *testing.T) {
	jwtSecret := "super-secure-test-jwt-secret-key-32b"
	handshakeSecret := "internal-test-handshake-secret"

	cfg := &config.Config{
		JWTSecretKey:            jwtSecret,
		FrontendHandshakeSecret: handshakeSecret,
		AdminRoles:              []string{"admin", "owner", "super_admin", "staff"},
		AdminRoleMap: map[string]struct{}{
			"admin":       {},
			"owner":       {},
			"super_admin": {},
			"staff":       {},
		},
	}

	authMiddleware := ManagementAuth(cfg)
	testHandler := authMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		actor, ok := ActorFromContext(r.Context())
		if !ok || actor == nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(actor.Role))
	}))

	t.Run("valid access token via Authorization header", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "ADMIN", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d (body: %s)", rr.Code, rr.Body.String())
		}
	})

	t.Run("valid access token via admin-access-token cookie", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "super_admin", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.AddCookie(&http.Cookie{Name: "admin-access-token", Value: token})
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("expected 200 OK via cookie, got %d", rr.Code)
		}
	})

	t.Run("rejects missing token with 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized for missing token, got %d", rr.Code)
		}
	})

	t.Run("rejects expired token with 401", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "admin", "access", -5*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 for expired token, got %d", rr.Code)
		}
	})

	t.Run("rejects refresh token type with 401", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "admin", "refresh", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 for refresh token, got %d", rr.Code)
		}
	})

	t.Run("rejects wrong secret with 401", func(t *testing.T) {
		token := createTestToken(t, "wrong-secret-key-32b-length-here", "admin", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 for wrong secret, got %d", rr.Code)
		}
	})

	t.Run("rejects non-admin role (e.g. kid or teen) with 403", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "kid", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusForbidden {
			t.Errorf("expected 403 Forbidden for non-admin role 'kid', got %d", rr.Code)
		}
	})

	t.Run("rejects invalid handshake header with 403", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "admin", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/management/inquiries", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", "invalid-handshake")

		rr := httptest.NewRecorder()
		testHandler.ServeHTTP(rr, req)

		if rr.Code != http.StatusForbidden {
			t.Errorf("expected 403 Forbidden for invalid handshake, got %d", rr.Code)
		}
	})
}
