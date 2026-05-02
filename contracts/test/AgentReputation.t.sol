// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentReputation} from "../src/AgentReputation.sol";

contract AgentReputationTest is Test {
    AgentReputation public rep;

    address constant BULL = address(0x1);
    address constant BEAR = address(0x2);
    address constant RISK = address(0x3);
    address constant TECH = address(0x4);
    address constant SENTIMENT = address(0x5);

    address deployer = address(this);
    address updater = address(0xBACE);
    address stranger = address(0xDEAD);

    function setUp() public {
        address[5] memory agents = [BULL, BEAR, RISK, TECH, SENTIMENT];
        rep = new AgentReputation(agents, updater);
    }

    // --- Test 1: Initial reputation ---

    function test_InitialReputation() public view {
        assertEq(rep.reputation(BULL), 100);
        assertEq(rep.reputation(BEAR), 100);
        assertEq(rep.reputation(RISK), 100);
        assertEq(rep.reputation(TECH), 100);
        assertEq(rep.reputation(SENTIMENT), 100);
    }

    function test_InitialDebatesZero() public view {
        assertEq(rep.debatesParticipated(BULL), 0);
        assertEq(rep.alignedWithConsensus(BULL), 0);
    }

    function test_AgentsArray() public view {
        address[] memory agents = rep.getAgents();
        assertEq(agents.length, 5);
        assertEq(agents[0], BULL);
        assertEq(agents[4], SENTIMENT);
    }

    // --- Test 2: onlyAuthorized revert ---

    function test_UpdateReputation_RevertsWhenNotAuthorized() public {
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(AgentReputation.UnauthorizedUpdater.selector, stranger)
        );
        rep.updateReputation(BULL, 10);
    }

    function test_UpdateReputation_RevertsWhenOwnerNotAuthorized() public {
        vm.expectRevert(
            abi.encodeWithSelector(AgentReputation.UnauthorizedUpdater.selector, deployer)
        );
        rep.updateReputation(BULL, 10);
    }

    // --- Test 3: Happy path increment ---

    function test_UpdateReputation_Increment() public {
        vm.prank(updater);
        rep.updateReputation(BULL, 10);

        assertEq(rep.reputation(BULL), 110);
        assertEq(rep.debatesParticipated(BULL), 1);
        assertEq(rep.alignedWithConsensus(BULL), 1);
    }

    function test_UpdateReputation_EmitsEvent() public {
        vm.prank(updater);
        vm.expectEmit(true, false, false, true);
        emit AgentReputation.ReputationUpdated(BULL, 110, 10, block.timestamp);
        rep.updateReputation(BULL, 10);
    }

    // --- Test 4: Decrement ---

    function test_UpdateReputation_Decrement() public {
        vm.prank(updater);
        rep.updateReputation(BEAR, -5);

        assertEq(rep.reputation(BEAR), 95);
        assertEq(rep.debatesParticipated(BEAR), 1);
        assertEq(rep.alignedWithConsensus(BEAR), 0);
    }

    function test_UpdateReputation_DecrementToZero() public {
        vm.prank(updater);
        rep.updateReputation(BEAR, -100);

        assertEq(rep.reputation(BEAR), 0);
    }

    // --- Test 5: Underflow revert ---

    function test_UpdateReputation_RevertsOnUnderflow() public {
        vm.prank(updater);
        vm.expectRevert(
            abi.encodeWithSelector(
                AgentReputation.ReputationUnderflow.selector,
                RISK,
                100,
                int256(-101)
            )
        );
        rep.updateReputation(RISK, -101);
    }

    // --- Test 6: Transfer authorization ---

    function test_TransferAuthorization() public {
        address newUpdater = address(0xCAFE);

        vm.expectEmit(true, true, false, false);
        emit AgentReputation.AuthorizationTransferred(updater, newUpdater);
        rep.transferAuthorization(newUpdater);

        assertEq(rep.authorizedUpdater(), newUpdater);
    }

    function test_TransferAuthorization_RevertsWhenNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert();
        rep.transferAuthorization(address(0xCAFE));
    }

    function test_TransferAuthorization_RevertsOnZeroAddress() public {
        vm.expectRevert(AgentReputation.ZeroAddress.selector);
        rep.transferAuthorization(address(0));
    }

    // --- Test 7: getReputation tuple ---

    function test_GetReputation() public {
        vm.startPrank(updater);
        rep.updateReputation(TECH, 15);
        rep.updateReputation(TECH, -3);
        rep.updateReputation(TECH, 7);
        vm.stopPrank();

        (uint256 score, uint256 debates, uint256 aligned) = rep.getReputation(TECH);
        assertEq(score, 119); // 100 + 15 - 3 + 7
        assertEq(debates, 3);
        assertEq(aligned, 2); // +15 and +7 aligned, -3 not
    }

    // --- Test 8: Unregistered agent ---

    function test_UpdateReputation_RevertsForUnregisteredAgent() public {
        vm.prank(updater);
        vm.expectRevert(
            abi.encodeWithSelector(AgentReputation.AgentNotRegistered.selector, stranger)
        );
        rep.updateReputation(stranger, 10);
    }

    // --- Test 9: Zero delta (neutral debate) ---

    function test_UpdateReputation_ZeroDelta() public {
        vm.prank(updater);
        rep.updateReputation(BULL, 0);

        assertEq(rep.reputation(BULL), 100);
        assertEq(rep.debatesParticipated(BULL), 1);
        assertEq(rep.alignedWithConsensus(BULL), 0);
    }

    // --- Test 10: Multiple debates track correctly ---

    function test_MultipleDebates() public {
        vm.startPrank(updater);
        rep.updateReputation(SENTIMENT, 10);
        rep.updateReputation(SENTIMENT, 20);
        rep.updateReputation(SENTIMENT, -5);
        rep.updateReputation(SENTIMENT, 0);
        vm.stopPrank();

        assertEq(rep.reputation(SENTIMENT), 125); // 100 + 10 + 20 - 5 + 0
        assertEq(rep.debatesParticipated(SENTIMENT), 4);
        assertEq(rep.alignedWithConsensus(SENTIMENT), 2); // +10, +20
    }

    // --- Test 11: New updater can update, old cannot ---

    function test_TransferAuthorization_NewUpdaterWorks() public {
        address newUpdater = address(0xCAFE);
        rep.transferAuthorization(newUpdater);

        vm.prank(newUpdater);
        rep.updateReputation(BULL, 5);
        assertEq(rep.reputation(BULL), 105);

        vm.prank(updater);
        vm.expectRevert(
            abi.encodeWithSelector(AgentReputation.UnauthorizedUpdater.selector, updater)
        );
        rep.updateReputation(BULL, 5);
    }

    // --- Fuzz test ---

    function testFuzz_ReputationNeverNegative(int256 delta) public {
        vm.assume(delta > -100 && delta < 1000);
        vm.prank(updater);
        rep.updateReputation(BULL, delta);
        assertGe(rep.reputation(BULL), 0);
    }
}
