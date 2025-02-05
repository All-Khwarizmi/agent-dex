// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "forge-std/Test.sol";

import "../contracts/Factory.sol";
import "../contracts/Pair.sol";

contract FactoryTest is Test {
    Factory public factory;

    function setUp() public {
        factory = new Factory();
    }

    function testCreatePair() public {
        address tokenA = address(0x1);
        address tokenB = address(0x2);
        address pair = factory.createPair(tokenA, tokenB);
        assertEq(factory.getPair(tokenA, tokenB), pair);
        assertEq(factory.getPair(tokenB, tokenA), pair);
    }

    // function testCreatePairEmitsPairCreatedEvent() public {
    //     address tokenA = address(0x1);
    //     address tokenB = address(0x2);
    //     vm.expectEmit(true, true, true, true);
    //     emit IFactory.PairCreated(tokenA, tokenB, address(0), 0);
    //     factory.createPair(tokenA, tokenB);
    // }

    function testCreatePairFails() public {
        address tokenA = address(0x1);
        vm.expectRevert("IDENTICAL_ADDRESSES");
        factory.createPair(tokenA, tokenA);
    }

    function testCreatePairFailsIfPairExists() public {
        address tokenA = address(0x1);
        address tokenB = address(0x2);
        factory.createPair(tokenA, tokenB);
        vm.expectRevert("POOL_EXISTS");
        factory.createPair(tokenA, tokenB);
    }

    function testGetPairCount() public {
        address tokenA = address(0x1);
        address tokenB = address(0x2);
        factory.createPair(tokenA, tokenB);

        uint pairCount = factory.getPairCount();
        assertEq(pairCount, 1);
    }

    function testGetPairCountAfterTenPairs() public {
        for (uint i = 0; i < 10; i++) {
            address tokenA = address(
                uint160(uint256(keccak256(abi.encodePacked(vm.toString(i)))))
            );
            address tokenB = address(
                uint160(
                    uint256(keccak256(abi.encodePacked(vm.toString(i + 1))))
                )
            );
            factory.createPair(tokenA, tokenB);
        }

        uint pairCount = factory.getPairCount();
        assertEq(pairCount, 10);
    }
}
