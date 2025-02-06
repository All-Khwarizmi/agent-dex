// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IFactory.sol";
import "./Pair.sol";

import "./interfaces/IUniswapFactory.sol";
import "./interfaces/IUniswapRouter.sol";

contract Factory is IFactory {
    address[] public allPairs;
    mapping(address => mapping(address => address)) public getPair;

    function createPair(
        address _tokenA,
        address _tokenB
    ) public returns (address pair) {
        require(_tokenA != _tokenB, "IDENTICAL_ADDRESSES");
        require(getPair[_tokenA][_tokenB] == address(0), "POOL_EXISTS");
        require(getPair[_tokenB][_tokenA] == address(0), "POOL_EXISTS");

        IUniswapV2Factory factory = IUniswapV2Factory(
            0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
        );
        IUniswapV2Router router = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );

        Pair _pair = new Pair(
            _tokenA,
            _tokenB,
            address(factory),
            address(router)
        );
        getPair[_tokenA][_tokenB] = address(_pair);
        getPair[_tokenB][_tokenA] = address(_pair);
        allPairs.push(address(_pair));

        emit PairCreated(_tokenA, _tokenB, address(_pair), allPairs.length);

        return address(_pair);
    }

    function getPairCount() public view returns (uint poolCount) {
        poolCount = allPairs.length;
    }
}
