"""MockUSDC transfer encoder + sample recipients for Governor proposals.

Encodes ERC20 transfer(address,uint256) calldata targeting the deployed
MockUSDC contract on Base Sepolia. Used by POST /api/proposals/encode
so the frontend can preview and submit on-chain proposals.
"""
from __future__ import annotations

import re

from eth_utils import to_checksum_address

from governance.calldata import encode_function_call, validate_uint256

TRANSFER_SIGNATURE = "transfer(address,uint256)"
TRANSFER_ARG_TYPES = ["address", "uint256"]

MOCK_USDC_ADDRESS = "0x606ede7755131e6206a29b67d88761eebb3bb59d"
MOCK_USDC_DECIMALS = 6

BASESCAN_URL = "https://sepolia.basescan.org"

_ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")

SAMPLE_RECIPIENTS: dict[str, dict[str, str]] = {
    "aave_vault": {
        "address": "0x1111111111111111111111111111111111111111",
        "label": "Aave-like Yield Vault",
        "description": "Treasury allocation for yield generation (demo)",
    },
    "eth_treasury": {
        "address": "0x2222222222222222222222222222222222222222",
        "label": "ETH Treasury Reserve",
        "description": "Strategic reserve for ETH exposure (demo)",
    },
}


def _validate_address(address: str) -> str:
    """Validate and return checksummed Ethereum address.

    Raises:
        ValueError: If address format is invalid.
    """
    if not _ADDRESS_RE.match(address):
        raise ValueError(f"Invalid Ethereum address format: {address}")
    return to_checksum_address(address)


def encode_mock_usdc_transfer(recipient: str, amount_wei: str) -> dict:
    """Encode MockUSDC.transfer(recipient, amount) calldata for Governor proposal.

    Args:
        recipient: Ethereum address (hex, 0x-prefixed, 40 hex chars).
        amount_wei: Amount in smallest unit (uint256 as string).

    Returns:
        Dict with target, value, calldata, signature, description,
        and basescan_url for UI preview.

    Raises:
        ValueError: If address invalid or amount out of uint256 range.
    """
    recipient_checksum = _validate_address(recipient)

    try:
        amount_int = int(amount_wei)
    except (ValueError, TypeError) as exc:
        raise ValueError(f"amount_wei must be a valid integer string: {amount_wei}") from exc

    validate_uint256(amount_int)

    raw_calldata = encode_function_call(
        TRANSFER_SIGNATURE,
        TRANSFER_ARG_TYPES,
        [recipient_checksum, amount_int],
    )
    calldata_hex = "0x" + raw_calldata.hex()

    human_amount = amount_int / (10**MOCK_USDC_DECIMALS)

    mock_usdc_checksum = to_checksum_address(MOCK_USDC_ADDRESS)

    return {
        "target": mock_usdc_checksum,
        "value": 0,
        "calldata": calldata_hex,
        "signature": TRANSFER_SIGNATURE,
        "description": f"Transfer {human_amount:,.6g} mUSDC to {recipient_checksum}",
        "basescan_url": f"{BASESCAN_URL}/address/{recipient_checksum}",
    }
