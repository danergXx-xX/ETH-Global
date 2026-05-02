"""
Pydantic schemas dla AI Treasury Council API.
SSOT dla typow - frontend (apps/web) generuje TS types via openapi-typescript.

Schemat handoffu: Hugo dostarcza, Aiko konsumuje przez generated types.
"""
from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


# ============================================================
# AGENT PERSONAS (5 + opcjonalny Adversarial)
# ============================================================

AgentPersona = Literal["bull", "bear", "risk", "tech", "sentiment", "adversarial"]


class Source(BaseModel):
    """Source attribution per agent claim (Moat 4 - Sora trust research)."""
    url: str
    title: str
    snippet: str = Field(..., max_length=500)
    weight: float = Field(..., ge=0.0, le=1.0, description="0=irrelevant, 1=primary source")
    source_type: Literal["rss", "coingecko", "defillama", "aixbt", "perplexity"] | None = None


class AgentClaim(BaseModel):
    """Pojedynczy claim agenta z confidence + sources."""
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    sources: list[Source] = Field(default_factory=list, min_length=1, description="Min 1 source per claim")


class AgentDecision(BaseModel):
    """Decyzja agenta po analizie proposal."""
    persona: AgentPersona
    decision: Literal["FOR", "AGAINST", "ABSTAIN"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str = Field(..., min_length=10, max_length=2000)
    claims: list[AgentClaim] = Field(default_factory=list)
    timestamp: datetime
    tokens_used: int | None = None
    cost_usd: float | None = None


# ============================================================
# TREASURY ACTIONS
# ============================================================

class TransferAction(BaseModel):
    type: Literal["transfer"] = "transfer"
    token: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$", description="Token contract address")
    recipient: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$", description="Recipient address")
    # str not int: uint256 > JS MAX_SAFE_INTEGER causes precision loss in JSON
    amount_wei: str = Field(..., pattern=r"^\d+$", description="Amount as string (uint256)")


class SwapAction(BaseModel):
    type: Literal["swap"] = "swap"
    token_in: str
    token_out: str
    amount_in_wei: str
    min_amount_out_wei: str
    dex: Literal["uniswap_v3"] = "uniswap_v3"


class DepositAction(BaseModel):
    type: Literal["deposit"] = "deposit"
    protocol: Literal["aave"]
    token: str
    amount_wei: str


# Discriminated union
TreasuryAction = TransferAction | SwapAction | DepositAction


# ============================================================
# PROPOSAL FLOW
# ============================================================

class CreateProposalRequest(BaseModel):
    """User submits new proposal for AI Council to debate."""
    text: str = Field(..., min_length=10, max_length=2000)
    action: TreasuryAction
    user_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    signature: str = Field(..., description="Signed message proving wallet ownership")


class ProposalStatus(BaseModel):
    proposal_id: str
    status: Literal[
        "pending_debate",
        "debating",
        "debate_complete",
        "voting",
        "vote_passed",
        "vote_failed",
        "queued",
        "executing",
        "executed",
        "cancelled",
    ]
    text: str
    action: TreasuryAction
    user_address: str
    created_at: datetime
    debate_complete_at: datetime | None = None
    audit_trail_cid: str | None = Field(None, description="0G Storage CID lub IPFS hash")
    onchain_proposal_id: str | None = Field(None, description="ID po queue na Governor")


class CreateProposalResponse(BaseModel):
    proposal_id: str
    websocket_url: str = Field(..., description="ws://.../api/debate/{proposal_id} for live updates")
    estimated_debate_seconds: int = Field(default=30)
    status: ProposalStatus


# ============================================================
# DEBATE EVENTS (WebSocket)
# ============================================================

class DebateEvent(BaseModel):
    """Base class - WebSocket events."""
    type: Literal[
        "agent_started",
        "agent_thinking",
        "agent_done",
        "debate_complete",
        "audit_uploaded",
        "error",
    ]
    proposal_id: str
    timestamp: datetime


class AgentStartedEvent(DebateEvent):
    type: Literal["agent_started"] = "agent_started"
    agent_id: AgentPersona


class AgentThinkingEvent(DebateEvent):
    type: Literal["agent_thinking"] = "agent_thinking"
    agent_id: AgentPersona
    partial_text: str
    chars_so_far: int


class AgentDoneEvent(DebateEvent):
    type: Literal["agent_done"] = "agent_done"
    agent_id: AgentPersona
    decision: AgentDecision


class DebateCompleteEvent(DebateEvent):
    type: Literal["debate_complete"] = "debate_complete"
    decisions: list[AgentDecision]
    consensus: Literal["FOR", "AGAINST", "ABSTAIN", "SPLIT"]
    vote_id: str


class AuditUploadedEvent(DebateEvent):
    type: Literal["audit_uploaded"] = "audit_uploaded"
    storage_provider: Literal["0g", "ipfs"]
    cid: str
    gateway_url: str


class ErrorEvent(DebateEvent):
    type: Literal["error"] = "error"
    agent_id: AgentPersona | None = None
    message: str
    recoverable: bool


# ============================================================
# AGENT REPUTATION (Moat 5 - Matthew PoW for agents)
# ============================================================

class AgentReputation(BaseModel):
    """On-chain reputation per agent (Moat 5)."""
    agent_id: AgentPersona
    ens_subname: str = Field(..., description="bull.aicouncil.eth itp.")
    address: str = Field(..., description="Agent's on-chain address")
    reputation: int = Field(default=100, description="Current reputation score (uint256 on-chain)")
    debates_count: int = Field(default=0)
    successful_decisions: int = Field(default=0, description="Voted with majority that succeeded post-execute")
    slashed_decisions: int = Field(default=0, description="Voted against successful execution")
    vote_weight: float = Field(default=1.0, ge=0.0, le=2.0, description="Computed from reputation, affects vote weight in future debates")


# ============================================================
# PROPOSAL ENCODING (Phase 1D - execution payload)
# ============================================================

class ProposalEncodeRequest(BaseModel):
    """Request to encode treasury action into Governor-compatible calldata.

    Phase 1D: only TransferAction. Phase 1+: expand to TreasuryAction union.
    """
    action: TransferAction


class ProposalEncoded(BaseModel):
    """Encoded calldata ready for Governor.propose()."""
    target: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    value: int = Field(default=0, ge=0)
    calldata: str = Field(..., pattern=r"^0x[a-fA-F0-9]+$")
    signature: str
    description: str
    basescan_url: str | None = None


class RecipientInfo(BaseModel):
    """Sample recipient for demo proposals."""
    key: str
    address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    label: str
    description: str


class RecipientsResponse(BaseModel):
    """Available demo recipients + treasury token info."""
    recipients: list[RecipientInfo]
    token_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    token_symbol: str
    token_decimals: int


# ============================================================
# DEBATE REQUEST / RESPONSE (main.py endpoint)
# ============================================================

class DebateRequest(BaseModel):
    """Input for POST /api/debate."""
    text: str = Field(..., min_length=1, max_length=2000)


class DebateResponse(BaseModel):
    """Output from POST /api/debate."""
    decisions: list[AgentDecision]
    consensus: Literal["FOR", "AGAINST", "ABSTAIN", "SPLIT"]
    vote_id: str
    audit_trail_cid: str | None = None
    audit_trail_gateway: str | None = None
    storage_provider: str | None = None


# ============================================================
# HEALTH + META
# ============================================================

class HealthResponse(BaseModel):
    status: Literal["ok", "degraded", "down"] = "ok"
    version: str = "0.1.0"
    timestamp: datetime
    services: dict[str, Literal["ok", "degraded", "down"]] = Field(default_factory=dict)
