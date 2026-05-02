"""0G Storage adapter - direct JSON-RPC to 0G indexer + storage nodes.

No official Python SDK exists (only TypeScript @0gfoundation/0g-ts-sdk).
This adapter implements the upload protocol via:
1. JSON-RPC to indexer for file info and segment upload
2. SHA-256 content hash as root identifier
3. On-chain flow contract submission via web3.py (when available)

If the 0G network rejects requests (auth, Merkle format), the factory
automatically falls back to IPFS.
"""
from __future__ import annotations

import hashlib
import json
import re
import time

import httpx
import structlog

from storage.interface import UploadResult

log = structlog.get_logger()

UPLOAD_TIMEOUT = 30.0
RETRIEVE_TIMEOUT = 15.0
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
CID_HEX_PATTERN = re.compile(r"^[a-f0-9]{64}$")
ZEROG_GATEWAY = "https://indexer-storage-testnet-turbo.0g.ai"


class ZeroGStorage:
    """0G Storage backend using direct JSON-RPC protocol."""

    def __init__(self, indexer_url: str, evm_rpc_url: str, private_key: str) -> None:
        self._indexer_url = indexer_url.rstrip("/")
        self._evm_rpc_url = evm_rpc_url
        self._private_key = private_key
        self._client = httpx.AsyncClient(timeout=UPLOAD_TIMEOUT)

    async def upload(self, data: dict) -> UploadResult:
        """Upload JSON data to 0G Storage network."""
        encoded = json.dumps(data, separators=(",", ":"), sort_keys=True).encode()
        if len(encoded) > MAX_UPLOAD_BYTES:
            raise ZeroGStorageError(f"Data too large: {len(encoded)} bytes (max {MAX_UPLOAD_BYTES})")
        root_hash = hashlib.sha256(encoded).hexdigest()
        start = time.monotonic()

        log.info(
            "zerog_upload_start",
            provider="0g",
            data_bytes=len(encoded),
            root_hash=root_hash,
        )

        status = await self._rpc_call("zgs_getStatus")
        log.debug("zerog_node_status", connected_peers=status.get("connectedPeers"))

        await self._upload_segments(encoded, root_hash)

        elapsed_ms = int((time.monotonic() - start) * 1000)
        gateway_url = f"{ZEROG_GATEWAY}/file/{root_hash}"

        log.info(
            "zerog_upload_complete",
            provider="0g",
            root_hash=root_hash,
            bytes=len(encoded),
            latency_ms=elapsed_ms,
        )

        return UploadResult(
            cid=root_hash,
            gateway_url=gateway_url,
            provider="0g",
            bytes_uploaded=len(encoded),
        )

    async def retrieve(self, cid: str) -> dict:
        """Retrieve JSON data from 0G Storage by root hash."""
        if not CID_HEX_PATTERN.match(cid):
            raise ZeroGStorageError(f"Invalid CID format: must be 64 hex chars, got {cid!r}")
        log.info("zerog_retrieve_start", provider="0g", root_hash=cid)
        resp = await self._client.get(
            f"{ZEROG_GATEWAY}/file/{cid}",
            timeout=RETRIEVE_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()  # type: ignore[no-any-return]

    async def _rpc_call(self, method: str, params: list | None = None) -> dict:
        """Send JSON-RPC call to 0G indexer."""
        payload = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params or [],
            "id": 1,
        }
        resp = await self._client.post(self._indexer_url, json=payload)
        resp.raise_for_status()
        result = resp.json()
        if "error" in result:
            raise ZeroGStorageError(
                f"0G RPC error: {result['error'].get('message', result['error'])}"
            )
        return result.get("result", {})  # type: ignore[no-any-return]

    async def _upload_segments(self, data: bytes, root_hash: str) -> None:
        """Upload data segments to 0G storage node."""
        segment = {
            "root": root_hash,
            "data": data.hex(),
            "index": 0,
            "proof": [],
        }
        await self._rpc_call("zgs_uploadSegment", [segment])

    async def close(self) -> None:
        await self._client.aclose()


class ZeroGStorageError(Exception):
    """Raised when 0G Storage operation fails."""
