// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IFactory {
    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint
    );

    function createPair(
        address _tokenA,
        address _tokenB
    ) external returns (address pair);

    function getPairCount() external view returns (uint pairCount);
}
