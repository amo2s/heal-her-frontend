package security

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestExtractClientIP(t *testing.T) {
	tests := []struct {
		name       string
		headers    map[string]string
		remoteAddr string
		expected   string
	}{
		{
			name: "prioritizes X-Real-IP",
			headers: map[string]string{
				"X-Real-IP":       "192.0.2.1",
				"X-Forwarded-For": "198.51.100.1, 203.0.113.1",
			},
			remoteAddr: "10.0.0.1:12345",
			expected:   "192.0.2.1",
		},
		{
			name: "falls back to leftmost X-Forwarded-For when X-Real-IP absent",
			headers: map[string]string{
				"X-Forwarded-For": "198.51.100.10, 203.0.113.5",
			},
			remoteAddr: "10.0.0.1:12345",
			expected:   "198.51.100.10",
		},
		{
			name: "falls back to RemoteAddr host",
			headers: map[string]string{},
			remoteAddr: "192.168.1.50:54321",
			expected:   "192.168.1.50",
		},
		{
			name: "handles IPv6 correctly",
			headers: map[string]string{
				"X-Real-IP": "2001:db8::1",
			},
			remoteAddr: "127.0.0.1:8080",
			expected:   "2001:db8::1",
		},
		{
			name: "sanitizes invalid IP string and falls back safely",
			headers: map[string]string{
				"X-Real-IP": "malicious<script>",
			},
			remoteAddr: "10.0.0.2:8080",
			expected:   "10.0.0.2",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/test", nil)
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}
			req.RemoteAddr = tt.remoteAddr

			got := ExtractClientIP(req)
			if got != tt.expected {
				t.Errorf("ExtractClientIP() = %q, expected %q", got, tt.expected)
			}
		})
	}
}

func TestIPRateLimiter(t *testing.T) {
	// 1 req/min, burst 2
	limiter := NewIPRateLimiter(1.0, 2)
	defer limiter.Stop()

	testIP := "203.0.113.99"

	// Request 1: allowed (uses burst token 1)
	if !limiter.Allow(testIP) {
		t.Error("expected request 1 to be allowed")
	}

	// Request 2: allowed (uses burst token 2)
	if !limiter.Allow(testIP) {
		t.Error("expected request 2 to be allowed")
	}

	// Request 3: rejected (burst exhausted)
	if limiter.Allow(testIP) {
		t.Error("expected request 3 to be rejected under burst 2 limit")
	}

	// Different IP should still be allowed
	if !limiter.Allow("203.0.113.100") {
		t.Error("expected independent IP to be allowed")
	}
}

func TestIPRateLimiterMiddleware(t *testing.T) {
	limiter := NewIPRateLimiter(1.0, 1)
	defer limiter.Stop()

	handler := limiter.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))

	// 1st request from IP
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", nil)
	req1.Header.Set("X-Real-IP", "198.51.100.42")
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Errorf("expected 200 OK, got %d", rr1.Code)
	}

	// 2nd immediate request from same IP should get 429
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", nil)
	req2.Header.Set("X-Real-IP", "198.51.100.42")
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)

	if rr2.Code != http.StatusTooManyRequests {
		t.Errorf("expected 429 Too Many Requests, got %d", rr2.Code)
	}

	if rr2.Header().Get("Retry-After") != "60" {
		t.Errorf("expected Retry-After 60, got %s", rr2.Header().Get("Retry-After"))
	}
}

func TestIPRateLimiterCleanup(t *testing.T) {
	limiter := NewIPRateLimiter(1.0, 1)
	defer limiter.Stop()

	// Add an entry
	limiter.Allow("192.0.2.1")

	limiter.mu.Lock()
	if len(limiter.buckets) != 1 {
		t.Errorf("expected 1 bucket, got %d", len(limiter.buckets))
	}
	// Manually age the bucket
	limiter.buckets["192.0.2.1"].lastSeen = time.Now().Add(-1 * time.Hour)
	limiter.mu.Unlock()

	// Run cleanup with 30m TTL
	limiter.cleanup(30 * time.Minute)

	limiter.mu.RLock()
	if len(limiter.buckets) != 0 {
		t.Errorf("expected 0 buckets after cleanup, got %d", len(limiter.buckets))
	}
	limiter.mu.RUnlock()
}
