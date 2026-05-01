// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CouncilToken} from "../src/CouncilToken.sol";
import {AICouncilGovernor} from "../src/AICouncilGovernor.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

contract AICouncilGovernorTest is Test {
    CouncilToken public token;
    TimelockController public timelock;
    AICouncilGovernor public governor;
    MockUSDC public usdc;

    address public deployer = address(0xD1);
    address public agent1 = address(0xA1);
    address public agent2 = address(0xA2);
    address public agent3 = address(0xA3);
    address public agent4 = address(0xA4);
    address public agent5 = address(0xA5);
    address public recipient = address(0xBEEF);

    uint256 constant ONE_TOKEN = 10 ** 18;
    uint256 constant TIMELOCK_DELAY = 48 hours;
    uint256 constant VOTING_PERIOD = 86400;

    function setUp() public {
        vm.startPrank(deployer);

        token = new CouncilToken(deployer);

        address[] memory emptyProposers = new address[](0);
        address[] memory anyoneExecutors = new address[](1);
        anyoneExecutors[0] = address(0);

        timelock = new TimelockController(TIMELOCK_DELAY, emptyProposers, anyoneExecutors, deployer);
        governor = new AICouncilGovernor(IVotes(address(token)), timelock);

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);

        usdc = new MockUSDC();
        usdc.mint(address(timelock), 1_000_000 * 10 ** 6);

        // Distribute tokens: 1 per agent
        token.transfer(agent1, ONE_TOKEN);
        token.transfer(agent2, ONE_TOKEN);
        token.transfer(agent3, ONE_TOKEN);
        token.transfer(agent4, ONE_TOKEN);
        token.transfer(agent5, ONE_TOKEN);

        vm.stopPrank();

        // Each agent self-delegates
        vm.prank(agent1); token.delegate(agent1);
        vm.prank(agent2); token.delegate(agent2);
        vm.prank(agent3); token.delegate(agent3);
        vm.prank(agent4); token.delegate(agent4);
        vm.prank(agent5); token.delegate(agent5);

        // Advance time so checkpoints are available
        vm.warp(block.timestamp + 1);
    }

    function _createProposal() internal returns (uint256) {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(usdc);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("transfer(address,uint256)", recipient, 100_000 * 10 ** 6);

        vm.prank(agent1);
        uint256 proposalId = governor.propose(targets, values, calldatas, "Transfer 100k mUSDC to recipient");

        return proposalId;
    }

    function testProposeAndVoteFor() public {
        uint256 proposalId = _createProposal();

        // Skip voting delay
        vm.warp(block.timestamp + governor.votingDelay() + 1);

        // 4/5 vote FOR (80% > 60% quorum)
        vm.prank(agent1); governor.castVote(proposalId, 1);
        vm.prank(agent2); governor.castVote(proposalId, 1);
        vm.prank(agent3); governor.castVote(proposalId, 1);
        vm.prank(agent4); governor.castVote(proposalId, 1);

        // Skip voting period
        vm.warp(block.timestamp + VOTING_PERIOD + 1);

        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Succeeded));
    }

    function testProposeVoteAgainst() public {
        uint256 proposalId = _createProposal();

        vm.warp(block.timestamp + governor.votingDelay() + 1);

        // 4/5 vote AGAINST
        vm.prank(agent1); governor.castVote(proposalId, 0);
        vm.prank(agent2); governor.castVote(proposalId, 0);
        vm.prank(agent3); governor.castVote(proposalId, 0);
        vm.prank(agent4); governor.castVote(proposalId, 0);

        vm.warp(block.timestamp + VOTING_PERIOD + 1);

        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Defeated));
    }

    function testQuorumNotMet() public {
        uint256 proposalId = _createProposal();

        vm.warp(block.timestamp + governor.votingDelay() + 1);

        // Only 2/5 vote (40% < 60% quorum)
        vm.prank(agent1); governor.castVote(proposalId, 1);
        vm.prank(agent2); governor.castVote(proposalId, 1);

        vm.warp(block.timestamp + VOTING_PERIOD + 1);

        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Defeated));
    }

    function testTimelockDelayEnforced() public {
        uint256 proposalId = _createProposal();

        vm.warp(block.timestamp + governor.votingDelay() + 1);

        vm.prank(agent1); governor.castVote(proposalId, 1);
        vm.prank(agent2); governor.castVote(proposalId, 1);
        vm.prank(agent3); governor.castVote(proposalId, 1);
        vm.prank(agent4); governor.castVote(proposalId, 1);

        vm.warp(block.timestamp + VOTING_PERIOD + 1);

        // Queue the proposal
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(usdc);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("transfer(address,uint256)", recipient, 100_000 * 10 ** 6);
        bytes32 descHash = keccak256(bytes("Transfer 100k mUSDC to recipient"));

        governor.queue(targets, values, calldatas, descHash);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Queued));

        // Try execute before timelock expires - should revert
        vm.expectRevert();
        governor.execute(targets, values, calldatas, descHash);

        // Advance past timelock delay
        vm.warp(block.timestamp + TIMELOCK_DELAY + 1);

        // Execute succeeds
        governor.execute(targets, values, calldatas, descHash);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Executed));
        assertEq(usdc.balanceOf(recipient), 100_000 * 10 ** 6);
    }

    function testCancelProposal() public {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(usdc);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("transfer(address,uint256)", recipient, 100_000 * 10 ** 6);
        string memory description = "Transfer 100k mUSDC to recipient";
        bytes32 descHash = keccak256(bytes(description));

        vm.prank(agent1);
        uint256 proposalId = governor.propose(targets, values, calldatas, description);

        // Cancel (proposer can cancel their own proposal)
        vm.prank(agent1);
        governor.cancel(targets, values, calldatas, descHash);

        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Canceled));
    }

    function testGovernorSettings() public view {
        assertEq(governor.votingDelay(), 12);
        assertEq(governor.votingPeriod(), VOTING_PERIOD);
        assertEq(governor.proposalThreshold(), 0);
        assertEq(governor.name(), "AICouncilGovernor");
    }

    function testQuorumFraction() public view {
        // With 5 tokens total supply, 60% quorum = 3 tokens worth of votes
        uint256 expectedQuorum = (5 * ONE_TOKEN * 60) / 100;
        assertEq(governor.quorum(block.timestamp - 1), expectedQuorum);
    }

    function testTimelockIsExecutor() public view {
        // The executor (where funds live) should be the timelock
        assertEq(address(timelock), governor.timelock());
    }
}
