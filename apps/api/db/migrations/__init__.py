"""Migration runner: invoked from main.py lifespan startup.

Runs alembic via subprocess to isolate from the FastAPI event loop. Calling
alembic in-process from an async lifespan triggers RuntimeError because
env.py uses asyncio.run() internally (cannot be nested in a running loop).

Subprocess pattern also matches Railway's expected CLI invocation and works
identically in local dev and prod containers.
"""

from __future__ import annotations

import asyncio
import os
import subprocess
import sys
from pathlib import Path

import structlog

log = structlog.get_logger()


def _api_dir() -> Path:
    return Path(__file__).resolve().parent.parent.parent


def _run_alembic_upgrade_sync(target: str = "head") -> bool:
    api_dir = _api_dir()
    ini_path = api_dir / "alembic.ini"
    if not ini_path.exists():
        log.warning("alembic_ini_missing", path=str(ini_path))
        return False
    if not os.environ.get("DATABASE_URL"):
        log.info("alembic_skipped_no_database_url")
        return False

    cmd = [sys.executable, "-m", "alembic", "-c", str(ini_path), "upgrade", target]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(api_dir),
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError) as exc:
        log.warning(
            "alembic_upgrade_subprocess_failed",
            error_type=type(exc).__name__,
            error=str(exc),
        )
        return False

    if proc.returncode != 0:
        log.warning(
            "alembic_upgrade_nonzero_exit",
            returncode=proc.returncode,
            stdout=proc.stdout[-500:] if proc.stdout else "",
            stderr=proc.stderr[-500:] if proc.stderr else "",
        )
        return False

    log.info("alembic_upgraded", target=target)
    return True


async def run_alembic_upgrade(target: str = "head") -> bool:
    """
    Run `alembic upgrade <target>` via subprocess inside a worker thread so
    the FastAPI event loop is not blocked. Returns True on success, False on
    any error (missing alembic.ini, missing DATABASE_URL, non-zero exit, etc).
    Does NOT raise - failures are logged so the API can still start in
    degraded mode (DB operations will surface the error).
    """
    return await asyncio.to_thread(_run_alembic_upgrade_sync, target)
