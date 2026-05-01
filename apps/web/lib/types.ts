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
  label: string;
  bias: string;
  color: string;
}

export const AGENTS: AgentMeta[] = [
  { persona: "bull", label: "Optymista", bias: "bullish", color: "text-green-400" },
  { persona: "bear", label: "Sceptyk", bias: "bearish", color: "text-red-400" },
  { persona: "risk", label: "Ryzyko", bias: "risk-averse", color: "text-amber-400" },
  { persona: "tech", label: "Technologia", bias: "technical", color: "text-blue-400" },
  { persona: "sentiment", label: "Sentyment", bias: "sentiment", color: "text-purple-400" },
];
