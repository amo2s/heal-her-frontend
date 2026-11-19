package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"heal-her/inquiries/internal/config"
	"heal-her/inquiries/internal/domain"
	"heal-her/inquiries/internal/middleware"
	"heal-her/inquiries/internal/repository"
)

type mockManagementRepo struct {
	mu           sync.Mutex
	inquiries    map[uuid.UUID]*domain.ContactInquiry
	messages     map[uuid.UUID][]domain.InquiryMessage
	replyCalls   int
	statusCalls  int
	lastStatus   string
	lastReplyJob repository.CreateStaffReplyParams
}

func newMockManagementRepo() *mockManagementRepo {
	return &mockManagementRepo{
		inquiries: make(map[uuid.UUID]*domain.ContactInquiry),
		messages:  make(map[uuid.UUID][]domain.InquiryMessage),
	}
}

func (m *mockManagementRepo) CreateInquiryWithInitialMessage(ctx context.Context, params repository.CreateInquiryParams) (*domain.ContactInquiry, *domain.InquiryMessage, error) {
	return nil, nil, nil
}

func (m *mockManagementRepo) MarkMessageEmailDispatched(ctx context.Context, messageID uuid.UUID) error {
	return nil
}

func (m *mockManagementRepo) ListInquiries(ctx context.Context, filter repository.ListInquiriesFilter) ([]domain.InquirySummary, int, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	summaries := make([]domain.InquirySummary, 0)
	for _, inq := range m.inquiries {
		if filter.Status != "" && inq.Status != filter.Status {
			continue
		}
		if filter.Search != "" && !strings.Contains(strings.ToLower(inq.Subject), strings.ToLower(filter.Search)) {
			continue
		}
		summaries = append(summaries, domain.InquirySummary{
			ID:            inq.ID,
			ReferenceCode: domain.DeriveReferenceCode(inq.ID),
			FullName:      inq.FullName,
			Organization:  inq.Organization,
			Email:         inq.Email,
			Subject:       inq.Subject,
			Status:        inq.Status,
			CreatedAt:     inq.CreatedAt,
			UpdatedAt:     inq.UpdatedAt,
			MessageCount:  len(m.messages[inq.ID]),
		})
	}
	return summaries, len(summaries), nil
}

func (m *mockManagementRepo) GetInquiryDetail(ctx context.Context, id uuid.UUID) (*domain.ContactInquiry, []domain.InquiryMessage, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	inq, ok := m.inquiries[id]
	if !ok {
		return nil, nil, domain.ErrInquiryNotFound
	}
	msgs := m.messages[id]
	return inq, msgs, nil
}

func (m *mockManagementRepo) GetInquiryStats(ctx context.Context) (*domain.InquiryStatsResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	return &domain.InquiryStatsResponse{
		Status:         "success",
		TotalInquiries: len(m.inquiries),
		ByStatus: domain.StatusCounts{
			Open: len(m.inquiries),
		},
		StaffActivity: []domain.StaffActivityStat{},
	}, nil
}

func (m *mockManagementRepo) CreateStaffReply(ctx context.Context, params repository.CreateStaffReplyParams) (*domain.InquiryMessage, *domain.ContactInquiry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.replyCalls++
	m.lastReplyJob = params

	inq, ok := m.inquiries[params.InquiryID]
	if !ok {
		return nil, nil, domain.ErrInquiryNotFound
	}

	if inq.Status == domain.StatusClosed {
		return nil, nil, domain.ErrInquiryClosed
	}

	msgID := uuid.New()
	msg := domain.InquiryMessage{
		ID:         msgID,
		InquiryID:  params.InquiryID,
		SenderType: domain.SenderTypeStaff,
		SenderID:   &params.SenderID,
		SenderName: params.SenderName,
		Body:       params.Body,
		CreatedAt:  time.Now().UTC(),
	}

	m.messages[params.InquiryID] = append(m.messages[params.InquiryID], msg)
	inq.Status = domain.StatusReplied
	inq.UpdatedAt = time.Now().UTC()

	return &msg, inq, nil
}

func (m *mockManagementRepo) UpdateInquiryStatus(ctx context.Context, id uuid.UUID, newStatus string) (*domain.ContactInquiry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.statusCalls++
	m.lastStatus = newStatus

	inq, ok := m.inquiries[id]
	if !ok {
		return nil, domain.ErrInquiryNotFound
	}

	inq.Status = newStatus
	inq.UpdatedAt = time.Now().UTC()
	return inq, nil
}

