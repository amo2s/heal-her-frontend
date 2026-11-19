package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

// CreateStaffReplyParams contains parameters for creating an authenticated staff reply.
type CreateStaffReplyParams struct {
	InquiryID  uuid.UUID
	SenderID   uuid.UUID
	SenderName string
	Body       string
}

// ListInquiriesFilter defines parameters for paginated inbox queries.
type ListInquiriesFilter struct {
	Status string
	Search string
	Limit  int
	Offset int
}

// InquiryRepository defines the persistence contract for contact inquiries and messages.
type InquiryRepository interface {
	CreateInquiryWithInitialMessage(ctx context.Context, params CreateInquiryParams) (*domain.ContactInquiry, *domain.InquiryMessage, error)
	MarkMessageEmailDispatched(ctx context.Context, messageID uuid.UUID) error
	ListInquiries(ctx context.Context, filter ListInquiriesFilter) ([]domain.InquirySummary, int, error)
	GetInquiryDetail(ctx context.Context, id uuid.UUID) (*domain.ContactInquiry, []domain.InquiryMessage, error)
	GetInquiryStats(ctx context.Context) (*domain.InquiryStatsResponse, error)
	CreateStaffReply(ctx context.Context, params CreateStaffReplyParams) (*domain.InquiryMessage, *domain.ContactInquiry, error)
	UpdateInquiryStatus(ctx context.Context, id uuid.UUID, newStatus string) (*domain.ContactInquiry, error)
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

// ListInquiries retrieves a paginated slice of inquiry summaries with message counts.
func (r *PostgresInquiryRepository) ListInquiries(ctx context.Context, filter ListInquiriesFilter) ([]domain.InquirySummary, int, error) {
	queryCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("ci.status = $%d", argIdx))
		args = append(args, filter.Status)
		argIdx++
	}

	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		conditions = append(conditions, fmt.Sprintf("(ci.full_name ILIKE $%d ESCAPE '\\' OR ci.organization ILIKE $%d ESCAPE '\\' OR ci.email ILIKE $%d ESCAPE '\\' OR ci.subject ILIKE $%d ESCAPE '\\')", argIdx, argIdx, argIdx, argIdx))
		args = append(args, searchPattern)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// 1. Total matching count
	countQuery := "SELECT COUNT(*) FROM contact_inquiries ci " + whereClause
	var total int
	if err := r.pool.QueryRow(queryCtx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to query total inquiry count: %w", err)
	}

	if total == 0 {
		return []domain.InquirySummary{}, 0, nil
	}

	// 2. Fetch paginated summaries with correlated/lateral aggregation
	listQuery := fmt.Sprintf(`
		SELECT 
			ci.id,
			ci.full_name,
			ci.organization,
			ci.email,
			ci.subject,
			ci.status,
			ci.created_at,
			ci.updated_at,
			COUNT(m.id) AS message_count,
			COUNT(m.id) FILTER (WHERE m.sender_type = 'STAFF') AS staff_reply_count,
			(SELECT m2.sender_name FROM inquiry_messages m2 WHERE m2.inquiry_id = ci.id AND m2.sender_type = 'STAFF' ORDER BY m2.created_at DESC LIMIT 1) AS last_replied_by,
			MAX(m.created_at) AS last_message_at
		FROM contact_inquiries ci
		LEFT JOIN inquiry_messages m ON m.inquiry_id = ci.id
		%s
		GROUP BY ci.id
		ORDER BY ci.updated_at DESC, ci.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIdx, argIdx+1)

	limitArgs := append(args, filter.Limit, filter.Offset)
	rows, err := r.pool.Query(queryCtx, listQuery, limitArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query inquiries: %w", err)
	}
	defer rows.Close()

	summaries := make([]domain.InquirySummary, 0, filter.Limit)
	for rows.Next() {
		var s domain.InquirySummary
		err := rows.Scan(
			&s.ID,
			&s.FullName,
			&s.Organization,
			&s.Email,
			&s.Subject,
			&s.Status,
			&s.CreatedAt,
			&s.UpdatedAt,
			&s.MessageCount,
			&s.StaffReplyCount,
			&s.LastRepliedBy,
			&s.LastMessageAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan inquiry summary row: %w", err)
		}
		s.ReferenceCode = domain.DeriveReferenceCode(s.ID)
		summaries = append(summaries, s)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating inquiry rows: %w", err)
	}

	return summaries, total, nil
}

// GetInquiryDetail fetches the inquiry header and all chronological thread messages.
func (r *PostgresInquiryRepository) GetInquiryDetail(ctx context.Context, id uuid.UUID) (*domain.ContactInquiry, []domain.InquiryMessage, error) {
	queryCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// 1. Fetch parent inquiry row
	inquiryQuery := `
		SELECT id, full_name, organization, email, subject, status, ip_address, created_at, updated_at
		FROM contact_inquiries
		WHERE id = $1
	`
	inquiry := &domain.ContactInquiry{}
	err := r.pool.QueryRow(queryCtx, inquiryQuery, id).Scan(
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, domain.ErrInquiryNotFound
		}
		return nil, nil, fmt.Errorf("failed to query inquiry detail: %w", err)
	}

	// 2. Fetch all child messages in chronological order
	messagesQuery := `
		SELECT id, inquiry_id, sender_type, sender_id, sender_name, body, email_dispatched, created_at
		FROM inquiry_messages
		WHERE inquiry_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(queryCtx, messagesQuery, id)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to query inquiry messages: %w", err)
	}
	defer rows.Close()

	messages := make([]domain.InquiryMessage, 0)
	for rows.Next() {
		var m domain.InquiryMessage
		err := rows.Scan(
			&m.ID,
			&m.InquiryID,
			&m.SenderType,
			&m.SenderID,
			&m.SenderName,
			&m.Body,
			&m.EmailDispatched,
			&m.CreatedAt,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to scan inquiry message row: %w", err)
		}
		messages = append(messages, m)
	}

	if err := rows.Err(); err != nil {
		return nil, nil, fmt.Errorf("error iterating message rows: %w", err)
	}

	return inquiry, messages, nil
}

