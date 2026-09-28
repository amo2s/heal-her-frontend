// cmd/api/main.go
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
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"

	"tos-gateway/internal/mailer"
	"tos-gateway/internal/repository"
	"tos-gateway/internal/service"
)

func main() {
	// Enforce structured JSON logging for downstream observability
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	if err := run(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("application encountered a fatal error", "error", err)
		os.Exit(1)
	}
}

// run encapsulates the boot sequence to guarantee deferred cleanup executes on error.
func run() error {
	_ = godotenv.Load() // Silent failure acceptable; platform orchestrator may inject variables directly.

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Establish root context tied to OS interrupts for graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// 1. PostgreSQL Connection Pool via pgx
	dbCtx, dbCancel := context.WithTimeout(ctx, 10*time.Second)
	defer dbCancel()

	dbPool, err := pgxpool.New(dbCtx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return fmt.Errorf("failed to create database pool: %w", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(dbCtx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}
	slog.Info("PostgreSQL connection pool established")

	// 2. Redis Client Initialization
	redisOpts, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		return fmt.Errorf("invalid redis url: %w", err)
	}
	redisClient := redis.NewClient(redisOpts)
	defer redisClient.Close()

	if err := redisClient.Ping(dbCtx).Err(); err != nil {
		return fmt.Errorf("redis ping failed: %w", err)
	}
	slog.Info("Redis connection established")

	// 3. Mailer Initialization
	webhookURL := os.Getenv("GOOGLE_MAILER_WEBHOOK_URL")
	if webhookURL == "" {
		slog.Warn("GOOGLE_MAILER_WEBHOOK_URL is missing; email dispatch will fail")
	}
	mailerSvc, err := mailer.New(webhookURL)
	if err != nil {
		return fmt.Errorf("failed to initialize mailer: %w", err)
	}
	slog.Info("Mailer service initialized")

	// 4. Repository & Service Orchestrator Initialization
	repo := repository.New(dbPool)
	orchestratorSvc := service.NewOrchestrator(repo, mailerSvc)
	_ = orchestratorSvc // Ready to be injected into internal handlers

	// 5. Router Configuration
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second)) // Hard request ceiling

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"healthy","component":"tos-gateway"}`))
	})

	// TODO: Mount JWT middleware and internal TOS handlers here passing orchestratorSvc

	// 6. Server Configuration & Graceful Teardown
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  10 * time.Second, // Mitigates Slowloris attacks
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  time.Minute,
	}

	errChan := make(chan error, 1)
	go func() {
		slog.Info("TOS Gateway starting", "port", port)
		errChan <- srv.ListenAndServe()
	}()

	select {
	case err := <-errChan:
		return err
	case <-ctx.Done():
		slog.Info("Shutdown signal received, initiating graceful teardown")

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer shutdownCancel()

		return srv.Shutdown(shutdownCtx)
	}
}