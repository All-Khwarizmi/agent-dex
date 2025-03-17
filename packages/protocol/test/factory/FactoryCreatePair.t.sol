// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Test } from "forge-std/Test.sol";
import { Factory, IFactory } from "../../contracts/Factory.sol";

contract FactoryCreatePairTest is Test {
    Factory private factory;
    address private token0;
    address private token1;
    address private token2;
    address private token3;
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");

    function setUp() public {
        factory = new Factory();
        token0 = address(0x1);
        token1 = address(0x2);
        token2 = address(0x3);
        token3 = address(0x4);
    }

    function test_createPair_succeeds() public {
        factory.createPair(token0, token1);
        address pair = factory.getPair(token0, token1);
        assertEq(factory.getPair(token0, token1), pair);
        assertEq(factory.getPair(token1, token0), pair);
        assertEq(factory.getPairCount(), 1);
    }

    function test_emitPairCreatedEvent() public {
        vm.expectEmit(true, true, false, false);
        emit IFactory.PairCreated(token0, token1, address(0));
        factory.createPair(token0, token1);
    }

    function test_createPairWithIdenticalAddresses_reverts() public {
        vm.expectRevert(IFactory.Factory_IdenticalAddresses.selector);
        factory.createPair(token0, token0);
    }

    function test_createPairWithZeroAddress_reverts() public {
        vm.expectRevert(IFactory.Factory_ZeroAddress.selector);
        factory.createPair(address(0), address(0));
    }

    function test_createPairWithExistingPair_reverts() public {
        factory.createPair(token0, token1);
        vm.expectRevert(IFactory.Factory_PoolExists.selector);
        factory.createPair(token0, token1);
    }

    function test_userCreatePairMultiplePairs() public {
        factory.createPair(token0, token1);
        address pair1 = factory.getPair(token0, token1);
        assertEq(factory.getPair(token0, token1), pair1);
        assertEq(factory.getPair(token1, token0), pair1);

        factory.createPair(token2, token3);
        address pair2 = factory.getPair(token2, token3);
        assertEq(factory.getPair(token2, token3), pair2);
        assertEq(factory.getPair(token3, token2), pair2);
    }

    function test_multipleUsersCreatePairMultiplePairs() public {
        vm.startPrank(user1);
        factory.createPair(token0, token1);
        address pair1 = factory.getPair(token0, token1);
        assertEq(factory.getPair(token0, token1), pair1);
        assertEq(factory.getPair(token1, token0), pair1);
        vm.stopPrank();

        vm.startPrank(user2);
        factory.createPair(token2, token3);
        address pair2 = factory.getPair(token2, token3);
        assertEq(factory.getPair(token2, token3), pair2);
        assertEq(factory.getPair(token3, token2), pair2);
        vm.stopPrank();
    }

    function test_fuzz_createPair(address tokenA, address tokenB) public {
        vm.assume(tokenA != tokenB && tokenA != address(0) && tokenB != address(0));
        factory.createPair(tokenA, tokenB);
        address pair = factory.getPair(tokenA, tokenB);
        assertEq(factory.getPair(tokenA, tokenB), pair);
        assertEq(factory.getPair(tokenB, tokenA), pair);
    }
}
