// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CouncilToken} from "../src/CouncilToken.sol";
import {AICouncilGovernor} from "../src/AICouncilGovernor.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @title Deploy
/// @notice Atomic deployment: Token -> Timelock -> Governor -> roles -> MockUSDC -> treasury fund
contract Deploy is Script {
    uint256 constant TIMELOCK_MIN_DELAY = 48 hours;
    uint256 constant TREASURY_USDC_AMOUNT = 1_000_000 * 10 ** 6;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("Timelock delay:", TIMELOCK_MIN_DELAY, "seconds");

        vm.startBroadcast(deployerKey);

        // 1. Deploy CouncilToken (auto-mint 5 tokens + auto-delegate to deployer)
        CouncilToken token = new CouncilToken(deployer);
        console.log("CouncilToken:", address(token));

        // 2. Deploy TimelockController (48h delay, empty roles initially, deployer as temp admin)
        address[] memory emptyProposers = new address[](0);
        address[] memory anyoneExecutors = new address[](1);
        anyoneExecutors[0] = address(0);

        TimelockController timelock = new TimelockController(
            TIMELOCK_MIN_DELAY,
            emptyProposers,
            anyoneExecutors,
            deployer
        );
        console.log("TimelockController:", address(timelock));

        // 3. Deploy AICouncilGovernor
        AICouncilGovernor governor = new AICouncilGovernor(
            IVotes(address(token)),
            timelock
        );
        console.log("AICouncilGovernor:", address(governor));

        // 4. Grant PROPOSER_ROLE to Governor
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));

        // 5. Grant CANCELLER_ROLE to Governor
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));

        // 6. Revoke TIMELOCK_ADMIN_ROLE from deployer (decentralization)
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);

        // 7. Deploy MockUSDC
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC:", address(mockUSDC));

        // 8. Mint 1M mUSDC to Timelock (treasury)
        mockUSDC.mint(address(timelock), TREASURY_USDC_AMOUNT);
        console.log("Treasury funded:", TREASURY_USDC_AMOUNT / 10 ** 6, "mUSDC");

        vm.stopBroadcast();

        console.log("--- Deployment complete ---");
        console.log("Token clock mode: timestamp");
        console.log("Voting delay: 12s, Voting period: 1 day");
        console.log("Quorum: 60%, Timelock: 48h");
    }
}
