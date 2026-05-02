"use client";

import { useMemo } from "react";
import type { AgentPersona } from "../types";
import { AGENTS } from "../types";

interface ENSData {
  name: string;
  address: string;
  avatar: string | null;
  resolved: boolean;
  latencyMs: number;
  records: Record<string, string>;
}

const MOCK_ADDRESSES: Record<AgentPersona | "treasury" | "parent", string> = {
  parent: "0x4872F81A0fFeb204D13f17644e26e7345F7d148a",
  treasury: "0x76a69bB6AeF69A2E76Fa6C9632FF6Ca101441b0f",
  bull: "0xA001000000000000000000000000000000000001",
  bear: "0xA002000000000000000000000000000000000002",
  risk: "0xA003000000000000000000000000000000000003",
  tech: "0xA004000000000000000000000000000000000004",
  sentiment: "0xA005000000000000000000000000000000000005",
};

const MOCK_RECORDS: Record<AgentPersona, Record<string, string>> = {
  bull: { description: "Opportunity-seeking AI agent", "rep.score": "87", "rep.statements": "412", llm: "claude-opus-4-6" },
  bear: { description: "Risk-aware contrarian AI agent", "rep.score": "91", "rep.statements": "503", llm: "claude-opus-4-6" },
  risk: { description: "Quantitative risk analyst", "rep.score": "94", "rep.statements": "388", llm: "claude-opus-4-6" },
  tech: { description: "Technical due diligence specialist", "rep.score": "82", "rep.statements": "271", llm: "claude-opus-4-6" },
  sentiment: { description: "Market psychology analyst", "rep.score": "76", "rep.statements": "198", llm: "claude-sonnet-4-6" },
};

/**
 * Phase 1B: mock ENS resolution. Phase 2: swap to real viem getEnsAddress/getEnsText/getEnsAvatar.
 * Isolation layer - components NEVER call viem ENS directly.
 */
export function useAgentENS(agentId: AgentPersona | "treasury" | "parent"): ENSData {
  return useMemo(() => {
    const agent = AGENTS.find((a) => a.persona === agentId);
    const ensName = agentId === "parent"
      ? "aicouncil.eth"
      : agentId === "treasury"
        ? "treasury.aicouncil.eth"
        : agent?.ens ?? `${agentId}.aicouncil.eth`;

    const latency = 60 + Math.floor(Math.random() * 80);

    return {
      name: ensName,
      address: MOCK_ADDRESSES[agentId],
      avatar: null,
      resolved: true,
      latencyMs: latency,
      records: agentId === "parent" || agentId === "treasury"
        ? { description: agentId === "parent" ? "AI Treasury Council ENS parent" : "DAO treasury wallet" }
        : MOCK_RECORDS[agentId] ?? {},
    };
  }, [agentId]);
}
