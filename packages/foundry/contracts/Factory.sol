// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IFactory } from "./interfaces/IFactory.sol";
import { Pair, IUniswapV2Factory, IUniswapV2Router } from "./Pair.sol";

/**
 * @title Factory
 * @author Jason Suárez
 * @notice Contract responsible for creating and getting pairs
 */
contract Factory is IFactory {
    IUniswapV2Factory immutable i_uniswapV2Factory;
    IUniswapV2Router immutable i_uniswapV2Router;

    address[] public allPairs;
    mapping(address => mapping(address => address)) public getPair;

    constructor(address uniswapFactory, address uniswapRouter) {
        i_uniswapV2Factory = IUniswapV2Factory(uniswapFactory);
        i_uniswapV2Router = IUniswapV2Router(uniswapRouter);
    }

    /**
     * @notice Function to create a pair (pool)
     * @param token0 address of the first token
     * @param token1 address of the second token
     */
    function createPair(address token0, address token1) external returns (address pair) {
        if (token0 == address(0) || token1 == address(0)) {
            revert Factory_ZeroAddress();
        }
        if (token0 == token1) revert Factory_IdenticalAddresses();
        if (getPair[token0][token1] != address(0) || getPair[token1][token0] != address(0)) revert Factory_PoolExists();

        Pair _pair = new Pair(token0, token1, address(i_uniswapV2Factory), address(i_uniswapV2Router));
        address pairAddress = address(_pair);
        getPair[token0][token1] = pairAddress;
        getPair[token1][token0] = pairAddress;
        allPairs.push(pairAddress);

        emit PairCreated(token0, token1, pairAddress, allPairs.length);

        return pairAddress;
    }

    /**
     * @notice Function to get the amount of pairs that have been created
     * @return poolCount the amount of pairs that have been created
     */
    function getPairCount() external view returns (uint256 poolCount) {
        poolCount = allPairs.length;
    }
}
