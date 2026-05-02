// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Testnet mock of USDC with 6 decimals and public mint (for treasury funding)
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Public mint for testnet use only
    /// @param to Recipient address
    /// @param amount Amount in smallest unit (6 decimals)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
