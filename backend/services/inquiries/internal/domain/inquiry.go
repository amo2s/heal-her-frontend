package domain

import (
	"time"

	"github.com/google/uuid"
)

// Ticket status constants
const (
	StatusOpen    = "OPEN"
	StatusReplied = "REPLIED"
	StatusClosed  = "CLOSED"
)

// Sender type constants
const (
	SenderTypeUser  = "USER"
	SenderTypeStaff = "STAFF"
)

// ContactInquiry mirrors the contact_inquiries table in Supabase PostgreSQL (9 columns).
type ContactInquiry struct {
	ID           uuid.UUID `json:"id" db:"id"`
	FullName     string    `json:"full_name" db:"full_name"`
	Organization string    `json:"organization" db:"organization"`
	Email        string    `json:"email" db:"email"`
	Subject      string    `json:"subject" db:"subject"`
	Status       string    `json:"status" db:"status"`
	IPAddress    *string   `json:"ip_address" db:"ip_address"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// InquiryMessage mirrors the inquiry_messages table in Supabase PostgreSQL (8 columns).
type InquiryMessage struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	InquiryID       uuid.UUID  `json:"inquiry_id" db:"inquiry_id"`
	SenderType      string     `json:"sender_type" db:"sender_type"`
	SenderID        *uuid.UUID `json:"sender_id" db:"sender_id"`
	SenderName      string     `json:"sender_name" db:"sender_name"`
	Body            string     `json:"body" db:"body"`
	EmailDispatched bool       `json:"email_dispatched" db:"email_dispatched"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
}

// CreateInquiryRequest defines the incoming public intake payload contract.
type CreateInquiryRequest struct {
	Name    string `json:"name"`
	Org     string `json:"org"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
	Website string `json:"website,omitempty"`
}

// CreateInquiryResponse defines the public response envelope upon successful intake.
type CreateInquiryResponse struct {
	Status        string    `json:"status"`
	InquiryID     uuid.UUID `json:"inquiry_id"`
	ReferenceCode string    `json:"reference_code"`
	TicketStatus  string    `json:"ticket_status"`
	Message       string    `json:"message"`
}

// DeriveReferenceCode formats a clean short reference code from an inquiry UUID.
// Format: REF-XXXXXXXX (first 8 hex characters, uppercase).
func DeriveReferenceCode(id uuid.UUID) string {
	raw := id.String()
	if len(raw) >= 8 {
		return "REF-" + stringsToUpper(raw[:8])
	}
	return "REF-" + stringsToUpper(raw)
}

func stringsToUpper(s string) string {
	b := []byte(s)
	for i, c := range b {
		if c >= 'a' && c <= 'z' {
			b[i] = c - 32
		}
	}
	return string(b)
}
