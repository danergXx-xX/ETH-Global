"use client";

import { useQuery } from "@tanstack/react-query";

export type ProtocolStatus = "approved" | "under_review" | "banned" | "light";

export type ProtocolCategory =
  | "lending"
  | "dex"
  | "staking"
  | "derivatives"
  | "yield"
  | "stablecoin";

export interface AuditRef {
  firm: string;
  date: string;
  report_url: string;
}

export interface Protocol {
  id: string;
  name: string;
  category: ProtocolCategory;
  chain: string;
  tvl_usd: number;
  status: ProtocolStatus;
  risk_flags: string[];
  audit_history: AuditRef[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const DEMO_PROTOCOLS: Protocol[] = [
  {
    id: "aave-v3",
    name: "Aave v3",
    category: "lending",
    chain: "ethereum",
    tvl_usd: 12_400_000_000,
    status: "approved",
    risk_flags: [],
    audit_history: [
      { firm: "Trail of Bits", date: "2024-09-12", report_url: "https://github.com/aave" },
      { firm: "OpenZeppelin", date: "2024-06-04", report_url: "https://github.com/aave" },
    ],
  },
  {
    id: "compound-v3",
    name: "Compound v3",
    category: "lending",
    chain: "ethereum",
    tvl_usd: 2_700_000_000,
    status: "approved",
    risk_flags: [],
    audit_history: [
      { firm: "OpenZeppelin", date: "2024-05-30", report_url: "https://github.com/compound" },
    ],
  },
  {
    id: "lido",
    name: "Lido (stETH)",
    category: "staking",
    chain: "ethereum",
    tvl_usd: 22_000_000_000,
    status: "approved",
    risk_flags: ["validator_concentration"],
    audit_history: [
      { firm: "MixBytes", date: "2024-04-10", report_url: "https://github.com/lido" },
    ],
  },
  {
    id: "uniswap-v4",
    name: "Uniswap v4",
    category: "dex",
    chain: "ethereum",
    tvl_usd: 4_800_000_000,
    status: "approved",
    risk_flags: ["new_protocol"],
    audit_history: [
      { firm: "Trail of Bits", date: "2024-12-01", report_url: "https://github.com/uniswap" },
    ],
  },
  {
    id: "curve-finance",
    name: "Curve Finance",
    category: "dex",
    chain: "ethereum",
    tvl_usd: 2_100_000_000,
    status: "under_review",
    risk_flags: ["historical_exploit"],
    audit_history: [
      { firm: "Trail of Bits", date: "2023-10-12", report_url: "https://github.com/curve" },
    ],
  },
  {
    id: "yearn-v3",
    name: "Yearn v3",
    category: "yield",
    chain: "ethereum",
    tvl_usd: 480_000_000,
    status: "light",
    risk_flags: ["complex_strategies"],
    audit_history: [
      { firm: "ChainSecurity", date: "2024-02-18", report_url: "https://github.com/yearn" },
    ],
  },
  {
    id: "convex",
    name: "Convex",
    category: "yield",
    chain: "ethereum",
    tvl_usd: 1_300_000_000,
    status: "light",
    risk_flags: ["dependency_risk"],
    audit_history: [],
  },
  {
    id: "anchor",
    name: "Anchor (legacy)",
    category: "stablecoin",
    chain: "terra",
    tvl_usd: 0,
    status: "banned",
    risk_flags: ["depeg_history", "operational_collapse"],
    audit_history: [],
  },
];

async function fetchProtocols(): Promise<Protocol[]> {
  const res = await fetch(`${API_BASE}/api/protocols`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Protocol[];
}

export function useProtocols() {
  const query = useQuery<Protocol[]>({
    queryKey: ["protocols", "list"],
    queryFn: fetchProtocols,
    staleTime: 1000 * 60,
    retry: 1,
  });

  return {
    protocols: query.data ?? (query.isError ? DEMO_PROTOCOLS : undefined),
    isLoading: query.isLoading,
    isError: query.isError,
    isFallback: query.isError,
    refetch: query.refetch,
  };
}

export { DEMO_PROTOCOLS };
