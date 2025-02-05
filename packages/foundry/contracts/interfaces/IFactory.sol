// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

abstract contract IFactory {
    address[] public tokenList;
    mapping(address => address) tokenToPool;
    mapping(address => address) poolToToken;

    function launchExchange(
        address _token
    ) public virtual returns (address pool);

    function getPoolCount() public view virtual returns (uint poolCount);

    function tokenToPoolLookup(
        address _token
    ) public view virtual returns (address pool);

    function poolToTokenLookup(
        address _pool
    ) public view virtual returns (address token);

    event PoolLaunch(address indexed pool, address indexed token);
}
