-- name: CreateAuditRecord :one
INSERT INTO tos_audit_ledger (
    request_id,
    client_name,
    client_email,
    is_parental_consent,
    minor_name,
    minor_age,
    ip_address,
    sha512_hash,
    storage_path
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;