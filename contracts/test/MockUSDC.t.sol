// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {CouncilToken} from "../src/CouncilToken.sol";
import {AICouncilGovernor} from "../src/AICouncilGovernor.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

contract MockUSDCTest is Test {
    MockUSDC public usdc;
    address public alice = address(0xA1);
    address public bob = address(0xB1);
    address public treasury = address(0x1234);

    function setUp() public {
        usdc = new MockUSDC();
    }

    function testMint() public {
        usdc.mint(alice, 1_000_000 * 10 ** 6);
        assertEq(usdc.balanceOf(alice), 1_000_000 * 10 ** 6);
    }

    function testDecimals() public view {
        assertEq(usdc.decimals(), 6);
    }

    function testTransfer() public {
        usdc.mint(alice, 1000 * 10 ** 6);

        vm.prank(alice);
        usdc.transfer(bob, 500 * 10 ** 6);

        assertEq(usdc.balanceOf(alice), 500 * 10 ** 6);
        assertEq(usdc.balanceOf(bob), 500 * 10 ** 6);
    }

    function testTransferFrom() public {
        usdc.mint(alice, 1000 * 10 ** 6);

        vm.prank(alice);
        usdc.approve(bob, 500 * 10 ** 6);

        vm.prank(bob);
        usdc.transferFrom(alice, bob, 500 * 10 ** 6);

        assertEq(usdc.balanceOf(alice), 500 * 10 ** 6);
        assertEq(usdc.balanceOf(bob), 500 * 10 ** 6);
    }

    function testGovernanceTransfer() public {
        // Full governance flow: propose -> vote -> queue -> execute transfer
        address deployer = address(this);

        CouncilToken token = new CouncilToken(deployer);

        address[] memory emptyProposers = new address[](0);
        address[] memory anyoneExecutors = new address[](1);
        anyoneExecutors[0] = address(0);

        TimelockController timelock = new TimelockController(
            48 hours, emptyProposers, anyoneExecutors, deployer
        );

        AICouncilGovernor governor = new AICouncilGovernor(
            IVotes(address(token)), timelock
        );

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);

        // Fund treasury
        usdc.mint(address(timelock), 1_000_000 * 10 ** 6);

        // Advance time for checkpoint
        vm.warp(block.timestamp + 1);

        // Propose transfer
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(usdc);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("transfer(address,uint256)", bob, 50_000 * 10 ** 6);
        string memory desc = "Transfer 50k to bob";

        uint256 proposalId = governor.propose(targets, values, calldatas, desc);

        // Skip voting delay
        vm.warp(block.timestamp + governor.votingDelay() + 1);

        // Vote (deployer has all 5 tokens, self-delegated)
        governor.castVote(proposalId, 1);

        // Skip voting period
        vm.warp(block.timestamp + governor.votingPeriod() + 1);

        // Queue
        bytes32 descHash = keccak256(bytes(desc));
        governor.queue(targets, values, calldatas, descHash);

        // Skip timelock
        vm.warp(block.timestamp + 48 hours + 1);

        // Execute
        governor.execute(targets, values, calldatas, descHash);

        assertEq(usdc.balanceOf(bob), 50_000 * 10 ** 6);
        assertEq(usdc.balanceOf(address(timelock)), 950_000 * 10 ** 6);
    }

    function testSymbolAndName() public view {
        assertEq(usdc.symbol(), "mUSDC");
        assertEq(usdc.name(), "Mock USDC");
    }

    function testMintMultipleTimes() public {
        usdc.mint(alice, 100 * 10 ** 6);
        usdc.mint(alice, 200 * 10 ** 6);
        assertEq(usdc.balanceOf(alice), 300 * 10 ** 6);
    }
}
