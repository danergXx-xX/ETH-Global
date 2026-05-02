"""IPFS adapter via Pinata pinning service.

Uploads JSON data to IPFS via Pinata API, returns IPFS CID.
Uses pinJSONToIPFS endpoint with Bearer JWT auth.
Fallback for when 0G Storage is unavailable.

Note: web3.storage legacy API (api.web3.storage/upload) was sunset
Jan 2024. Pinata chosen for simpler auth model (JWT, no UCAN).
"""
from __future__ import annotations

import json
import re
import time

import httpx
import structlog

from storage.interface import UploadResult

log = structlog.get_logger()

PINATA_PIN_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs"
UPLOAD_TIMEOUT = 30.0
RETRIEVE_TIMEOUT = 15.0
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
CID_PATTERN = re.compile(r"^[a-zA-Z0-9]{46,64}$")


class IPFSStorage:
    """IPFS storage backend via Pinata pinning service."""

    def __init__(self, token: str) -> None:
        self._token = token
        self._client = httpx.AsyncClient(timeout=UPLOAD_TIMEOUT)

    async def upload(self, data: dict) -> UploadResult:
        """Upload JSON data to IPFS via Pinata."""
        encoded = json.dumps(data, separators=(",", ":"), sort_keys=True).encode()
        if len(encoded) > MAX_UPLOAD_BYTES:
            raise IPFSStorageError(f"Data too large: {len(encoded)} bytes (max {MAX_UPLOAD_BYTES})")
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

        payload = {
            "pinataContent": data,
            "pinataMetadata": {"name": "ai-council-debate"},
        }

        resp = await self._client.post(
            PINATA_PIN_URL,
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        result = resp.json()
        cid = result["IpfsHash"]

        elapsed_ms = int((time.monotonic() - start) * 1000)
        gateway_url = f"{PINATA_GATEWAY}/{cid}"

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
        if not CID_PATTERN.match(cid):
            raise IPFSStorageError(f"Invalid CID format: {cid!r}")
        log.info("ipfs_retrieve_start", provider="ipfs", cid=cid)
        gateway_url = f"{PINATA_GATEWAY}/{cid}"
        resp = await self._client.get(gateway_url, timeout=RETRIEVE_TIMEOUT)
        resp.raise_for_status()
        return resp.json()  # type: ignore[no-any-return]

    async def close(self) -> None:
        await self._client.aclose()


class IPFSStorageError(Exception):
    """Raised when IPFS storage operation fails."""
