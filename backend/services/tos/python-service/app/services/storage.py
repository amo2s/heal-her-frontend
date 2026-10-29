# app/services/storage.py
import logging
import httpx
from app.config import get_settings

logger = logging.getLogger("tos_service.storage")
settings = get_settings()


class StorageUploadError(Exception):
    pass


async def upload_document_to_vault(pdf_bytes: bytes, storage_path: str) -> str:
    """
    Asynchronously uploads the encrypted PDF byte stream directly to Supabase Storage.
    Uses the service role key to write to the protected 'tos-vault' bucket.

    Returns:
        str: The canonical storage path inside the vault.
    """
    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.warning("Supabase credentials not configured; document stored in local audit state only.")
        return storage_path

    bucket = settings.supabase_tos_bucket or "tos-vault"
    clean_base = settings.supabase_url.rstrip("/")
    endpoint = f"{clean_base}/storage/v1/object/{bucket}/{storage_path}"

    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/pdf",
        "x-upsert": "true",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, content=pdf_bytes, headers=headers)

            if response.status_code not in (200, 201):
                logger.error(f"Supabase vault upload failed [{response.status_code}]: {response.text}")
                raise StorageUploadError(f"Vault storage failure: HTTP {response.status_code}")

            logger.info(f"Successfully vaulted document at {bucket}/{storage_path}")
            return storage_path

    except httpx.RequestError as exc:
        logger.error(f"Network transport error uploading document to Supabase: {exc}")
        raise StorageUploadError(f"Vault network transport error: {exc}")
