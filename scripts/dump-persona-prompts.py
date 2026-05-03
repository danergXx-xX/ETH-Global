#!/usr/bin/env python3
"""
Dump 5 system prompts (bull, bear, risk, tech, sentiment) jako JSON na stdout.

Cel (Sesja 37, Szymon P0-1 escalation): TS scripts potrzebuja BYTE-IDENTYCZNEGO
system prompta z personas.py do policzenia keccak256(systemPrompt). Replikacja
build_system_prompt() w TS = drift risk - jeden zapomniany whitespace zmienia
hash. Zamiast tego: Python jest SSOT, TS shells out, parsuje JSON.

Uzycie:
    python3 scripts/dump-persona-prompts.py
    -> {"bull": "You are BULL...", "bear": "...", ...}

Zero side effects, zero deps poza stdlib + apps/api/agents/personas.py.
"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PERSONAS_PATH = REPO_ROOT / "apps" / "api" / "agents" / "personas.py"

# Direct module load - omija agents/__init__.py (ktore importuje anthropic SDK,
# nieobecny w bare environment skryptu). personas.py ma zero side-effect imports
# poza dataclass + typing, wiec import-as-file jest bezpieczny.
_spec = importlib.util.spec_from_file_location("personas_ssot", PERSONAS_PATH)
if _spec is None or _spec.loader is None:
    raise RuntimeError(f"Cannot load personas from {PERSONAS_PATH}")
_mod = importlib.util.module_from_spec(_spec)
sys.modules["personas_ssot"] = _mod
_spec.loader.exec_module(_mod)

ALL_PERSONAS = _mod.ALL_PERSONAS
PHASE_3_OPTIONAL = _mod.PHASE_3_OPTIONAL
build_system_prompt = _mod.build_system_prompt


def main() -> None:
    out: dict[str, str] = {}
    for persona in ALL_PERSONAS + PHASE_3_OPTIONAL:
        out[persona.persona_id] = build_system_prompt(persona)
    json.dump(out, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
