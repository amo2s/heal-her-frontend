package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"heal-her/inquiries/internal/config"
)

// NewPostgresPool establishes a hardened connection pool to Supabase PostgreSQL,
// strictly tailored for PgBouncer / Transaction Pooler (port 6543) compatibility.
func NewPostgresPool(ctx context.Context, cfg *config.Config) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database configuration: %w", err)
	}

	// Supabase Port 6543 PgBouncer Compatibility:
	// Use simple-protocol execution mode to prevent server-side prepared statement conflicts
	// across shared transaction pooler connections.
	poolConfig.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Conservative Container Pool Limits for shared container deployment:
	poolConfig.MaxConns = 8
	poolConfig.MinConns = 1
	poolConfig.MaxConnLifetime = 30 * time.Minute
	poolConfig.MaxConnIdleTime = 5 * time.Minute
	poolConfig.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize connection pool: %w", err)
	}

	// Startup Readiness Ping with strict 5-second timeout
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		// Redact details to avoid leaking credentials in logs
		return nil, fmt.Errorf("database startup ping failed: target host is unreachable: %w", err)
	}

	slog.Info("connected to Supabase PostgreSQL pooler",
		"max_conns", poolConfig.MaxConns,
		"min_conns", poolConfig.MinConns,
		"mode", "simple_protocol",
	)

	return pool, nil
}
