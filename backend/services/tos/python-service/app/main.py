# app/main.py
import hashlib
import io
import logging

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from app.models.schemas import EnrichedSignaturePayload
from app.services.renderer import render_tos_pdf, DocumentRenderingError

# Configure structured logging for the microservice observability
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("tos_renderer.api")

app = FastAPI(
    title="TOS Rendering Service",
    description="Stateless internal microservice for generating and hashing cryptographic TOS documents.",
    version="1.0.0"
)

@app.post("/api/v1/render", response_class=StreamingResponse)
async def render_tos_document(payload: EnrichedSignaturePayload) -> StreamingResponse:
    """
    Receives enriched payload from the Go gateway, delegates PDF rendering and encryption,
    generates a cryptographic SHA-512 fingerprint, and streams the locked binary 
    back to the orchestrator.
    """
    logger.info(f"Received rendering request [ID: {payload.request_id}] for client: {payload.client_name}")
    
    try:
        # 1. Dispatch validated payload to the stateless rendering service
        # This handles Jinja2 compilation, WeasyPrint generation, and AES-256 lockdown.
        locked_pdf_bytes = render_tos_pdf(payload)
        
        # 2. Phase 5.2 - Fingerprinting: Generate deterministic SHA-512 hash 
        # of the finalized locked binary payload for the PostgreSQL ledger.
        document_hash = hashlib.sha512(locked_pdf_bytes).hexdigest()
        
        # 3. Phase 5.3 - Egress: Construct headers strictly required by the Go Gateway contract.
        headers = {
            "X-Document-Hash": document_hash,
            "Content-Disposition": f'attachment; filename="tos_{payload.request_id}.pdf"'
        }
        
        logger.info(f"Successfully processed request [ID: {payload.request_id}]. Egressing binary stream.")
        
        # Wrap the byte stream in io.BytesIO and dispatch via FastAPI StreamingResponse
        return StreamingResponse(
            io.BytesIO(locked_pdf_bytes),
            media_type="application/pdf",
            headers=headers
        )

    except DocumentRenderingError:
        # Masked domain exception: Return a generic 500 without leaking internal infrastructure
        raise HTTPException(status_code=500, detail="Internal document rendering failure")
        
    except Exception as e:
        # Fallback for completely unhandled transport errors, strongly masked from the frontend
        logger.critical(f"Unhandled transport failure for request [ID: {payload.request_id}]: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")