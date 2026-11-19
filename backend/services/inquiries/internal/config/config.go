package config

import (
	"bufio"
	"errors"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

// Default RBAC allowlists enforcing strict three-role consolidation.
const (
	DefaultReadRoles   = "super_admin,admin,staff"
	DefaultActionRoles = "admin,staff"
)

// Config encapsulates validated runtime configuration for the Inquiries service.
type Config struct {
	BindHost                string
	Port                    string
	DatabaseURL             string
	JWTSecretKey            string
	FrontendHandshakeSecret string
	GoogleMailerWebhookURL  string
	ReadRoles               []string
	ReadRoleMap             map[string]struct{}
	ActionRoles             []string
	ActionRoleMap           map[string]struct{}
	RateLimitPerMin         float64
	RateLimitBurst          int
	MailerWorkers           int
	MailerQueueSize         int
	Environment             string
}

// NormalizeDatabaseURL inspects the incoming database connection string.
// If it begins with postgresql+asyncpg://, it strips and rewrites it to postgres://.
// It also ensures consistent postgres:// scheme handling without logging credentials.
func NormalizeDatabaseURL(rawURL string) string {
	trimmed := strings.TrimSpace(rawURL)
	if strings.HasPrefix(trimmed, "postgresql+asyncpg://") {
		return "postgres://" + strings.TrimPrefix(trimmed, "postgresql+asyncpg://")
	}
	if strings.HasPrefix(trimmed, "postgresql://") {
		return "postgres://" + strings.TrimPrefix(trimmed, "postgresql://")
	}
	return trimmed
}

// Load reads and validates configuration from environment variables (with optional .env support).
func Load() (*Config, error) {
	// Attempt optional .env load if present, without failing if missing
	loadOptionalDotEnv(".env")

	bindHost := getEnv("INQUIRIES_BIND_HOST", "127.0.0.1")
	port := getEnv("INQUIRIES_PORT", "8083")

	rawDBURL := os.Getenv("DATABASE_URL")
	if strings.TrimSpace(rawDBURL) == "" {
		return nil, errors.New("DATABASE_URL is required and cannot be empty")
	}
	dbURL := NormalizeDatabaseURL(rawDBURL)

	jwtSecret := os.Getenv("JWT_SECRET_KEY")
	if len(strings.TrimSpace(jwtSecret)) < 16 {
		return nil, errors.New("JWT_SECRET_KEY is required and must be at least 16 characters")
	}

	frontendHandshake := strings.TrimSpace(os.Getenv("FRONTEND_HANDSHAKE_SECRET"))

	mailerWebhookURL := strings.TrimSpace(os.Getenv("GOOGLE_MAILER_WEBHOOK_URL"))
	if mailerWebhookURL == "" {
		return nil, errors.New("GOOGLE_MAILER_WEBHOOK_URL is required and cannot be empty")
	}
	parsedURL, err := url.Parse(mailerWebhookURL)
	if err != nil || parsedURL.Scheme != "https" || parsedURL.Host == "" {
		return nil, fmt.Errorf("GOOGLE_MAILER_WEBHOOK_URL must be a valid https:// URL, got: %q", mailerWebhookURL)
	}

	// 1. Parse Tier 1: Oversight & Read Roles (Default: super_admin, admin, staff)
	rawReadRoles := getEnv("INQUIRIES_READ_ROLES", DefaultReadRoles)
	readRoles, readRoleMap := parseRoleSet(rawReadRoles)
	if len(readRoles) == 0 {
		return nil, errors.New("INQUIRIES_READ_ROLES must contain at least one valid authorized role")
	}

	// 2. Parse Tier 2: Operational Action Roles (Default: admin, staff)
	rawActionRoles := getEnv("INQUIRIES_ACTION_ROLES", DefaultActionRoles)
	actionRoles, actionRoleMap := parseRoleSet(rawActionRoles)
	if len(actionRoles) == 0 {
		return nil, errors.New("INQUIRIES_ACTION_ROLES must contain at least one valid operational role")
	}

	// Startup Invariant: every action role must be valid, non-empty, and included in the read roles
	for _, ar := range actionRoles {
		if _, ok := readRoleMap[ar]; !ok {
			return nil, fmt.Errorf("action role %q must also be authorized in INQUIRIES_READ_ROLES", ar)
		}
	}

	rateLimitPerMin := getEnvFloat("INQUIRIES_RATE_LIMIT_PER_MIN", 1.0)
	if rateLimitPerMin <= 0 {
		rateLimitPerMin = 1.0
	}

	rateLimitBurst := getEnvInt("INQUIRIES_RATE_LIMIT_BURST", 3)
	if rateLimitBurst <= 0 {
		rateLimitBurst = 3
	}

	mailerWorkers := getEnvInt("INQUIRIES_MAILER_WORKERS", 4)
	if mailerWorkers <= 0 {
		mailerWorkers = 4
	}

	mailerQueueSize := getEnvInt("INQUIRIES_MAILER_QUEUE_SIZE", 100)
	if mailerQueueSize <= 0 {
		mailerQueueSize = 100
	}

	envMode := strings.ToLower(getEnv("APP_ENV", getEnv("ENVIRONMENT", "production")))

	return &Config{
		BindHost:                bindHost,
		Port:                    port,
		DatabaseURL:             dbURL,
		JWTSecretKey:            jwtSecret,
		FrontendHandshakeSecret: frontendHandshake,
		GoogleMailerWebhookURL:  mailerWebhookURL,
		ReadRoles:               readRoles,
		ReadRoleMap:             readRoleMap,
		ActionRoles:             actionRoles,
		ActionRoleMap:           actionRoleMap,
		RateLimitPerMin:         rateLimitPerMin,
		RateLimitBurst:          rateLimitBurst,
		MailerWorkers:           mailerWorkers,
		MailerQueueSize:         mailerQueueSize,
		Environment:             envMode,
	}, nil
}

// IsReadAuthorized checks if a role has executive oversight / read clearance.
func (c *Config) IsReadAuthorized(role string) bool {
	normalized := strings.ToLower(strings.TrimSpace(role))
	_, ok := c.ReadRoleMap[normalized]
	return ok
}

// IsActionAuthorized checks if a role has operational reply / ticket management authority.
func (c *Config) IsActionAuthorized(role string) bool {
	normalized := strings.ToLower(strings.TrimSpace(role))
	_, ok := c.ActionRoleMap[normalized]
	return ok
}

func parseRoleSet(raw string) ([]string, map[string]struct{}) {
	slice := strings.Split(raw, ",")
	roles := make([]string, 0, len(slice))
	roleMap := make(map[string]struct{}, len(slice))
	for _, r := range slice {
		cleaned := strings.ToLower(strings.TrimSpace(r))
		if cleaned != "" {
			if _, exists := roleMap[cleaned]; !exists {
				roles = append(roles, cleaned)
				roleMap[cleaned] = struct{}{}
			}
		}
	}
	return roles, roleMap
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	valStr := os.Getenv(key)
	if valStr == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(strings.TrimSpace(valStr))
	if err != nil {
		return defaultVal
	}
	return n
}

func getEnvFloat(key string, defaultVal float64) float64 {
	valStr := os.Getenv(key)
	if valStr == "" {
		return defaultVal
	}
	f, err := strconv.ParseFloat(strings.TrimSpace(valStr), 64)
	if err != nil {
		return defaultVal
	}
	return f
}

// loadOptionalDotEnv loads key=value pairs into the process environment if the file exists
// without overwriting existing environment variables.
func loadOptionalDotEnv(filenames ...string) {
	for _, fn := range filenames {
		file, err := os.Open(fn)
		if err != nil {
			continue
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				val := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
				if _, exists := os.LookupEnv(key); !exists {
					_ = os.Setenv(key, val)
				}
			}
		}
	}
}
