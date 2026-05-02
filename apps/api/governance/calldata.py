"""Generic ABI encoding helpers for Governor proposal calldata.

Wraps eth_abi for type-safe calldata construction.
Phase 1D: transfer only. Phase 1+: swap, deposit.
"""
from __future__ import annotations

from eth_abi import encode as abi_encode
from eth_utils import function_signature_to_4byte_selector


MAX_UINT256 = (2**256) - 1


def encode_function_call(signature: str, types: list[str], values: list) -> bytes:
    """Encode a Solidity function call (selector + ABI-encoded args).

    Args:
        signature: Solidity function signature, e.g. "transfer(address,uint256)"
        types: ABI types for arguments, e.g. ["address", "uint256"]
        values: Argument values matching types

    Returns:
        Raw bytes: 4-byte selector + ABI-encoded arguments
    """
    selector = function_signature_to_4byte_selector(signature)
    encoded_args = abi_encode(types, values)
    return selector + encoded_args


def validate_uint256(value: int) -> int:
    """Validate that value fits in uint256 range.

    Raises:
        ValueError: If value is negative or exceeds uint256 max.
    """
    if value < 0:
        raise ValueError(f"uint256 cannot be negative: {value}")
    if value > MAX_UINT256:
        raise ValueError(f"Exceeds uint256 max: {value}")
    return value
