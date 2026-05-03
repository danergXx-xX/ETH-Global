#!/usr/bin/env python3
"""
Pre-deploy / pre-recording data freshness check.

Verifies live data sources are responsive before demo recording or deploy:
- CoinGecko: BTC, ETH, USDC current prices
- DefiLlama: top protocols TVL endpoint
- RSS feeds: CoinDesk + Reuters (HEAD)

Output: stdout markdown report - works/failed per source.
Exit code 0 if all critical sources OK, 1 if any failed.

Usage:
    python3 scripts/check-data-freshness.py
    python3 scripts/check-data-freshness.py --json   # machine output
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass, field
from typing import Any

try:
    import httpx
except ImportError:
    sys.stderr.write("ERROR: httpx not installed. Run: pip install httpx\n")
    sys.exit(2)


COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
COINGECKO_PARAMS = {
    "ids": "bitcoin,ethereum,usd-coin",
    "vs_currencies": "usd",
    "include_24hr_change": "true",
}

DEFILLAMA_URL = "https://api.llama.fi/protocols"

RSS_FEEDS = [
    ("CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml"),
    ("Federal Reserve press", "https://www.federalreserve.gov/feeds/press_all.xml"),
]

TIMEOUT_SECONDS = 12.0


@dataclass
class CheckResult:
    """Outcome of a single source check."""

    name: str
    ok: bool
    latency_ms: int
    detail: str
    data: dict[str, Any] = field(default_factory=dict)


def check_coingecko() -> CheckResult:
    """Fetch BTC, ETH, USDC prices from CoinGecko."""
    start = time.perf_counter()
    try:
        with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
            resp = client.get(COINGECKO_URL, params=COINGECKO_PARAMS)
            elapsed = int((time.perf_counter() - start) * 1000)
            resp.raise_for_status()
            data = resp.json()
            btc = data.get("bitcoin", {}).get("usd")
            eth = data.get("ethereum", {}).get("usd")
            usdc = data.get("usd-coin", {}).get("usd")
            if btc is None or eth is None or usdc is None:
                return CheckResult(
                    name="CoinGecko",
                    ok=False,
                    latency_ms=elapsed,
                    detail=f"Missing price fields. Got keys: {list(data.keys())}",
                )
            return CheckResult(
                name="CoinGecko",
                ok=True,
                latency_ms=elapsed,
                detail=f"BTC=${btc:,.2f} ETH=${eth:,.2f} USDC=${usdc:.4f}",
                data={"btc": btc, "eth": eth, "usdc": usdc},
            )
    except httpx.HTTPError as exc:
        elapsed = int((time.perf_counter() - start) * 1000)
        return CheckResult(
            name="CoinGecko",
            ok=False,
            latency_ms=elapsed,
            detail=f"HTTP error: {exc}",
        )
    except (ValueError, KeyError) as exc:
        elapsed = int((time.perf_counter() - start) * 1000)
        return CheckResult(
            name="CoinGecko",
            ok=False,
            latency_ms=elapsed,
            detail=f"Parse error: {exc}",
        )


def check_defillama() -> CheckResult:
    """Fetch top protocols from DefiLlama."""
    start = time.perf_counter()
    try:
        with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
            resp = client.get(DEFILLAMA_URL)
            elapsed = int((time.perf_counter() - start) * 1000)
            resp.raise_for_status()
            data = resp.json()
            if not isinstance(data, list) or len(data) == 0:
                return CheckResult(
                    name="DefiLlama",
                    ok=False,
                    latency_ms=elapsed,
                    detail=f"Unexpected response shape (len={len(data) if isinstance(data, list) else 'n/a'})",
                )
            top10 = [
                {"name": p.get("name"), "tvl": p.get("tvl")}
                for p in data[:10]
                if p.get("tvl") is not None
            ]
            top_names = ", ".join(p["name"] for p in top10[:3])
            return CheckResult(
                name="DefiLlama",
                ok=True,
                latency_ms=elapsed,
                detail=f"{len(data)} protocols. Top 3: {top_names}",
                data={"top10": top10, "total_protocols": len(data)},
            )
    except httpx.HTTPError as exc:
        elapsed = int((time.perf_counter() - start) * 1000)
        return CheckResult(
            name="DefiLlama",
            ok=False,
            latency_ms=elapsed,
            detail=f"HTTP error: {exc}",
        )
    except (ValueError, TypeError) as exc:
        elapsed = int((time.perf_counter() - start) * 1000)
        return CheckResult(
            name="DefiLlama",
            ok=False,
            latency_ms=elapsed,
            detail=f"Parse error: {exc}",
        )


def check_rss(name: str, url: str) -> CheckResult:
    """HEAD check on RSS feed - confirm liveness, not parse content."""
    start = time.perf_counter()
    try:
        with httpx.Client(timeout=TIMEOUT_SECONDS, follow_redirects=True) as client:
            resp = client.head(url)
            elapsed = int((time.perf_counter() - start) * 1000)
            if resp.status_code >= 400:
                # Some servers reject HEAD - retry GET with stream
                resp = client.get(url)
                elapsed = int((time.perf_counter() - start) * 1000)
                resp.raise_for_status()
            return CheckResult(
                name=f"RSS:{name}",
                ok=True,
                latency_ms=elapsed,
                detail=f"HTTP {resp.status_code}",
            )
    except httpx.HTTPError as exc:
        elapsed = int((time.perf_counter() - start) * 1000)
        return CheckResult(
            name=f"RSS:{name}",
            ok=False,
            latency_ms=elapsed,
            detail=f"HTTP error: {exc}",
        )


def render_markdown(results: list[CheckResult]) -> str:
    """Render results as markdown report."""
    lines = ["# Data Freshness Check", ""]
    overall_ok = all(r.ok for r in results)
    status_label = "PASS" if overall_ok else "FAIL"
    lines.append(f"**Overall:** {status_label}")
    lines.append("")
    lines.append("| Source | Status | Latency | Detail |")
    lines.append("|---|---|---|---|")
    for r in results:
        status = "OK" if r.ok else "FAIL"
        lines.append(f"| {r.name} | {status} | {r.latency_ms}ms | {r.detail} |")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Data freshness pre-deploy check")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON instead of markdown",
    )
    args = parser.parse_args()

    results: list[CheckResult] = []
    results.append(check_coingecko())
    results.append(check_defillama())
    for name, url in RSS_FEEDS:
        results.append(check_rss(name, url))

    if args.json:
        payload = {
            "overall_ok": all(r.ok for r in results),
            "results": [
                {
                    "name": r.name,
                    "ok": r.ok,
                    "latency_ms": r.latency_ms,
                    "detail": r.detail,
                    "data": r.data,
                }
                for r in results
            ],
        }
        print(json.dumps(payload, indent=2))
    else:
        print(render_markdown(results))

    return 0 if all(r.ok for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
