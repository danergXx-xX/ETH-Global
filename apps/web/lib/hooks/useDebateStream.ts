"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentDecision, AgentPersona, Claim, DebatePhase } from "../types";
import { MOCK_DECISIONS } from "../mocks/debate";

interface DebateStreamState {
  phase: DebatePhase;
  agentStates: Map<AgentPersona, AgentStreamState>;
  elapsedMs: number;
  error: string | null;
  consensus: "FOR" | "AGAINST" | "ABSTAIN" | "SPLIT" | null;
  voteId: string | null;
  retrying: boolean;
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
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3_000;
const AGENTS: AgentPersona[] = ["bull", "bear", "risk", "tech", "sentiment"];

function emptyAgentStates(): Map<AgentPersona, AgentStreamState> {
  const m = new Map<AgentPersona, AgentStreamState>();
  for (const a of AGENTS) {
    m.set(a, { ...INITIAL_AGENT_STATE });
  }
  return m;
}

function deriveWsUrl(): string | null {
  if (typeof window === "undefined") return null;
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit && explicit.length > 0) {
    return explicit.replace(/\/$/, "");
  }
  // Fallback: derive from window location for same-origin dev.
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}`;
}

function genProposalId(): string {
  return `prop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Live debate stream.
 * - Tries real WebSocket against NEXT_PUBLIC_WS_URL/ws/debate.
 * - Retries up to 3 times with 3s spacing on connection / handshake failure.
 * - Falls back to mock playback if all retries fail (offline demo continues).
 *
 * Server event shape (apps/api/services/debate_streamer.py):
 *   { type: "agent_started", agent_id }
 *   { type: "agent_statement", agent_id, decision }
 *   { type: "consensus", consensus, vote_id }
 *   { type: "complete" }
 *   { type: "error", message, recoverable }
 */
