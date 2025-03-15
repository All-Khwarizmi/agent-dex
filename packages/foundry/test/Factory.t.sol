// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test } from "forge-std/Test.sol";
import { DeployFactory } from "../script/DeployFactory.s.sol";
import { Factory, IFactory } from "../contracts/Factory.sol";
import { Pair } from "../contracts/Pair.sol";

contract FactoryTest is Test {
    DeployFactory private factoryDeployer;
    Factory public factory;
    address token0;
    address token1;
    address constant ZERO_ADDRESS = address(0);

    function setUp() public {
        factoryDeployer = new DeployFactory();
        factory = Factory(factoryDeployer.deployFactory());
        token0 = address(0x1);
        token1 = address(0x2);
    }

    function testFactoryCreatePairDeploysPair() public {
        factory.createPair(token0, token1);
        address pair = factory.getPair(token0, token1);
        assertEq(factory.getPair(token0, token1), pair);
        assertEq(factory.getPair(token1, token0), pair);
    }

    function testFactoryCreatePairRevertsWhenIdenticalAddresses() public {
        vm.expectRevert(IFactory.Factory_IdenticalAddresses.selector);
        factory.createPair(token0, token0);
    }

    function testFactoryCreatePairRevertsWhenZeroAddresses() public {
        vm.expectRevert(IFactory.Factory_ZeroAddress.selector);
        factory.createPair(ZERO_ADDRESS, ZERO_ADDRESS);
    }

    function testFactoryCreatePairReversIfPairExistsAlready() public {
        factory.createPair(token0, token1);
        vm.expectRevert(IFactory.Factory_PoolExists.selector);
        factory.createPair(token0, token1);
    }

    function testFactoryGetPairCountReturnsExpectedValue() public {
        factory.createPair(token0, token1);

        uint256 pairCount = factory.getPairCount();
        assertEq(pairCount, 1);
    }

    function testFactoryGetPairCountAfterTenPairs() public {
        for (uint256 i = 0; i < 10; i++) {
            address _tokenA = address(uint160(uint256(keccak256(abi.encodePacked(vm.toString(i))))));
            address _tokenB = address(uint160(uint256(keccak256(abi.encodePacked(vm.toString(i + 1))))));
            factory.createPair(_tokenA, _tokenB);
        }

        uint256 pairCount = factory.getPairCount();
        assertEq(pairCount, 10);
    }
}
