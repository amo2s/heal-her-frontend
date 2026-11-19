package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
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

func TestTwoTierRBACMatrix(t *testing.T) {
	jwtSecret := "super-secure-test-jwt-secret-key-32b"
	handshakeSecret := "internal-test-handshake-secret"

	cfg := &config.Config{
		JWTSecretKey:            jwtSecret,
		FrontendHandshakeSecret: handshakeSecret,
		ReadRoles:               []string{"super_admin", "admin", "staff"},
		ReadRoleMap: map[string]struct{}{
			"super_admin": {},
			"admin":       {},
			"staff":       {},
		},
		ActionRoles: []string{"admin", "staff"},
		ActionRoleMap: map[string]struct{}{
			"admin": {},
			"staff": {},
		},
	}

	authMiddleware := Authenticate(cfg)
	readGuard := RequireReadAccess(cfg)
	actionGuard := RequireActionAccess(cfg)

	readHandler := authMiddleware(readGuard(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("read_ok"))
	})))

	actionHandler := authMiddleware(actionGuard(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("action_ok"))
	})))

	t.Run("super_admin passes Read tier but is rejected on Action tier with oversight message", func(t *testing.T) {
		token := createTestToken(t, jwtSecret, "super_admin", "access", 10*time.Minute, jwt.SigningMethodHS256)

		// Read tier: 200 OK
		reqRead := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/stats", nil)
		reqRead.Header.Set("Authorization", "Bearer "+token)
		reqRead.Header.Set("x-healher-handshake", handshakeSecret)
		rrRead := httptest.NewRecorder()
		readHandler.ServeHTTP(rrRead, reqRead)

		if rrRead.Code != http.StatusOK {
			t.Errorf("expected super_admin to pass Read tier with 200, got: %d", rrRead.Code)
		}

		// Action tier: 403 Forbidden
		reqAction := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/123/reply", nil)
		reqAction.Header.Set("Authorization", "Bearer "+token)
		reqAction.Header.Set("x-healher-handshake", handshakeSecret)
		rrAction := httptest.NewRecorder()
		actionHandler.ServeHTTP(rrAction, reqAction)

		if rrAction.Code != http.StatusForbidden {
			t.Errorf("expected super_admin to be blocked on Action tier with 403, got: %d", rrAction.Code)
		}
		if !strings.Contains(rrAction.Body.String(), "executive oversight accounts have read-only access") {
			t.Errorf("expected read-only oversight notice, got: %s", rrAction.Body.String())
		}
	})

	t.Run("admin and staff pass both Read and Action tiers", func(t *testing.T) {
		for _, role := range []string{"admin", "ADMIN", "staff", "STAFF"} {
			token := createTestToken(t, jwtSecret, role, "access", 10*time.Minute, jwt.SigningMethodHS256)

			// Read tier
			reqRead := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries", nil)
			reqRead.Header.Set("Authorization", "Bearer "+token)
			reqRead.Header.Set("x-healher-handshake", handshakeSecret)
			rrRead := httptest.NewRecorder()
			readHandler.ServeHTTP(rrRead, reqRead)

			if rrRead.Code != http.StatusOK {
				t.Errorf("expected %s to pass Read tier, got: %d", role, rrRead.Code)
			}

			// Action tier
			reqAction := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/123/reply", nil)
			reqAction.Header.Set("Authorization", "Bearer "+token)
			reqAction.Header.Set("x-healher-handshake", handshakeSecret)
			rrAction := httptest.NewRecorder()
			actionHandler.ServeHTTP(rrAction, reqAction)

			if rrAction.Code != http.StatusOK {
				t.Errorf("expected %s to pass Action tier, got: %d", role, rrAction.Code)
			}
		}
	})

	t.Run("retired and demographic roles are rejected on both tiers with 403", func(t *testing.T) {
		unauthorizedRoles := []string{
			"owner", "superadmin", "teacher", "counselor", "principal", "management",
			"kid", "teen", "young-adult", "user",
		}

		for _, role := range unauthorizedRoles {
			token := createTestToken(t, jwtSecret, role, "access", 10*time.Minute, jwt.SigningMethodHS256)

			// Read tier: 403
			reqRead := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries", nil)
			reqRead.Header.Set("Authorization", "Bearer "+token)
			reqRead.Header.Set("x-healher-handshake", handshakeSecret)
			rrRead := httptest.NewRecorder()
			readHandler.ServeHTTP(rrRead, reqRead)

			if rrRead.Code != http.StatusForbidden {
				t.Errorf("expected %s to be rejected on Read tier with 403, got: %d", role, rrRead.Code)
			}

			// Action tier: 403
			reqAction := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/123/reply", nil)
			reqAction.Header.Set("Authorization", "Bearer "+token)
			reqAction.Header.Set("x-healher-handshake", handshakeSecret)
			rrAction := httptest.NewRecorder()
			actionHandler.ServeHTTP(rrAction, reqAction)

			if rrAction.Code != http.StatusForbidden {
				t.Errorf("expected %s to be rejected on Action tier with 403, got: %d", role, rrAction.Code)
			}
		}
	})

	t.Run("token and handshake failures", func(t *testing.T) {
		// Missing token: 401
		req := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries", nil)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		readHandler.ServeHTTP(rr, req)
		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 for missing token, got: %d", rr.Code)
		}

		// Expired token: 401
		expiredToken := createTestToken(t, jwtSecret, "admin", "access", -5*time.Minute, jwt.SigningMethodHS256)
		reqExp := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries", nil)
		reqExp.Header.Set("Authorization", "Bearer "+expiredToken)
		reqExp.Header.Set("x-healher-handshake", handshakeSecret)
		rrExp := httptest.NewRecorder()
		readHandler.ServeHTTP(rrExp, reqExp)
		if rrExp.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 for expired token, got: %d", rrExp.Code)
		}

		// Refresh token type: 401
		refreshToken := createTestToken(t, jwtSecret, "admin", "refresh", 10*time.Minute, jwt.SigningMethodHS256)
		reqRef := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries", nil)
		reqRef.Header.Set("Authorization", "Bearer "+refreshToken)
		reqRef.Header.Set("x-healher-handshake", handshakeSecret)
		rrRef := httptest.NewRecorder()
		readHandler.ServeHTTP(rrRef, reqRef)
		if rrRef.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 for refresh token, got: %d", rrRef.Code)
		}

		// Invalid handshake: 403
		validToken := createTestToken(t, jwtSecret, "admin", "access", 10*time.Minute, jwt.SigningMethodHS256)
		reqBadHandshake := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries", nil)
		reqBadHandshake.Header.Set("Authorization", "Bearer "+validToken)
		reqBadHandshake.Header.Set("x-healher-handshake", "wrong-secret")
		rrBadHandshake := httptest.NewRecorder()
		readHandler.ServeHTTP(rrBadHandshake, reqBadHandshake)
		if rrBadHandshake.Code != http.StatusForbidden {
			t.Errorf("expected 403 for bad handshake, got: %d", rrBadHandshake.Code)
		}
	})
}
