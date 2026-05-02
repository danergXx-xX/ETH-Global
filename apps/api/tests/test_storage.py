"""Tests for storage layer - 0G, IPFS, factory with fallback."""
from __future__ import annotations

from unittest.mock import AsyncMock, patch

import httpx
import pytest

from storage.factory import (
    StorageConfigError,
    StorageFallbackError,
    create_storage,
    upload_with_fallback,
)
from storage.ipfs import IPFSStorage
from storage.zerog import ZeroGStorage

SAMPLE_DATA = {"proposal": "Allocate 100k USDC", "consensus": "FOR"}


# -- 0G happy path --

def _mock_response(status: int, json_data: dict) -> httpx.Response:
    """Create httpx.Response with request attached (needed for raise_for_status)."""
    return httpx.Response(
        status,
        json=json_data,
        request=httpx.Request("POST", "https://test.local"),
    )


@pytest.mark.asyncio
async def test_zerog_upload_happy_path() -> None:
    """0G adapter returns CID (root hash) and gateway URL on success."""
    storage = ZeroGStorage(
        indexer_url="https://indexer.test",
        evm_rpc_url="https://rpc.test",
        private_key="0xdeadbeef",
    )
    rpc_ok = _mock_response(200, {"jsonrpc": "2.0", "result": {"connectedPeers": 3}, "id": 1})

    with patch.object(storage._client, "post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = rpc_ok
        result = await storage.upload(SAMPLE_DATA)

    assert result.provider == "0g"
    assert len(result.cid) == 64  # SHA-256 hex
    assert "0g.ai" in result.gateway_url
    assert result.bytes_uploaded > 0
    assert result.fallback_used is False


# -- IPFS happy path --

@pytest.mark.asyncio
async def test_ipfs_upload_happy_path() -> None:
    """IPFS adapter returns CID from web3.storage response."""
    storage = IPFSStorage(token="test-token")
    ipfs_ok = _mock_response(
        200, {"cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"},
    )

    with patch.object(storage._client, "post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = ipfs_ok
        result = await storage.upload(SAMPLE_DATA)

    assert result.provider == "ipfs"
    assert result.cid == "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
    assert "ipfs.w3s.link" in result.gateway_url
    assert result.bytes_uploaded > 0
    assert result.fallback_used is False


# -- Auto-fallback: 0G fails -> IPFS kicks in --

@pytest.mark.asyncio
async def test_auto_fallback_on_zerog_failure() -> None:
    """When 0G upload fails, factory falls back to IPFS automatically."""
    mock_settings = _make_settings(storage_provider="0g")

    with (
        patch("storage.factory.get_settings", return_value=mock_settings),
        patch("storage.factory.ZeroGStorage") as mock_0g_cls,
        patch("storage.factory.IPFSStorage") as mock_ipfs_cls,
    ):
        mock_0g = AsyncMock()
        mock_0g.upload.side_effect = ConnectionError("0G indexer unreachable")
        mock_0g_cls.return_value = mock_0g

        mock_ipfs = AsyncMock()
        mock_ipfs.upload.return_value = _make_upload_result("ipfs", "bafyfallback123")
        mock_ipfs_cls.return_value = mock_ipfs

        result = await upload_with_fallback(SAMPLE_DATA)

    assert result.provider == "ipfs"
    assert result.fallback_used is True
    mock_0g.upload.assert_called_once()
    mock_ipfs.upload.assert_called_once()


# -- Both providers fail -> graceful error --

@pytest.mark.asyncio
async def test_both_providers_fail_graceful_error() -> None:
    """When both 0G and IPFS fail, StorageFallbackError is raised."""
    mock_settings = _make_settings(storage_provider="0g")

    with (
        patch("storage.factory.get_settings", return_value=mock_settings),
        patch("storage.factory.ZeroGStorage") as mock_0g_cls,
        patch("storage.factory.IPFSStorage") as mock_ipfs_cls,
    ):
        mock_0g = AsyncMock()
        mock_0g.upload.side_effect = ConnectionError("0G down")
        mock_0g_cls.return_value = mock_0g

        mock_ipfs = AsyncMock()
        mock_ipfs.upload.side_effect = httpx.HTTPStatusError(
            "503", request=httpx.Request("POST", "https://api.web3.storage/upload"),
            response=httpx.Response(503),
        )
        mock_ipfs_cls.return_value = mock_ipfs

        with pytest.raises(StorageFallbackError, match="Both .* failed"):
            await upload_with_fallback(SAMPLE_DATA)


# -- Unknown provider -> ValueError --

def test_factory_unknown_provider_raises() -> None:
    """Factory raises StorageConfigError for unknown STORAGE_PROVIDER."""
    with pytest.raises(StorageConfigError, match="Unknown STORAGE_PROVIDER"):
        create_storage("s3")  # type: ignore[arg-type]


# -- Helpers --

def _make_settings(
    storage_provider: str = "0g",
    zerog_private_key: str = "0xdeadbeef",
    web3_storage_token: str = "test-w3s-token",
) -> object:
    """Create a mock settings object for factory tests."""

    class MockSettings:
        pass

    s = MockSettings()
    s.storage_provider = storage_provider  # type: ignore[attr-defined]
    s.zerog_indexer_url = "https://indexer.test"  # type: ignore[attr-defined]
    s.zerog_evm_rpc_url = "https://rpc.test"  # type: ignore[attr-defined]
    s.zerog_private_key = zerog_private_key  # type: ignore[attr-defined]
    s.web3_storage_token = web3_storage_token  # type: ignore[attr-defined]
    return s


def _make_upload_result(provider: str, cid: str):  # type: ignore[no-untyped-def]
    from storage.interface import UploadResult

    return UploadResult(
        cid=cid,
        gateway_url=f"https://{cid}.ipfs.w3s.link/",
        provider=provider,  # type: ignore[arg-type]
        bytes_uploaded=100,
    )
