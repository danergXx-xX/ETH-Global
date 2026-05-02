// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CouncilToken} from "../src/CouncilToken.sol";

contract CouncilTokenTest is Test {
    CouncilToken public token;
    address public deployer = address(0xD1);
    address public alice = address(0xA1);
    address public bob = address(0xB1);

    function setUp() public {
        vm.prank(deployer);
        token = new CouncilToken(deployer);
    }

    function testInitialMint() public view {
        uint256 expected = 5 * 10 ** token.decimals();
        assertEq(token.balanceOf(deployer), expected);
        assertEq(token.totalSupply(), expected);
    }

    function testAutoDelegate() public view {
        uint256 expectedVotes = 5 * 10 ** token.decimals();
        assertEq(token.getVotes(deployer), expectedVotes);
        assertEq(token.delegates(deployer), deployer);
    }

    function testTransferMovesVotingPower() public {
        uint256 oneToken = 10 ** token.decimals();

        vm.prank(deployer);
        token.transfer(alice, oneToken);

        // Alice must delegate to activate voting power
        vm.prank(alice);
        token.delegate(alice);

        assertEq(token.getVotes(deployer), 4 * oneToken);
        assertEq(token.getVotes(alice), oneToken);
    }

    function testExplicitDelegate() public {
        uint256 oneToken = 10 ** token.decimals();

        vm.prank(deployer);
        token.transfer(alice, oneToken);

        // Alice delegates to Bob
        vm.prank(alice);
        token.delegate(bob);

        assertEq(token.getVotes(bob), oneToken);
        assertEq(token.getVotes(alice), 0);
        assertEq(token.balanceOf(alice), oneToken);
    }

    function testNoPublicMint() public {
        // CouncilToken has no public mint - only constructor mint
        bytes4 selector = bytes4(keccak256("mint(address,uint256)"));
        (bool success,) = address(token).call(abi.encodeWithSelector(selector, alice, 100));
        assertFalse(success);
    }

    function testClockModeTimestamp() public view {
        assertEq(token.CLOCK_MODE(), "mode=timestamp");
        assertEq(token.clock(), uint48(block.timestamp));
    }

    function testClockAdvancesWithTime() public {
        uint48 t1 = token.clock();
        vm.warp(block.timestamp + 100);
        uint48 t2 = token.clock();
        assertEq(t2 - t1, 100);
    }

    function testPastVotesCheckpoint() public {
        uint256 oneToken = 10 ** token.decimals();
        uint256 startTime = block.timestamp;

        vm.warp(startTime + 10);

        vm.prank(deployer);
        token.transfer(alice, oneToken);
        vm.prank(alice);
        token.delegate(alice);

        vm.warp(startTime + 20);

        // Before transfer, deployer had full supply
        assertEq(token.getPastVotes(deployer, startTime + 5), 5 * oneToken);
        // After transfer + delegate, alice has 1 token voting power
        assertEq(token.getPastVotes(alice, startTime + 15), oneToken);
    }
}
