// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IFactory.sol";
import "./Pair.sol";

/**
 * @title Factory
 * @author Jason Suárez
 * @notice Contract responsible for creating and getting pairs
 */
contract Factory is IFactory {
    IUniswapV2Factory immutable i_uniswapV2Factory =
        IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    IUniswapV2Router immutable i_uniswapV2Router =
        IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    address[] public allPairs;
    mapping(address => mapping(address => address)) public getPair;

    function createPair(
        address token0,
        address token1
    ) public returns (address pair) {
        if (token0 != token1) revert Factory_IdenticalAddresses();
        if (
            getPair[token0][token1] == address(0) ||
            getPair[token1][token0] == address(0)
        ) revert Factory_PoolExists();

        Pair _pair = new Pair(
            token0,
            token1,
            address(i_uniswapV2Factory),
            address(i_uniswapV2Router)
        );
        getPair[token0][token1] = address(_pair);
        getPair[token1][token0] = address(_pair);
        allPairs.push(address(_pair));

        emit PairCreated(token0, token1, address(_pair), allPairs.length);

        return address(_pair);
    }

    function getPairCount() public view returns (uint poolCount) {
        poolCount = allPairs.length;
    }
}
