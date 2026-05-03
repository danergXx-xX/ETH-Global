"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, fallback, http } from "viem";
import { sepolia } from "viem/chains";
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

type AgentId = AgentPersona | "treasury" | "parent";

// Phase 2 (Sesja 25 Sol+Aiko): real viem ENS resolution na Sepolia.
// Komponenty NIGDY nie wolaja viem ENS bezpośrednio - hook to isolation layer.
const ENS_DOMAIN =
  process.env.NEXT_PUBLIC_ENS_DOMAIN || "aicouncil-danergy.eth";
// Multi-RPC fallback chain dla Sepolia. Pierwszenstwo: env override, potem publicnode
// (sporadyczny 503 rate-limit), Tenderly gateway, RockX, 1rpc.io. Drop rpc.sepolia.org
// (Mateusz audit: niestabilny od 2026, sporadyczne stale state).
// viem `fallback` transport automatycznie przelacza po retry/timeout (bez manual circuit).
const SEPOLIA_RPC_URLS: string[] = [
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.gateway.tenderly.co",
  "https://rpc-sepolia.rockx.com",
  "https://1rpc.io/sepolia",
].filter((url): url is string => Boolean(url));

// Dla parent/treasury - placeholder addresses gdy ENS nie zwroci addr().
const FALLBACK_ADDRESSES: Record<AgentId, string> = {
  parent: "0x14b97991f681D0b69074B5AD3CcC675765C276F4",
  treasury: "0x76a69bB6AeF69A2E76Fa6C9632FF6Ca101441b0f",
  bull: "0x0000000000000000000000000000000000000001",
  bear: "0x0000000000000000000000000000000000000002",
  risk: "0x0000000000000000000000000000000000000003",
  tech: "0x0000000000000000000000000000000000000004",
  sentiment: "0x0000000000000000000000000000000000000005",
};

// Klucze text records mintowane przez scripts/mint-ens-subnames.ts (Sesja 35: deep records).
// Ghost in the Machine pattern - 26 records per subname dla ENS partner prize.
const AGENT_TEXT_KEYS = [
  // Identity
  "name",
  "description",
  "avatar",
  "url",
  "email",
  // Social
  "com.twitter",
  "com.github",
  "com.discord",
  // AI persona metadata
  "ai.persona",
  "ai.role",
  "ai.framework",
  "ai.consensus_method",
  "ai.system_prompt_hash",
  // Reputation + stats
  "ai.reputation",
  "ai.debates_participated",
  "ai.consensus_aligned",
  "ai.contract",
  "ai.last_debate_cid",
  // Tools / capabilities
  "ai.tools",
  "ai.data_sources",
  "ai.update_frequency",
  // Audit / verifiability
  "ai.proof_of_work",
  "ai.audit_log",
  "ai.transparency_score",
  // Memory / state
  "ai.memory_type",
  "ai.last_active",
  // Backwards compat (Sesja 25)
  "ai.address",
] as const;

const PARENT_TEXT_KEYS = ["name", "description", "avatar", "url"] as const;

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: fallback(
    SEPOLIA_RPC_URLS.map((url) =>
      http(url, {
        timeout: 8_000,
        retryCount: 2,
        retryDelay: 200,
      }),
    ),
    { rank: false, retryCount: 0 },
  ),
});

function ensNameFor(agentId: AgentId): string {
  if (agentId === "parent") return ENS_DOMAIN;
  if (agentId === "treasury") return `treasury.${ENS_DOMAIN}`;
  return `${agentId}.${ENS_DOMAIN}`;
}

function fallbackName(agentId: AgentId): string {
  if (agentId === "parent" || agentId === "treasury") return ensNameFor(agentId);
  const agent = AGENTS.find((a) => a.persona === agentId);
  return agent?.ens ?? `${agentId}.aicouncil.eth`;
}

async function resolveAgentENS(agentId: AgentId): Promise<ENSData> {
  const name = ensNameFor(agentId);
  const keys =
    agentId === "parent" || agentId === "treasury"
      ? PARENT_TEXT_KEYS
      : AGENT_TEXT_KEYS;

  const start = performance.now();

  // viem `getEnsText` cofa się do PublicResolver Sepolia. Brak rekordu = null.
  const [addressResult, ...textResults] = await Promise.allSettled([
    sepoliaClient.getEnsAddress({ name }),
    ...keys.map((key) =>
      sepoliaClient.getEnsText({ name, key }).then((value) => ({ key, value })),
    ),
  ]);

  const latencyMs = Math.round(performance.now() - start);

  const records: Record<string, string> = {};
  for (const r of textResults) {
    if (r.status === "fulfilled" && r.value && r.value.value) {
      records[r.value.key] = r.value.value;
    }
  }

  const resolvedAddress =
    addressResult.status === "fulfilled" && addressResult.value
      ? addressResult.value
      : FALLBACK_ADDRESSES[agentId];

  // MED-3 (Mateusz audit): walidacja avatar URL aby zablokowac javascript: / data: schemes.
  // Jak ownership subname przejdzie kiedys do agentow lub DAO, kazdy moze ustawic dowolny URL.
  const avatarRaw = records.avatar ?? null;
  const avatar =
    avatarRaw && /^(https?:|ipfs:)\/\//i.test(avatarRaw) ? avatarRaw : null;
  const resolvedAtLeastOneText = Object.keys(records).length > 0;
  const resolvedAddressOk =
    addressResult.status === "fulfilled" && addressResult.value !== null;

  return {
    name,
    address: resolvedAddress,
    avatar,
    resolved: resolvedAtLeastOneText || resolvedAddressOk,
    latencyMs,
    records,
  };
}

function fallbackData(agentId: AgentId): ENSData {
  return {
    name: fallbackName(agentId),
    address: FALLBACK_ADDRESSES[agentId],
    avatar: null,
    resolved: false,
    latencyMs: 0,
    records: {},
  };
}

export function useAgentENS(agentId: AgentId): ENSData {
  const { data } = useQuery<ENSData>({
    queryKey: ["agent-ens", ENS_DOMAIN, agentId],
    queryFn: async () => {
      try {
        return await resolveAgentENS(agentId);
      } catch (err) {
        // Nie blokuj UI - log + fallback. ENS lookup może padnac na rate-limit RPC.
        if (typeof console !== "undefined") {
          console.warn(`[useAgentENS] ${agentId}:`, err);
        }
        return fallbackData(agentId);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  return data ?? fallbackData(agentId);
}
