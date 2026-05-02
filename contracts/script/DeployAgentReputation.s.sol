// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentReputation} from "../src/AgentReputation.sol";

/// @title DeployAgentReputation
/// @notice Deploys AgentReputation (Moat 5 PoW for agents) on Base Sepolia
/// @dev Separate from Phase 1A Deploy.s.sol per ADR-004 (open exception)
contract DeployAgentReputation is Script {
    // Placeholder agent addresses (match ENS subnames Phase 2)
    address constant BULL = address(0x1);
    address constant BEAR = address(0x2);
    address constant RISK = address(0x3);
    address constant TECH = address(0x4);
    address constant SENTIMENT = address(0x5);

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("--- Deploying AgentReputation (Moat 5) ---");

        vm.startBroadcast(deployerKey);

        address[5] memory agents = [BULL, BEAR, RISK, TECH, SENTIMENT];

        // authorizedUpdater = deployer initially (Hugo backend will receive transfer post-deploy)
        AgentReputation reputation = new AgentReputation(agents, deployer);

        console.log("AgentReputation:", address(reputation));
        console.log("AuthorizedUpdater:", deployer);
        console.log("Initial reputation per agent:", reputation.reputation(BULL));

        vm.stopBroadcast();

        console.log("--- AgentReputation deployed ---");
        console.log("Next: transferAuthorization() to Hugo backend wallet");
    }
}
