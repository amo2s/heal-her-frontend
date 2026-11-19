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

// DefaultAdminRoles contains the administrative roles discovered from repository inspection.
const DefaultAdminRoles = "admin,owner,super_admin,superadmin,teacher,counselor,staff,principal,management"

// Config encapsulates validated runtime configuration for the Inquiries service.
type Config struct {
	BindHost                string
	Port                    string
	DatabaseURL             string
	JWTSecretKey            string
	FrontendHandshakeSecret string
	GoogleMailerWebhookURL  string
	AdminRoles              []string
	AdminRoleMap            map[string]struct{}
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

	rawAdminRoles := getEnv("INQUIRIES_ADMIN_ROLES", DefaultAdminRoles)
	roleSlice := strings.Split(rawAdminRoles, ",")
	adminRoles := make([]string, 0, len(roleSlice))
	adminRoleMap := make(map[string]struct{}, len(roleSlice))
	for _, r := range roleSlice {
		cleaned := strings.ToLower(strings.TrimSpace(r))
		if cleaned != "" {
			if _, exists := adminRoleMap[cleaned]; !exists {
				adminRoles = append(adminRoles, cleaned)
				adminRoleMap[cleaned] = struct{}{}
			}
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
		AdminRoles:              adminRoles,
		AdminRoleMap:            adminRoleMap,
		RateLimitPerMin:         rateLimitPerMin,
		RateLimitBurst:          rateLimitBurst,
		MailerWorkers:           mailerWorkers,
		MailerQueueSize:         mailerQueueSize,
		Environment:             envMode,
	}, nil
}

// IsAuthorizedRole checks if a normalized role string is present in the admin allowlist.
func (c *Config) IsAuthorizedRole(role string) bool {
	normalized := strings.ToLower(strings.TrimSpace(role))
	_, ok := c.AdminRoleMap[normalized]
	return ok
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
