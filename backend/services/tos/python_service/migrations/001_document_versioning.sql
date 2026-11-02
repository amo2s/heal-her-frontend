-- ============================================================================
-- Migration: 001_document_versioning.sql
-- Destination: Supabase PostgreSQL (Production / Staging)
-- Microservice: tos-python-service (Legal Consent Microservice)
-- ============================================================================
-- Phase 1: High-Concurrency PostgreSQL Database Evolution
-- Adds document_version tracking to tos_audit_ledger and creates a compound
-- B-Tree index for sub-millisecond status checks at 10,000+ concurrent requests.
-- ============================================================================

-- 1. Surgical Schema Evolution: Add document_version with default '1.0'
ALTER TABLE tos_audit_ledger 
ADD COLUMN IF NOT EXISTS document_version VARCHAR(10) NOT NULL DEFAULT '1.0';

-- 2. Compound B-Tree Index for O(log N) Status Traversal:
-- Enables sub-millisecond interrogation on (client_email, document_version)
-- IMPORTANT: Execute in Supabase SQL Editor outside a transaction block for CONCURRENTLY.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tos_audit_email_version 
ON tos_audit_ledger (client_email, document_version);

-- 3. Temporal Composite Index:
-- Accelerates `ORDER BY execution_timestamp DESC LIMIT 1` queries for re-consent checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tos_audit_email_timestamp 
ON tos_audit_ledger (client_email, execution_timestamp DESC);

