package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Sentinel domain errors for mapping to HTTP status codes.
var (
	ErrInquiryNotFound = errors.New("inquiry not found")
	ErrInquiryClosed   = errors.New("cannot reply to closed inquiry")
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
	IPAddress    *string   `json:"ip_address,omitempty" db:"ip_address"`
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

// InquirySummary represents an aggregated item in the Management Portal inbox view.
type InquirySummary struct {
	ID              uuid.UUID  `json:"id"`
	ReferenceCode   string     `json:"reference_code"`
	FullName        string     `json:"full_name"`
	Organization    string     `json:"organization"`
	Email           string     `json:"email"`
	Subject         string     `json:"subject"`
	Status          string     `json:"status"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	MessageCount    int        `json:"message_count"`
	StaffReplyCount int        `json:"staff_reply_count"`
	LastRepliedBy   *string    `json:"last_replied_by"`
	LastMessageAt   *time.Time `json:"last_message_at"`
}

// PaginationMeta provides pagination cursor information.
type PaginationMeta struct {
	Total   int  `json:"total"`
	Limit   int  `json:"limit"`
	Offset  int  `json:"offset"`
	HasMore bool `json:"has_more"`
}

// InquiryListResponse envelopes paginated inbox inquiry summaries.
type InquiryListResponse struct {
	Status     string           `json:"status"`
	Data       []InquirySummary `json:"data"`
	Pagination PaginationMeta   `json:"pagination"`
}

// InquiryDetailResponse envelopes a full inquiry thread with chronological correspondence.
type InquiryDetailResponse struct {
	Status        string           `json:"status"`
	Inquiry       ContactInquiry   `json:"inquiry"`
	ReferenceCode string           `json:"reference_code"`
	Messages      []InquiryMessage `json:"messages"`
}

// StaffActivityStat holds aggregated productivity and accountability metrics per responder.
type StaffActivityStat struct {
	SenderID    *uuid.UUID `json:"sender_id"`
	SenderName  string     `json:"sender_name"`
	ReplyCount  int        `json:"reply_count"`
	LastReplyAt *time.Time `json:"last_reply_at"`
}

// StatusCounts aggregates ticket statuses.
type StatusCounts struct {
	Open    int `json:"open"`
	Replied int `json:"replied"`
	Closed  int `json:"closed"`
}

// InquiryStatsResponse represents executive oversight analytics for the Management Portal.
type InquiryStatsResponse struct {
	Status                 string              `json:"status"`
	TotalInquiries         int                 `json:"total_inquiries"`
	ByStatus               StatusCounts        `json:"by_status"`
	TotalMessages          int                 `json:"total_messages"`
	UserMessages           int                 `json:"user_messages"`
	StaffReplies           int                 `json:"staff_replies"`
	EmailsDispatched       int                 `json:"emails_dispatched"`
	EmailsPendingOrFailed  int                 `json:"emails_pending_or_failed"`
	StaffActivity          []StaffActivityStat `json:"staff_activity"`
}

// StaffReplyRequest defines the payload contract for staff responses.
type StaffReplyRequest struct {
	Body string `json:"body"`
}

// StatusUpdateRequest defines the payload contract for ticket status mutations.
type StatusUpdateRequest struct {
	Status string `json:"status"`
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
