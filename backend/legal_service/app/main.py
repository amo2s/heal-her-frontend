# app/main.py
import hashlib
import io
import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import jwt

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import TosAuditLedger
from app.db.session import get_db, init_db
from app.dependencies import AuthenticatedUser, get_current_user
from app.models.schemas import (
    EnrichedSignaturePayload,
    SignatureRequest,
    TOSExecutionResponse,
    TOSStatusResponse,
)
from app.services.mailer import dispatch_tos_confirmation_email_async
from app.services.renderer import DocumentRenderingError, render_tos_pdf
from app.services.storage import StorageUploadError, upload_document_to_vault

# Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("tos_service.api")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes PostgreSQL connection pool and ensures schema readiness on startup.
    """
    logger.info("Initializing Heal Her Legal Consent (TOS) Microservice...")
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"Database initialization deferred (verify DATABASE_URL): {e}")
    yield
    logger.info("TOS Microservice shutting down gracefully.")


app = FastAPI(
    title="Heal Her — Legal Consent (TOS) Microservice",
    description="Tier-1 Enterprise Python microservice for Zero-Trust legal contract execution, in-memory PDF rendering, and cryptographic audit logging.",
    version="0.2.0",
    lifespan=lifespan,
)

# Cross-Origin Security Armor
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Observability"])
async def health_check():
    """
    Liveness and readiness probe for container orchestrator.
    """
    return {
        "status": "healthy",
        "service": "tos-python-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.2.0",
    }


@app.get(
    "/api/v1/tos/status",
    response_model=TOSStatusResponse,
    status_code=status.HTTP_200_OK,
    tags=["Legal Consent"],
    summary="Check whether the authenticated user has executed the active version of the TOS & Privacy agreement"
)
@app.get(
    "/status",
    response_model=TOSStatusResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def get_tos_consent_status(
    user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sub-10ms Status Interrogation with Dynamic Version Gatekeeping:
    Fetches the most recent signature record for client_email ordered by execution_timestamp DESC.
    
    Logic Matrix:
    1. No record exists -> has_signed: false, requires_reconsent: false (Brand new user)
    2. Record exists AND record.document_version == settings.active_tos_version -> has_signed: true, requires_reconsent: false (Fully compliant)
    3. Record exists AND record.document_version != settings.active_tos_version -> has_signed: false, requires_reconsent: true (User signed outdated version; must re-consent)
    """
    try:
        query = text(
            """
            SELECT document_version 
            FROM tos_audit_ledger 
            WHERE client_email = :email 
            ORDER BY execution_timestamp DESC 
            LIMIT 1
            """
        )
        result = await db.execute(query, {"email": user.email})
        row = result.fetchone()

        if row is None:
            # Case 1: Brand new user
            return TOSStatusResponse(
                has_signed=False,
                requires_reconsent=False,
                active_version=settings.active_tos_version,
            )

        recorded_version = str(row[0]) if row[0] is not None else ""
        if recorded_version == settings.active_tos_version:
            # Case 2: Fully compliant user on active version
            return TOSStatusResponse(
                has_signed=True,
                requires_reconsent=False,
                active_version=settings.active_tos_version,
            )
        else:
            # Case 3: Outdated version signature; requires re-consent
            return TOSStatusResponse(
                has_signed=False,
                requires_reconsent=True,
                active_version=settings.active_tos_version,
            )

    except Exception as exc:
        logger.error(f"Error querying TOS consent status for user {user.email}: {exc}")
        return TOSStatusResponse(
            has_signed=False,
            requires_reconsent=False,
            active_version=settings.active_tos_version,
        )


