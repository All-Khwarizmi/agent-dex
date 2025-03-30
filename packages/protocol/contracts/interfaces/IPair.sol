// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IPair {
    error Pair_ZeroAddress();
    error Pair_IdenticalAddress();
    error Pair_InvalidToken();
    error Pair_SlippageExceeded(uint256 amountOut, uint256 amountOutMin);
    error Pair_IdenticalTokens();
    error Pair_Locked();
    error Pair_InsufficientLiquidity();
    error Pair_InsufficientBalance();
    error Pair_InsufficientLiquidityMinted();
    error Pair_InsufficientLiquidityBurnt();
    error Pair_ExceededMaxLiquidityRemoval();
    error Pair_InsufficientInitialLiquidity();
    error Pair_InsufficientInput();
    error Pair_InsufficientOutput();
    error Pair_InvalidPairRatio();
    error Pair_SwapNotSupported();
    error Pair_TransferFailed();

    event Pair_Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 mintedLiquidity);
    event Pair_Burn(address indexed sender, uint256 amount0, uint256 amount1, uint256 burntLiquidity);
    event Pair_Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
}
