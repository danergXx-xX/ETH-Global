"""POST /api/agents/custom - register a user-defined Council agent (Moat 5 PoW)."""

import structlog
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from schemas import CustomAgent, CustomAgentSpec
from services.custom_agent_service import (
    JailbreakRejected,
    register_custom_agent,
)
from services.in_memory_store import save_custom_agent

log = structlog.get_logger()

router = APIRouter(prefix="/api/agents", tags=["agents"])
_limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/custom",
    response_model=CustomAgent,
    summary="Register a custom Council agent",
    description=(
        "Validates the spec, sanitizes the system prompt against prompt-injection, "
        "optionally runs a sandbox Test Arena (no on-chain side effects), and "
        "stores the agent record in 'testing' or 'awaiting_multisig' status."
    ),
)
@_limiter.limit("10/minute")
async def submit_custom_agent(
    request: Request,
    spec: CustomAgentSpec,
) -> CustomAgent:
    try:
        agent = await register_custom_agent(spec)
    except JailbreakRejected as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    await save_custom_agent(agent)
    return agent
