// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FundUser is Script {
    // Common token whales
    address constant USDC_WHALE = 0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341;
    address constant WETH_WHALE = 0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E;
    address constant DAI_WHALE = 0xf6e72Db5454dd049d0788e411b06CfAF16853042;
    address constant WBTC_WHALE = 0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8;

    // Token addresses
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    function run() external {
        // Target user to fund
        address user = 0xDcc4E41072017A20101B68B9500630A3ab6fE2fF; // Or specify a different address

        // Fund with ETH first
        vm.deal(user, 100 ether);

        // Fund USDC
        fundToken(USDC, USDC_WHALE, user, 1_000_000 * 1e6); // 1M USDC

        // Fund WETH
        fundToken(WETH, WETH_WHALE, user, 1000 * 1e18); // 1000 WETH

        // Fund DAI
        fundToken(DAI, DAI_WHALE, user, 1_000_000 * 1e18); // 1M DAI

        // Fund WBTC
        fundToken(WBTC, WBTC_WHALE, user, 100 * 1e8); // 100 WBTC

        // Log final balances
        logBalances(user);
    }

    function fundToken(
        address token,
        address whale,
        address user,
        uint256 amount
    ) internal {
        console.log("\nFunding %s", token);
        console.log("Before balance:", ERC20(token).balanceOf(user));

        vm.startPrank(whale);
        require(ERC20(token).transfer(user, amount), "Transfer failed");
        vm.stopPrank();

        console.log("After balance:", ERC20(token).balanceOf(user));
    }

    function logBalances(address user) internal view {
        console.log("\n=== Final Balances ===");
        console.log("ETH: %s", user.balance);
        console.log("USDC: %s", ERC20(USDC).balanceOf(user));
        console.log("WETH: %s", ERC20(WETH).balanceOf(user));
        console.log("DAI: %s", ERC20(DAI).balanceOf(user));
        console.log("WBTC: %s", ERC20(WBTC).balanceOf(user));
    }
}
