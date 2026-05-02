"""Abstract storage interface for decentralized audit trail uploads."""
from __future__ import annotations

from typing import Literal, Protocol

from pydantic import BaseModel, Field


class UploadResult(BaseModel):
    """Result of uploading debate transcript to decentralized storage."""

    cid: str = Field(..., description="Content identifier (root hash or IPFS CID)")
    gateway_url: str = Field(..., description="HTTP gateway URL for retrieval")
    provider: Literal["0g", "ipfs"] = Field(..., description="Which backend stored the data")
    bytes_uploaded: int = Field(..., ge=0)
    fallback_used: bool = Field(default=False, description="True if primary provider failed")


class StorageBackend(Protocol):
    """Protocol for decentralized storage backends."""

    async def upload(self, data: dict) -> UploadResult:
        """Upload JSON data, return CID and gateway URL."""
        ...

    async def retrieve(self, cid: str) -> dict:
        """Retrieve JSON data by CID."""
        ...