// GetInquiryStats computes executive oversight analytics in fast aggregate queries.
func (r *PostgresInquiryRepository) GetInquiryStats(ctx context.Context) (*domain.InquiryStatsResponse, error) {
	queryCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	stats := &domain.InquiryStatsResponse{
		Status:        "success",
		StaffActivity: []domain.StaffActivityStat{},
	}

	// 1. Inquiries counts by status
	inquiryStatsQuery := `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE status = 'OPEN'),
			COUNT(*) FILTER (WHERE status = 'REPLIED'),
			COUNT(*) FILTER (WHERE status = 'CLOSED')
		FROM contact_inquiries
	`
	err := r.pool.QueryRow(queryCtx, inquiryStatsQuery).Scan(
		&stats.TotalInquiries,
		&stats.ByStatus.Open,
		&stats.ByStatus.Replied,
		&stats.ByStatus.Closed,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query inquiry counts: %w", err)
	}

	// 2. Messages counts
	msgStatsQuery := `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE sender_type = 'USER'),
			COUNT(*) FILTER (WHERE sender_type = 'STAFF'),
			COUNT(*) FILTER (WHERE email_dispatched = TRUE),
			COUNT(*) FILTER (WHERE email_dispatched = FALSE)
		FROM inquiry_messages
	`
	err = r.pool.QueryRow(queryCtx, msgStatsQuery).Scan(
		&stats.TotalMessages,
		&stats.UserMessages,
		&stats.StaffReplies,
		&stats.EmailsDispatched,
		&stats.EmailsPendingOrFailed,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query message counts: %w", err)
	}

	// 3. Staff activity breakdown (top 50 active responders)
	staffQuery := `
		SELECT 
			sender_id,
			sender_name,
			COUNT(*) AS reply_count,
			MAX(created_at) AS last_reply_at
		FROM inquiry_messages
		WHERE sender_type = 'STAFF'
		GROUP BY sender_id, sender_name
		ORDER BY reply_count DESC, last_reply_at DESC
		LIMIT 50
	`
	rows, err := r.pool.Query(queryCtx, staffQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query staff activity stats: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var sa domain.StaffActivityStat
		if err := rows.Scan(&sa.SenderID, &sa.SenderName, &sa.ReplyCount, &sa.LastReplyAt); err != nil {
			return nil, fmt.Errorf("failed to scan staff activity row: %w", err)
		}
		stats.StaffActivity = append(stats.StaffActivity, sa)
	}

	return stats, nil
}

