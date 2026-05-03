#!/usr/bin/env python3
"""
Cross-language hash determinism test (Vera audit Sesja 37 CRITICAL).

Cel: zagwarantowac ze keccak256(systemPrompt) policzony przez juror'a w Pythonie
== keccak256 policzony przez TS multicall script == hash on-chain (po broadcast).

Smell test scenariusz:
1. Juror klonuje repo, czyta personas.py
2. Liczy: `keccak(build_system_prompt(persona).encode("utf-8"))`
3. Robi `cast call resolver text(node, "ai.system_prompt_hash")`
4. Porownuje. Musi byc BYTE-IDENTICAL.

Ten test:
- Liczy hash w Pythonie (eth_utils / keccak hashlib)
- Wywoluje TS `getAllPromptHashes()` przez tsx
- Porownuje per persona
- Exit 0 = match, exit 1 = drift detected (dyskwalifikacja smell test)

Uzycie:
    python3 scripts/verify-hash-cross-language.py

Wymaga: tsx + viem zainstalowane (pnpm install w worktree).
Brak external deps poza stdlib (uzywa hashlib + ctypes na keccak256
przez sha3 builtin Pythona 3.6+).
"""
from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PERSONAS_PATH = REPO_ROOT / "apps" / "api" / "agents" / "personas.py"

# Direct import (omija agents/__init__.py z anthropic SDK)
_spec = importlib.util.spec_from_file_location("personas_ssot", PERSONAS_PATH)
assert _spec and _spec.loader
_mod = importlib.util.module_from_spec(_spec)
sys.modules["personas_ssot"] = _mod
_spec.loader.exec_module(_mod)

ALL_PERSONAS = _mod.ALL_PERSONAS  # type: ignore[attr-defined]
build_system_prompt = _mod.build_system_prompt  # type: ignore[attr-defined]


def keccak256_hex(data: bytes) -> str:
    """keccak256 (NIE sha3) jako 0x + 64 hex. Stdlib hashlib.sha3_256 != keccak256.

    Uzywamy implementacji z eth_hash (lekka, pure Python opcja):
    """
    try:
        from eth_hash.auto import keccak  # type: ignore[import-not-found]
    except ImportError:
        # Fallback: pycryptodome
        try:
            from Crypto.Hash import keccak as keccak_lib  # type: ignore[import-not-found]

            h = keccak_lib.new(digest_bits=256)
            h.update(data)
            return "0x" + h.hexdigest()
        except ImportError:
            print(
                "ERROR: brak eth_hash i pycryptodome. Zainstaluj jedno z:\n"
                "  pip install eth-hash[pycryptodome]\n"
                "lub uzyj py-evm / web3.py ktore juz to zawieraja.",
                file=sys.stderr,
            )
            sys.exit(2)
    return "0x" + keccak(data).hex()


def main() -> int:
    print("=" * 74)
    print("Cross-language hash determinism test (Sesja 37 Vera CRITICAL)")
    print("=" * 74)

    # 1. Python side - liczymy hash z personas.py
    py_hashes: dict[str, str] = {}
    for persona in ALL_PERSONAS:
        prompt = build_system_prompt(persona)
        py_hashes[persona.persona_id] = keccak256_hex(prompt.encode("utf-8"))
    print("\n[Python side - eth_hash keccak256]")
    for pid, h in py_hashes.items():
        print(f"  {pid:10} {h}")

    # 2. TS side - exec tsx scripts/dump-hashes (one-liner)
    ts_script = (
        'import { getAllPromptHashes } from "./scripts/lib/persona-prompts"; '
        "console.log(JSON.stringify(getAllPromptHashes()));"
    )
    try:
        result = subprocess.run(
            ["npx", "tsx", "--eval", ts_script],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=30,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"\nERROR: tsx fail: {e.stderr}", file=sys.stderr)
        return 2
    except subprocess.TimeoutExpired:
        print("\nERROR: tsx timeout (30s)", file=sys.stderr)
        return 2

    # tsx --eval moze tez wypisac warningi, bierzemy ostatnia linie z JSON
    ts_lines = [
        line for line in result.stdout.splitlines() if line.strip().startswith("{")
    ]
    if not ts_lines:
        print(f"\nERROR: tsx output nie zawiera JSON:\n{result.stdout}", file=sys.stderr)
        return 2
    ts_hashes: dict[str, str] = json.loads(ts_lines[-1])
    print("\n[TS side - viem keccak256(stringToHex)]")
    for pid, h in ts_hashes.items():
        print(f"  {pid:10} {h}")

    # 3. Compare
    print("\n[Comparison]")
    drift = []
    for pid in py_hashes:
        py_h = py_hashes[pid].lower()
        ts_h = ts_hashes.get(pid, "").lower()
        if py_h == ts_h:
            print(f"  {pid:10} MATCH")
        else:
            print(f"  {pid:10} DRIFT")
            print(f"             Python: {py_h}")
            print(f"             TS:     {ts_h}")
            drift.append(pid)

    if drift:
        print(f"\nFAIL: {len(drift)} drift(s) - smell test by FAILED.")
        return 1
    print("\nPASS: wszystkie 5 hashy byte-perfect match cross-language.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
