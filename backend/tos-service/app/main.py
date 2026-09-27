# app/main.py
import hashlib
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, Field, model_validator

# Configure structured logging for the microservice observability
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("tos_renderer")

app = FastAPI(
    title="TOS Rendering Service",
    description="Stateless internal microservice for generating and hashing cryptographic TOS documents.",
    version="1.0.0"
)

class SignaturePayload(BaseModel):
    """
    Defines the exact JSON contract expected from the Go gateway.
    Strictly enforces the dual-track parental consent boundaries using Pydantic V2.
    """
    client_name: str = Field(..., min_length=2, max_length=255)
    is_parental_consent: bool
    minor_name: Optional[str] = Field(default=None, max_length=255)
    minor_age: Optional[int] = Field(default=None, ge=0, le=17)

    @model_validator(mode='after')
    def validate_parental_consent_matrix(self) -> 'SignaturePayload':
        """
        Acts as the secondary firewall to enforce the parental consent matrix,
        perfectly mirroring the Go gateway's struct validation rules.
        """
        if self.is_parental_consent:
            # Dual-Track Logic: Parental consent IS active.
            # Minor data MUST be present and structurally valid.
            if not self.minor_name or len(self.minor_name.strip()) < 2:
                raise ValueError("minor_name is required and must be valid when is_parental_consent is True")
            if self.minor_age is None:
                raise ValueError("minor_age is required when is_parental_consent is True")
        else:
            # Standard Logic: Parental consent is NOT active.
            # Minor data MUST be completely null to prevent conflicting ledger records.
            if self.minor_name is not None or self.minor_age is not None:
                raise ValueError("minor_name and minor_age must be exactly null when is_parental_consent is False")
        
        return self

@app.post("/api/v1/render")
async def render_tos_document(payload: SignaturePayload) -> Response:
    """
    Receives validated payload from the Go gateway, renders a PDF document 
    (to be implemented via WeasyPrint), and returns the binary stream with 
    a cryptographic SHA-512 hash header.
    """
    logger.info(f"Received rendering request for client: {payload.client_name}")
    
    try:
        # TODO: Phase 3.3 - Implement WeasyPrint HTML-to-PDF rendering logic here.
        # For this step, we generate a stub binary to satisfy the Go orchestrator's contract.
        pdf_bytes = b"%PDF-1.4\n% Simulated PDF for infrastructure validation\nEOF\n"
        
        # Generate deterministic SHA-512 hash of the binary payload
        document_hash = hashlib.sha512(pdf_bytes).hexdigest()
        
        # Construct response with the strictly required headers for the Go gateway
        headers = {
            "Content-Type": "application/pdf",
            "X-Document-Hash": document_hash,
        }
        
        logger.info("Successfully processed rendering request")
        return Response(content=pdf_bytes, headers=headers, media_type="application/pdf")

    except Exception as e:
        logger.error(f"Failed to render document: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal document rendering failure")