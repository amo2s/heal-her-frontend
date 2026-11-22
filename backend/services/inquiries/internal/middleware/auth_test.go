package middleware

import (
	"context"
	"errors"
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

type testSessionVerifier struct {
	active bool
	err    error
}

func (m *testSessionVerifier) VerifyActiveSession(ctx context.Context, sessionID, userID, role string) (bool, error) {
	return m.active, m.err
}

func createTestToken(t *testing.T, secret string, role string, tokenType string, expOffset time.Duration, method jwt.SigningMethod) string {
	return createTestTokenWithApproval(t, secret, role, "APPROVED", tokenType, expOffset, method)
}

func createTestTokenWithApproval(t *testing.T, secret string, role string, approvalStatus string, tokenType string, expOffset time.Duration, method jwt.SigningMethod) string {
	t.Helper()
	now := time.Now()
	sid := uuid.New()
	claims := domain.Claims{
		Sub:            uuid.New(),
		SID:            &sid,
		Role:           role,
		TokenType:      tokenType,
		IAT:            now.Unix(),
		EXP:            now.Add(expOffset).Unix(),
		ApprovalStatus: approvalStatus,
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

	authMiddleware := Authenticate(cfg, &testSessionVerifier{active: true})
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

func TestFailClosedApprovalGate(t *testing.T) {
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

	authMiddleware := Authenticate(cfg, &testSessionVerifier{active: true})
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

	invalidStatuses := []string{"PENDING", "pending", "REJECTED", "rejected", "", "UNKNOWN"}
	roles := []string{"super_admin", "admin", "staff"}

	for _, role := range roles {
		for _, status := range invalidStatuses {
			t.Run(role+" with status '"+status+"' is rejected with 403 on Read and Action endpoints", func(t *testing.T) {
				token := createTestTokenWithApproval(t, jwtSecret, role, status, "access", 10*time.Minute, jwt.SigningMethodHS256)

				// Test Read endpoint
				reqRead := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/stats", nil)
				reqRead.Header.Set("Authorization", "Bearer "+token)
				reqRead.Header.Set("x-healher-handshake", handshakeSecret)
				rrRead := httptest.NewRecorder()
				readHandler.ServeHTTP(rrRead, reqRead)

				if rrRead.Code != http.StatusForbidden {
					t.Errorf("expected 403 Forbidden for Read tier with status %q, got: %d", status, rrRead.Code)
				}
				if !strings.Contains(rrRead.Body.String(), "Account approval required to access management inquiries") {
					t.Errorf("expected approval error message, got: %s", rrRead.Body.String())
				}

				// Test Action endpoint
				reqAction := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/123/reply", nil)
				reqAction.Header.Set("Authorization", "Bearer "+token)
				reqAction.Header.Set("x-healher-handshake", handshakeSecret)
				rrAction := httptest.NewRecorder()
				actionHandler.ServeHTTP(rrAction, reqAction)

				if rrAction.Code != http.StatusForbidden {
					t.Errorf("expected 403 Forbidden for Action tier with status %q, got: %d", status, rrAction.Code)
				}
				if !strings.Contains(rrAction.Body.String(), "Account approval required to access management inquiries") {
					t.Errorf("expected approval error message, got: %s", rrAction.Body.String())
				}
			})
		}
	}
}

func TestZeroWindowSessionRevocation(t *testing.T) {
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

	okHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	t.Run("active session succeeds with 200", func(t *testing.T) {
		auth := Authenticate(cfg, &testSessionVerifier{active: true, err: nil})
		handler := auth(okHandler)

		token := createTestTokenWithApproval(t, jwtSecret, "staff", "APPROVED", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Fatalf("expected 200 OK, got: %d (%s)", rr.Code, rr.Body.String())
		}
	})

	t.Run("revoked or inactive session fails with 401", func(t *testing.T) {
		auth := Authenticate(cfg, &testSessionVerifier{active: false, err: nil})
		handler := auth(okHandler)

		token := createTestTokenWithApproval(t, jwtSecret, "staff", "APPROVED", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401 Unauthorized, got: %d (%s)", rr.Code, rr.Body.String())
		}
		if !strings.Contains(rr.Body.String(), "Session revoked or account inactive") {
			t.Fatalf("expected revocation error message, got: %s", rr.Body.String())
		}
	})

	t.Run("verifier database error fails with 503", func(t *testing.T) {
		auth := Authenticate(cfg, &testSessionVerifier{active: false, err: errors.New("db connection failure")})
		handler := auth(okHandler)

		token := createTestTokenWithApproval(t, jwtSecret, "staff", "APPROVED", "access", 10*time.Minute, jwt.SigningMethodHS256)
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503 Service Unavailable, got: %d (%s)", rr.Code, rr.Body.String())
		}
		if !strings.Contains(rr.Body.String(), "session verification unavailable") {
			t.Fatalf("expected service unavailable error message, got: %s", rr.Body.String())
		}
	})

	t.Run("missing or nil sid fails with 401", func(t *testing.T) {
		auth := Authenticate(cfg, &testSessionVerifier{active: true, err: nil})
		handler := auth(okHandler)

		now := time.Now()
		claims := domain.Claims{
			Sub:            uuid.New(),
			SID:            nil, // Missing SID
			Role:           "staff",
			TokenType:      "access",
			IAT:            now.Unix(),
			EXP:            now.Add(10 * time.Minute).Unix(),
			ApprovalStatus: "APPROVED",
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenStr, err := token.SignedString([]byte(jwtSecret))
		if err != nil {
			t.Fatalf("failed to sign token: %v", err)
		}

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401 Unauthorized for missing SID, got: %d (%s)", rr.Code, rr.Body.String())
		}
		if !strings.Contains(rr.Body.String(), "missing or invalid session ID") {
			t.Fatalf("expected missing SID error message, got: %s", rr.Body.String())
		}
	})
}

