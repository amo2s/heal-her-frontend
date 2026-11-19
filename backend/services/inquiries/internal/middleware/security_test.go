package middleware

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSecurityHeaders(t *testing.T) {
	handler := SecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Error("missing X-Content-Type-Options: nosniff")
	}
	if rr.Header().Get("X-Frame-Options") != "DENY" {
		t.Error("missing X-Frame-Options: DENY")
	}
	if rr.Header().Get("Referrer-Policy") != "no-referrer" {
		t.Error("missing Referrer-Policy: no-referrer")
	}
	if rr.Header().Get("Cache-Control") != "no-store" {
		t.Error("missing Cache-Control: no-store")
	}
}

func TestEnforceJSONContentType(t *testing.T) {
	handler := EnforceJSONContentType(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	t.Run("valid application/json", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/test", strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json; charset=utf-8")
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", rr.Code)
		}
	})

	t.Run("missing content-type on POST", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/test", strings.NewReader(`{}`))
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusUnsupportedMediaType {
			t.Errorf("expected 415, got %d", rr.Code)
		}
	})

	t.Run("invalid content-type text/plain on POST", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/test", strings.NewReader(`test`))
		req.Header.Set("Content-Type", "text/plain")
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusUnsupportedMediaType {
			t.Errorf("expected 415, got %d", rr.Code)
		}
	})

	t.Run("GET request ignores content-type", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("expected 200 for GET, got %d", rr.Code)
		}
	})
}

func TestPayloadCap(t *testing.T) {
	const cap16KB = 16384
	capMiddleware := PayloadCap(cap16KB)

	handler := capMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := io.ReadAll(r.Body)
		if err != nil {
			if HandleMaxBytesError(err) {
				renderJSONError(w, http.StatusRequestEntityTooLarge, "Request body exceeds maximum allowed size")
				return
			}
			renderJSONError(w, http.StatusBadRequest, "Read error")
			return
		}
		w.WriteHeader(http.StatusOK)
	}))

	t.Run("body under 16 KB is accepted", func(t *testing.T) {
		body := bytes.Repeat([]byte("a"), 1024) // 1 KB
		req := httptest.NewRequest(http.MethodPost, "/test", bytes.NewReader(body))
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", rr.Code)
		}
	})

	t.Run("body over 16 KB is rejected with 413", func(t *testing.T) {
		body := bytes.Repeat([]byte("a"), 16385) // 16 KB + 1 byte
		req := httptest.NewRequest(http.MethodPost, "/test", bytes.NewReader(body))
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusRequestEntityTooLarge {
			t.Errorf("expected 413 Payload Too Large, got %d", rr.Code)
		}
	})
}

func TestPanicRecovery(t *testing.T) {
	handler := PanicRecovery(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("database connection string dropped")
	}))

	req := httptest.NewRequest(http.MethodGet, "/panic", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 Internal Server Error, got %d", rr.Code)
	}

	body := rr.Body.String()
	if strings.Contains(body, "database connection string dropped") {
		t.Error("panic recovery leaked internal panic message to client")
	}
}
