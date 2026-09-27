# app/models/schemas.py
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator, ConfigDict
from pydantic.alias_generators import to_camel

class EnrichedSignaturePayload(BaseModel):
    """
    Immutable data transfer object for the rendering worker.
    Uses camelCase aliasing to map directly to the Jinja2 template variables
    (e.g., client_name becomes payload.clientName in the HTML).
    """
    model_config = ConfigDict(
        frozen=True, 
        alias_generator=to_camel,
        populate_by_name=True
    )

    client_name: str = Field(..., min_length=2, max_length=255)
    client_email: str = Field(..., max_length=255)
    request_id: UUID
    is_parental_consent: bool
    minor_name: Optional[str] = Field(default=None, max_length=255)
    minor_age: Optional[int] = Field(default=None, ge=0, le=17)

    @model_validator(mode='after')
    def validate_parental_consent_matrix(self) -> 'EnrichedSignaturePayload':
        """
        Enforces the dual-track parental consent matrix.
        """
        if self.is_parental_consent:
            if not self.minor_name or len(self.minor_name.strip()) < 2:
                raise ValueError("minor_name is strictly required when is_parental_consent is True")
            if self.minor_age is None:
                raise ValueError("minor_age is strictly required when is_parental_consent is True")
        else:
            if self.minor_name is not None or self.minor_age is not None:
                raise ValueError("minor data must be completely null when is_parental_consent is False")
        
        return self