@app.post(
    "/api/v1/tos/execute",
    response_model=TOSExecutionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Legal Consent"],
    summary="Execute, cryptographically sign, and vault a Terms of Service agreement"
)
@app.post(
    "/execute",
    response_model=TOSExecutionResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def execute_tos_agreement(
    payload: SignatureRequest,
    background_tasks: BackgroundTasks,
    user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Core Consolidation Endpoint:
    1. Authenticates caller via JWT Bearer token and captures IP telemetry.
    2. Enforces parental consent matrix validation via Pydantic V2.
    3. Compiles A4 PDF in RAM via WeasyPrint with AES-256 cryptographic lockdown.
    4. Computes SHA-512 non-repudiation digest.
    5. Vaults document to Supabase Storage asynchronously.
    6. Commits immutable audit entry to PostgreSQL tos_audit_ledger.
    7. Schedules asynchronous email dispatch via BackgroundTasks for 0ms user latency.
    """
    request_id = uuid.uuid4()
    logger.info(f"Processing TOS execution [Request ID: {request_id}] for user: {user.email}")

    # 1. Asymmetric Cryptographic JIT Receipt Verification (Ed25519 / EdDSA)
    try:
        jit_claims = jwt.decode(
            payload.jit_receipt,
            settings.jit_ed25519_public_key,
            algorithms=["EdDSA"],
            issuer="heal-her-rust-auth",
            options={"require": ["sub", "ctx", "jti", "exp", "iss"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="JIT consent authorization receipt has expired (TTL 60s exceeded). Please re-verify.",
        )
    except jwt.InvalidTokenError as exc:
        logger.warning(f"Invalid JIT receipt presented for user {user.email}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cryptographic JIT signature invalid: {exc}",
        )

    # 2. Context-Bound Zero-Trust Claims Enforcement
    if jit_claims.get("sub") != str(user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="JIT consent receipt subject does not match authenticated user.",
        )

    if jit_claims.get("ctx") != settings.active_tos_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"JIT consent version mismatch: receipt signed for version {jit_claims.get('ctx')}, but active platform version is {settings.active_tos_version}.",
        )

    try:
        jit_nonce = uuid.UUID(str(jit_claims.get("jti")))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed cryptographic JTI nonce in JIT receipt.",
        )

    # 3. Double-Spend Replay Attack Defense (PostgreSQL Nonce Gate)
    nonce_check_query = text(
        "SELECT 1 FROM tos_audit_ledger WHERE jit_nonce = :nonce LIMIT 1"
    )
    nonce_result = await db.execute(nonce_check_query, {"nonce": jit_nonce})
    if nonce_result.fetchone() is not None:
        logger.critical(
            f"REPLAY ATTACK DETECTED: Nonce {jit_nonce} already spent! Aborting execution for user {user.email}."
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cryptographic nonce already spent. Replay attack detected and aborted.",
        )

    # 4. Construct immutable enriched payload
    enriched_payload = EnrichedSignaturePayload(
        request_id=request_id,
        user_id=user.user_id,
        client_name=payload.client_name,
        client_email=user.email,
        is_parental_consent=payload.is_parental_consent,
        minor_name=payload.minor_name,
        minor_age=payload.minor_age,
        ip_address=user.ip_address,
        document_version=settings.active_tos_version,
        jit_nonce=jit_nonce,
    )

    # 5. Render and encrypt PDF entirely in RAM
    try:
        pdf_bytes = render_tos_pdf(enriched_payload)
    except DocumentRenderingError as exc:
        logger.error(f"Failed to render document for request {request_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document rendering failure. Please retry.",
        )

    # 6. Calculate deterministic SHA-512 non-repudiation fingerprint
    sha512_hash = hashlib.sha512(pdf_bytes).hexdigest()

    # 7. Asynchronously vault document to Supabase Storage
    timestamp_epoch = int(time.time())
    storage_path = f"{user.user_id}/{timestamp_epoch}_tos.pdf"

    try:
        await upload_document_to_vault(pdf_bytes, storage_path)
    except StorageUploadError as exc:
        logger.error(f"Storage vault upload failure for request {request_id}: {exc}")
        # Proceed with ledger record to guarantee audit compliance even if vault retry is needed

    # 8. Commit audit ledger record to PostgreSQL
    try:
        audit_entry = TosAuditLedger(
            request_id=request_id,
            client_name=payload.client_name,
            client_email=user.email,
            is_parental_consent=payload.is_parental_consent,
            minor_name=payload.minor_name,
            minor_age=payload.minor_age,
            ip_address=user.ip_address,
            sha512_hash=sha512_hash,
            storage_path=storage_path,
            document_version=settings.active_tos_version,
            jit_nonce=jit_nonce,
            execution_timestamp=datetime.now(timezone.utc),
        )
        db.add(audit_entry)
        await db.commit()
        logger.info(
            f"Committed audit record to tos_audit_ledger [Request ID: {request_id}, Version: {settings.active_tos_version}, Nonce: {jit_nonce}, SHA: {sha512_hash[:16]}...]"
        )
    except Exception as exc:
        await db.rollback()
        logger.critical(f"Database commit failure for tos_audit_ledger: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record document audit trail in database.",
        )

    # 6. Schedule zero-latency asynchronous email dispatch
    background_tasks.add_task(
        dispatch_tos_confirmation_email_async,
        email=user.email,
        client_name=payload.client_name,
        request_id=request_id,
        storage_path=storage_path,
        document_hash=sha512_hash,
    )

    # 7. Return instantaneous success response
    return TOSExecutionResponse(
        status="success",
        message="Terms of Service agreement executed and cryptographically sealed.",
        request_id=request_id,
        document_hash=sha512_hash,
        storage_path=storage_path,
        document_version=settings.active_tos_version,
    )


# Backward-compatibility endpoint for legacy gateway rendering delegation
@app.post(
    "/api/v1/render",
    response_class=StreamingResponse,
    include_in_schema=False
)
async def legacy_render_endpoint(payload: EnrichedSignaturePayload):
    """
    Maintains compatibility with legacy Go orchestrator during migration window.
    """
    try:
        pdf_bytes = render_tos_pdf(payload)
        document_hash = hashlib.sha512(pdf_bytes).hexdigest()
        headers = {
            "X-Document-Hash": document_hash,
            "Content-Disposition": f'attachment; filename="tos_{payload.request_id}.pdf"',
        }
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers=headers,
        )
    except DocumentRenderingError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
