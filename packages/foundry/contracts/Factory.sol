// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IFactory } from "./interfaces/IFactory.sol";
import { Pair } from "./Pair.sol";

/**
 * @title Factory
 * @author Jason Suárez
 * @notice Contract responsible for creating and getting pairs
 */
contract Factory is IFactory {
    address[] public allPairs;
    mapping(address => mapping(address => address)) private pairs;

    /**
     * @notice Function to create a pair (pool)
     * @param token0 address of the first token
     * @param token1 address of the second token
     */
    function createPair(address token0, address token1) external {
        if (token0 == address(0) || token1 == address(0)) {
            revert Factory_ZeroAddress();
        }
        if (token0 == token1) revert Factory_IdenticalAddresses();

        // Checking only for one pair direction is enough
        if (pairs[token0][token1] != address(0)) revert Factory_PoolExists();

        Pair pair = new Pair(token0, token1);
        pairs[token0][token1] = address(pair);
        pairs[token1][token0] = address(pair);
        allPairs.push(address(pair));

        emit PairCreated(token0, token1, address(pair));
    }

    /**
     * @notice Function to get the amount of pairs that have been created
     * @return poolCount the amount of pairs that have been created
     */
    function getPairCount() external view returns (uint256 poolCount) {
        poolCount = allPairs.length;
    }

    /**
     * @notice Function to get the address of a pair
     * @param token0 address of the first token
     * @param token1 address of the second token
     * @return pairAddress address of the pair
     */
    function getPair(address token0, address token1) external view returns (address pairAddress) {
        pairAddress = pairs[token0][token1];
    }
}
