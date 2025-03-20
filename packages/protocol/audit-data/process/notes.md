# Initial Review

## Context

## Scoping

## Reconnaissance

### Static analysis

#### Slither

- Pair.token0 (contracts/Pair.sol#21) should be immutable
- Pair.token1 (contracts/Pair.sol#22) should be immutable

## Vulnerability identification

### Price manipulation

- The `MINIMUM_LIQUIDITY` constant is set to 10^3, which means that the minimum liquidity amount is 1000 tokens.
- The protocol does not implement price oracles, making it potentially vulnerable to price manipulation in pools with low liquidity.
- For subsequent liquidity provisioning, the protocol doesn't strictly enforce the pool ratio, which could potentially lead to price manipulation if not properly checked.
- This might lead to price slippage / front running, where the attacker can manipulate the price to take advantage of the protocol's liquidity provisioning mechanism.
  **Mitigation:**
- Implement price oracles to ensure fair pricing and prevent price manipulation.
- Add time-based checks to protect against price manipulation.
- Add parameters for the `swap` function like `amountOutMin` to enforce a minimum amount of tokens received for a swap and prevent front running.

### Swapping

- The lack of token address validation might lead to overflows/underflows:
  > [!WARNING]
  > uint256 amountOut = getAmountOut(fromToken, targetToken, amountIn);
  > uint256 reserveIn = \_getReserveFromToken(fromToken); // 0
  > function \_getReserveFromToken(address token) internal view returns (uint256 reserve) {
        if (token == token0) {
            return reserve0;
        } else if (token == token1) {
            return reserve1;
        }
  }

  **Mitigation:** 
  - Add token address validation to prevent overflows/underflows. 
  - revert if the token address is not valid.

## Reporting
