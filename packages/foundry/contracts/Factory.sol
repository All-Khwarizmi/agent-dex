// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IFactory.sol";
import "./Pair.sol";

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
        Pair _pair = new Pair(_tokenA, _tokenB);
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
