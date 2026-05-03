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
    source_type: (
        Literal["rss", "coingecko", "defillama", "aixbt", "perplexity", "web_search"] | None
    ) = None


class AgentClaim(BaseModel):
    """Pojedynczy claim agenta z confidence + sources."""

    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    sources: list[Source] = Field(
        default_factory=list, min_length=1, description="Min 1 source per claim"
    )


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
    # Sesja 50.5: ENS reputation as off-chain voting weight (Eva demo VO).
    # reputation_score 0-100 read from AgentReputation contract via Redis cache.
    # vote_weight = reputation_score / 100 (clamped 0.0-2.0). None when reputation
    # data unavailable - consensus then falls back to equal weight (1.0).
    reputation_score: float | None = Field(
        default=None,
        ge=0.0,
        le=200.0,
        description="ENS reputation 0-100 from AgentReputation contract (Sesja 50.5).",
    )
    vote_weight: float | None = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Off-chain voting weight derived from reputation_score (Sesja 50.5).",
    )


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
    websocket_url: str = Field(
        ..., description="ws://.../api/debate/{proposal_id} for live updates"
    )
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
    successful_decisions: int = Field(
        default=0, description="Voted with majority that succeeded post-execute"
    )
    slashed_decisions: int = Field(default=0, description="Voted against successful execution")
    vote_weight: float = Field(
        default=1.0,
        ge=0.0,
        le=2.0,
        description="Computed from reputation, affects vote weight in future debates",
    )


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

    text: str = Field(..., min_length=10, max_length=2000)


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


# ============================================================
# TREASURY PORTFOLIO (Wave 2 Sesja 47)
# ============================================================


class TokenHolding(BaseModel):
    """Single token position in treasury."""

    symbol: str = Field(..., min_length=1, max_length=20)
    balance: float = Field(..., ge=0)
    usd_value: float = Field(..., ge=0)
    allocation_pct: float = Field(..., ge=0, le=100)


class ProtocolAllocation(BaseModel):
    """Capital deployed to a DeFi protocol."""

    name: str = Field(..., min_length=1, max_length=64)
    balance_usd: float = Field(..., ge=0)
    apy: float = Field(..., ge=0, le=10000, description="APY in percent (e.g. 4.2 = 4.2%)")
    risk_score: int = Field(..., ge=0, le=100, description="0=safe, 100=highest risk")


class RecentDecision(BaseModel):
    """Recent council decision affecting treasury."""

    proposal_id: str = Field(..., min_length=1, max_length=128)
    verdict: Literal["FOR", "AGAINST", "ABSTAIN", "SPLIT"]
    impact_usd: float = Field(..., description="Net USD change to treasury (signed)")
    executed_at: datetime


class PortfolioResponse(BaseModel):
    """Treasury portfolio snapshot for dashboard."""

    total_usd: float = Field(..., ge=0)
    tokens: list[TokenHolding]
    protocols: list[ProtocolAllocation]
    pnl_7d: float = Field(..., description="Net USD P&L last 7 days (signed)")
    recent_decisions: list[RecentDecision]


# ============================================================
# PROTOCOL REGISTRY (Wave 2 Sesja 48)
# ============================================================


ProtocolStatus = Literal["approved", "under_review", "banned", "light"]
ProtocolCategory = Literal["lending", "dex", "staking", "derivatives", "yield", "stablecoin"]


class AuditRef(BaseModel):
    """Reference to a smart-contract audit report."""

    firm: str = Field(..., min_length=1, max_length=64)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="ISO date YYYY-MM-DD")
    report_url: str = Field(..., min_length=10, max_length=512)


class Protocol(BaseModel):
    """Protocol entry in registry (DeFi protocols council can interact with)."""

    id: str = Field(..., min_length=1, max_length=64, pattern=r"^[a-z0-9_-]+$")
    name: str = Field(..., min_length=1, max_length=64)
    category: ProtocolCategory
    chain: str = Field(..., min_length=1, max_length=32)
    tvl_usd: float = Field(..., ge=0)
    status: ProtocolStatus
    risk_flags: list[str] = Field(default_factory=list, max_length=20)
    audit_history: list[AuditRef] = Field(default_factory=list, max_length=20)


# ============================================================
# USER SETTINGS (Wave 2 Sesja 46)
# ============================================================


ThemeChoice = Literal["dark", "light", "conclave"]
LanguageChoice = Literal["en", "pl"]
ETH_ADDRESS_PATTERN = r"^0x[a-fA-F0-9]{40}$"


