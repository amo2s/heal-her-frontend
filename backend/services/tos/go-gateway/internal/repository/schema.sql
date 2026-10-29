CREATE TABLE tos_audit_ledger (
    request_id UUID PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    is_parental_consent BOOLEAN NOT NULL,
    minor_name VARCHAR(255),
    minor_age INTEGER,
    ip_address VARCHAR(45) NOT NULL,
    sha512_hash VARCHAR(128) NOT NULL UNIQUE,
    storage_path VARCHAR(512) NOT NULL,
    execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);