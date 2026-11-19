package config

import (
	"os"
	"testing"
)

func TestNormalizeDatabaseURL(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "postgresql+asyncpg rewrite",
			input:    "postgresql+asyncpg://postgres:secret@db.supabase.co:6543/postgres",
			expected: "postgres://postgres:secret@db.supabase.co:6543/postgres",
		},
		{
			name:     "postgresql standard prefix rewrite",
			input:    "postgresql://postgres:secret@db.supabase.co:6543/postgres",
			expected: "postgres://postgres:secret@db.supabase.co:6543/postgres",
		},
		{
			name:     "postgres standard prefix untouched",
			input:    "postgres://postgres:secret@db.supabase.co:6543/postgres",
			expected: "postgres://postgres:secret@db.supabase.co:6543/postgres",
		},
		{
			name:     "whitespace trimmed",
			input:    "  postgresql+asyncpg://postgres:pass@host:5432/db  ",
			expected: "postgres://postgres:pass@host:5432/db",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NormalizeDatabaseURL(tt.input)
			if result != tt.expected {
				t.Errorf("NormalizeDatabaseURL(%q) = %q; expected %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestConfigValidationAndStrictRBAC(t *testing.T) {
	// Preserve original env vars
	origDB := os.Getenv("DATABASE_URL")
	origJWT := os.Getenv("JWT_SECRET_KEY")
	origWebhook := os.Getenv("GOOGLE_MAILER_WEBHOOK_URL")
	origReadRoles := os.Getenv("INQUIRIES_READ_ROLES")
	origActionRoles := os.Getenv("INQUIRIES_ACTION_ROLES")
	defer func() {
		_ = os.Setenv("DATABASE_URL", origDB)
		_ = os.Setenv("JWT_SECRET_KEY", origJWT)
		_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", origWebhook)
		_ = os.Setenv("INQUIRIES_READ_ROLES", origReadRoles)
		_ = os.Setenv("INQUIRIES_ACTION_ROLES", origActionRoles)
	}()

	_ = os.Setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@host:6543/db")
	_ = os.Setenv("JWT_SECRET_KEY", "a-very-secure-hmac-sha256-secret-32b")
	_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", "https://script.google.com/macros/s/ABCDEF/exec")
	_ = os.Unsetenv("INQUIRIES_READ_ROLES")
	_ = os.Unsetenv("INQUIRIES_ACTION_ROLES")

	t.Run("default RBAC allowlists enforce strict three-role governance", func(t *testing.T) {
		cfg, err := Load()
		if err != nil {
			t.Fatalf("unexpected load error: %v", err)
		}

		// Verify Tier 1: Read clearance
		if !cfg.IsReadAuthorized("super_admin") || !cfg.IsReadAuthorized("SUPER_ADMIN") {
			t.Error("expected super_admin to have read authorization")
		}
		if !cfg.IsReadAuthorized("admin") || !cfg.IsReadAuthorized("staff") {
			t.Error("expected admin and staff to have read authorization")
		}

		// Verify Tier 2: Action clearance
		if cfg.IsActionAuthorized("super_admin") {
			t.Error("super_admin must NOT have operational action authorization (read-only oversight)")
		}
		if !cfg.IsActionAuthorized("admin") || !cfg.IsActionAuthorized("staff") {
			t.Error("expected admin and staff to have action authorization")
		}

		// Verify default read roles count is exactly 3
		if len(cfg.ReadRoles) != 3 {
			t.Errorf("expected exactly 3 default read roles, got: %v", cfg.ReadRoles)
		}
		// Verify default action roles count is exactly 2
		if len(cfg.ActionRoles) != 2 {
			t.Errorf("expected exactly 2 default action roles, got: %v", cfg.ActionRoles)
		}

		// Verify permanently retired and demographic roles are rejected by default
		retiredRoles := []string{
			"owner", "OWNER",
			"superadmin", "SUPERADMIN",
			"teacher", "TEACHER",
			"counselor", "COUNSELOR",
			"principal", "PRINCIPAL",
			"management", "MANAGEMENT",
			"kid", "teen", "young-adult", "user", "guest",
		}

		for _, role := range retiredRoles {
			if cfg.IsReadAuthorized(role) {
				t.Errorf("retired/demographic role %q erroneously authorized for read", role)
			}
			if cfg.IsActionAuthorized(role) {
				t.Errorf("retired/demographic role %q erroneously authorized for action", role)
			}
		}
	})

	t.Run("action role must be a subset of read roles", func(t *testing.T) {
		_ = os.Setenv("INQUIRIES_READ_ROLES", "super_admin,admin")
		_ = os.Setenv("INQUIRIES_ACTION_ROLES", "admin,staff") // staff is missing from read roles

		_, err := Load()
		if err == nil {
			t.Fatal("expected startup invariant error when action role is missing from read roles")
		}
	})
}
