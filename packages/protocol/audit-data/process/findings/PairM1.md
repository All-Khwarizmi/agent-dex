### [M-1] Violation of Checks-Effects-Interactions pattern in multiple functions

**Description:**
Multiple functions in the Pair contract violate the Checks-Effects-Interactions (CEI) pattern by performing external calls before updating the contract's state. The CEI pattern is a best practice in smart contract development to prevent reentrancy attacks.

The violation occurs in three key functions:

1. In the `removeLiquidity` function:

```solidity
function removeLiquidity(uint256 amount) external lock {
    // ... checks and calculations ...

    // EXTERNAL CALLS BEFORE STATE UPDATES
    IERC20(token0).safeTransfer(msg.sender, amount0);
    IERC20(token1).safeTransfer(msg.sender, amount1);

    // STATE UPDATES AFTER EXTERNAL CALLS
    _burn(msg.sender, amount);
    reserve0 -= amount0;
    reserve1 -= amount1;

    emit Pair_Burn(msg.sender, amount0, amount1, amount);
}
```

2. In the `_addLiquidity` function:

```solidity
function _addLiquidity(uint256 amount0, uint256 amount1, uint256 liquidity) internal lock {
    // EXTERNAL CALLS BEFORE STATE UPDATES
    IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
    IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

    // STATE UPDATES AFTER EXTERNAL CALLS
    reserve0 += amount0;
    reserve1 += amount1;
    _mint(msg.sender, liquidity);

    emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
}
```

3. In the `swap` function:

```solidity
function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
    uint256 amountOut = getAmountOut(fromToken, targetToken, amountIn);

    if (amountOut == 0) revert Pair_InsufficientOutput();

    // EXTERNAL CALLS BEFORE STATE UPDATES
    IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
    IERC20(targetToken).safeTransfer(msg.sender, amountOut);

    // STATE UPDATES AFTER EXTERNAL CALLS (via balanceOf calls)
    reserve0 = IERC20(token0).balanceOf(address(this));
    reserve1 = IERC20(token1).balanceOf(address(this));

    emit Pair_Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
}
```

In all these functions, external calls to token contracts are made before updating the contract's state variables. This violates the CEI pattern which recommends performing all external calls after state changes to prevent potential reentrancy attacks.

**Impact:**
While all these functions include a `lock` modifier to prevent reentrancy, the consistent violation of the CEI pattern introduces several risks:

1. If the lock modifier were to be removed or modified in a future update, all these functions would be vulnerable to reentrancy attacks
2. It creates a dependency on a single security control (the reentrancy guard) rather than using proper state management as a defense-in-depth measure
3. If any of the tokens have callback mechanisms, they could potentially be exploited
4. The consistent violation of a fundamental security pattern indicates a systemic issue in the codebase

The consistent pattern violation across all major state-changing functions significantly increases the severity of this issue, as it represents a systemic architectural weakness rather than an isolated instance.

**Proof of Concept:**
This is a pattern violation rather than an exploitable vulnerability in the current implementation (due to the lock modifier). However, if the lock modifier were to be removed or bypassed, multiple attack paths would be opened:

1. In `removeLiquidity`: Multiple withdrawals of the same liquidity before the burn
2. In `_addLiquidity`: Manipulation of reserve calculations during the minting process
3. In `swap`: Double-spending or price manipulation during token transfers

**Recommended Mitigation:**
Reorganize all three functions to follow the CEI pattern:

1. For `removeLiquidity`:

```solidity
function removeLiquidity(uint256 amount) external lock {
    // ... checks and calculations ...

    // STATE UPDATES FIRST
    _burn(msg.sender, amount);
    reserve0 -= amount0;
    reserve1 -= amount1;

    // EXTERNAL CALLS AFTER STATE UPDATES
    IERC20(token0).safeTransfer(msg.sender, amount0);
    IERC20(token1).safeTransfer(msg.sender, amount1);

    emit Pair_Burn(msg.sender, amount0, amount1, amount);
}
```

2. For `_addLiquidity`:

```solidity
function _addLiquidity(uint256 amount0, uint256 amount1, uint256 liquidity) internal lock {
    // Get initial balances
    uint256 balance0Before = IERC20(token0).balanceOf(address(this));
    uint256 balance1Before = IERC20(token1).balanceOf(address(this));

    // EXTERNAL CALLS
    IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
    IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

    // Verify the amounts received (for tokens with fees)
    uint256 balance0After = IERC20(token0).balanceOf(address(this));
    uint256 balance1After = IERC20(token1).balanceOf(address(this));
    uint256 amount0Received = balance0After - balance0Before;
    uint256 amount1Received = balance1After - balance1Before;

    // STATE UPDATES AFTER VERIFYING RECEIVED AMOUNTS
    reserve0 += amount0Received;
    reserve1 += amount1Received;
    _mint(msg.sender, liquidity);

    emit Pair_Mint(msg.sender, amount0Received, amount1Received, liquidity);
}
```

3. For `swap`:

```solidity
function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
    // ... validation and calculations ...

    // Get initial balances
    uint256 balance0Before = IERC20(token0).balanceOf(address(this));
    uint256 balance1Before = IERC20(token1).balanceOf(address(this));

    // EXTERNAL CALLS
    IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
    IERC20(targetToken).safeTransfer(msg.sender, amountOut);

    // STATE UPDATES BASED ON ACTUAL TRANSFERS
    uint256 balance0After = IERC20(token0).balanceOf(address(this));
    uint256 balance1After = IERC20(token1).balanceOf(address(this));

    reserve0 = balance0After;
    reserve1 = balance1After;

    emit Pair_Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
}
```

This reorganization follows the recommended CEI pattern for all functions and provides defense in depth against potential reentrancy vulnerabilities, complementing the lock modifier.
