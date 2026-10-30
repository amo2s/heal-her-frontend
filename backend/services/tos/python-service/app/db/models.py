# app/db/models.py
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TosAuditLedger(Base):
    """
    Cryptographic Audit Ledger matching PostgreSQL tos_audit_ledger table.
    Enforces non-repudiation by preserving SHA-512 digest, client metadata,
    and storage path coordinates.
    """
    __tablename__ = "tos_audit_ledger"

    request_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        index=True,
        doc="Deterministic UUID assigned to the execution cycle"
    )
    client_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Full legal name of the user or parent/guardian"
    )
    client_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Verified email address derived from authenticated JWT"
    )
    is_parental_consent: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        doc="Whether document execution applies to a minor"
    )
    minor_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Name of the minor if parental consent is active"
    )
    minor_age: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Age of the minor (0-17) if parental consent is active"
    )
    ip_address: Mapped[str] = mapped_column(
        String(45),
        nullable=False,
        doc="Client IP address recorded during signature execution"
    )
    sha512_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        unique=True,
        index=True,
        doc="Cryptographic SHA-512 checksum of the finalized PDF binary"
    )
    storage_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
        doc="Path coordinate of the PDF within the Supabase tos-vault bucket"
    )
    document_version: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="1.0",
        doc="Document version of the legal terms executed (e.g. '1.0')"
    )
    execution_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        doc="UTC timestamp marking official signature execution"
    )

