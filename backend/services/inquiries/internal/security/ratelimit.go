package security

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/netip"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

const (
	defaultMaxEntries  = 10000
	defaultCleanupFreq = 5 * time.Minute
	defaultEntryTTL    = 30 * time.Minute
)

type ipBucket struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// IPRateLimiter provides a memory-safe, thread-safe token bucket rate limiter per client IP.
type IPRateLimiter struct {
	mu         sync.RWMutex
	buckets    map[string]*ipBucket
	rateLimit  rate.Limit
	burst      int
	maxEntries int
	ctx        context.Context
	cancel     context.CancelFunc
}

// NewIPRateLimiter initializes an IP-based token-bucket rate limiter.
func NewIPRateLimiter(ratePerMin float64, burst int) *IPRateLimiter {
	ctx, cancel := context.WithCancel(context.Background())
	// Convert per-minute rate to per-second rate.Limit
	rLimit := rate.Limit(ratePerMin / 60.0)
	if ratePerMin <= 0 {
		rLimit = rate.Every(time.Minute)
	}

	limiter := &IPRateLimiter{
		buckets:    make(map[string]*ipBucket),
		rateLimit:  rLimit,
		burst:      burst,
		maxEntries: defaultMaxEntries,
		ctx:        ctx,
		cancel:     cancel,
	}

	go limiter.cleanupLoop(defaultCleanupFreq, defaultEntryTTL)

	return limiter
}

// Stop terminates the background cleanup goroutine.
func (rl *IPRateLimiter) Stop() {
	if rl.cancel != nil {
		rl.cancel()
	}
}

// ExtractClientIP resolves the genuine client IP according to strict priority order.
func ExtractClientIP(r *http.Request) string {
	// 1. X-Real-IP
	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		if addr, err := netip.ParseAddr(realIP); err == nil {
			return addr.String()
		}
	}

	// 2. Leftmost non-empty IP from X-Forwarded-For
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		for _, part := range parts {
			candidate := strings.TrimSpace(part)
			if candidate != "" {
				if addr, err := netip.ParseAddr(candidate); err == nil {
					return addr.String()
				}
			}
		}
	}

	// 3. Fall back to RemoteAddr
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		if addr, err := netip.ParseAddr(host); err == nil {
			return addr.String()
		}
	}

	// Direct IP check on RemoteAddr if no port was present
	if addr, err := netip.ParseAddr(r.RemoteAddr); err == nil {
		return addr.String()
	}

	return "127.0.0.1"
}

// Allow checks if the given IP address is allowed to execute a request.
func (rl *IPRateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	bucket, exists := rl.buckets[ip]
	if !exists {
		// Enforce hard memory cap: evict oldest if at max capacity
		if len(rl.buckets) >= rl.maxEntries {
			rl.evictOldestLocked(rl.maxEntries / 10) // Evict oldest 10%
		}

		bucket = &ipBucket{
			limiter:  rate.NewLimiter(rl.rateLimit, rl.burst),
			lastSeen: now,
		}
		rl.buckets[ip] = bucket
	}

	bucket.lastSeen = now
	return bucket.limiter.Allow()
}

// Middleware returns an HTTP handler middleware enforcing the per-IP rate limit.
func (rl *IPRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := ExtractClientIP(r)

		if !rl.Allow(ip) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"status":  "error",
				"message": "Rate limit exceeded. Please wait before submitting another inquiry.",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (rl *IPRateLimiter) cleanupLoop(interval, ttl time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-rl.ctx.Done():
			return
		case <-ticker.C:
			rl.cleanup(ttl)
		}
	}
}

func (rl *IPRateLimiter) cleanup(ttl time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	cutoff := time.Now().Add(-ttl)
	for ip, b := range rl.buckets {
		if b.lastSeen.Before(cutoff) {
			delete(rl.buckets, ip)
		}
	}
}

func (rl *IPRateLimiter) evictOldestLocked(count int) {
	if count <= 0 {
		count = 100
	}
	type entry struct {
		ip       string
		lastSeen time.Time
	}
	entries := make([]entry, 0, len(rl.buckets))
	for ip, b := range rl.buckets {
		entries = append(entries, entry{ip: ip, lastSeen: b.lastSeen})
	}

	// Simple selection of oldest entries
	for i := 0; i < count && i < len(entries); i++ {
		oldestIdx := i
		for j := i + 1; j < len(entries); j++ {
			if entries[j].lastSeen.Before(entries[oldestIdx].lastSeen) {
				oldestIdx = j
			}
		}
		entries[i], entries[oldestIdx] = entries[oldestIdx], entries[i]
		delete(rl.buckets, entries[i].ip)
	}
}
