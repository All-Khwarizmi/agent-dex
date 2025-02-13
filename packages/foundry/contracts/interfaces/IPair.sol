// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IPair {
    event Mint(
        address indexed sender,
        uint amount0,
        uint amount1,
        uint mintedLiquidity
    );
    event Burn(
        address indexed sender,
        uint amount0,
        uint amount1,
        address indexed to,
        uint burntLiquidity
    );
    event Swap(
        address indexed sender,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut
    );
    event SwapForwarded(
        address user,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut
    );

    event Investment(
        address indexed liquidityProvider,
        uint256 indexed sharesPurchased
    );
    event Divestment(
        address indexed liquidityProvider,
        uint256 indexed sharesBurned
    );
}
