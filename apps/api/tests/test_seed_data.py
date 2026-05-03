"""Tests for seed data (Lumen Sesja 27)."""

from __future__ import annotations

from data.seed_historical_debates import (
    HISTORICAL_DEBATES,
    get_debate_by_id,
    get_historical_debates,
)
from data.seed_proposals import (
    SUGGESTED_PROPOSALS,
    get_proposal_by_id,
    get_suggested_proposals,
)


# ============================================================
# Suggested proposals
# ============================================================


def test_suggested_proposals_count() -> None:
    assert len(SUGGESTED_PROPOSALS) == 4
    assert len(get_suggested_proposals()) == 4


def test_suggested_proposals_required_fields() -> None:
    required = {
        "id",
        "title",
        "description",
        "full_context",
        "suggested_amount",
        "target",
        "tags",
        "suggested_action_data",
    }
    for proposal in SUGGESTED_PROPOSALS:
        assert required.issubset(proposal.keys()), f"missing fields in {proposal['id']}"
        assert "en" in proposal["title"] and "pl" in proposal["title"]
        assert "en" in proposal["description"] and "pl" in proposal["description"]
        assert "en" in proposal["full_context"] and "pl" in proposal["full_context"]


def test_suggested_proposals_unique_ids() -> None:
    ids = [p["id"] for p in SUGGESTED_PROPOSALS]
    assert len(ids) == len(set(ids))


def test_suggested_proposals_full_context_has_paragraphs() -> None:
    """Each full_context must have 3+ paragraphs in both languages."""
    for proposal in SUGGESTED_PROPOSALS:
        en_paras = [p for p in proposal["full_context"]["en"].split("\n\n") if p.strip()]
        pl_paras = [p for p in proposal["full_context"]["pl"].split("\n\n") if p.strip()]
        assert len(en_paras) >= 3, f"{proposal['id']} EN has {len(en_paras)} paragraphs"
        assert len(pl_paras) >= 3, f"{proposal['id']} PL has {len(pl_paras)} paragraphs"


def test_get_proposal_by_id_hit_and_miss() -> None:
    assert get_proposal_by_id("PROP-DEMO-01") is not None
    assert get_proposal_by_id("DOES-NOT-EXIST") is None


def test_suggested_action_data_valid_types() -> None:
    valid_types = {"transfer", "swap", "deposit"}
    for proposal in SUGGESTED_PROPOSALS:
        action_type = proposal["suggested_action_data"]["type"]
        assert action_type in valid_types


# ============================================================
# Historical debates
# ============================================================


def test_historical_debates_count() -> None:
    assert len(HISTORICAL_DEBATES) == 3
    assert len(get_historical_debates()) == 3


def test_historical_debates_have_5_statements() -> None:
    """Every concluded debate has 5 agent statements (one per persona)."""
    expected_personas = {"bull", "bear", "risk", "tech", "sentiment"}
    for debate in HISTORICAL_DEBATES:
        statements = debate["agent_statements"]
        assert len(statements) == 5
        personas_seen = {s["persona"] for s in statements}
        assert personas_seen == expected_personas


def test_historical_debates_vote_tally_consistent() -> None:
    """Vote tally FOR + AGAINST + ABSTAIN must equal statement count (5)."""
    for debate in HISTORICAL_DEBATES:
        tally = debate["vote_tally"]
        total = tally["FOR"] + tally["AGAINST"] + tally["ABSTAIN"]
        assert total == 5, f"{debate['id']} tally totals {total}, expected 5"


def test_historical_debates_verdict_matches_consensus() -> None:
    """APPROVED <-> FOR consensus, REJECTED <-> AGAINST."""
    for debate in HISTORICAL_DEBATES:
        if debate["verdict"] == "APPROVED":
            assert debate["consensus"] == "FOR"
        elif debate["verdict"] == "REJECTED":
            assert debate["consensus"] == "AGAINST"


def test_historical_debates_source_attribution() -> None:
    """Every statement has a primary source with required fields."""
    for debate in HISTORICAL_DEBATES:
        for s in debate["agent_statements"]:
            src = s["primary_source"]
            assert src["title"]
            assert src["url"].startswith("http")
            assert src["type"] in {
                "rss",
                "coingecko",
                "defillama",
                "aixbt",
                "perplexity",
            }
            assert 0.0 <= src["weight"] <= 1.0


def test_historical_debates_og_storage_cid_format() -> None:
    """0G Storage CID resembles realistic IPFS CIDv1 (bafy prefix)."""
    for debate in HISTORICAL_DEBATES:
        cid = debate["og_storage_cid"]
        assert cid.startswith("bafy"), f"{debate['id']} CID does not start with bafy"
        assert len(cid) >= 50


def test_historical_debates_chronological_order() -> None:
    """Debates are listed oldest-first (chronological)."""
    timestamps = [d["submitted_at"] for d in HISTORICAL_DEBATES]
    assert timestamps == sorted(timestamps)


def test_get_debate_by_id_hit_and_miss() -> None:
    assert get_debate_by_id("DEBATE-HIST-01") is not None
    assert get_debate_by_id("DOES-NOT-EXIST") is None


def test_historical_debates_cids_unique() -> None:
    """Each concluded debate has its own 0G Storage CID."""
    cids = [d["og_storage_cid"] for d in HISTORICAL_DEBATES]
    assert len(cids) == len(set(cids))


def test_proposal_token_addresses_lowercase() -> None:
    """Action data addresses are all-lowercase placeholders.

    Mixed-case 0x... triggers EIP-55 checksum validation in eth_utils
    when piped through /api/proposals/encode. Lowercase is always valid.
    """
    import re
    address_re = re.compile(r"^0x[0-9a-f]{40}$")
    for proposal in SUGGESTED_PROPOSALS:
        action = proposal["suggested_action_data"]
        for key in ("token", "recipient", "token_in", "token_out"):
            value = action.get(key)
            if value is None:
                continue
            assert address_re.match(value), (
                f"{proposal['id']}.{key}={value} not lowercase EIP-55-safe"
            )