func createManagementTestRouter(cfg *config.Config, repo repository.InquiryRepository, mailerMock EmailEnqueuer) http.Handler {
	r := chi.NewRouter()
	mgmtHandler := NewManagementHandler(repo, mailerMock)

	r.Route("/api/v1/inquiries", func(inq chi.Router) {
		inq.Use(middleware.Authenticate(cfg))

		// Tier 1: Read Access
		inq.Group(func(read chi.Router) {
			read.Use(middleware.RequireReadAccess(cfg))
			read.Get("/stats", mgmtHandler.GetStats)
			read.Get("/", mgmtHandler.ListInquiries)
			read.Get("/{id}", mgmtHandler.GetInquiry)
		})

		// Tier 2: Action Access
		inq.Group(func(action chi.Router) {
			action.Use(middleware.RequireActionAccess(cfg))
			action.Use(middleware.PayloadCap(16384))
			action.Use(middleware.EnforceJSONContentType)

			action.Post("/{id}/reply", mgmtHandler.CreateReply)
			action.Patch("/{id}/status", mgmtHandler.UpdateStatus)
		})
	})

	return r
}

func makeToken(secret string, role string, firstName string) string {
	now := time.Now()
	claims := domain.Claims{
		Sub:       uuid.New(),
		Role:      role,
		TokenType: "access",
		IAT:       now.Unix(),
		EXP:       now.Add(15 * time.Minute).Unix(),
		FirstName: &firstName,
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := t.SignedString([]byte(secret))
	return tokenStr
}

func TestManagementEndpoints(t *testing.T) {
	jwtSecret := "super-secure-mgmt-test-jwt-key-32b"
	handshakeSecret := "mgmt-handshake-secret"

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

	repo := newMockManagementRepo()
	mailerMock := &mockMailer{}
	router := createManagementTestRouter(cfg, repo, mailerMock)

	// Seed one OPEN ticket and one CLOSED ticket
	openID := uuid.New()
	closedID := uuid.New()

	repo.inquiries[openID] = &domain.ContactInquiry{
		ID:           openID,
		FullName:     "Alice Smith",
		Organization: "Springfield High",
		Email:        "alice@springfield.edu",
		Subject:      "Workshop Enrollment",
		Status:       domain.StatusOpen,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	repo.inquiries[closedID] = &domain.ContactInquiry{
		ID:           closedID,
		FullName:     "Bob Jones",
		Organization: "Metropolis Community",
		Email:        "bob@metro.org",
		Subject:      "Resolved Case",
		Status:       domain.StatusClosed,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	superAdminToken := makeToken(jwtSecret, "super_admin", "SuperExecutive")
	adminToken := makeToken(jwtSecret, "admin", "AdminDirector")
	staffToken := makeToken(jwtSecret, "staff", "StaffOfficer")
	userToken := makeToken(jwtSecret, "young-adult", "YoungAdultUser")

	// -------------------------------------------------------------------------
	// 1. GET /api/v1/inquiries/stats
	// -------------------------------------------------------------------------
	t.Run("GET /stats allowed for super_admin, admin, staff; rejected for regular user", func(t *testing.T) {
		for _, tok := range []string{superAdminToken, adminToken, staffToken} {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/stats", nil)
			req.Header.Set("Authorization", "Bearer "+tok)
			req.Header.Set("x-healher-handshake", handshakeSecret)
			rr := httptest.NewRecorder()
			router.ServeHTTP(rr, req)

			if rr.Code != http.StatusOK {
				t.Errorf("expected 200 for authorized role, got %d", rr.Code)
			}
		}

		// Regular user rejected
		reqUser := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/stats", nil)
		reqUser.Header.Set("Authorization", "Bearer "+userToken)
		reqUser.Header.Set("x-healher-handshake", handshakeSecret)
		rrUser := httptest.NewRecorder()
		router.ServeHTTP(rrUser, reqUser)

		if rrUser.Code != http.StatusForbidden {
			t.Errorf("expected 403 for user role, got %d", rrUser.Code)
		}
	})

	// -------------------------------------------------------------------------
	// 2. GET /api/v1/inquiries
	// -------------------------------------------------------------------------
	t.Run("GET /inquiries returns paginated list", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries?limit=10&offset=0", nil)
		req.Header.Set("Authorization", "Bearer "+staffToken)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Fatalf("expected 200, got: %d", rr.Code)
		}

		var resp domain.InquiryListResponse
		if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
			t.Fatalf("failed to parse list response: %v", err)
		}

		if resp.Pagination.Total != 2 {
			t.Errorf("expected total 2, got %d", resp.Pagination.Total)
		}
	})

	// -------------------------------------------------------------------------
	// 3. GET /api/v1/inquiries/{id}
	// -------------------------------------------------------------------------
	t.Run("GET /inquiries/{id} retrieves detail, rejects bad UUID and missing ticket", func(t *testing.T) {
		// Valid hit
		req := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/"+openID.String(), nil)
		req.Header.Set("Authorization", "Bearer "+superAdminToken)
		req.Header.Set("x-healher-handshake", handshakeSecret)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("expected 200 for valid hit, got %d", rr.Code)
		}

		// Malformed UUID: 400
		reqBad := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/not-a-uuid", nil)
		reqBad.Header.Set("Authorization", "Bearer "+superAdminToken)
		reqBad.Header.Set("x-healher-handshake", handshakeSecret)
		rrBad := httptest.NewRecorder()
		router.ServeHTTP(rrBad, reqBad)

		if rrBad.Code != http.StatusBadRequest {
			t.Errorf("expected 400 for malformed UUID, got %d", rrBad.Code)
		}

		// Non-existent UUID: 404
		reqNotFound := httptest.NewRequest(http.MethodGet, "/api/v1/inquiries/"+uuid.New().String(), nil)
		reqNotFound.Header.Set("Authorization", "Bearer "+superAdminToken)
		reqNotFound.Header.Set("x-healher-handshake", handshakeSecret)
		rrNotFound := httptest.NewRecorder()
		router.ServeHTTP(rrNotFound, reqNotFound)

		if rrNotFound.Code != http.StatusNotFound {
			t.Errorf("expected 404 for missing ticket, got %d", rrNotFound.Code)
		}
	})

	// -------------------------------------------------------------------------
	// 4. POST /api/v1/inquiries/{id}/reply
	// -------------------------------------------------------------------------
	t.Run("POST /{id}/reply permissions, validation, and closed-ticket guard", func(t *testing.T) {
		replyBody := `{"body":"We have approved your workshop request."}`

		// super_admin is BLOCKED on Action route: 403
		reqSuper := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/"+openID.String()+"/reply", strings.NewReader(replyBody))
		reqSuper.Header.Set("Content-Type", "application/json")
		reqSuper.Header.Set("Authorization", "Bearer "+superAdminToken)
		reqSuper.Header.Set("x-healher-handshake", handshakeSecret)
		rrSuper := httptest.NewRecorder()
		router.ServeHTTP(rrSuper, reqSuper)

		if rrSuper.Code != http.StatusForbidden {
			t.Errorf("expected 403 for super_admin on reply, got %d", rrSuper.Code)
		}

		// Staff reply succeeds: 201 Created & async email enqueued
		mailerMock.mu.Lock()
		initialEnqueued := len(mailerMock.enqueued)
		mailerMock.mu.Unlock()

		reqStaff := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/"+openID.String()+"/reply", strings.NewReader(replyBody))
		reqStaff.Header.Set("Content-Type", "application/json")
		reqStaff.Header.Set("Authorization", "Bearer "+staffToken)
		reqStaff.Header.Set("x-healher-handshake", handshakeSecret)
		rrStaff := httptest.NewRecorder()
		router.ServeHTTP(rrStaff, reqStaff)

		if rrStaff.Code != http.StatusCreated {
			t.Fatalf("expected 201 for staff reply, got %d (body: %s)", rrStaff.Code, rrStaff.Body.String())
		}

		mailerMock.mu.Lock()
		if len(mailerMock.enqueued) != initialEnqueued+1 {
			t.Errorf("expected mailer to have 1 new enqueued email job")
		}
		mailerMock.mu.Unlock()

		// Replying to CLOSED ticket returns 409 Conflict
		reqClosed := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/"+closedID.String()+"/reply", strings.NewReader(replyBody))
		reqClosed.Header.Set("Content-Type", "application/json")
		reqClosed.Header.Set("Authorization", "Bearer "+adminToken)
		reqClosed.Header.Set("x-healher-handshake", handshakeSecret)
		rrClosed := httptest.NewRecorder()
		router.ServeHTTP(rrClosed, reqClosed)

		if rrClosed.Code != http.StatusConflict {
			t.Errorf("expected 409 Conflict for reply on closed ticket, got %d", rrClosed.Code)
		}

		// Empty reply body: 422
		reqEmpty := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/"+openID.String()+"/reply", strings.NewReader(`{"body":" "}`))
		reqEmpty.Header.Set("Content-Type", "application/json")
		reqEmpty.Header.Set("Authorization", "Bearer "+adminToken)
		reqEmpty.Header.Set("x-healher-handshake", handshakeSecret)
		rrEmpty := httptest.NewRecorder()
		router.ServeHTTP(rrEmpty, reqEmpty)

		if rrEmpty.Code != http.StatusUnprocessableEntity {
			t.Errorf("expected 422 for empty reply body, got %d", rrEmpty.Code)
		}

		// Body > 16 KB: 413
		hugeBody := `{"body":"` + strings.Repeat("A", 17000) + `"}`
		reqHuge := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries/"+openID.String()+"/reply", strings.NewReader(hugeBody))
		reqHuge.Header.Set("Content-Type", "application/json")
		reqHuge.Header.Set("Authorization", "Bearer "+adminToken)
		reqHuge.Header.Set("x-healher-handshake", handshakeSecret)
		rrHuge := httptest.NewRecorder()
		router.ServeHTTP(rrHuge, reqHuge)

		if rrHuge.Code != http.StatusRequestEntityTooLarge {
			t.Errorf("expected 413 for oversized body, got %d", rrHuge.Code)
		}
	})

	// -------------------------------------------------------------------------
	// 5. PATCH /api/v1/inquiries/{id}/status
	// -------------------------------------------------------------------------
	t.Run("PATCH /{id}/status transitions and guards", func(t *testing.T) {
		// super_admin blocked: 403
		reqSuper := httptest.NewRequest(http.MethodPatch, "/api/v1/inquiries/"+openID.String()+"/status", strings.NewReader(`{"status":"CLOSED"}`))
		reqSuper.Header.Set("Content-Type", "application/json")
		reqSuper.Header.Set("Authorization", "Bearer "+superAdminToken)
		reqSuper.Header.Set("x-healher-handshake", handshakeSecret)
		rrSuper := httptest.NewRecorder()
		router.ServeHTTP(rrSuper, reqSuper)

		if rrSuper.Code != http.StatusForbidden {
			t.Errorf("expected 403 for super_admin on status update, got %d", rrSuper.Code)
		}

		// Admin updates status to CLOSED: 200 OK
		reqAdmin := httptest.NewRequest(http.MethodPatch, "/api/v1/inquiries/"+openID.String()+"/status", strings.NewReader(`{"status":"CLOSED"}`))
		reqAdmin.Header.Set("Content-Type", "application/json")
		reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
		reqAdmin.Header.Set("x-healher-handshake", handshakeSecret)
		rrAdmin := httptest.NewRecorder()
		router.ServeHTTP(rrAdmin, reqAdmin)

		if rrAdmin.Code != http.StatusOK {
			t.Fatalf("expected 200 for admin status update, got %d", rrAdmin.Code)
		}

		// Invalid status string: 422
		reqBadStatus := httptest.NewRequest(http.MethodPatch, "/api/v1/inquiries/"+openID.String()+"/status", strings.NewReader(`{"status":"DELETED"}`))
		reqBadStatus.Header.Set("Content-Type", "application/json")
		reqBadStatus.Header.Set("Authorization", "Bearer "+adminToken)
		reqBadStatus.Header.Set("x-healher-handshake", handshakeSecret)
		rrBadStatus := httptest.NewRecorder()
		router.ServeHTTP(rrBadStatus, reqBadStatus)

		if rrBadStatus.Code != http.StatusUnprocessableEntity {
			t.Errorf("expected 422 for invalid status enum, got %d", rrBadStatus.Code)
		}
	})
}
