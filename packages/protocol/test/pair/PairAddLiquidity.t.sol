// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test, console } from "@forge-std/Test.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Constants } from "../helpers/Constants.sol";
import { Pair, IPair } from "../../contracts/Pair.sol";

contract PairAddLiquidityTest is Test, Constants {
    function setUp() public {
        usdc = address(new ERC20Mock());
        weth = address(new ERC20Mock());
        pair = new Pair(usdc, weth);

        deal(usdc, USER_1, type(uint96).max);
        deal(weth, USER_1, type(uint96).max);

        vm.startPrank(USER_1);
        IERC20(usdc).approve(address(pair), type(uint96).max);
        IERC20(weth).approve(address(pair), type(uint96).max);
        vm.stopPrank();

        deal(usdc, USER_2, type(uint96).max);
        deal(weth, USER_2, type(uint96).max);

        vm.startPrank(USER_2);
        IERC20(usdc).approve(address(pair), type(uint96).max);
        IERC20(weth).approve(address(pair), type(uint96).max);
        vm.stopPrank();
    }
    /*//////////////////////////////////////////////////////////////
                               HAPPY PATH
    //////////////////////////////////////////////////////////////*/

    function test_addLiquidity_succeeds() public {
        vm.startPrank(USER_1);
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);
        vm.stopPrank();

        assertTrue(pair.balanceOf(USER_1) > 0);
    }

    function test_setsCorrectPoolState_whenFirstLiquidityAdded() public {
        vm.startPrank(USER_1);

        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);

        uint256 poolBalance = pair.totalSupply();
        uint256 userBalance = pair.balanceOf(USER_1);

        vm.stopPrank();

        uint256 expectedPoolBalance = Math.sqrt(TOKEN_0_AMOUNT * TOKEN_1_AMOUNT);

        assertEq(poolBalance, expectedPoolBalance);
        assertEq(userBalance, expectedPoolBalance);

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();
        assertEq(reserve0, TOKEN_0_AMOUNT);
        assertEq(reserve1, TOKEN_1_AMOUNT);

        assertEq(IERC20(usdc).balanceOf(address(pair)), TOKEN_0_AMOUNT);
        assertEq(IERC20(weth).balanceOf(address(pair)), TOKEN_1_AMOUNT);
    }

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    function test_emitsPairMint_whenSucceeds() public {
        vm.startPrank(USER_1);
        vm.expectEmit(true, true, true, true);
        emit IPair.Pair_Mint(USER_1, TOKEN_0_AMOUNT, TOKEN_1_AMOUNT, Math.sqrt(TOKEN_0_AMOUNT * TOKEN_1_AMOUNT));
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    function test_shouldRevert_whenPassingZeroValues() public {
        vm.startPrank(USER_1);
        vm.expectRevert(IPair.Pair_InsufficientInput.selector);
        pair.addLiquidity(0, 0);
        vm.expectRevert(IPair.Pair_InsufficientInput.selector);
        pair.addLiquidity(TOKEN_0_AMOUNT, 0);
        vm.expectRevert(IPair.Pair_InsufficientInput.selector);
        pair.addLiquidity(0, TOKEN_1_AMOUNT);
        vm.stopPrank();
    }

    function test_shouldRevert_whenNotPassingMinimumLiquidity() public {
        vm.startPrank(USER_1);
        vm.expectRevert(IPair.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(MINIMUM_LIQUIDITY - 1, MINIMUM_LIQUIDITY - 1);
        vm.expectRevert(IPair.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(MINIMUM_LIQUIDITY, MINIMUM_LIQUIDITY - 1);
        vm.expectRevert(IPair.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(MINIMUM_LIQUIDITY - 1, MINIMUM_LIQUIDITY);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                         MULTIPLE ACTIONS
    //////////////////////////////////////////////////////////////*/

    function test_setsCorrectState_whenUserHasAlreadyAddedLiquidity() public {
        vm.startPrank(USER_1);
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();
        uint256 totalSupplyAfterFirstTransaction = pair.totalSupply();

        pair.addLiquidity(TOKEN_0_AMOUNT / 2, TOKEN_1_AMOUNT / 2);
        vm.stopPrank();

        uint256 expectedUserBalanceAfterFirstTransaction = Math.sqrt(TOKEN_0_AMOUNT * TOKEN_1_AMOUNT);
        uint256 liquidityMintedAfterSecondTransaction = Math.min(
            (TOKEN_0_AMOUNT / 2) * totalSupplyAfterFirstTransaction / reserve0,
            (TOKEN_1_AMOUNT / 2) * totalSupplyAfterFirstTransaction / reserve1
        );
        uint256 finalBalance = expectedUserBalanceAfterFirstTransaction + liquidityMintedAfterSecondTransaction;
        uint256 userBalance = pair.balanceOf(USER_1);

        assertEq(userBalance, finalBalance);
        assertEq(pair.totalSupply(), finalBalance);
    }
    /*//////////////////////////////////////////////////////////////
                         MULTIPLE USERS 
    //////////////////////////////////////////////////////////////*/

    function test_setsCorrectState_whenMultipleUsersAddLiquidity() public {
        vm.startPrank(USER_1);
        pair.addLiquidity(TOKEN_0_AMOUNT, TOKEN_1_AMOUNT);
        vm.stopPrank();
        (uint256 reserve0, uint256 reserve1) = pair.getReserves();
        uint256 totalSupplyAfterFirstTransaction = pair.totalSupply();
        vm.startPrank(USER_2);
        pair.addLiquidity(TOKEN_0_AMOUNT / 2, TOKEN_1_AMOUNT / 2);
        vm.stopPrank();

        uint256 expectedUser1BalanceAfterFirstTransaction = Math.sqrt(TOKEN_0_AMOUNT * TOKEN_1_AMOUNT);
        uint256 liquidityMintedAfterSecondTransaction = Math.min(
            (TOKEN_0_AMOUNT / 2) * totalSupplyAfterFirstTransaction / reserve0,
            (TOKEN_1_AMOUNT / 2) * totalSupplyAfterFirstTransaction / reserve1
        );
        uint256 finalBalance = expectedUser1BalanceAfterFirstTransaction + liquidityMintedAfterSecondTransaction;

        uint256 user2Balance = pair.balanceOf(USER_2);

        assertEq(user2Balance, liquidityMintedAfterSecondTransaction);
        assertEq(pair.totalSupply(), finalBalance);
    }

    /*//////////////////////////////////////////////////////////////
                         FUZZ TESTS
    //////////////////////////////////////////////////////////////*/
    function test_fuzz_addLiquidity(uint96 amount0, uint96 amount1, address user) public {
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

        pair.addLiquidity(amount0, amount1);
        vm.stopPrank();

        assertEq(pair.balanceOf(user), expectedLiquidity);
    }
}
