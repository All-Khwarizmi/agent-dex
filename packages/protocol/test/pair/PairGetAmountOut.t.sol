// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test, console } from "@forge-std/Test.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Constants } from "../helpers/Constants.sol";
import { Pair, IPair } from "../../contracts/Pair.sol";

contract PairGetAmountOutTest is Test, Constants {
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

    function test_getAmountOut_succeeds_whenToken0() public view {
        uint256 expectedWethReceived = pair.getAmountOut(usdc, weth, TOKEN_0_AMOUNT);
        assert(expectedWethReceived > 0);
    }

    function test_getAmountOut_succeeds_whenToken1() public view {
        uint256 expectedUsdcReceived = pair.getAmountOut(weth, usdc, TOKEN_1_AMOUNT);
        assert(expectedUsdcReceived > 0);
    }

    function test_getAmountOut_reverts_whenTokensInvalid() public {
        address invalidToken0 = address(new ERC20Mock());
        address invalidToken1 = address(new ERC20Mock());

        vm.expectRevert(IPair.Pair_InvalidToken.selector);
        pair.getAmountOut(invalidToken0, invalidToken1, TOKEN_0_AMOUNT);
    }

    function test_getAmountOut_reverts_whenIdenticalTokens() public {
        vm.expectRevert(IPair.Pair_IdenticalTokens.selector);
        pair.getAmountOut(usdc, usdc, TOKEN_0_AMOUNT);
    }
}
