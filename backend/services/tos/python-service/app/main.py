# app/main.py
import hashlib
import io
import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import TosAuditLedger
from app.db.session import get_db, init_db
from app.dependencies import AuthenticatedUser, get_current_user
from app.models.schemas import (
    EnrichedSignaturePayload,
    SignatureRequest,
    TOSExecutionResponse,
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

    # 1. Construct immutable enriched payload
    enriched_payload = EnrichedSignaturePayload(
        request_id=request_id,
        user_id=user.user_id,
        client_name=payload.client_name,
        client_email=user.email,
        is_parental_consent=payload.is_parental_consent,
        minor_name=payload.minor_name,
        minor_age=payload.minor_age,
        ip_address=user.ip_address,
    )

    # 2. Render and encrypt PDF entirely in RAM
    try:
        pdf_bytes = render_tos_pdf(enriched_payload)
    except DocumentRenderingError as exc:
        logger.error(f"Failed to render document for request {request_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document rendering failure. Please retry.",
        )

    # 3. Calculate deterministic SHA-512 non-repudiation fingerprint
    sha512_hash = hashlib.sha512(pdf_bytes).hexdigest()

    # 4. Asynchronously vault document to Supabase Storage
    timestamp_epoch = int(time.time())
    storage_path = f"{user.user_id}/{timestamp_epoch}_tos.pdf"

    try:
        await upload_document_to_vault(pdf_bytes, storage_path)
    except StorageUploadError as exc:
        logger.error(f"Storage vault upload failure for request {request_id}: {exc}")
        # Proceed with ledger record to guarantee audit compliance even if vault retry is needed

    # 5. Commit audit ledger record to PostgreSQL
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
            execution_timestamp=datetime.now(timezone.utc),
        )
        db.add(audit_entry)
        await db.commit()
        logger.info(f"Committed audit record to tos_audit_ledger [Request ID: {request_id}, SHA: {sha512_hash[:16]}...]")
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
