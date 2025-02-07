// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/UniswapV2.sol";
import "../contracts/Pair.sol";
import "../contracts/Factory.sol";
import "../test/Pair.t.sol";

import "../contracts/interfaces/IUniswapFactory.sol";
import "../contracts/interfaces/IUniswapRouter.sol";

/**
 * @notice Deploy script for YourContract contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployYourContract.s.sol  # local anvil chain
 * yarn deploy --file DeployYourContract.s.sol --network optimism # live network (requires keystore)
 */
contract DeployUniswapV2PriceChecker is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
        // Deploy tokens
        address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

        // Deploy factory
        Factory localFactory = new Factory();

        localFactory.createPair(usdc, weth);

        // Deploy pair to have it in debug page
        address uniswapFactoryAddr = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
        address uniswapRouterAddr = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

        new Pair(usdc, weth, uniswapFactoryAddr, uniswapRouterAddr);
    }
}
