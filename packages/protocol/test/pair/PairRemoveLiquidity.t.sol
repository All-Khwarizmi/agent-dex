// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test, console } from "@forge-std/Test.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Constants } from "../helpers/Constants.sol";
import { Pair, IPair } from "../../contracts/Pair.sol";

contract PairRemoveLiquidityTest is Test, Constants {
    function setUp() public {
        usdc = address(new ERC20Mock());
        weth = address(new ERC20Mock());
        pair = new Pair(usdc, weth);

        deal(usdc, USER_1, type(uint96).max);
        deal(weth, USER_1, type(uint96).max);

        vm.startPrank(USER_1);
        IERC20(usdc).approve(address(pair), type(uint96).max);
        IERC20(weth).approve(address(pair), type(uint96).max);
        pair.approve(address(pair), type(uint96).max);
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);
        vm.stopPrank();

        deal(usdc, USER_2, type(uint96).max);
        deal(weth, USER_2, type(uint96).max);

        vm.startPrank(USER_2);
        IERC20(usdc).approve(address(pair), type(uint96).max);
        IERC20(weth).approve(address(pair), type(uint96).max);
        vm.stopPrank();
    }

    function _calculateAmountsAndReservesLeft(uint256 liquidityToRemove)
        internal
        view
        returns (uint256 reserve0, uint256 reserve1, uint256 amount0, uint256 amount1)
    {
        uint256 _totalSupply = pair.totalSupply();
        (uint256 _reserve0, uint256 _reserve1) = pair.getReserves();
        amount0 = _reserve0 * liquidityToRemove / _totalSupply;
        amount1 = _reserve1 * liquidityToRemove / _totalSupply;
        reserve0 = _reserve0 - amount0;
        reserve1 = _reserve1 - amount1;
    }
    /*//////////////////////////////////////////////////////////////
                               HAPPY PATH
    //////////////////////////////////////////////////////////////*/

    function test_removeLiquidity_succeeds_withOneUser_whenRemoveAllLiquidity() public {
        uint256 userPreUsdcBalance = IERC20(usdc).balanceOf(USER_1);
        uint256 userPreWethBalance = IERC20(weth).balanceOf(USER_1);
        (uint256 reserve0Left, uint256 reserve1Left, uint256 amount0, uint256 amount1) =
            _calculateAmountsAndReservesLeft(pair.balanceOf(USER_1));

        assertEq(amount0, TOKEN_0_AMOUNT);
        assertEq(amount1, TOKEN_1_AMOUNT);

        vm.startPrank(USER_1);
        pair.removeLiquidity(pair.balanceOf(USER_1));
        vm.stopPrank();

        assertEq(pair.balanceOf(USER_1), 0);
        assertEq(IERC20(usdc).balanceOf(USER_1), userPreUsdcBalance + amount0);
        assertEq(IERC20(weth).balanceOf(USER_1), userPreWethBalance + amount1);
        assertEq(pair.totalSupply(), 0);

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        assertEq(reserve0, reserve0Left);
        assertEq(reserve1, reserve1Left);

        assertEq(IERC20(usdc).balanceOf(address(pair)), 0);
        assertEq(IERC20(weth).balanceOf(address(pair)), 0);
    }

    function test_removeLiquidity_succeeds_withMultipleUsers_whenRemovePartialLiquidity() public {
        uint256 pairPreWethBalance = IERC20(weth).balanceOf(address(pair));
        uint256 pairPreUsdcBalance = IERC20(usdc).balanceOf(address(pair));
        uint256 userPreUsdcBalance = IERC20(usdc).balanceOf(USER_1);
        uint256 userPreWethBalance = IERC20(weth).balanceOf(USER_1);
        uint256 userPairPreBalance = pair.balanceOf(USER_1);
        (uint256 reserve0Left, uint256 reserve1Left, uint256 amount0, uint256 amount1) =
            _calculateAmountsAndReservesLeft(userPairPreBalance / 2);

        vm.startPrank(USER_1);
        pair.removeLiquidity(userPairPreBalance / 2);
        vm.stopPrank();

        assertEq(pair.balanceOf(USER_1), userPairPreBalance / 2);
        assertEq(IERC20(usdc).balanceOf(USER_1), userPreUsdcBalance + amount0);
        assertEq(IERC20(weth).balanceOf(USER_1), userPreWethBalance + amount1);
        assertEq(pair.totalSupply(), userPairPreBalance / 2);

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();
        assertEq(reserve0, reserve0Left);
        assertEq(reserve1, reserve1Left);

        assertEq(IERC20(usdc).balanceOf(address(pair)), pairPreUsdcBalance - amount0);
        assertEq(IERC20(weth).balanceOf(address(pair)), pairPreWethBalance - amount1);
    }
    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    function test_emitsPairBurn_whenSucceeds() public {
        vm.startPrank(USER_1);
        vm.expectEmit(true, true, true, true);
        emit IPair.Pair_Burn(USER_1, TOKEN_0_AMOUNT, TOKEN_1_AMOUNT, Math.sqrt(TOKEN_0_AMOUNT * TOKEN_1_AMOUNT));
        pair.removeLiquidity(pair.balanceOf(USER_1));
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           UNEXPECTED VALUES
    //////////////////////////////////////////////////////////////*/
    function test_shouldRevert_whenPassingZeroValue() public {
        vm.startPrank(USER_1);
        vm.expectRevert(IPair.Pair_InsufficientLiquidityBurnt.selector);
        pair.removeLiquidity(0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    function test_shouldRevert_whenRemovingMoreThanBalance() public {
        vm.startPrank(USER_1);

        uint256 currentBalance = pair.balanceOf(USER_1);
        vm.expectRevert(abi.encodeWithSelector(IPair.Pair_InsufficientBalance.selector));

        pair.removeLiquidity(currentBalance + 1);

        vm.stopPrank();
    }
    /*//////////////////////////////////////////////////////////////
                         MULTIPLE ACTIONS BY SINGLE USER
    //////////////////////////////////////////////////////////////*/

    function test_removeLiquidity_succeeds_whenUserRemovesPartialLiquidityMultipleTimes() public {
        uint256 userPairPreBalance = pair.balanceOf(USER_1);
        vm.startPrank(USER_1);
        pair.removeLiquidity(pair.balanceOf(USER_1) / 2);
        pair.removeLiquidity(pair.balanceOf(USER_1) / 2);
        vm.stopPrank();

        assertEq(pair.balanceOf(USER_1), userPairPreBalance / 4);

        vm.startPrank(USER_1);
        pair.approve(address(pair), pair.balanceOf(USER_1));
        pair.removeLiquidity(pair.balanceOf(USER_1));
        vm.stopPrank();

        assertEq(pair.balanceOf(USER_1), 0);
    }

    /*//////////////////////////////////////////////////////////////
                         MULTIPLE USERS 
    //////////////////////////////////////////////////////////////*/
    function test_setsCorrectState_whenMultipleUsersRemoveLiquidity() public {
        vm.prank(USER_2);
        pair.addLiquidity(TOKEN_0_AMOUNT * 2, TOKEN_1_AMOUNT * 2);

        uint256 totalSupplyAfterSecondTransaction = pair.totalSupply();

        (uint256 reserve0Left, uint256 reserve1Left,,) = _calculateAmountsAndReservesLeft(pair.balanceOf(USER_1) / 2);

        uint256 user1PairPreBalance = pair.balanceOf(USER_1);

        vm.startPrank(USER_1);
        pair.removeLiquidity(user1PairPreBalance / 2);
        vm.stopPrank();

        (uint256 finalReserve0, uint256 finalReserve1) = pair.getReserves();
        assertEq(finalReserve0, reserve0Left);
        assertEq(finalReserve1, reserve1Left);

        assertEq(pair.totalSupply(), totalSupplyAfterSecondTransaction - user1PairPreBalance / 2);
    }
    /*//////////////////////////////////////////////////////////////
                         FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function test_fuzz_removeLiquidity(uint96 amount0, uint96 amount1, address user) public {
        vm.assume(user != address(0));
        vm.assume(user != OWNER);
        vm.assume(user != USER_1);
        vm.assume(user != USER_2);
        vm.assume(amount0 >= MINIMUM_LIQUIDITY && amount1 >= MINIMUM_LIQUIDITY);

        deal(usdc, user, amount0);
        deal(weth, user, amount1);

        vm.startPrank(user);
        IERC20(usdc).approve(address(pair), amount0);
        IERC20(weth).approve(address(pair), amount1);

        uint256 expectedLiquidity = pair.getLiquidityToMint(amount0, amount1);

        vm.assume(expectedLiquidity > 1e18);
        pair.addLiquidity(amount0, amount1);
        vm.stopPrank();

        assertEq(pair.balanceOf(user), expectedLiquidity);

        vm.startPrank(user);
        pair.approve(address(pair), expectedLiquidity);
        pair.removeLiquidity(expectedLiquidity);
        vm.stopPrank();
    }
}
