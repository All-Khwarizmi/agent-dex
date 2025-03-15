// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IFactory {
    error Factory_IdenticalAddresses();
    error Factory_ZeroAddress();
    error Factory_PoolExists();

    event PairCreated(address indexed token0, address indexed token1, address pair);

    function createPair(address token0, address token1) external;

    function getPairCount() external view returns (uint256 pairCount);

    function getPair(address token0, address token1) external view returns (address pair);
}
