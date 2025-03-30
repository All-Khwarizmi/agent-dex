// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test, console } from "@forge-std/Test.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Constants } from "../helpers/Constants.sol";
import { Pair, IPair } from "../../contracts/Pair.sol";

contract PairSwapTest is Test, Constants {
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

        deal(usdc, USER_2, TOKEN_0_AMOUNT);
        deal(weth, USER_2, TOKEN_1_AMOUNT);

        vm.startPrank(USER_2);
        IERC20(usdc).approve(address(pair), TOKEN_0_AMOUNT);
        IERC20(weth).approve(address(pair), TOKEN_1_AMOUNT);
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);
        vm.stopPrank();
    }

    function _setupBalancesAndAllowances()
        internal
        returns (
            uint256 user3InitialUsdcBalance,
            uint256 user3InitialWethBalance,
            uint256 user4InitialUsdcBalance,
            uint256 user4InitialWethBalance
        )
    {
        deal(usdc, USER_3, TOKEN_0_AMOUNT);
        deal(weth, USER_3, TOKEN_1_AMOUNT);
        deal(usdc, USER_4, TOKEN_0_AMOUNT);
        deal(weth, USER_4, TOKEN_1_AMOUNT);

        vm.startPrank(USER_3);
        IERC20(usdc).approve(address(pair), type(uint256).max);
        IERC20(weth).approve(address(pair), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(USER_4);
        IERC20(usdc).approve(address(pair), type(uint256).max);
        IERC20(weth).approve(address(pair), type(uint256).max);
        vm.stopPrank();

        user3InitialUsdcBalance = IERC20(usdc).balanceOf(USER_3);
        user3InitialWethBalance = IERC20(weth).balanceOf(USER_3);
        user4InitialUsdcBalance = IERC20(usdc).balanceOf(USER_4);
        user4InitialWethBalance = IERC20(weth).balanceOf(USER_4);
    }

    function _executeSwaps(uint256 amount0, uint256 amount1, uint16 rounds) internal {
        for (uint16 i = 0; i < rounds; i++) {
            _setupBalancesAndAllowances();
            vm.startPrank(USER_3);
            ERC20Mock(usdc).mint(USER_3, amount0);
            IERC20(usdc).approve(address(pair), amount0);
            uint256 amountOut = pair.getAmountOut(usdc, weth, amount0);
            pair.swap(usdc, weth, amount0, amountOut);
            vm.stopPrank();

            vm.startPrank(USER_4);
            ERC20Mock(weth).mint(USER_4, amount1);
            IERC20(weth).approve(address(pair), amount1);
            amountOut = pair.getAmountOut(weth, usdc, amount1);
            pair.swap(weth, usdc, amount1, amountOut);
            vm.stopPrank();
        }
    }

    /*//////////////////////////////////////////////////////////////
                               HAPPY PATH
    //////////////////////////////////////////////////////////////*/
    function test_swap_succeeds_fromToken0ToToken1() public {
        deal(usdc, USER_3, TOKEN_0_AMOUNT);
        uint256 expectedWethReceived = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT);

        vm.startPrank(USER_3);
        IERC20(usdc).approve(address(pair), TOKEN_0_AMOUNT);
        uint256 amountOut = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT);
        pair.swap(usdc, weth, TOKEN_0_AMOUNT, amountOut);
        vm.stopPrank();

        assertEq(IERC20(weth).balanceOf(USER_3), expectedWethReceived);
    }

    function test_swap_succeeds_fromToken1ToToken0() public {
        deal(weth, USER_3, TOKEN_1_AMOUNT);
        uint256 expectedUsdcReceived = pair.getAmountOut(weth, usdc, TOKEN_1_AMOUNT);

        vm.startPrank(USER_3);
        IERC20(weth).approve(address(pair), TOKEN_1_AMOUNT);
        uint256 amountOut = pair.getAmountOut(weth, usdc, TOKEN_1_AMOUNT);
        pair.swap(weth, usdc, TOKEN_1_AMOUNT, amountOut);
        vm.stopPrank();

        assertEq(IERC20(usdc).balanceOf(USER_3), expectedUsdcReceived);
    }

    function test_liquidityProvidersReceiveCollectedFees_succeeds() public {
        _executeSwaps(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT, 190);

        uint256 userBalance = pair.balanceOf(USER_1);
        console.log("user balance", userBalance);
        vm.prank(USER_1);
        pair.removeLiquidity(userBalance);

        assertGt(IERC20(usdc).balanceOf(USER_1), TOKEN_0_AMOUNT);
        assertGt(IERC20(weth).balanceOf(USER_1), TOKEN_1_AMOUNT);
    }

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/
    function test_emitsPairSwap_whenSucceeds() public {
        deal(usdc, USER_3, TOKEN_0_AMOUNT);
        uint256 expectedWethReceived = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT);

        vm.startPrank(USER_3);
        IERC20(usdc).approve(address(pair), TOKEN_0_AMOUNT);

        uint256 amountOut = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT);
        vm.expectEmit(true, true, true, true);
        emit IPair.Pair_Swap(USER_3, usdc, weth, TOKEN_0_AMOUNT, expectedWethReceived);
        pair.swap(usdc, weth, TOKEN_0_AMOUNT, amountOut);
        vm.stopPrank();
    }
    /*//////////////////////////////////////////////////////////////
                           UNEXPECTED VALUES
    //////////////////////////////////////////////////////////////*/

    function test_shouldRevert_whenPassingZeroValue() public {
        vm.startPrank(USER_3);
        uint256 amountOut = pair.getAmountOut(usdc, weth, 0);
        vm.expectRevert(IPair.Pair_InsufficientOutput.selector);
        pair.swap(usdc, weth, 0, amountOut);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                         MULTIPLE ACTIONS BY SINGLE USER
    //////////////////////////////////////////////////////////////*/
    function test_userIsAbleToSwapMultipleTimes_inEitherDirection() public {
        deal(usdc, USER_3, TOKEN_0_AMOUNT);
        deal(weth, USER_3, TOKEN_1_AMOUNT);
        uint256 initialUsdcBalance = IERC20(usdc).balanceOf(USER_3);
        uint256 initialWethBalance = IERC20(weth).balanceOf(USER_3);

        vm.startPrank(USER_3);
        IERC20(usdc).approve(address(pair), TOKEN_0_AMOUNT);
        IERC20(weth).approve(address(pair), TOKEN_1_AMOUNT);

        uint256 expectedWethReceived1 = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT / 2);
        pair.swap(usdc, weth, TOKEN_0_AMOUNT / 2, expectedWethReceived1);

        uint256 expectedUsdcReceived1 = pair.getAmountOut(weth, usdc, TOKEN_1_AMOUNT / 2);
        pair.swap(weth, usdc, TOKEN_1_AMOUNT / 2, expectedUsdcReceived1);

        uint256 expectedWethReceived2 = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT / 2);
        pair.swap(usdc, weth, TOKEN_0_AMOUNT / 2, expectedWethReceived2);

        assertEq(
            IERC20(weth).balanceOf(USER_3),
            initialWethBalance + expectedWethReceived1 - TOKEN_1_AMOUNT / 2 + expectedWethReceived2,
            "Incorrect weth balance"
        );
        assertEq(IERC20(usdc).balanceOf(USER_3), initialUsdcBalance + expectedUsdcReceived1 - TOKEN_0_AMOUNT);
    }
    /*//////////////////////////////////////////////////////////////
                         MULTIPLE USERS 
    //////////////////////////////////////////////////////////////*/

    function test_usersMakeMultipleSwaps_succeeds() public {
        uint256 user3InitialUsdcBalance;
        uint256 user3InitialWethBalance;
        uint256 user4InitialUsdcBalance;
        uint256 user4InitialWethBalance;

        (user3InitialUsdcBalance, user3InitialWethBalance, user4InitialUsdcBalance, user4InitialWethBalance) =
            _setupBalancesAndAllowances();

        (uint256 initialReserve0, uint256 initialReserve1) = pair.getReserves();

        uint256 expectedWethReceived1 = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT / 2);
        vm.prank(USER_3);
        pair.swap(usdc, weth, TOKEN_0_AMOUNT / 2, expectedWethReceived1);

        uint256 expectedUsdcReceived2 = pair.getAmountOut(weth, usdc, TOKEN_1_AMOUNT / 2);
        vm.prank(USER_4);
        pair.swap(weth, usdc, TOKEN_1_AMOUNT / 2, expectedUsdcReceived2);

        uint256 expectedUsdcReceived3 = pair.getAmountOut(weth, usdc, TOKEN_1_AMOUNT / 2);
        vm.prank(USER_3);
        pair.swap(weth, usdc, TOKEN_1_AMOUNT / 2, expectedUsdcReceived3);

        uint256 expectedWethReceived4 = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT / 2);
        vm.prank(USER_4);
        pair.swap(usdc, weth, TOKEN_0_AMOUNT / 2, expectedWethReceived4);

        assertEq(
            IERC20(weth).balanceOf(USER_3),
            user3InitialWethBalance + expectedWethReceived1 - TOKEN_1_AMOUNT / 2,
            "Incorrect weth balance"
        );

        assertEq(
            IERC20(weth).balanceOf(USER_4),
            user4InitialWethBalance + expectedWethReceived4 - TOKEN_1_AMOUNT / 2,
            "Incorrect weth balance"
        );

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        assertEq(
            reserve0,
            initialReserve0 - expectedUsdcReceived2 - expectedUsdcReceived3 + TOKEN_0_AMOUNT,
            "Incorrect reserve0"
        );

        assertEq(
            reserve1,
            initialReserve1 - expectedWethReceived1 - expectedWethReceived4 + TOKEN_1_AMOUNT,
            "Incorrect reserve1"
        );
    }
    /*//////////////////////////////////////////////////////////////
                         FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function test_fuzz_swap(uint96 amount0, uint96 amount1, address user1) public {
        vm.assume(user1 != address(0));
        vm.assume(amount0 >= 1e6 && amount1 >= 1e18);

        deal(usdc, user1, amount0);
        deal(weth, user1, amount1);

        vm.startPrank(user1);
        IERC20(usdc).approve(address(pair), amount0);
        IERC20(weth).approve(address(pair), amount1);

        uint256 expectedWethReceived = pair.getAmountOut(usdc, weth, amount0);
        pair.swap(usdc, weth, amount0, expectedWethReceived);
        assertEq(IERC20(weth).balanceOf(user1), amount1 + expectedWethReceived);

        uint256 expectedUsdcReceived = pair.getAmountOut(weth, usdc, amount1);
        pair.swap(weth, usdc, amount1, expectedUsdcReceived);
        vm.stopPrank();
        assertEq(IERC20(usdc).balanceOf(user1), expectedUsdcReceived);
    }
}
