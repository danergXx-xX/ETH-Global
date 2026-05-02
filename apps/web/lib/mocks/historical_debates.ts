/**
 * 3 historical mock debates - audit trail tab pre-populated.
 *
 * Mirror of apps/api/data/seed_historical_debates.py (Lumen owner).
 * Used by AuditLog component to render concluded debates with full
 * source attribution before live debates accumulate.
 */

import type { AgentPersona, Decision, Consensus, SourceType } from "../types";

export interface HistoricalAgentStatement {
  persona: AgentPersona;
  ens: string;
  decision: Decision;
  confidence: number;
  reasoning_snippet: string;
  primary_source: {
    title: string;
    url: string;
    type: SourceType;
    weight: number;
  };
  timestamp: string;
}

export interface HistoricalDebate {
  id: string;
  proposal: {
    id: string;
    title: { en: string; pl: string };
    description: { en: string; pl: string };
    amount: string;
    target: string;
  };
  submitted_at: string;
  concluded_at: string;
  duration_seconds: number;
  consensus: Consensus;
  verdict: "APPROVED" | "REJECTED" | "ABSTAINED";
  vote_tally: { FOR: number; AGAINST: number; ABSTAIN: number };
  confidence: number;
  agent_statements: HistoricalAgentStatement[];
  og_storage_cid: string;
  tx_hash: string | null;
  reputation_deltas: Record<AgentPersona, number>;
}

