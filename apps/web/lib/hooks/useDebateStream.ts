"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentDecision, AgentPersona, Claim, DebatePhase } from "../types";
import { MOCK_DECISIONS } from "../mocks/debate";

interface DebateStreamState {
  phase: DebatePhase;
  agentStates: Map<AgentPersona, AgentStreamState>;
  elapsedMs: number;
  error: string | null;
}

interface AgentStreamState {
  status: "waiting" | "analyzing" | "done" | "error";
  claims: Claim[];
  currentClaimIndex: number;
  currentCharIndex: number;
  decision: AgentDecision | null;
}

const INITIAL_AGENT_STATE: AgentStreamState = {
  status: "waiting",
  claims: [],
  currentClaimIndex: 0,
  currentCharIndex: 0,
  decision: null,
};

const TYPEWRITER_MS = 30;
const CLAIM_PAUSE_MS = 400;

/**
 * WebSocket debate stream with typewriter effect.
 * Phase 1B: simulates with mock data + timers.
 * Phase 3: swap to real ws://api/agents/stream/{proposalId}.
 */
export function useDebateStream(proposalId: string | null) {
  const [state, setState] = useState<DebateStreamState>({
    phase: "waiting",
    agentStates: new Map(),
    elapsedMs: 0,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const startDebate = useCallback(() => {
    if (!proposalId) return;

    startRef.current = Date.now();
    const agents: AgentPersona[] = ["bull", "bear", "risk", "tech", "sentiment"];
    const initial = new Map<AgentPersona, AgentStreamState>();
    for (const a of agents) {
      initial.set(a, { ...INITIAL_AGENT_STATE });
    }

    setState({ phase: "debating", agentStates: initial, elapsedMs: 0, error: null });

    const agentOrder = [...agents];
    let currentAgentIdx = 0;
    let claimIdx = 0;
    let charIdx = 0;
    let pauseUntil = 0;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startRef.current;

      if (now < pauseUntil) {
        setState((prev) => ({ ...prev, elapsedMs: elapsed }));
        return;
      }

      if (currentAgentIdx >= agentOrder.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setState((prev) => ({ ...prev, phase: "done", elapsedMs: elapsed }));
        return;
      }

      const persona = agentOrder[currentAgentIdx];
      const mockDecision = MOCK_DECISIONS.find((d) => d.persona === persona);
      if (!mockDecision) {
        currentAgentIdx++;
        return;
      }

      const claims = mockDecision.claims;

      setState((prev) => {
        const next = new Map(prev.agentStates);
        const agentState = { ...(next.get(persona) ?? INITIAL_AGENT_STATE) };

        if (claimIdx >= claims.length) {
          agentState.status = "done";
          agentState.decision = mockDecision;
          next.set(persona, agentState);
          currentAgentIdx++;
          claimIdx = 0;
          charIdx = 0;
          return { ...prev, agentStates: next, elapsedMs: elapsed };
        }

        agentState.status = "analyzing";
        const claim = claims[claimIdx];
        const text = claim.text;

        if (charIdx >= text.length) {
          agentState.claims = [...agentState.claims.slice(0, claimIdx), claim];
          agentState.currentClaimIndex = claimIdx + 1;
          agentState.currentCharIndex = 0;
          claimIdx++;
          charIdx = 0;
          pauseUntil = now + CLAIM_PAUSE_MS;
        } else {
          const partialClaim: Claim = {
            text: text.slice(0, charIdx + 1),
            sourceId: charIdx >= text.length - 1 ? claim.sourceId : null,
          };
          agentState.claims = [...agentState.claims.slice(0, claimIdx), partialClaim];
          agentState.currentClaimIndex = claimIdx;
          agentState.currentCharIndex = charIdx + 1;
          charIdx++;
        }

        next.set(persona, agentState);
        return { ...prev, agentStates: next, elapsedMs: elapsed };
      });
    }, TYPEWRITER_MS);
  }, [proposalId]);

  const stopDebate = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState((prev) => ({ ...prev, phase: "done" }));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    ...state,
    startDebate,
    stopDebate,
  };
}
