"""Migration runner: invoked from main.py lifespan startup.

Wraps `alembic upgrade head` so we don't shell out at runtime.
"""

from __future__ import annotations

from pathlib import Path

import structlog

log = structlog.get_logger()


def run_alembic_upgrade(target: str = "head") -> bool:
    """Run alembic upgrade head. Returns True on success, False on error.

    Designed to be called from lifespan startup. Does NOT raise - failure
    here should not prevent the API from starting (callers will see DB
    operations fail with clearer errors than 'startup failed').
    """
    try:
        from alembic import command
        from alembic.config import Config
    except ImportError as exc:
        log.warning("alembic_not_installed", error=str(exc))
        return False

    api_dir = Path(__file__).resolve().parent.parent.parent
    ini_path = api_dir / "alembic.ini"
    if not ini_path.exists():
        log.warning("alembic_ini_missing", path=str(ini_path))
        return False

    cfg = Config(str(ini_path))
    cfg.set_main_option("script_location", str(api_dir / "db" / "migrations"))
    try:
        command.upgrade(cfg, target)
    except Exception as exc:
        log.warning(
            "alembic_upgrade_failed",
            error_type=type(exc).__name__,
            error=str(exc),
        )
        return False
    log.info("alembic_upgraded", target=target)
    return True