// CreateStaffReply locks the inquiry, guards against closed status, persists the reply,
// and sets status to REPLIED inside an atomic transaction.
func (r *PostgresInquiryRepository) CreateStaffReply(ctx context.Context, params CreateStaffReplyParams) (*domain.InquiryMessage, *domain.ContactInquiry, error) {
	txCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	tx, err := r.pool.Begin(txCtx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(txCtx)
	}()

	// 1. Lock and inspect current inquiry state
	lockQuery := `
		SELECT id, full_name, organization, email, subject, status, ip_address, created_at, updated_at
		FROM contact_inquiries
		WHERE id = $1
		FOR UPDATE
	`
	inquiry := &domain.ContactInquiry{}
	err = tx.QueryRow(txCtx, lockQuery, params.InquiryID).Scan(
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, domain.ErrInquiryNotFound
		}
		return nil, nil, fmt.Errorf("failed to lock inquiry for reply: %w", err)
	}

	// 2. Closed-Ticket Guard: staff must explicitly reopen a closed ticket first
	if inquiry.Status == domain.StatusClosed {
		return nil, nil, domain.ErrInquiryClosed
	}

	// 3. Insert staff message
	insertMsgQuery := `
		INSERT INTO inquiry_messages (inquiry_id, sender_type, sender_id, sender_name, body, email_dispatched)
		VALUES ($1, 'STAFF', $2, $3, $4, FALSE)
		RETURNING id, inquiry_id, sender_type, sender_id, sender_name, body, email_dispatched, created_at
	`
	msg := &domain.InquiryMessage{}
	err = tx.QueryRow(txCtx, insertMsgQuery,
		params.InquiryID,
		params.SenderID,
		params.SenderName,
		params.Body,
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
		return nil, nil, fmt.Errorf("failed to insert staff reply message: %w", err)
	}

	// 4. Update parent ticket status to REPLIED
	updateInquiryQuery := `
		UPDATE contact_inquiries
		SET status = 'REPLIED', updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at
	`
	err = tx.QueryRow(txCtx, updateInquiryQuery, params.InquiryID).Scan(&inquiry.UpdatedAt)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to update inquiry status to REPLIED: %w", err)
	}
	inquiry.Status = domain.StatusReplied

	// 5. Commit transaction
	if err := tx.Commit(txCtx); err != nil {
		return nil, nil, fmt.Errorf("failed to commit staff reply transaction: %w", err)
	}

	return msg, inquiry, nil
}

// UpdateInquiryStatus mutates the status of an inquiry.
func (r *PostgresInquiryRepository) UpdateInquiryStatus(ctx context.Context, id uuid.UUID, newStatus string) (*domain.ContactInquiry, error) {
	updateCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `
		UPDATE contact_inquiries
		SET status = $2, updated_at = NOW()
		WHERE id = $1
		RETURNING id, full_name, organization, email, subject, status, ip_address, created_at, updated_at
	`
	inquiry := &domain.ContactInquiry{}
	err := r.pool.QueryRow(updateCtx, query, id, newStatus).Scan(
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrInquiryNotFound
		}
		return nil, fmt.Errorf("failed to update inquiry status: %w", err)
	}

	return inquiry, nil
}
