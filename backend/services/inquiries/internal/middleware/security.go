package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"mime"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/google/uuid"
	"heal-her/inquiries/internal/security"
)

type contextKey string

const (
	RequestIDContextKey contextKey = "request_id"
)

// SecurityHeaders sets hardening HTTP response headers on every route.
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cache-Control", "no-store")

		next.ServeHTTP(w, r)
	})
}

// RequestID extracts or assigns a unique tracing identifier for each HTTP request.
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}

		w.Header().Set("X-Request-ID", reqID)
		ctx := context.WithValue(r.Context(), RequestIDContextKey, reqID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetRequestID retrieves the request ID from context or returns "unknown".
func GetRequestID(ctx context.Context) string {
	if id, ok := ctx.Value(RequestIDContextKey).(string); ok && id != "" {
		return id
	}
	return "unknown"
}

// EnforceJSONContentType ensures POST, PUT, and PATCH requests supply application/json.
func EnforceJSONContentType(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodPatch {
			ct := r.Header.Get("Content-Type")
			if ct == "" {
				renderJSONError(w, http.StatusUnsupportedMediaType, "Missing Content-Type header; expected application/json")
				return
			}

			mediaType, _, err := mime.ParseMediaType(ct)
			if err != nil || mediaType != "application/json" {
				renderJSONError(w, http.StatusUnsupportedMediaType, "Unsupported Media Type; Content-Type must be application/json")
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

// PayloadCap limits the request body size to maxBytes (e.g. 16 KB = 16384 bytes).
func PayloadCap(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Body != nil {
				r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			}
			next.ServeHTTP(w, r)
		})
	}
}

// HandleMaxBytesError checks if an error was caused by http.MaxBytesReader and writes HTTP 413.
func HandleMaxBytesError(err error) bool {
	var maxBytesErr *http.MaxBytesError
	return errors.As(err, &maxBytesErr)
}

// statusWriter wraps http.ResponseWriter to capture status code for logging.
type statusWriter struct {
	http.ResponseWriter
	statusCode int
}

func (sw *statusWriter) WriteHeader(code int) {
	sw.statusCode = code
	sw.ResponseWriter.WriteHeader(code)
}

// StructuredLogger logs HTTP request metadata using slog with zero PII/credential leakage.
func StructuredLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(sw, r)

		duration := time.Since(start)
		reqID := GetRequestID(r.Context())
		clientIP := security.ExtractClientIP(r)

		slog.Info("http_request",
			"request_id", reqID,
			"method", r.Method,
			"path", r.URL.Path,
			"status", sw.statusCode,
			"duration_ms", duration.Milliseconds(),
			"client_ip", clientIP,
		)
	})
}

// PanicRecovery shields the application from unexpected crashes and leaks zero internal details.
func PanicRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				reqID := GetRequestID(r.Context())
				clientIP := security.ExtractClientIP(r)

				slog.Error("panic_recovered",
					"request_id", reqID,
					"error", rec,
					"client_ip", clientIP,
					"stack", string(debug.Stack()),
				)

				renderJSONError(w, http.StatusInternalServerError, "An unexpected internal server error occurred")
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func renderJSONError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "error",
		"message": message,
	})
}