class UserSettings(BaseModel):
    """Per-user settings (keyed by wallet address)."""

    notifications_enabled: bool = True
    theme: ThemeChoice = "dark"
    preferred_language: LanguageChoice = "en"
    council_rules_overrides: dict[str, str] | None = Field(default=None)
    trust_gate_threshold: int = Field(default=70, ge=50, le=100)
    agent_weights: dict[str, float] = Field(default_factory=dict)


class UserSettingsUpdate(UserSettings):
    """POST body: includes address (server keys settings by checksum address)."""

    address: str = Field(..., pattern=ETH_ADDRESS_PATTERN)


# ============================================================
# USER ONBOARDING (Wave 1 Sesja 42)
# ============================================================


ONBOARDING_STEPS: tuple[str, ...] = (
    "wallet_connected",
    "dao_verified",
    "rules_read",
    "role_selected",
    "first_proposal_submitted",
)


class OnboardingStatus(BaseModel):
    """Snapshot of onboarding progress for an address."""

    completed_steps: list[str] = Field(default_factory=list)
    current_step: str
    is_complete: bool = False


class OnboardingProgress(BaseModel):
    """POST body: mark a step complete for an address."""

    address: str = Field(..., pattern=ETH_ADDRESS_PATTERN)
    step_id: Literal[
        "wallet_connected",
        "dao_verified",
        "rules_read",
        "role_selected",
        "first_proposal_submitted",
    ]
    metadata: dict[str, str] | None = None


# ============================================================
# CUSTOM AGENT (Wave 1 Sesja 43)
# ============================================================


LLMModelChoice = Literal[
    "claude-sonnet-4-6", "claude-opus-4-7", "gpt-4o", "gemini-2-pro"
]
CustomAgentStatus = Literal["testing", "awaiting_multisig", "approved", "rejected"]
ENS_SUBNAME_PATTERN = r"^[a-z0-9-]{2,32}\.[a-z0-9-]{2,64}\.eth$"


class TestArenaResult(BaseModel):
    """Outcome of running a custom agent through Test Arena (sandbox debate)."""

    proposal: str
    custom_decision: Literal["FOR", "AGAINST", "ABSTAIN"]
    custom_confidence: float = Field(..., ge=0.0, le=1.0)
    custom_reasoning: str = Field(..., min_length=1, max_length=2000)
    standard_consensus: Literal["FOR", "AGAINST", "ABSTAIN", "SPLIT"]
    aligned_with_consensus: bool
    sandbox: bool = True


class CustomAgentSpec(BaseModel):
    """User-submitted spec for a custom DAO agent (Moat 5 Proof-of-Work)."""

    persona_id: str = Field(..., min_length=2, max_length=32, pattern=r"^[a-z0-9_-]+$")
    display_name: str = Field(..., min_length=2, max_length=64)
    llm_model: LLMModelChoice
    ens_subname: str = Field(..., pattern=ENS_SUBNAME_PATTERN)
    vote_weight: int = Field(..., ge=1, le=10)
    trust_gate: int = Field(..., ge=50, le=100)
    system_prompt: str = Field(..., min_length=20, max_length=2000)
    test_arena_proposal: str | None = Field(default=None, max_length=2000)


class CustomAgent(BaseModel):
    """Server-side record of a registered custom agent."""

    agent_id: str
    persona_id: str
    display_name: str
    llm_model: LLMModelChoice
    ens_subname: str
    vote_weight: int
    trust_gate: int
    status: CustomAgentStatus
    created_at: datetime
    test_arena_result: TestArenaResult | None = None


# ============================================================
# NOTIFICATIONS (Wave 2 Sesja 45)
# ============================================================


NotificationCategory = Literal[
    "verdict",
    "signature",
    "rule_change",
    "debate_started",
    "debate_completed",
]


class Notification(BaseModel):
    """User-facing notification (delivered via WS push + REST history)."""

    id: str = Field(..., min_length=1, max_length=64)
    category: NotificationCategory
    title: str = Field(..., min_length=1, max_length=200)
    summary: str = Field(..., min_length=1, max_length=1000)
    metadata: dict[str, str] = Field(default_factory=dict)
    timestamp: datetime
    read: bool = False


class NotificationListResponse(BaseModel):
    notifications: list[Notification]
    unread_count: int = Field(..., ge=0)


class NotificationReadRequest(BaseModel):
    """POST /api/notifications/read body: mark notifications as read."""

    address: str = Field(..., pattern=ETH_ADDRESS_PATTERN)
    ids: list[str] = Field(..., min_length=1, max_length=100)
