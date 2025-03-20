### [G-1] token0 and token1 should be immutable

**Description:**
The `token0` and `token1` state variables in the Pair contract are initialized in the constructor and never modified afterward, making them perfect candidates for the `immutable` modifier.

```solidity
// Current implementation
address public token0;
address public token1;

constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") IPair() {
    token0 = _token0;
    token1 = _token1;
}
```

Using the `immutable` modifier for these variables would:

1. Reduce gas cost for reading these values
2. Make it clear that these values never change

**Impact:**
Each time `token0` or `token1` is accessed, the contract performs a SLOAD operation which costs 100 gas. With immutable variables, the values are burned into the bytecode, making reads essentially free.

These variables are read in multiple functions including `swap`, `getAmountOut`, and `_getReserveFromToken`, so the gas savings would be applied to every swap and liquidity operation.

**Recommended Mitigation:**
Declare the token variables as immutable:

```solidity
address public immutable token0;
address public immutable token1;

constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") IPair() {
    token0 = _token0;
    token1 = _token1;
}
```

This change is risk-free as it does not alter any behavior, only improves gas efficiency.
