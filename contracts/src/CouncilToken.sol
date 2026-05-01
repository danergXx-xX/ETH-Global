// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title CouncilToken
/// @notice ERC20Votes token for AI Treasury Council governance (5 AI agent personas, 1 vote each)
/// @dev Uses timestamp-based clock mode for L2 compatibility (Base)
contract CouncilToken is ERC20, ERC20Permit, ERC20Votes {
    uint256 public constant INITIAL_SUPPLY = 5;

    /// @param initialHolder Address receiving 5 tokens (1 per AI agent persona)
    constructor(address initialHolder)
        ERC20("AI Council Token", "AICT")
        ERC20Permit("AI Council Token")
    {
        _mint(initialHolder, INITIAL_SUPPLY * 10 ** decimals());
        _delegate(initialHolder, initialHolder);
    }

    /// @dev Timestamp-based clock for L2 compatibility (ERC-6372)
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// @dev Machine-readable clock mode descriptor (ERC-6372)
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
