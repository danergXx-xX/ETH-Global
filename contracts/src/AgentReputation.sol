// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgentReputation
/// @notice On-chain Proof-of-Work reputation tracker for AI Council agent personas
/// @dev Moat 5 - tracks per-agent reputation, debate participation, and consensus alignment.
///      Backend service calls updateReputation after each debate via authorizedUpdater wallet.
/// @custom:security-contact security@aicouncil.eth
contract AgentReputation is Ownable {
    // --- Storage ---

    mapping(address => uint256) public reputation;
    mapping(address => uint256) public debatesParticipated;
    mapping(address => uint256) public alignedWithConsensus;
    mapping(address => bool) public isAgent;

    /// @notice Backend wallet authorized to update reputation scores
    address public authorizedUpdater;

    /// @notice Addresses of the 5 registered agent personas
    address[] public agents;

    // --- Events ---

    /// @notice Emitted when an agent's reputation changes
    event ReputationUpdated(
        address indexed agent,
        uint256 newReputation,
        int256 delta,
        uint256 timestamp
    );

    /// @notice Emitted when the authorized updater address is transferred
    event AuthorizationTransferred(
        address indexed oldUpdater,
        address indexed newUpdater
    );

    // --- Errors ---

    /// @notice Caller is not the authorized updater
    error UnauthorizedUpdater(address caller);

    /// @notice Reputation would underflow below zero
    error ReputationUnderflow(address agent, uint256 current, int256 delta);

    /// @notice Agent address is not registered
    error AgentNotRegistered(address agent);

    /// @notice New updater address is zero
    error ZeroAddress();

    /// @notice Duplicate agent address in constructor
    error DuplicateAgent(address agent);

    // --- Modifiers ---

    modifier onlyAuthorized() {
        if (msg.sender != authorizedUpdater) {
            revert UnauthorizedUpdater(msg.sender);
        }
        _;
    }

    // --- Constructor ---

    /// @notice Deploys AgentReputation with 5 hardcoded agent addresses
    /// @param _agents Array of 5 agent addresses (bull, bear, risk, tech, sentiment)
    /// @param _authorizedUpdater Backend wallet that can update reputation
    constructor(
        address[5] memory _agents,
        address _authorizedUpdater
    ) Ownable(msg.sender) {
        if (_authorizedUpdater == address(0)) revert ZeroAddress();

        authorizedUpdater = _authorizedUpdater;

        for (uint256 i = 0; i < 5; i++) {
            if (_agents[i] == address(0)) revert ZeroAddress();
            if (isAgent[_agents[i]]) revert DuplicateAgent(_agents[i]);
            agents.push(_agents[i]);
            reputation[_agents[i]] = 100;
            isAgent[_agents[i]] = true;
        }

        emit AuthorizationTransferred(address(0), _authorizedUpdater);
    }

    // --- External functions ---

    /// @notice Update an agent's reputation after a debate
    /// @param agent Address of the agent persona
    /// @param delta Positive (aligned with consensus) or negative (diverged) change
    function updateReputation(address agent, int256 delta) external onlyAuthorized {
        if (!isAgent[agent]) {
            revert AgentNotRegistered(agent);
        }

        debatesParticipated[agent] += 1;

        if (delta > 0) {
            alignedWithConsensus[agent] += 1;
            reputation[agent] += uint256(delta);
        } else if (delta < 0) {
            uint256 absDelta = uint256(-delta);
            if (absDelta > reputation[agent]) {
                revert ReputationUnderflow(agent, reputation[agent], delta);
            }
            reputation[agent] -= absDelta;
        }

        emit ReputationUpdated(agent, reputation[agent], delta, block.timestamp);
    }

    /// @notice Transfer the authorized updater role to a new address
    /// @param newUpdater New backend wallet address
    function transferAuthorization(address newUpdater) external onlyOwner {
        if (newUpdater == address(0)) revert ZeroAddress();

        address oldUpdater = authorizedUpdater;
        authorizedUpdater = newUpdater;

        emit AuthorizationTransferred(oldUpdater, newUpdater);
    }

    // --- View functions ---

    /// @notice Get full reputation data for an agent
    /// @param agent Address of the agent persona
    /// @return rep Current reputation score
    /// @return debates Total debates participated in
    /// @return aligned Debates where agent aligned with consensus
    function getReputation(address agent)
        external
        view
        returns (uint256 rep, uint256 debates, uint256 aligned)
    {
        return (
            reputation[agent],
            debatesParticipated[agent],
            alignedWithConsensus[agent]
        );
    }

    /// @notice Get all registered agent addresses
    /// @return Array of 5 agent addresses
    function getAgents() external view returns (address[] memory) {
        return agents;
    }

}
