// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/UniswapV2.sol";
import "../contracts/Pair.sol";
import "../contracts/Factory.sol";
import "forge-std/console.sol";
import "../contracts/test/MockERC20.sol";

contract Deploy is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
      



        // Deploy factory
        Factory factory = new Factory();
        console.log("Factory deployed to:", address(factory));

        // Create pairs

        // Deploy price checker pair
        Pair priceChecker = new Pair(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
            0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, // WETH
            0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f, // Uniswap Factory
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D // Uniswap Router
        );
        console.log("Price Checker deployed to:", address(priceChecker));
    }
}
