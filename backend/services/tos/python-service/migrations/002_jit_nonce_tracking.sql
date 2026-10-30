-- Migration: 002_jit_nonce_tracking.sql
-- Description: Adds jit_nonce UUID column to tos_audit_ledger to prevent replay / double-spend attacks on Ed25519 JIT consent tokens.

ALTER TABLE tos_audit_ledger ADD COLUMN IF NOT EXISTS jit_nonce UUID UNIQUE;

-- Concurrently index jit_nonce for O(1) replay verification lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tos_audit_jit_nonce ON tos_audit_ledger (jit_nonce);

