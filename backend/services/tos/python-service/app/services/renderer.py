# app/services/renderer.py
import io
import logging
from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, TemplateError
from pypdf import PdfReader, PdfWriter
from weasyprint import HTML

from app.config import get_settings
from app.models.schemas import EnrichedSignaturePayload

logger = logging.getLogger("tos_service.renderer")
settings = get_settings()


class DocumentRenderingError(Exception):
    """
    Domain exception raised when template compilation, PDF conversion,
    or cryptographic encryption encounters a critical failure.
    """
    pass


# Initialize Jinja2 environment locked strictly to app/templates
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(
    loader=FileSystemLoader(searchpath=TEMPLATE_DIR),
    autoescape=True,
    trim_blocks=True,
    lstrip_blocks=True,
)


def render_tos_pdf(payload: EnrichedSignaturePayload) -> bytes:
    """
    Generates a certified, read-only PDF entirely in memory (RAM).
    Never writes unencrypted or encrypted documents to the container filesystem.

    Workflow:
    1. Compiles Jinja2 template with enriched signature context.
    2. Converts compiled HTML to paged PDF bytes using WeasyPrint.
    3. Enforces AES-256 cryptographic lockdown via pypdf (immutable read-only mode).
    4. Returns raw byte stream.
    """
    try:
        # 1. Prepare dynamic template context
        context = {
            "payload": payload.model_dump(by_alias=True),
            "request_id": str(payload.request_id),
            "execution_date": datetime.now(timezone.utc).strftime("%B %d, %Y"),
            "active_version": payload.document_version or settings.active_tos_version,
            "jit_nonce": str(payload.jit_nonce) if payload.jit_nonce else "N/A",
        }

        # 2. Compile child template
        template = jinja_env.get_template("tos.html")
        rendered_html = template.render(**context)

        # 3. Render raw PDF bytes strictly in RAM via WeasyPrint
        raw_pdf_bytes = HTML(string=rendered_html).write_pdf()

        # 4. Apply AES-256 Cryptographic Lockdown in RAM
        reader = PdfReader(io.BytesIO(raw_pdf_bytes))
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        owner_password = settings.pdf_owner_password or "heal-her-strict-internal-secret"

        # Blank user password allows instant view; strong owner password locks modifications
        writer.encrypt(
            user_password="",
            owner_password=owner_password,
            algorithm="AES-256",
        )

        locked_buffer = io.BytesIO()
        writer.write(locked_buffer)
        locked_pdf_bytes = locked_buffer.getvalue()

        logger.info(f"Rendered and locked PDF in RAM for request_id: {payload.request_id} ({len(locked_pdf_bytes)} bytes)")
        return locked_pdf_bytes

    except TemplateError as e:
        logger.error(f"Jinja2 compilation error for request_id {payload.request_id}: {e}")
        raise DocumentRenderingError(f"Template rendering failure: {e}")
    except Exception as e:
        logger.error(f"WeasyPrint or PDF encryption error for request_id {payload.request_id}: {e}")
        raise DocumentRenderingError(f"Document generation failure: {e}")
