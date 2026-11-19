package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"heal-her/inquiries/internal/domain"
)

// CreateInquiryParams contains sanitized parameters for atomic inquiry intake.
type CreateInquiryParams struct {
	FullName     string
	Organization string
	Email        string
	Subject      string
	Message      string
	IPAddress    *string
}

// InquiryRepository defines the persistence contract for contact inquiries and messages.
type InquiryRepository interface {
	CreateInquiryWithInitialMessage(ctx context.Context, params CreateInquiryParams) (*domain.ContactInquiry, *domain.InquiryMessage, error)
	MarkMessageEmailDispatched(ctx context.Context, messageID uuid.UUID) error
}

// PostgresInquiryRepository is the pgxpool-backed implementation of InquiryRepository.
type PostgresInquiryRepository struct {
	pool *pgxpool.Pool
}

// NewPostgresInquiryRepository creates a new repository instance.
func NewPostgresInquiryRepository(pool *pgxpool.Pool) *PostgresInquiryRepository {
	return &PostgresInquiryRepository{pool: pool}
}

// CreateInquiryWithInitialMessage inserts the inquiry ticket and opening message in an atomic transaction.
func (r *PostgresInquiryRepository) CreateInquiryWithInitialMessage(ctx context.Context, params CreateInquiryParams) (*domain.ContactInquiry, *domain.InquiryMessage, error) {
	txCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	tx, err := r.pool.Begin(txCtx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(txCtx)
	}()

	// 1. Insert ticket header into contact_inquiries
	inquiryQuery := `
		INSERT INTO contact_inquiries (full_name, organization, email, subject, status, ip_address)
		VALUES ($1, $2, $3, $4, 'OPEN', $5)
		RETURNING id, full_name, organization, email, subject, status, ip_address, created_at, updated_at
	`
	inquiry := &domain.ContactInquiry{}
	err = tx.QueryRow(txCtx, inquiryQuery,
		params.FullName,
		params.Organization,
		params.Email,
		params.Subject,
		params.IPAddress,
	).Scan(
		&inquiry.ID,
		&inquiry.FullName,
		&inquiry.Organization,
		&inquiry.Email,
		&inquiry.Subject,
		&inquiry.Status,
		&inquiry.IPAddress,
		&inquiry.CreatedAt,
		&inquiry.UpdatedAt,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to insert contact inquiry: %w", err)
	}

	// 2. Insert opening message into inquiry_messages
	messageQuery := `
		INSERT INTO inquiry_messages (inquiry_id, sender_type, sender_id, sender_name, body, email_dispatched)
		VALUES ($1, 'USER', NULL, $2, $3, FALSE)
		RETURNING id, inquiry_id, sender_type, sender_id, sender_name, body, email_dispatched, created_at
	`
	msg := &domain.InquiryMessage{}
	err = tx.QueryRow(txCtx, messageQuery,
		inquiry.ID,
		params.FullName,
		params.Message,
	).Scan(
		&msg.ID,
		&msg.InquiryID,
		&msg.SenderType,
		&msg.SenderID,
		&msg.SenderName,
		&msg.Body,
		&msg.EmailDispatched,
		&msg.CreatedAt,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to insert initial inquiry message: %w", err)
	}

	// 3. Commit the transaction
	if err := tx.Commit(txCtx); err != nil {
		return nil, nil, fmt.Errorf("failed to commit inquiry transaction: %w", err)
	}

	return inquiry, msg, nil
}

// MarkMessageEmailDispatched updates inquiry_messages setting email_dispatched = TRUE.
func (r *PostgresInquiryRepository) MarkMessageEmailDispatched(ctx context.Context, messageID uuid.UUID) error {
	updateCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `UPDATE inquiry_messages SET email_dispatched = TRUE WHERE id = $1`
	_, err := r.pool.Exec(updateCtx, query, messageID)
	if err != nil {
		return fmt.Errorf("failed to mark message email dispatched: %w", err)
	}
	return nil
}
