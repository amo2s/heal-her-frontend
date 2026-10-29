# app/services/mailer.py
import logging
from datetime import datetime, timezone
from uuid import UUID

import httpx

from app.config import get_settings

logger = logging.getLogger("tos_service.mailer")
settings = get_settings()


async def dispatch_tos_confirmation_email_async(
    email: str,
    client_name: str,
    request_id: UUID,
    storage_path: str,
    document_hash: str
) -> None:
    """
    Non-blocking background task to notify the Google Mailer Webhook of an executed agreement.
    Executed in a FastAPI BackgroundTask so HTTP caller experiences 0ms latency impact.
    """
    webhook_url = settings.google_mailer_webhook_url
    if not webhook_url:
        logger.info(f"[MAILER SIMULATOR] Transactional confirmation skipped (no webhook URL): email={email}, request_id={request_id}")
        return

    payload = {
        "type": "TOS_SIGNATURE_CONFIRMATION",
        "recipient": email,
        "clientName": client_name,
        "requestId": str(request_id),
        "storagePath": storage_path,
        "documentHash": document_hash,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(webhook_url, json=payload)
            if response.status_code in (200, 201):
                logger.info(f"TOS confirmation email successfully dispatched via webhook to {email}")
            else:
                logger.warning(f"Google mailer webhook returned status {response.status_code}: {response.text}")
    except Exception as exc:
        logger.error(f"Failed to dispatch TOS confirmation email to {email}: {exc}")

