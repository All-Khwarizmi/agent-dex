### [G-2] Inefficient reserve updates in swap function

**Description:**
The `swap` function updates reserve values by making external calls to `balanceOf()` rather than tracking deltas directly:

```solidity
function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
    // ... other code ...

    // External calls to token contracts
    IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
    IERC20(targetToken).safeTransfer(msg.sender, amountOut);

    // Inefficient - makes more external calls
    reserve0 = IERC20(token0).balanceOf(address(this));
    reserve1 = IERC20(token1).balanceOf(address(this));

    // ... emit event ...
}
```

This approach is inconsistent with `addLiquidity` and `removeLiquidity` which directly update reserves using known deltas.

**Impact:**
External calls are expensive in terms of gas. Each `balanceOf()` call:

- Costs more gas than simple arithmetic
- Creates unnecessary contract calls
- Adds ~2100 gas overhead per swap operation

**Recommended Mitigation:**
Update reserves directly using the known input and output amounts:

```solidity
function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
    // ... other code ...

    IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
    IERC20(targetToken).safeTransfer(msg.sender, amountOut);

    // More gas efficient
    if (fromToken == token0) {
        reserve0 += amountIn;
        reserve1 -= amountOut;
    } else {
        reserve0 -= amountOut;
        reserve1 += amountIn;
    }

    // ... emit event ...
}
```

This direct approach will save gas and maintain consistency with other functions in the contract.
