# Phase 0 mock. Nova podmieni w feat/agents-bull branch.
from __future__ import annotations

from datetime import datetime, timezone


async def run_debate(proposal_text: str) -> dict:
    """Uruchamia debate agentow. Phase 0 zwraca mock."""
    now = datetime.now(timezone.utc).isoformat()
    return {
        "decisions": [
            {
                "persona": "bull",
                "decision": "FOR",
                "confidence": 0.7,
                "reasoning": "Mock - Nova podlaczy w Phase 1",
                "claims": [],
                "timestamp": now,
            },
            {
                "persona": "bear",
                "decision": "AGAINST",
                "confidence": 0.6,
                "reasoning": "Mock - Nova podlaczy w Phase 1",
                "claims": [],
                "timestamp": now,
            },
            {
                "persona": "risk",
                "decision": "ABSTAIN",
                "confidence": 0.5,
                "reasoning": "Mock - Nova podlaczy w Phase 1",
                "claims": [],
                "timestamp": now,
            },
            {
                "persona": "tech",
                "decision": "FOR",
                "confidence": 0.6,
                "reasoning": "Mock - Nova podlaczy w Phase 1",
                "claims": [],
                "timestamp": now,
            },
            {
                "persona": "sentiment",
                "decision": "FOR",
                "confidence": 0.55,
                "reasoning": "Mock - Nova podlaczy w Phase 1",
                "claims": [],
                "timestamp": now,
            },
        ],
        "consensus": "FOR",
        "vote_id": "mock-vote-uuid",
    }
