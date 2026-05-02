import type { AgentDecision, Claim, ProposalMeta, Source } from "../types";

export const MOCK_PROPOSAL: ProposalMeta = {
  id: "PROP-042",
  description: {
    en: "Allocate 100,000 USDC from treasury to Aave v3 USDC supply for 4.2% est. APY. 30-day initial term, auto-renew unless DAO cancels. Withdraw at any time (no lock).",
    pl: "Przeznaczyć 100 000 USDC ze skarbca DAO na Aave v3 USDC supply dla szacowanego APY 4,2%. Okres początkowy 30 dni, auto-odnowienie chyba że DAO anuluje. Wypłata w dowolnej chwili (bez locka).",
  },
  amount: "100,000 USDC",
  target: "Aave v3 (Base)",
  estApy: "4.2%",
};

export const MOCK_SOURCES: Record<number, Source> = {
  1: { id: 1, title: "DeFiLlama - Aave v3 USDC pool (Base)", type: "defillama", url: "https://defillama.com/yields/pool/aave-v3-usdc-base", confidence: 0.92, snippet: "30d rolling APY 4.21%, TVL 184.3M USDC, utilization 72.4%, deposits 24h: 6.1M" },
  2: { id: 2, title: "Aave v3 risk parameters - Base USDC reserve", type: "defillama", url: "https://app.aave.com/reserve-overview/?underlyingAsset=usdc&marketName=base", confidence: 0.94, snippet: "Optimal utilization 80%. Slope1 4%, Slope2 60%. Reserve factor 10%. Current state: below kink." },
  3: { id: 3, title: "CoinGecko - USDC stable benchmarks", type: "coingecko", url: "https://www.coingecko.com/en/coins/usd-coin", confidence: 0.88, snippet: "30d depeg max 0.18%, T-bill equiv yield 3.31% Apr 2026, base risk-free spread vs Aave: ~89bps" },
  4: { id: 4, title: "Aave Governance forum - Nov 2025 GHO incident retro", type: "rss", url: "https://governance.aave.com/t/gho-collateral-pause-retrospective", confidence: 0.81, snippet: "GHO collateral was paused for 4h11m; root cause oracle staleness; mitigations deployed v3.0.2." },
  5: { id: 5, title: "Council Rules v0.4 - per-protocol concentration cap", type: "perplexity", url: "https://aicouncil.eth.limo/rules", confidence: 0.99, snippet: "max_per_protocol_pct: 5 (soft), max_per_asset_pct: 30 (hard). Soft requires HITL waiver." },
  6: { id: 6, title: "Internal risk model - VaR backtest 90d", type: "perplexity", url: "https://0g.ai/storage/cid/bafy...risk-q1-2026", confidence: 0.86, snippet: "VaR(95) for 100k USDC supplied to Aave v3 over 30 days bounded at 1.84% under historical depeg distribution." },
  7: { id: 7, title: "Council Rules v0.4 - hard caps", type: "perplexity", url: "https://aicouncil.eth.limo/rules#caps", confidence: 0.99, snippet: "Hard cap per asset: 30%. Hard cap per protocol: 15%. Soft cap per protocol: 5%, requires HITL." },
  8: { id: 8, title: "Spearbit audit report - Aave v3.0.2", type: "rss", url: "https://github.com/spearbit/portfolio/aave-v3-0-2.pdf", confidence: 0.93, snippet: "No critical or high findings. 3 medium accepted, 7 low fixed in v3.0.2-rc1. Formal verification by Certora attached." },
  9: { id: 9, title: "Aave v3 dev docs - aToken integration", type: "rss", url: "https://docs.aave.com/developers/tokens/atoken", confidence: 0.90, snippet: "aTokens are ERC-20 with rebasing balance. Standard transfer/approve. No custom adapter required for OZ governance." },
  10: { id: 10, title: "aixbt - Aave sentiment trailing 7d", type: "aixbt", url: "https://aixbt.tech/asset/aave", confidence: 0.74, snippet: "Composite score: +0.31. Volume index: +18% wow. Top themes: stability, rate competitiveness, Base growth." },
};

