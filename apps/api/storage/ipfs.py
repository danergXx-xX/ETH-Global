"""IPFS adapter via web3.storage w3up API.

Uploads JSON data as a file to web3.storage, returns IPFS CID.
Uses the w3up HTTP bridge (https://up.web3.storage) with Bearer token auth.
Fallback for when 0G Storage is unavailable.
"""
from __future__ import annotations

import json
import time

import httpx
import structlog

from storage.interface import UploadResult

log = structlog.get_logger()

W3S_UPLOAD_URL = "https://up.web3.storage/bridge"
W3S_LEGACY_URL = "https://api.web3.storage/upload"
UPLOAD_TIMEOUT = 30.0
RETRIEVE_TIMEOUT = 15.0


class IPFSStorage:
    """IPFS storage backend via web3.storage."""

    def __init__(self, token: str) -> None:
        self._token = token
        self._client = httpx.AsyncClient(timeout=UPLOAD_TIMEOUT)

    async def upload(self, data: dict) -> UploadResult:
        """Upload JSON data to IPFS via web3.storage."""
        encoded = json.dumps(data, separators=(",", ":"), sort_keys=True).encode()
        start = time.monotonic()

        log.info(
            "ipfs_upload_start",
            provider="ipfs",
            data_bytes=len(encoded),
        )

        headers = {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json",
        }

        resp = await self._client.post(
            W3S_LEGACY_URL,
            headers=headers,
            content=encoded,
        )
        resp.raise_for_status()
        result = resp.json()
        cid = result["cid"]

        elapsed_ms = int((time.monotonic() - start) * 1000)
        gateway_url = f"https://{cid}.ipfs.w3s.link/"

        log.info(
            "ipfs_upload_complete",
            provider="ipfs",
            cid=cid,
            bytes=len(encoded),
            latency_ms=elapsed_ms,
        )

        return UploadResult(
            cid=cid,
            gateway_url=gateway_url,
            provider="ipfs",
            bytes_uploaded=len(encoded),
        )

    async def retrieve(self, cid: str) -> dict:
        """Retrieve JSON data from IPFS gateway."""
        log.info("ipfs_retrieve_start", provider="ipfs", cid=cid)
        gateway_url = f"https://{cid}.ipfs.w3s.link/"
        resp = await self._client.get(gateway_url, timeout=RETRIEVE_TIMEOUT)
        resp.raise_for_status()
        return resp.json()  # type: ignore[no-any-return]

    async def close(self) -> None:
        await self._client.aclose()


class IPFSStorageError(Exception):
    """Raised when IPFS storage operation fails."""