export const HISTORICAL_DEBATES: HistoricalDebate[] = [
  {
    id: "DEBATE-HIST-01",
    proposal: {
      id: "PROP-2026-04-30-001",
      title: {
        en: "Approve $50K USDC -> Aave v3 deposit at 4.2 percent APY",
        pl: "Zatwierdź 50 tys. USDC -> depozyt Aave v3 przy APY 4,2 procent",
      },
      description: {
        en: "Allocate 50,000 USDC from treasury to Aave v3 USDC supply on Base for 4.2 percent estimated APY. 30-day initial term, auto-renew unless DAO cancels.",
        pl: "Przeznaczyć 50 000 USDC ze skarbca DAO na Aave v3 USDC supply na Base dla szacowanego APY 4,2 procent. Okres początkowy 30 dni, auto-odnowienie chyba że DAO anuluje.",
      },
      amount: "50,000 USDC",
      target: "Aave v3 (Base)",
    },
    submitted_at: "2026-04-30T20:45:00Z",
    concluded_at: "2026-04-30T20:53:42Z",
    duration_seconds: 522,
    consensus: "FOR",
    verdict: "APPROVED",
    vote_tally: { FOR: 4, AGAINST: 1, ABSTAIN: 0 },
    confidence: 0.78,
    agent_statements: [
      {
        persona: "bull",
        ens: "bull.aicouncil.eth",
        decision: "FOR",
        confidence: 0.82,
        reasoning_snippet:
          "30-day APY trailing 4.21 percent stable; TVL on pool 184M USDC, utilization 72 percent below kink. Net yield over T-bill ~89bps after gas.",
        primary_source: {
          title: "DeFiLlama - Aave v3 USDC pool (Base)",
          url: "https://defillama.com/yields/pool/aave-v3-usdc-base",
          type: "defillama",
          weight: 0.92,
        },
        timestamp: "2026-04-30T20:47:18Z",
      },
      {
        persona: "bear",
        ens: "bear.aicouncil.eth",
        decision: "AGAINST",
        confidence: 0.61,
        reasoning_snippet:
          "Smart-contract risk non-zero - GHO collateral incident Nov 2025. 4.2 percent APY thin margin over T-bills after gas. Recommend ladder across 2 protocols.",
        primary_source: {
          title: "Aave Governance - Nov 2025 GHO incident retro",
          url: "https://governance.aave.com/t/gho-collateral-pause-retrospective",
          type: "rss",
          weight: 0.81,
        },
        timestamp: "2026-04-30T20:48:04Z",
      },
      {
        persona: "risk",
        ens: "risk.aicouncil.eth",
        decision: "FOR",
        confidence: 0.74,
        reasoning_snippet:
          "VaR(95) on 50K USDC supply over 30 days bounded at 920 USDC. Sharpe 1.7 vs idle stable. Within 5 percent solo-protocol soft cap (this is 4.7 percent of treasury).",
        primary_source: {
          title: "Internal risk model - VaR backtest 90d",
          url: "https://0g.ai/storage/cid/bafyrisk-q1-2026",
          type: "perplexity",
          weight: 0.86,
        },
        timestamp: "2026-04-30T20:49:22Z",
      },
      {
        persona: "tech",
        ens: "tech.aicouncil.eth",
        decision: "FOR",
        confidence: 0.88,
        reasoning_snippet:
          "Aave v3.0.2 audited Spearbit + Certora formal verification April 2026. aUSDC clean ERC20 - no custom adapter. Gas est 184k on Base ~0.04 USDC.",
        primary_source: {
          title: "Spearbit audit - Aave v3.0.2",
          url: "https://github.com/spearbit/portfolio/aave-v3-0-2.pdf",
          type: "rss",
          weight: 0.93,
        },
        timestamp: "2026-04-30T20:50:10Z",
      },
      {
        persona: "sentiment",
        ens: "sentiment.aicouncil.eth",
        decision: "FOR",
        confidence: 0.55,
        reasoning_snippet:
          "aixbt sentiment +0.31 mildly positive, not euphoric. CT volume +18 percent wow neutral framing. No override signal in either direction.",
        primary_source: {
          title: "aixbt - Aave sentiment trailing 7d",
          url: "https://aixbt.tech/asset/aave",
          type: "aixbt",
          weight: 0.74,
        },
        timestamp: "2026-04-30T20:51:02Z",
      },
    ],
    og_storage_cid:
      "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    tx_hash:
      "0x7c1a5d8e9f3b4c2a6e8d9f1b5c3a7e2d4f6c8b1a9e3d5f7c2b4a6e8d1f3c5b7a",
    reputation_deltas: {
      bull: 0.18,
      bear: -0.04,
      risk: 0.22,
      tech: 0.14,
      sentiment: 0.02,
    },
  },
  {
    id: "DEBATE-HIST-02",
    proposal: {
      id: "PROP-2026-05-01-002",
      title: {
        en: "Sell 10 percent ETH treasury before EIP-4844 vote",
        pl: "Sprzedaj 10 procent skarbca ETH przed głosowaniem EIP-4844",
      },
      description: {
        en: "Sell 10 percent (32 ETH ~ $96K) of ETH treasury position before pending EIP-4844 governance vote, citing uncertainty risk. Convert to USDC.",
        pl: "Sprzedać 10 procent (32 ETH ~ 96 tys. USD) pozycji ETH ze skarbca przed nadchodzącym głosowaniem governance EIP-4844, wskazując na ryzyko niepewności. Konwersja na USDC.",
      },
      amount: "32 ETH",
      target: "Cowswap -> USDC",
    },
    submitted_at: "2026-05-01T09:30:00Z",
    concluded_at: "2026-05-01T09:41:18Z",
    duration_seconds: 678,
    consensus: "AGAINST",
    verdict: "REJECTED",
    vote_tally: { FOR: 1, AGAINST: 4, ABSTAIN: 0 },
    confidence: 0.81,
    agent_statements: [
      {
        persona: "bull",
        ens: "bull.aicouncil.eth",
        decision: "AGAINST",
        confidence: 0.79,
        reasoning_snippet:
          "EIP-4844 narrative is bullish - blob throughput improvements. Selling pre-vote oversells uncertainty premium. Historical pattern: pre-EIP sells underperform 3-month forward returns.",
        primary_source: {
          title: "CoinDesk - EIP-4844 governance preview",
          url: "https://www.coindesk.com/tech/2026/04/eip-4844-blob-upgrade-vote",
          type: "rss",
          weight: 0.78,
        },
        timestamp: "2026-05-01T09:32:44Z",
      },
      {
        persona: "bear",
        ens: "bear.aicouncil.eth",
        decision: "FOR",
        confidence: 0.68,
        reasoning_snippet:
          "Governance uncertainty IS material - EIP-4844 has stalled twice. 10 percent sell is prudent risk reduction, not capitulation. Re-entry possible post-vote.",
        primary_source: {
          title: "Reuters - Ethereum EIP delays history",
          url: "https://www.reuters.com/technology/ethereum-eip-delays-2026",
          type: "rss",
          weight: 0.76,
        },
        timestamp: "2026-05-01T09:33:28Z",
      },
      {
        persona: "risk",
        ens: "risk.aicouncil.eth",
        decision: "AGAINST",
        confidence: 0.84,
        reasoning_snippet:
          "Selling 10 percent ETH for governance event arbitrage is tactical, not strategic. VaR analysis shows event-driven moves typically <8 percent. Realized vol 32 percent annualized over 90d.",
        primary_source: {
          title: "CoinGecko - ETH 90d realized volatility",
          url: "https://www.coingecko.com/en/coins/ethereum/historical_data",
          type: "coingecko",
          weight: 0.88,
        },
        timestamp: "2026-05-01T09:34:51Z",
      },
      {
        persona: "tech",
        ens: "tech.aicouncil.eth",
        decision: "AGAINST",
        confidence: 0.72,
        reasoning_snippet:
          "EIP-4844 implementation is technically mature - testnet stable 6 months. Vote is governance ratification, not deployment risk. Tech case favors hold.",
        primary_source: {
          title: "Ethereum Foundation - EIP-4844 testnet status",
          url: "https://blog.ethereum.org/2026/04/eip-4844-testnet-stability",
          type: "rss",
          weight: 0.91,
        },
        timestamp: "2026-05-01T09:36:12Z",
      },
      {
        persona: "sentiment",
        ens: "sentiment.aicouncil.eth",
        decision: "AGAINST",
        confidence: 0.58,
        reasoning_snippet:
          "aixbt sentiment ETH +0.42 over 14d - net positive narrative. Pre-vote chatter is balanced 60/40 supportive. Selling here fights tape.",
        primary_source: {
          title: "aixbt - ETH composite sentiment",
          url: "https://aixbt.tech/asset/eth",
          type: "aixbt",
          weight: 0.71,
        },
        timestamp: "2026-05-01T09:37:03Z",
      },
    ],
    og_storage_cid:
      "bafybeicq3kyfrz2lthn5oebxrtxmwqg3pt6vzsfpke2y3bqksm6twh4lae",
    tx_hash: null,
    reputation_deltas: {
      bull: 0.16,
      bear: -0.12,
      risk: 0.24,
      tech: 0.18,
      sentiment: 0.06,
    },
  },
  {
    id: "DEBATE-HIST-03",
    proposal: {
      id: "PROP-2026-05-02-003",
      title: {
        en: "Add Lido stETH as collateral asset (treasury LST allocation)",
        pl: "Dodaj Lido stETH jako aktywo kolateralne (alokacja LST skarbca)",
      },
      description: {
        en: "Approve Lido stETH as treasury collateral asset, up to 15 percent allocation. Enables yield-bearing ETH exposure (~3.4 percent staking APR) while maintaining liquidity via Curve stETH/ETH pool.",
        pl: "Zatwierdź Lido stETH jako aktywo kolateralne skarbca, do 15 procent alokacji. Umożliwia ekspozycję na ETH przynoszącą yield (~3,4 procent APR ze stakingu) przy zachowaniu płynności przez pulę Curve stETH/ETH.",
      },
      amount: "Up to 15 percent (~$144K)",
      target: "Lido stETH",
    },
    submitted_at: "2026-05-02T14:00:00Z",
    concluded_at: "2026-05-02T14:09:33Z",
    duration_seconds: 573,
    consensus: "FOR",
    verdict: "APPROVED",
    vote_tally: { FOR: 5, AGAINST: 0, ABSTAIN: 0 },
    confidence: 0.91,
    agent_statements: [
      {
        persona: "bull",
        ens: "bull.aicouncil.eth",
        decision: "FOR",
        confidence: 0.88,
        reasoning_snippet:
          "Lido stETH dominant LST - 28 percent of staked ETH. Yield-bearing exposure superior to plain ETH for treasury. Curve depth >$220M ensures liquidity.",
        primary_source: {
          title: "DeFiLlama - Lido TVL and dominance",
          url: "https://defillama.com/protocol/lido",
          type: "defillama",
          weight: 0.94,
        },
        timestamp: "2026-05-02T14:02:12Z",
      },
      {
        persona: "bear",
        ens: "bear.aicouncil.eth",
        decision: "FOR",
        confidence: 0.71,
        reasoning_snippet:
          "stETH/ETH peg has held tight (max 0.4 percent deviation past 12mo). Validator slashing risk mitigated by Lido distributed operator set. 15 percent cap is conservative.",
        primary_source: {
          title: "Lido - stETH peg history dashboard",
          url: "https://stake.lido.fi/stats/peg-history",
          type: "rss",
          weight: 0.84,
        },
        timestamp: "2026-05-02T14:02:58Z",
      },
      {
        persona: "risk",
        ens: "risk.aicouncil.eth",
        decision: "FOR",
        confidence: 0.93,
        reasoning_snippet:
          "VaR(95) over 90d horizon for stETH allocation: 6.8 percent vs 7.4 percent plain ETH. Lower vol due to staking yield smoothing. Within all council caps.",
        primary_source: {
          title: "CoinGecko - stETH 90d volatility comparison",
          url: "https://www.coingecko.com/en/coins/lido-staked-ether/historical_data",
          type: "coingecko",
          weight: 0.89,
        },
        timestamp: "2026-05-02T14:04:08Z",
      },
      {
        persona: "tech",
        ens: "tech.aicouncil.eth",
        decision: "FOR",
        confidence: 0.96,
        reasoning_snippet:
          "Lido v2 contracts audited Sigma Prime + Statemind 2024. stETH is rebasing ERC20 - integration tested in Aave/Compound. No reentrancy vectors known.",
        primary_source: {
          title: "Sigma Prime - Lido v2 audit report",
          url: "https://github.com/sigp/public-audits/lido-v2.pdf",
          type: "rss",
          weight: 0.95,
        },
        timestamp: "2026-05-02T14:05:44Z",
      },
      {
        persona: "sentiment",
        ens: "sentiment.aicouncil.eth",
        decision: "FOR",
        confidence: 0.82,
        reasoning_snippet:
          "aixbt Lido sentiment +0.58 strongly positive 30d. Community discussion focuses on validator decentralization improvements - constructive framing.",
        primary_source: {
          title: "aixbt - Lido composite sentiment 30d",
          url: "https://aixbt.tech/asset/lido",
          type: "aixbt",
          weight: 0.79,
        },
        timestamp: "2026-05-02T14:07:18Z",
      },
    ],
    og_storage_cid:
      "bafybeih7d4yyqg5pelekuob6sguvsidu7yxvg7kr3yawcyjdr2qzs5jfei",
    tx_hash:
      "0x9d2f8e1a5c4b7e3a6d9f2c5b8e1a4d7c3f6b9e2a5d8c1f4b7e3a6d9c2f5b8e1a",
    reputation_deltas: {
      bull: 0.20,
      bear: 0.16,
      risk: 0.26,
      tech: 0.22,
      sentiment: 0.14,
    },
  },
];
