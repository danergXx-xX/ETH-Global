from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=(),
    )

    anthropic_api_key: str = ""
    model_id: str = "claude-opus-4-7"
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "INFO"
    env: Literal["dev", "prod"] = "dev"

    # Storage (decentralized audit trail)
    storage_provider: Literal["0g", "ipfs"] = "0g"
    zerog_indexer_url: str = "https://indexer-storage-testnet-turbo.0g.ai"
    zerog_evm_rpc_url: str = "https://evmrpc-testnet.0g.ai"
    zerog_private_key: str = ""
    web3_storage_token: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
