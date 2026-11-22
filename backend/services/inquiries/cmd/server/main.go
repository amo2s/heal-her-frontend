package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"heal-her/inquiries/internal/config"
	"heal-her/inquiries/internal/database"
	"heal-her/inquiries/internal/handler"
	"heal-her/inquiries/internal/mailer"
	"heal-her/inquiries/internal/middleware"
	"heal-her/inquiries/internal/repository"
	"heal-her/inquiries/internal/security"
)

func main() {
	// 1. Initialize Structured JSON Logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("booting Heal Her Inquiries microservice",
		"service", "inquiries",
		"version", "1.1.0",
		"arch", "go",
	)

	// 2. Load and Validate Configuration
	cfg, err := config.Load()
	if err != nil {
		slog.Error("fatal configuration error", "error", err)
		os.Exit(1)
	}

	if cfg.FrontendHandshakeSecret == "" && cfg.Environment != "local" && cfg.Environment != "development" && cfg.Environment != "test" {
		slog.Warn("FRONTEND_HANDSHAKE_SECRET is not configured; management routes will lack layer 7 handshake perimeter")
	}

	// 3. Initialize Hardened Supabase PostgreSQL Pool
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := database.NewPostgresPool(ctx, cfg)
	if err != nil {
		slog.Error("fatal database initialization error", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// 4. Initialize Repository and Asynchronous Mailer Worker Pool
	repo := repository.NewPostgresInquiryRepository(pool)
	mailWorkerPool := mailer.NewMailer(
		cfg.GoogleMailerWebhookURL,
		cfg.MailerWorkers,
		cfg.MailerQueueSize,
		repo,
	)

	// 5. Initialize Token-Bucket Rate Limiter
	rateLimiter := security.NewIPRateLimiter(cfg.RateLimitPerMin, cfg.RateLimitBurst)
	defer rateLimiter.Stop()

	// 6. Initialize HTTP Handlers
	intakeHandler := handler.NewIntakeHandler(repo, mailWorkerPool, pool)
	mgmtHandler := handler.NewManagementHandler(repo, mailWorkerPool)

	// 7. Compose Router and Layered Security Middlewares
	router := chi.NewRouter()

	// Global Perimeter Protection
	router.Use(middleware.PanicRecovery)
	router.Use(middleware.RequestID)
	router.Use(middleware.SecurityHeaders)
	router.Use(middleware.StructuredLogger)

	// Root Health Probe
	router.Get("/health", intakeHandler.HandleHealth)

	// Inquiries Namespace (/api/v1/inquiries)
	router.Route("/api/v1/inquiries", func(inq chi.Router) {
		// Ingress Health Probe
		inq.Get("/health", intakeHandler.HandleHealth)

		// Public Intake Endpoint (7-Layer Defense-in-Depth)
		inq.With(
			rateLimiter.Middleware,
			middleware.PayloadCap(16384), // 16 KB Body Cap
			middleware.EnforceJSONContentType,
		).Post("/", intakeHandler.HandleIntake)

		// Protected Management Operations (HS256 JWT + Handshake Guard + Live Session Revocation Guard)
		inq.Group(func(mgmt chi.Router) {
			sessionVerifier := NewPostgresSessionVerifier(pool)
			mgmt.Use(middleware.Authenticate(cfg, sessionVerifier))

			// Tier 1: Executive Oversight & Read Access (super_admin, admin, staff)
			mgmt.Group(func(read chi.Router) {
				read.Use(middleware.RequireReadAccess(cfg))

				// Static routes registered before UUID route
				read.Get("/stats", mgmtHandler.GetStats)
				read.Get("/", mgmtHandler.ListInquiries)
				read.Get("/{id}", mgmtHandler.GetInquiry)
			})

			// Tier 2: Operational Action Access (admin, staff; super_admin blocked)
			mgmt.Group(func(action chi.Router) {
				action.Use(middleware.RequireActionAccess(cfg))
				action.Use(middleware.PayloadCap(16384))
				action.Use(middleware.EnforceJSONContentType)

				action.Post("/{id}/reply", mgmtHandler.CreateReply)
				action.Patch("/{id}/status", mgmtHandler.UpdateStatus)
			})
		})
	})

	// 8. Configure Hardened HTTP Server
	bindAddress := fmt.Sprintf("%s:%s", cfg.BindHost, cfg.Port)
	server := &http.Server{
		Addr:              bindAddress,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    8192, // 8 KB
	}

	// 9. Launch Server Goroutine
	serverErr := make(chan error, 1)
	go func() {
		slog.Info("inquiries microservice listening for connections",
			"bind_host", cfg.BindHost,
			"port", cfg.Port,
			"addr", bindAddress,
		)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	// 10. Handle OS Termination Signals for Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	select {
	case err := <-serverErr:
		slog.Error("server startup failed", "error", err)
		os.Exit(1)
	case sig := <-quit:
		slog.Info("shutdown signal received; commencing zero-downtime drain", "signal", sig.String())
	}

	// 11. Graceful 15-Second Shutdown Lifecycle
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()

	// Step A: Stop accepting new HTTP requests and drain active connections
	if err := server.Shutdown(shutdownCtx); err != nil {
		slog.Error("HTTP server shutdown encountered an error", "error", err)
	} else {
		slog.Info("HTTP server stopped accepting connections and drained successfully")
	}

	// Step B: Drain and terminate in-flight mailer workers
	if err := mailWorkerPool.Shutdown(shutdownCtx); err != nil {
		slog.Error("mailer worker pool shutdown encountered an error", "error", err)
	}

	// Step C: Terminate rate limiter background cleaner
	rateLimiter.Stop()

	// Step D: Close pgxpool (deferred in main)
	slog.Info("inquiries microservice gracefully terminated")
}

// PostgresSessionVerifier checks session and user standing in Supabase PostgreSQL (SEC-003).
type PostgresSessionVerifier struct {
	pool *pgxpool.Pool
}

// NewPostgresSessionVerifier constructs a PostgreSQL session validator.
func NewPostgresSessionVerifier(pool *pgxpool.Pool) *PostgresSessionVerifier {
	return &PostgresSessionVerifier{pool: pool}
}

// VerifyActiveSession validates that the session row exists, is not revoked, has not expired,
// and that the associated user is active, not deleted, approved, and matches the presented role.
func (v *PostgresSessionVerifier) VerifyActiveSession(ctx context.Context, sessionID, userID, role string) (bool, error) {
	var dummy string
	query := `
		SELECT s.id::text
		FROM sessions s
		JOIN users u ON u.id = s.user_id
		WHERE s.id = $1::uuid
		  AND s.user_id = $2::uuid
		  AND s.is_revoked = FALSE
		  AND s.expires_at > NOW()
		  AND u.is_active = TRUE
		  AND u.deleted_at IS NULL
		  AND u.approval_status = 'APPROVED'
		  AND LOWER(TRIM(u.role)) = LOWER(TRIM($3))
	`
	err := v.pool.QueryRow(ctx, query, sessionID, userID, role).Scan(&dummy)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

