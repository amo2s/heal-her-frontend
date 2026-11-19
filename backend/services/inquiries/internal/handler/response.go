package handler

import (
	"encoding/json"
	"net/http"
)

// StandardErrorResponse defines the uniform error envelope.
type StandardErrorResponse struct {
	Status  string            `json:"status"`
	Message string            `json:"message"`
	Errors  map[string]string `json:"errors,omitempty"`
}

// RenderSuccess encodes the data payload as application/json with the given HTTP status code.
func RenderSuccess(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(data)
}

// RenderError renders a standardized error message in JSON format.
func RenderError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(StandardErrorResponse{
		Status:  "error",
		Message: message,
	})
}

// RenderValidationErrors renders an HTTP 422 Unprocessable Entity response with structured field errors.
func RenderValidationErrors(w http.ResponseWriter, errors map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnprocessableEntity)
	_ = json.NewEncoder(w).Encode(StandardErrorResponse{
		Status:  "error",
		Message: "Validation failed on one or more submitted fields",
		Errors:  errors,
	})
}
