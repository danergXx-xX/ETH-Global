export type AgentPersona = "bull" | "bear" | "risk" | "tech" | "sentiment";

export type Decision = "FOR" | "AGAINST" | "ABSTAIN";

export type Consensus = "FOR" | "AGAINST" | "ABSTAIN" | "SPLIT";

export interface AgentDecision {
  persona: AgentPersona;
  decision: Decision;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface AgentMeta {
  persona: AgentPersona;
  bias: string;
  color: string;
}

export const AGENTS: AgentMeta[] = [
  { persona: "bull", bias: "bullish", color: "text-green-400" },
  { persona: "bear", bias: "bearish", color: "text-red-400" },
  { persona: "risk", bias: "risk-averse", color: "text-amber-400" },
  { persona: "tech", bias: "technical", color: "text-blue-400" },
  { persona: "sentiment", bias: "sentiment", color: "text-purple-400" },
];
