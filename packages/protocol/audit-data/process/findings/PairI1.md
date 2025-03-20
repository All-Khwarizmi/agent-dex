### [I-1] Reentrancy guard inconsistently applied at internal function instead of public interface

**Description:**
The `Pair` contract implements a reentrancy guard using the `lock` modifier, but this guard is inconsistently applied. While the internal `_addLiquidity` function has the lock modifier, the public-facing `addLiquidity` function does not. This creates an architectural inconsistency in how security mechanisms are applied across the contract.

```solidity
function addLiquidity(uint256 amount0, uint256 amount1) external {
    // No reentrancy protection here
    if (amount0 == 0 || amount1 == 0) revert Pair_InsufficientInput();

    uint256 liquidity = getLiquidityToMint(amount0, amount1);

    if (liquidity == 0) revert Pair_InsufficientLiquidityMinted();

    _addLiquidity(amount0, amount1, liquidity);
}

function _addLiquidity(uint256 amount0, uint256 amount1, uint256 liquidity) internal lock {
    // Reentrancy protection applied here
    IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
    IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

    reserve0 += amount0;
    reserve1 += amount1;

    _mint(msg.sender, liquidity);

    emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
}
```

In testing, we attempted to exploit this using a malicious token with reentrant behavior during the transferFrom call, but the lock modifier on the internal function prevented the attack. However, this still represents a deviation from best practices in security-critical code.

**Impact:**
While there's no immediate path to exploit this in the current implementation, it represents an architectural flaw that:

1. Creates inconsistent protection against reentrancy attacks
2. Could lead to vulnerabilities if the contract is extended or modified
3. Violates the principle of applying security checks at the entry point
4. Introduces a potential attack vector in the calculation and validation steps before the `_addLiquidity` call

A malicious contract could potentially reenter the `addLiquidity` function during token operations in `getLiquidityToMint` if one of the tokens has a hook or callback mechanism.

**Recommended Mitigation:**
Apply the `lock` modifier to the public-facing `addLiquidity` function instead of (or in addition to) the internal function:

```solidity
function addLiquidity(uint256 amount0, uint256 amount1) external lock {
    if (amount0 == 0 || amount1 == 0) revert Pair_InsufficientInput();

    uint256 liquidity = getLiquidityToMint(amount0, amount1);

    if (liquidity == 0) revert Pair_InsufficientLiquidityMinted();

    _addLiquidity(amount0, amount1, liquidity);
}

// Internal function can keep lock or remove it since parent is protected
function _addLiquidity(uint256 amount0, uint256 amount1, uint256 liquidity) internal {
    IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
    IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

    reserve0 += amount0;
    reserve1 += amount1;

    _mint(msg.sender, liquidity);

    emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
}
```

This ensures that the reentrancy protection is applied at the entry point of the function, which is a best practice for smart contract security.
