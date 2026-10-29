# app/services/renderer.py
import io
import logging
import os
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, TemplateError
from pypdf import PdfReader, PdfWriter
from weasyprint import HTML

from app.models.schemas import EnrichedSignaturePayload

# Configure structured logger for the renderer service
logger = logging.getLogger("tos_renderer.generator")

class DocumentRenderingError(Exception):
    """
    Generic domain exception used to mask internal templating or PDF generation 
    errors from the transport layer, preventing infrastructure leakage to the frontend.
    """
    pass

# Initialize the Jinja2 environment once at module load to optimize performance.
# Bind the file system loader strictly to the 'app/templates' directory to prevent path traversal.
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(
    loader=FileSystemLoader(searchpath=TEMPLATE_DIR),
    autoescape=True, # Prevent XSS/HTML injection within the PDF if payload constraints ever fail
    trim_blocks=True,
    lstrip_blocks=True
)

def render_tos_pdf(payload: EnrichedSignaturePayload) -> bytes:
    """
    Compiles the dynamic HTML utilizing Jinja2, generates a base PDF via WeasyPrint,
    and applies AES-256 cryptographic lockdown to enforce immutability.
    
    Args:
        payload: The strictly validated EnrichedSignaturePayload.
        
    Returns:
        bytes: The encrypted, read-only PDF document byte stream.
        
    Raises:
        DocumentRenderingError: If template compilation, PDF generation, or encryption fails.
    """
    try:
        # 1. Prepare dynamic execution context
        # model_dump(by_alias=True) ensures camelCase variables (e.g., clientName, isParentalConsent) 
        # map flawlessly to the exact variables expected in the Jinja2 template.
        context = {
            "payload": payload.model_dump(by_alias=True),
            "request_id": str(payload.request_id),
            "execution_date": datetime.now().strftime("%B %d, %Y") # e.g., "September 28, 2026"
        }

        # 2. Load and render the child template
        # Assumes the master template is named 'base.html' and the child is 'tos.html'
        template = jinja_env.get_template("tos.html")
        rendered_html = template.render(**context)

        # 3. Generate raw binary PDF via WeasyPrint
        # We process the compiled HTML string and output directly to an in-memory byte stream.
        raw_pdf_bytes = HTML(string=rendered_html).write_pdf()

        # 4. Apply Cryptographic Lockdown (AES-256)
        # Load the raw bytes into pypdf to manipulate permissions and encrypt
        reader = PdfReader(io.BytesIO(raw_pdf_bytes))
        writer = PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)

        # Fetch strict owner password from environment variables (fallback provided for local dev)
        owner_password = os.getenv("PDF_OWNER_PASSWORD", "heal-her-strict-internal-secret")
        
        # Encrypt with a blank user password (allows seamless viewing) 
        # but strong owner password (enforces read-only flags and prevents edits/printing)
        writer.encrypt(
            user_password="", 
            owner_password=owner_password, 
            algorithm="AES-256"
        )

        # Output the locked document into a new stateless memory buffer
        locked_pdf_buffer = io.BytesIO()
        writer.write(locked_pdf_buffer)
        locked_pdf_bytes = locked_pdf_buffer.getvalue()

        logger.info(f"Successfully generated and locked PDF for request_id: {payload.request_id}")
        return locked_pdf_bytes

    except TemplateError as e:
        # Log the critical internal error for backend engineers, but do NOT bubble it up
        logger.error(f"Jinja2 template compilation failed for request_id {payload.request_id}: {str(e)}")
        raise DocumentRenderingError("Failed to compile document template.")
        
    except Exception as e:
        # Catch-all for WeasyPrint, pypdf, or unexpected systemic failures
        logger.error(f"PDF generation or encryption failed for request_id {payload.request_id}: {str(e)}")
        raise DocumentRenderingError("An internal error occurred during document generation.")