### [M-2] Potential price manipulation vulnerability with minimum liquidity constant

**Description:**
The `Pair` contract uses a fixed `MINIMUM_LIQUIDITY` constant of 10^3 (1000) for all token pairs, regardless of token decimals or relative value. This constant is used to prevent dust attacks during initial liquidity provision.

```solidity
uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;

function getLiquidityToMint(uint256 amount0, uint256 amount1) public view returns (uint256 liquidity) {
    // ...
    if (_totalSupply == 0) {
        // First liquidity provision
        // Require minimum amounts to prevent dust attacks
        if (amount0 < MINIMUM_LIQUIDITY || amount1 < MINIMUM_LIQUIDITY) {
            revert Pair_InsufficientInitialLiquidity();
        }

        // Initial LP tokens = sqrt(amount0 * amount1)
        liquidity = Math.sqrt(amount0 * amount1);
    }
    // ...
}
```

The issue is that a fixed minimum value doesn't account for differences in token decimals or real-world value. For high-value tokens with few decimals (like WBTC with 8 decimals), the minimum value of 1000 units could be economically significant. Conversely, for tokens with 18 decimals, this minimum might be too small to effectively prevent attacks.

**Impact:**
This one-size-fits-all approach to minimum liquidity could lead to several issues:

1. For valuable tokens with few decimals, legitimate users might be blocked from creating pools with reasonable amounts
2. For standard tokens with 18 decimals, the minimum might be too low to effectively prevent price manipulation
3. Attackers could initialize pools with minimal liquidity to manipulate prices in their favor
4. Initial liquidity providers might gain unfair control over pool pricing
5. The fixed minimum doesn't adapt to token value changes over time

**Proof of Concept:**
Consider two scenarios showing the extremes:

1. **WBTC (8 decimals) paired with USDC (6 decimals)**:

   - 1000 units of WBTC = 0.00001 BTC (at $50,000/BTC ≈ $0.50)
   - 1000 units of USDC = 0.001 USDC (≈ $0.001)
   - These minimums are economically insignificant and could easily be manipulated

2. **An obscure token with 24 decimals paired with a token with 2 decimals**:
   - The minimum would be completely disproportionate between the tokens
   - Creating a valid pool would require extremely imbalanced inputs

A malicious user could:

1. Initialize a pool with minimal amounts
2. Set an artificial extreme price
3. Benefit from arbitrage or front-running opportunities
4. Control pricing in low-liquidity pools

```solidity
// No specific code proof required - this is a conceptual vulnerability
// The issue is in the design decision to use a fixed constant rather than
// a value that accounts for token decimals
```

**Recommended Mitigation:**
Consider implementing one or more of these mitigations:

1. Calculate minimum liquidity based on token decimals:

```solidity
function _getMinimumLiquidity(address _token) internal view returns (uint256) {
    uint8 decimals = IERC20Metadata(_token).decimals();
    return 10 ** (decimals / 2 + 3); // Adjust formula as needed
}
```

2. Implement a more robust first-time liquidity provision model:

```solidity
function addLiquidity(uint256 amount0, uint256 amount1) external {
    // ...
    if (_totalSupply == 0) {
        // Require a substantial initial liquidity
        uint256 value0 = _getTokenValue(token0, amount0);
        uint256 value1 = _getTokenValue(token1, amount1);
        if (value0 < MINIMUM_VALUE_USD || value1 < MINIMUM_VALUE_USD) {
            revert Pair_InsufficientValueForInitialLiquidity();
        }
    }
    // ...
}
```

3. Use a percentage-based approach rather than absolute values:

```solidity
if (_totalSupply == 0) {
    // Require initial liquidity to be at least X% of token's circulating supply
    uint256 supply0 = IERC20(token0).totalSupply();
    uint256 supply1 = IERC20(token1).totalSupply();
    if (amount0 * 10000 / supply0 < MINIMUM_PERCENTAGE ||
        amount1 * 10000 / supply1 < MINIMUM_PERCENTAGE) {
        revert Pair_InsufficientInitialLiquidity();
    }
}
```

4. At a minimum, clearly document this limitation and provide guidance to users on appropriate initial liquidity amounts for different token types.
