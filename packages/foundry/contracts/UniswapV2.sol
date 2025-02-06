// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUniswapV2Router {
    function getAmountsOut(
        uint amountIn,
        address[] memory path
    ) external view returns (uint[] memory amounts);
}

interface IUniswapV2Factory {
    function getPair(
        address tokenA,
        address tokenB
    ) external view returns (address pair);
}

contract UniswapV2PriceChecker {
    address constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    function getAmountsOut(
        uint amountIn,
        address[] memory path
    ) public view returns (uint[] memory) {
        return IUniswapV2Router(ROUTER).getAmountsOut(amountIn, path);
    }
}
