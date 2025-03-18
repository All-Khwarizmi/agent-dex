// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Pair } from "../../contracts/Pair.sol";

contract Constants {
    Pair internal pair;
    address internal usdc;
    address internal weth;

    address internal immutable USER_1 = address(0x1);
    address internal immutable USER_2 = address(0x2);
    address internal immutable OWNER = address(this);

    uint256 internal constant TOKEN_0_AMOUNT = 100_000_000 * 1e6;
    uint256 internal constant TOKEN_1_AMOUNT = 500_000_000 * 1e18;
    uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
}
