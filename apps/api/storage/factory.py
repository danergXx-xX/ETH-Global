"""Storage factory with automatic fallback from 0G to IPFS."""
from __future__ import annotations

from typing import Literal

import structlog

from config import get_settings
from storage.interface import UploadResult
from storage.ipfs import IPFSStorage
from storage.zerog import ZeroGStorage

log = structlog.get_logger()


def create_storage(provider: Literal["0g", "ipfs"] | None = None) -> ZeroGStorage | IPFSStorage:
    """Create storage backend from settings or explicit provider."""
    settings = get_settings()
    chosen = provider or settings.storage_provider

    if chosen == "0g":
        if not settings.zerog_private_key:
            raise StorageConfigError("ZEROG_PRIVATE_KEY required for 0G Storage")
        return ZeroGStorage(
            indexer_url=settings.zerog_indexer_url,
            evm_rpc_url=settings.zerog_evm_rpc_url,
            private_key=settings.zerog_private_key,
        )

    if chosen == "ipfs":
        if not settings.web3_storage_token:
            raise StorageConfigError("WEB3_STORAGE_TOKEN required for IPFS Storage")
        return IPFSStorage(token=settings.web3_storage_token)

    raise StorageConfigError(f"Unknown STORAGE_PROVIDER: {chosen}")


async def upload_with_fallback(data: dict) -> UploadResult:
    """Upload to primary provider, auto-fallback to IPFS on failure."""
    settings = get_settings()
    primary_provider = settings.storage_provider

    try:
        backend = create_storage(primary_provider)
        result = await backend.upload(data)
        return result
    except Exception as primary_err:
        if primary_provider == "ipfs":
            log.error("ipfs_upload_failed", error=str(primary_err))
            raise

        log.warning(
            "storage_primary_failed",
            primary=primary_provider,
            error=str(primary_err),
            fallback="ipfs",
        )

        if not settings.web3_storage_token:
            log.error("storage_fallback_no_token", error="WEB3_STORAGE_TOKEN not set")
            raise StorageFallbackError(
                f"Primary ({primary_provider}) failed and IPFS fallback unavailable: {primary_err}"
            ) from primary_err

        try:
            ipfs = IPFSStorage(token=settings.web3_storage_token)
            result = await ipfs.upload(data)
            result.fallback_used = True
            return result
        except Exception as fallback_err:
            log.error(
                "storage_all_failed",
                primary_error=str(primary_err),
                fallback_error=str(fallback_err),
            )
            raise StorageFallbackError(
                f"Both {primary_provider} and IPFS failed"
            ) from fallback_err


class StorageConfigError(Exception):
    """Raised when storage configuration is invalid."""


class StorageFallbackError(Exception):
    """Raised when all storage backends fail."""
