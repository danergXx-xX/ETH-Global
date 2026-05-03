"""User-scoped endpoints: settings + onboarding (keyed by checksum address)."""

import structlog
from eth_utils import to_checksum_address
from fastapi import APIRouter, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from schemas import (
    OnboardingProgress,
    OnboardingStatus,
    UserSettings,
    UserSettingsUpdate,
    ETH_ADDRESS_PATTERN,
)
from services.in_memory_store import (
    get_onboarding,
    get_user_settings,
    mark_onboarding_step,
    put_user_settings,
)

log = structlog.get_logger()

router = APIRouter(prefix="/api/user", tags=["user"])
_limiter = Limiter(key_func=get_remote_address)


def _validate_address(raw: str) -> str:
    """Reject non-hex / wrong-length input early to surface a clean 422."""
    import re

    if not re.fullmatch(ETH_ADDRESS_PATTERN, raw):
        raise HTTPException(
            status_code=422,
            detail="address must match 0x[a-fA-F0-9]{40}",
        )
    return to_checksum_address(raw)


@router.get(
    "/settings",
    response_model=UserSettings,
    summary="Get user settings",
)
@_limiter.limit("60/minute")
async def get_settings(
    request: Request,
    address: str = Query(..., min_length=42, max_length=42),
) -> UserSettings:
    addr = _validate_address(address)
    return await get_user_settings(addr)


@router.post(
    "/settings",
    response_model=UserSettings,
    summary="Persist user settings",
)
@_limiter.limit("30/minute")
async def post_settings(
    request: Request,
    payload: UserSettingsUpdate,
) -> UserSettings:
    addr = _validate_address(payload.address)
    settings = UserSettings.model_validate(
        payload.model_dump(exclude={"address"})
    )
    saved = await put_user_settings(addr, settings)
    log.info("user_settings_saved", address=addr)
    return saved


@router.get(
    "/onboarding",
    response_model=OnboardingStatus,
    summary="Get onboarding progress",
)
@_limiter.limit("60/minute")
async def get_onboarding_status(
    request: Request,
    address: str = Query(..., min_length=42, max_length=42),
) -> OnboardingStatus:
    addr = _validate_address(address)
    return await get_onboarding(addr)


@router.post(
    "/onboarding",
    response_model=OnboardingStatus,
    summary="Mark onboarding step complete",
)
@_limiter.limit("30/minute")
async def post_onboarding_progress(
    request: Request,
    payload: OnboardingProgress,
) -> OnboardingStatus:
    addr = _validate_address(payload.address)
    status = await mark_onboarding_step(addr, payload.step_id)
    log.info(
        "user_onboarding_step",
        address=addr,
        step=payload.step_id,
        complete=status.is_complete,
    )
    return status