const BULL_CLAIMS_EN: Claim[] = [
  { text: "Aave v3 USDC supply on Base has held a 30d rolling APY between 3.9 and 4.6 percent through Q1 2026", sourceId: 1 },
  { text: "TVL on the pool sits at 184M USDC with utilization at 72 percent, comfortably below the kink point", sourceId: 2 },
  { text: "Estimated yield on 100k over 30 days is ~345 USDC after gas, net of standard reserve factor", sourceId: 3 },
  { text: "Pool is flagged as no-lock - exit liquidity tested at 50M+ in single-block redemptions over the past quarter", sourceId: 1 },
];

const BEAR_CLAIMS_EN: Claim[] = [
  { text: "Smart-contract risk is non-zero - Aave v3 had a paused-asset incident in Nov 2025 affecting GHO collateral", sourceId: 4 },
  { text: "Concentration is the real issue - 100k is 9.4 percent of stated treasury, breaching the proposed 5 percent solo-protocol cap", sourceId: 5 },
  { text: "Yield premium over short T-bill equivalents is roughly 90bps after gas - thin compensation for added surface", sourceId: 3 },
  { text: "Recommend laddering across two protocols or capping at 50k for a 14-day pilot", sourceId: null },
];

const RISK_CLAIMS_EN: Claim[] = [
  { text: "VaR(95) on 100k USDC supply over 30 days, given historical depeg events, is bounded at 1,840 USDC", sourceId: 6 },
  { text: "Sharpe of allocation versus idle stable is 1.7 on trailing 90 days", sourceId: 6 },
  { text: "Rule check - exceeds the 5 percent solo-protocol soft cap by 4.4 points but stays within 30 percent per-asset hard cap", sourceId: 7 },
  { text: "Net position - quant case clears, governance case requires HITL sign-off on the soft-cap waiver", sourceId: null },
];

const TECH_CLAIMS_EN: Claim[] = [
  { text: "Aave v3 contracts on Base are at v3.0.2, audited by Spearbit and Certora, last formal verification April 2026", sourceId: 8 },
  { text: "aUSDC token integrates cleanly with our existing OpenZeppelin governance executor - no custom adapter needed", sourceId: 9 },
  { text: "Pool oracle uses Chainlink USDC/USD with 0.5 percent deviation threshold and 24h heartbeat - acceptable", sourceId: 8 },
  { text: "Single tx execution path. Gas estimate 184k on Base - approximately 0.04 USDC at current basefee", sourceId: 9 },
];

const SENTIMENT_CLAIMS_EN: Claim[] = [
  { text: "aixbt sentiment score on Aave is +0.31 over trailing 7 days - mildly positive, not euphoric", sourceId: 10 },
  { text: "CT discussion volume around Aave v3 Base is up 18 percent week-over-week, mostly neutral framing", sourceId: 10 },
  { text: "No signal in either direction strong enough to override quant-driven outcome", sourceId: null },
  { text: "Abstaining - ceding the call to risk and tech who have higher-conviction reads here", sourceId: null },
];

export const MOCK_DECISIONS: AgentDecision[] = [
  { persona: "bull", decision: "FOR", confidence: 0.84, claims: BULL_CLAIMS_EN, timestamp: new Date().toISOString() },
  { persona: "bear", decision: "AGAINST", confidence: 0.71, claims: BEAR_CLAIMS_EN, timestamp: new Date().toISOString() },
  { persona: "risk", decision: "FOR", confidence: 0.66, claims: RISK_CLAIMS_EN, timestamp: new Date().toISOString() },
  { persona: "tech", decision: "FOR", confidence: 0.78, claims: TECH_CLAIMS_EN, timestamp: new Date().toISOString() },
  { persona: "sentiment", decision: "ABSTAIN", confidence: 0.52, claims: SENTIMENT_CLAIMS_EN, timestamp: new Date().toISOString() },
];
