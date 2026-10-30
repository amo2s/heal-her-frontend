# app/models/schemas.py
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel


class SignatureRequest(BaseModel):
    """
    Inbound client signature payload.
    Replaces legacy Go validation with strict Pydantic V2 verification.
    Strips unknown fields and accepts both camelCase and snake_case keys.
    """
    model_config = ConfigDict(
        extra="ignore",
        populate_by_name=True,
        alias_generator=to_camel
    )

    client_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Full legal name of the individual executing the agreement"
    )
    jit_receipt: str = Field(
        ...,
        min_length=10,
        description="Asymmetric Ed25519 JWT receipt issued by Rust Auth microservice"
    )
    is_parental_consent: bool = Field(
        default=False,
        description="Flag indicating whether signing on behalf of a minor child"
    )
    minor_name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Full legal name of the minor child (required if is_parental_consent=True)"
    )
    minor_age: Optional[int] = Field(
        default=None,
        ge=0,
        le=17,
        description="Age of the minor child between 0 and 17 (required if is_parental_consent=True)"
    )

    @model_validator(mode="after")
    def validate_parental_consent_matrix(self) -> "SignatureRequest":
        """
        Enforces the dual-track parental consent matrix:
        - If is_parental_consent is True: minor_name and minor_age must both be present and valid.
        - If is_parental_consent is False: minor_name and minor_age must be None or omitted.
        """
        if self.is_parental_consent:
            if not self.minor_name or len(self.minor_name.strip()) < 2:
                raise ValueError(
                    "minor_name is strictly required (minimum 2 characters) when is_parental_consent is True"
                )
            if self.minor_age is None:
                raise ValueError(
                    "minor_age is strictly required (integer between 0 and 17) when is_parental_consent is True"
                )
        else:
            if self.minor_name is not None or self.minor_age is not None:
                raise ValueError(
                    "minor_name and minor_age must be None or omitted when is_parental_consent is False"
                )

        return self


class EnrichedSignaturePayload(BaseModel):
    """
    Cryptographically authenticated internal payload transferred to the rendering engine.
    """
    model_config = ConfigDict(
        frozen=True,
        extra="ignore",
        populate_by_name=True,
        alias_generator=to_camel
    )

    request_id: UUID
    user_id: UUID
    client_name: str
    client_email: str
    is_parental_consent: bool
    minor_name: Optional[str] = None
    minor_age: Optional[int] = None
    ip_address: str
    document_version: str = "1.0"
    jit_nonce: Optional[UUID] = None


class TOSExecutionResponse(BaseModel):
    """
    Zero-latency success response returned to the frontend.
    """
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel
    )

    status: str = "success"
    message: str = "Terms of Service agreement executed and cryptographically sealed."
    request_id: UUID
    document_hash: str
    storage_path: str
    document_version: str = "1.0"


class TOSStatusResponse(BaseModel):
    """
    Blazing-fast status payload for Next.js Server Component dashboard modal gate with dynamic versioning.
    """
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel
    )

    has_signed: bool
    requires_reconsent: bool
    active_version: str

