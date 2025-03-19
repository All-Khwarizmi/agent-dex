// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IFactory } from "./interfaces/IFactory.sol";
import { Pair } from "./Pair.sol";

/**
 * @title Factory
 * @author Jason Suárez
 * @notice Creates and tracks liquidity pairs for the AgentDEX protocol
 * @dev Maintains a registry of all created pairs and prevents duplicate pair creation
 *      Each pair is an instance of the Pair contract
 */
contract Factory is IFactory {
    address[] public allPairs;
    mapping(address => mapping(address => address)) private pairs;

    /**
     * @notice Creates a new liquidity pool for a token pair
     * @dev Deploys a new Pair contract and records its address
     * @param token0 Address of the first token
     * @param token1 Address of the second token
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
     * @notice Returns the total number of pairs created through the factory
     * @return poolCount Number of pairs created
     */
    function getPairCount() external view returns (uint256 poolCount) {
        poolCount = allPairs.length;
    }

    /**
     * @notice Returns the address of the pair for the given tokens
     * @dev Returns address(0) if pair doesn't exist
     * @param token0 Address of the first token
     * @param token1 Address of the second token
     * @return pairAddress Address of the pair
     */
    function getPair(address token0, address token1) external view returns (address pairAddress) {
        pairAddress = pairs[token0][token1];
    }
}
