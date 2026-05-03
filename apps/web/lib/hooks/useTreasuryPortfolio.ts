"use client";

import { useQuery } from "@tanstack/react-query";

export interface TokenHolding {
  symbol: string;
  balance: number;
  usd_value: number;
  allocation_pct: number;
}

export interface ProtocolAllocation {
  name: string;
  balance_usd: number;
  apy: number;
  risk_score: number;
}

export type Verdict = "FOR" | "AGAINST" | "ABSTAIN" | "SPLIT";

export interface RecentDecision {
  proposal_id: string;
  verdict: Verdict;
  impact_usd: number;
  executed_at: string;
}

export interface PortfolioResponse {
  total_usd: number;
  tokens: TokenHolding[];
  protocols: ProtocolAllocation[];
  pnl_7d: number;
  recent_decisions: RecentDecision[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const DEMO_PORTFOLIO: PortfolioResponse = {
  total_usd: 1_500_000,
  tokens: [
    { symbol: "mUSDC", balance: 1_000_000, usd_value: 1_000_000, allocation_pct: 66.67 },
    { symbol: "ETH", balance: 120, usd_value: 300_000, allocation_pct: 20 },
    { symbol: "WBTC", balance: 2, usd_value: 140_000, allocation_pct: 9.33 },
    { symbol: "UNI", balance: 8000, usd_value: 60_000, allocation_pct: 4 },
  ],
  protocols: [
    { name: "Aave v3", balance_usd: 250_000, apy: 4.2, risk_score: 18 },
    { name: "Compound v3", balance_usd: 180_000, apy: 3.8, risk_score: 22 },
    { name: "Lido (stETH)", balance_usd: 300_000, apy: 3.4, risk_score: 28 },
  ],
  pnl_7d: 12_450,
  recent_decisions: [
    {
      proposal_id: "142",
      verdict: "FOR",
      impact_usd: 4_200,
      executed_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      proposal_id: "141",
      verdict: "AGAINST",
      impact_usd: 0,
      executed_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    },
    {
      proposal_id: "140",
      verdict: "FOR",
      impact_usd: 8_900,
      executed_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    },
    {
      proposal_id: "139",
      verdict: "SPLIT",
      impact_usd: -650,
      executed_at: new Date(Date.now() - 1000 * 60 * 60 * 78).toISOString(),
    },
    {
      proposal_id: "138",
      verdict: "FOR",
      impact_usd: 1_400,
      executed_at: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
    },
  ],
};

async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch(`${API_BASE}/api/treasury/portfolio`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PortfolioResponse;
}

export function useTreasuryPortfolio() {
  const query = useQuery<PortfolioResponse>({
    queryKey: ["treasury", "portfolio"],
    queryFn: fetchPortfolio,
    staleTime: 1000 * 30,
    retry: 1,
  });

  return {
    portfolio: query.data ?? (query.isError ? DEMO_PORTFOLIO : undefined),
    isLoading: query.isLoading,
    isError: query.isError,
    isFallback: query.isError,
    refetch: query.refetch,
  };
}

export { DEMO_PORTFOLIO };
