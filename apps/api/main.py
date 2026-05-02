from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncIterator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import get_settings
from logging_config import RequestIDMiddleware, setup_logging
from orchestrator import run_debate
from schemas import HealthResponse
import httpx

from storage.factory import StorageConfigError, StorageFallbackError, upload_with_fallback

settings = get_settings()
setup_logging(env=settings.env, log_level=settings.log_level)
log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    log.info("api_ready", env=settings.env, version="0.1.0")
    yield
    log.info("api_shutdown")


app = FastAPI(
    title="AI Treasury Council API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.add_middleware(RequestIDMiddleware)


class DebateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class DebateResponse(BaseModel):
    decisions: list[dict]
    consensus: str
    vote_id: str
    audit_trail_cid: str | None = None
    audit_trail_gateway: str | None = None
    storage_provider: str | None = None


@app.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
    )


@app.post("/api/debate")
async def debate(req: DebateRequest) -> DebateResponse:
    log.info("debate_requested", text_length=len(req.text))
    result = await run_debate(req.text)
    log.info("debate_complete", consensus=result["consensus"])

    audit_cid: str | None = None
    audit_gateway: str | None = None
    provider: str | None = None

    try:
        transcript = {
            "proposal": req.text,
            "decisions": result["decisions"],
            "consensus": result["consensus"],
            "vote_id": result["vote_id"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        storage_result = await upload_with_fallback(transcript)
        audit_cid = storage_result.cid
        audit_gateway = storage_result.gateway_url
        provider = storage_result.provider
        log.info(
            "audit_trail_stored",
            cid=audit_cid,
            provider=provider,
            fallback=storage_result.fallback_used,
        )
    except (StorageFallbackError, StorageConfigError, httpx.HTTPError, ConnectionError, OSError) as storage_err:
        log.error("audit_trail_failed", error=str(storage_err), error_type=type(storage_err).__name__)

    return DebateResponse(
        decisions=result["decisions"],
        consensus=result["consensus"],
        vote_id=result["vote_id"],
        audit_trail_cid=audit_cid,
        audit_trail_gateway=audit_gateway,
        storage_provider=provider,
    )
