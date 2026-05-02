export type AgentPersona = "bull" | "bear" | "risk" | "tech" | "sentiment";

export type Decision = "FOR" | "AGAINST" | "ABSTAIN";

export type Consensus = "FOR" | "AGAINST" | "ABSTAIN" | "SPLIT";

export type SourceType = "rss" | "coingecko" | "defillama" | "perplexity" | "aixbt";

export type ProposalState =
  | "pending"
  | "active"
  | "canceled"
  | "defeated"
  | "succeeded"
  | "queued"
  | "expired"
  | "executed";

export type DebatePhase = "waiting" | "debating" | "done" | "error";

export type ExecuteStage =
  | "collecting_sigs"
  | "threshold_reached"
  | "queued_timelock"
  | "executing"
  | "executed";

export type AuditEventType =
  | "proposal"
  | "vote"
  | "verdict"
  | "execution"
  | "rule_change"
  | "agent_lifecycle";

export interface Source {
  id: number;
  title: string;
  type: SourceType;
  url: string;
  confidence: number;
  snippet: string;
}

export interface Claim {
  text: string;
  sourceId: number | null;
}

export interface AgentColor {
  hue: number;
  accent: string;
  soft: string;
  headerBg: string;
  headerText: string;
}

export interface AgentMeta {
  persona: AgentPersona;
  ens: string;
  label: { en: string; pl: string };
  bias: { en: string; pl: string };
  rep: number;
  statements: number;
  color: AgentColor;
}

export interface AgentDecision {
  persona: AgentPersona;
  decision: Decision;
  confidence: number;
  claims: Claim[];
  timestamp: string;
}

export interface ProposalMeta {
  id: string;
  description: { en: string; pl: string };
  amount: string;
  target: string;
  estApy: string;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: string;
  title: string;
  actor: string;
  summary: string;
  delta?: string;
  deltaKind?: "positive" | "negative" | "neutral";
  txHash?: string;
  ogCid?: string;
}

export interface SignerInfo {
  address: string;
  ens?: string;
  signed: boolean;
  timestamp?: string;
}

export interface TimelockInfo {
  eta: number;
  delaySeconds: number;
  remainingSeconds: number;
}

export interface TxPreview {
  target: string;
  functionName: string;
  args: Record<string, string>;
  gasEstimate: number;
}

export const AGENTS: AgentMeta[] = [
  {
    persona: "bull",
    ens: "bull.aicouncil-danergy.eth",
    label: { en: "Bull", pl: "Optymista" },
    bias: { en: "opportunity-seeking", pl: "szuka okazji" },
    rep: 87,
    statements: 412,
    color: { hue: 152, accent: "oklch(0.78 0.16 152)", soft: "oklch(0.32 0.07 152)", headerBg: "oklch(0.30 0.085 152)", headerText: "oklch(0.94 0.05 152)" },
  },
  {
    persona: "bear",
    ens: "bear.aicouncil-danergy.eth",
    label: { en: "Bear", pl: "Sceptyk" },
    bias: { en: "risk-aware", pl: "wyczulony na ryzyko" },
    rep: 91,
    statements: 503,
    color: { hue: 22, accent: "oklch(0.73 0.17 22)", soft: "oklch(0.30 0.09 22)", headerBg: "oklch(0.28 0.10 22)", headerText: "oklch(0.94 0.06 22)" },
  },
  {
    persona: "risk",
    ens: "risk.aicouncil-danergy.eth",
    label: { en: "Risk", pl: "Ryzyko" },
    bias: { en: "quantitative", pl: "kwantytatywny" },
    rep: 94,
    statements: 388,
    color: { hue: 78, accent: "oklch(0.82 0.15 78)", soft: "oklch(0.32 0.08 78)", headerBg: "oklch(0.32 0.09 78)", headerText: "oklch(0.96 0.06 95)" },
  },
  {
    persona: "tech",
    ens: "tech.aicouncil-danergy.eth",
    label: { en: "Tech", pl: "Technologia" },
    bias: { en: "technical due diligence", pl: "audyt techniczny" },
    rep: 82,
    statements: 271,
    color: { hue: 245, accent: "oklch(0.74 0.15 245)", soft: "oklch(0.30 0.09 245)", headerBg: "oklch(0.28 0.11 245)", headerText: "oklch(0.94 0.05 245)" },
  },
  {
    persona: "sentiment",
    ens: "sentiment.aicouncil-danergy.eth",
    label: { en: "Sentiment", pl: "Sentyment" },
    bias: { en: "market psychology", pl: "psychologia rynku" },
    rep: 76,
    statements: 198,
    color: { hue: 305, accent: "oklch(0.74 0.16 305)", soft: "oklch(0.30 0.09 305)", headerBg: "oklch(0.28 0.10 305)", headerText: "oklch(0.94 0.05 305)" },
  },
];
