"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Aligned with CustomAgentSpec / CustomAgent in apps/api/schemas.py.
export type LLMModelChoice =
  | "claude-sonnet-4-6"
  | "claude-opus-4-7"
  | "gpt-4o"
  | "gemini-2-pro";

export type CustomAgentStatus =
  | "testing"
  | "awaiting_multisig"
  | "approved"
  | "rejected";

export interface CustomAgentSpec {
  persona_id: string;
  display_name: string;
  llm_model: LLMModelChoice;
  ens_subname: string;
  vote_weight: number;
  trust_gate: number;
  system_prompt: string;
  test_arena_proposal?: string | null;
}

export interface TestArenaResult {
  proposal: string;
  custom_decision: "FOR" | "AGAINST" | "ABSTAIN";
  custom_confidence: number;
  custom_reasoning: string;
  standard_consensus: "FOR" | "AGAINST" | "ABSTAIN" | "SPLIT";
  aligned_with_consensus: boolean;
  sandbox: boolean;
}

export interface CustomAgent {
  agent_id: string;
  persona_id: string;
  display_name: string;
  llm_model: LLMModelChoice;
  ens_subname: string;
  vote_weight: number;
  trust_gate: number;
  status: CustomAgentStatus;
  created_at: string;
  test_arena_result: TestArenaResult | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export class CustomAgentError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "CustomAgentError";
  }
}

async function postCustomAgent(spec: CustomAgentSpec): Promise<CustomAgent> {
  const res = await fetch(`${API_BASE}/api/agents/custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // ignore body parse error - keep status-only message
    }
    throw new CustomAgentError(res.status, detail);
  }
  return (await res.json()) as CustomAgent;
}

export function useSubmitCustomAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["custom-agent", "submit"],
    mutationFn: postCustomAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-agents"] });
    },
  });
}

/**
 * Demo Mode (Wave 1+): mock list of custom agents already registered.
 * Replaced once GET /api/agents/custom is wired (Hugo backlog).
 */
export const MOCK_CUSTOM_AGENTS: CustomAgent[] = [
  {
    agent_id: "ca_demo_aave_yield",
    persona_id: "aave_yield",
    display_name: "Aave Yield Hawk",
    llm_model: "claude-sonnet-4-6",
    ens_subname: "aave-yield.aicouncil-danergy.eth",
    vote_weight: 6,
    trust_gate: 75,
    status: "approved",
    created_at: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    test_arena_result: {
      proposal:
        "Should DAO buy 100 ETH at current price for treasury diversification?",
      custom_decision: "AGAINST",
      custom_confidence: 0.68,
      custom_reasoning:
        "Aave yield on stables exceeds expected ETH carry; treasury better deployed in lending.",
      standard_consensus: "FOR",
      aligned_with_consensus: false,
      sandbox: true,
    },
  },
];

export function useMockCustomAgents() {
  // Hook returns local state so the modal can append newly-submitted agents
  // without waiting on backend list endpoint.
  const [agents, setAgents] = useState<CustomAgent[]>(MOCK_CUSTOM_AGENTS);
  return {
    agents,
    addAgent: (a: CustomAgent) => setAgents((prev) => [a, ...prev]),
  };
}

const JAILBREAK_PHRASES = [
  "ignore previous",
  "ignore all previous",
  "disregard the above",
  "forget your instructions",
  "you are now",
  "system prompt:",
  "developer mode",
];

/**
 * Client-side jailbreak smell test. Server (custom_agent_service.JailbreakRejected)
 * is the SoT, but a quick local check stops obvious cases before submit.
 */
export function detectJailbreak(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  for (const phrase of JAILBREAK_PHRASES) {
    if (lower.includes(phrase)) {
      return `Prompt contains a jailbreak phrase ("${phrase}"). Rephrase before submitting.`;
    }
  }
  return null;
}
