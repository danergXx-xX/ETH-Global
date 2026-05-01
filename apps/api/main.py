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
    text: str = Field(..., min_length=1)


@app.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
    )


@app.post("/api/debate")
async def debate(req: DebateRequest) -> dict:
    log.info("debate_requested", text_length=len(req.text))
    result = await run_debate(req.text)
    log.info("debate_complete", consensus=result["consensus"])
    return result
