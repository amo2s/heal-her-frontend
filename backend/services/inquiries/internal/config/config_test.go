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

func TestConfigValidation(t *testing.T) {
	// Clear relevant env vars
	origDB := os.Getenv("DATABASE_URL")
	origJWT := os.Getenv("JWT_SECRET_KEY")
	origWebhook := os.Getenv("GOOGLE_MAILER_WEBHOOK_URL")
	defer func() {
		_ = os.Setenv("DATABASE_URL", origDB)
		_ = os.Setenv("JWT_SECRET_KEY", origJWT)
		_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", origWebhook)
	}()

	t.Run("missing DATABASE_URL", func(t *testing.T) {
		_ = os.Setenv("DATABASE_URL", "")
		_ = os.Setenv("JWT_SECRET_KEY", "super-secret-key-16-bytes-min")
		_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", "https://script.google.com/macros/s/xyz/exec")

		_, err := Load()
		if err == nil {
			t.Fatal("expected error for empty DATABASE_URL, got nil")
		}
	})

	t.Run("short JWT_SECRET_KEY", func(t *testing.T) {
		_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432/test")
		_ = os.Setenv("JWT_SECRET_KEY", "short")
		_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", "https://script.google.com/macros/s/xyz/exec")

		_, err := Load()
		if err == nil {
			t.Fatal("expected error for short JWT_SECRET_KEY, got nil")
		}
	})

	t.Run("invalid GOOGLE_MAILER_WEBHOOK_URL not https", func(t *testing.T) {
		_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432/test")
		_ = os.Setenv("JWT_SECRET_KEY", "super-secret-key-16-bytes-min")
		_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", "http://insecure.url/exec")

		_, err := Load()
		if err == nil {
			t.Fatal("expected error for non-https GOOGLE_MAILER_WEBHOOK_URL, got nil")
		}
	})

	t.Run("valid configuration and role parsing", func(t *testing.T) {
		_ = os.Setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@host:6543/db")
		_ = os.Setenv("JWT_SECRET_KEY", "a-very-secure-hmac-sha256-secret-32b")
		_ = os.Setenv("GOOGLE_MAILER_WEBHOOK_URL", "https://script.google.com/macros/s/ABCDEF/exec")
		_ = os.Setenv("INQUIRIES_ADMIN_ROLES", "Admin, Super_Admin, Teacher, counselor ")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("unexpected load error: %v", err)
		}

		if cfg.DatabaseURL != "postgres://user:pass@host:6543/db" {
			t.Errorf("expected normalized database URL, got: %s", cfg.DatabaseURL)
		}

		if !cfg.IsAuthorizedRole("admin") || !cfg.IsAuthorizedRole("ADMIN") || !cfg.IsAuthorizedRole("super_admin") || !cfg.IsAuthorizedRole("TEACHER") || !cfg.IsAuthorizedRole("counselor") {
			t.Errorf("failed role authorization check for allowed roles")
		}

		if cfg.IsAuthorizedRole("kid") || cfg.IsAuthorizedRole("teen") || cfg.IsAuthorizedRole("guest") {
			t.Errorf("end-user role erroneously marked authorized")
		}
	})
}