export function useDebateStream(proposalText: string | null) {
  const [state, setState] = useState<DebateStreamState>({
    phase: "waiting",
    agentStates: emptyAgentStates(),
    elapsedMs: 0,
    error: null,
    consensus: null,
    voteId: null,
    retrying: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(0);
  const proposalIdRef = useRef<string>("");

  const cleanupTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // best effort
      }
      wsRef.current = null;
    }
  }, []);

  const playMockFallback = useCallback(() => {
    // Mock playback identical to the previous implementation, used after
    // real WS retries are exhausted so the demo never goes blank.
    startRef.current = Date.now();
    setState({
      phase: "debating",
      agentStates: emptyAgentStates(),
      elapsedMs: 0,
      error:
        "Backend offline - playing mock debate. Connect backend (apps/api) for live council.",
      consensus: null,
      voteId: null,
      retrying: false,
    });

    const agentOrder = [...AGENTS];
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
          agentState.claims = [
            ...agentState.claims.slice(0, claimIdx),
            partialClaim,
          ];
          agentState.currentClaimIndex = claimIdx;
          agentState.currentCharIndex = charIdx + 1;
          charIdx++;
        }
        next.set(persona, agentState);
        return { ...prev, agentStates: next, elapsedMs: elapsed };
      });
    }, TYPEWRITER_MS);
  }, []);

  const handleEvent = useCallback((event: Record<string, unknown>) => {
    const type = event.type as string | undefined;
    // Backend (services/debate_streamer.py) shape:
    //   { type:"agent_statement", agent, decision:"FOR"|..., confidence,
    //     text, sources }
    if (type === "agent_statement" || type === "agent_done") {
      const persona = (event.agent ?? event.agent_id) as AgentPersona;
      const verdict = event.decision as AgentDecision["decision"] | undefined;
      const confidence = (event.confidence as number | undefined) ?? 0;
      const text = (event.text as string | undefined) ?? "";
      const sources = (event.sources as unknown[] | undefined) ?? [];
      if (!persona || !verdict) return;
      const decision: AgentDecision = {
        persona,
        decision: verdict,
        confidence,
        reasoning: text,
        claims:
          text.length > 0
            ? [{ text, sourceId: null }]
            : [],
        timestamp: (event.timestamp as string) ?? new Date().toISOString(),
        sources: sources as AgentDecision["sources"],
      } as unknown as AgentDecision;
      setState((prev) => {
        const next = new Map(prev.agentStates);
        const cur = next.get(persona) ?? { ...INITIAL_AGENT_STATE };
        next.set(persona, {
          ...cur,
          status: "done",
          decision,
          claims:
            text.length > 0
              ? [{ text, sourceId: null }]
              : cur.claims,
          currentClaimIndex: 1,
        });
        return { ...prev, agentStates: next };
      });
      return;
    }
    if (type === "agent_started" || type === "agent_thinking") {
      const personaId = (event.agent_id ?? event.agent ?? event.persona) as
        | AgentPersona
        | undefined;
      if (!personaId) return;
      setState((prev) => {
        const next = new Map(prev.agentStates);
        const cur = next.get(personaId) ?? { ...INITIAL_AGENT_STATE };
        next.set(personaId, { ...cur, status: "analyzing" });
        return { ...prev, agentStates: next };
      });
      return;
    }
    if (type === "consensus" || type === "debate_complete") {
      const consensus = (event.verdict ?? event.consensus ?? null) as
        | DebateStreamState["consensus"];
      const voteId = (event.vote_id ?? null) as string | null;
      setState((prev) => ({ ...prev, consensus, voteId }));
      return;
    }
    if (type === "complete") {
      setState((prev) => ({
        ...prev,
        phase: "done",
        elapsedMs: Date.now() - startRef.current,
      }));
      return;
    }
    if (type === "error") {
      const message = (event.message as string) ?? "stream error";
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  const connect = useCallback(
    (text: string) => {
      const base = deriveWsUrl();
      if (!base) {
        playMockFallback();
        return;
      }
      const url = `${base}/ws/debate?proposal_id=${encodeURIComponent(
        proposalIdRef.current
      )}&text=${encodeURIComponent(text)}`;

      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch (err) {
        if (retryRef.current >= MAX_RETRIES) {
          playMockFallback();
          return;
        }
        retryRef.current += 1;
        retryTimeoutRef.current = setTimeout(
          () => connect(text),
          RETRY_DELAY_MS
        );
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        startRef.current = Date.now();
        setState((prev) => ({
          ...prev,
          phase: "debating",
          agentStates: emptyAgentStates(),
          elapsedMs: 0,
          error: null,
          retrying: false,
        }));
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as Record<string, unknown>;
          handleEvent(data);
        } catch {
          // ignore malformed frame
        }
      };
      ws.onerror = () => {
        // onclose handles retry
      };
      ws.onclose = (ev) => {
        wsRef.current = null;
        const wasOpen = ev.code === 1000;
        if (wasOpen) return;
        if (retryRef.current >= MAX_RETRIES) {
          playMockFallback();
          return;
        }
        retryRef.current += 1;
        setState((prev) => ({
          ...prev,
          retrying: true,
          error: `Backend connecting, retry ${retryRef.current}/${MAX_RETRIES} in 3s...`,
        }));
        retryTimeoutRef.current = setTimeout(
          () => connect(text),
          RETRY_DELAY_MS
        );
      };
    },
    [handleEvent, playMockFallback]
  );

  const startDebate = useCallback(() => {
    if (!proposalText) return;
    cleanupTimers();
    closeSocket();
    retryRef.current = 0;
    proposalIdRef.current = genProposalId();
    setState({
      phase: "debating",
      agentStates: emptyAgentStates(),
      elapsedMs: 0,
      error: null,
      consensus: null,
      voteId: null,
      retrying: false,
    });
    connect(proposalText);
  }, [proposalText, connect, cleanupTimers, closeSocket]);

  const stopDebate = useCallback(() => {
    cleanupTimers();
    closeSocket();
    setState((prev) => ({ ...prev, phase: "done", retrying: false }));
  }, [cleanupTimers, closeSocket]);

  useEffect(() => {
    return () => {
      cleanupTimers();
      closeSocket();
    };
  }, [cleanupTimers, closeSocket]);

  return {
    ...state,
    startDebate,
    stopDebate,
  };
}
