// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

library PairLibrary {
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 FEE_NUMERATOR,
        uint256 FEE_DENOMINATOR
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");

        // Add console logs for debugging
        unchecked {
            // Example: For 1000 USDC -> WETH
            // amountIn = 1000e6
            // reserveIn = 1_000_000e6 (USDC)
            // reserveOut = 500e18 (WETH)
            // FEE_NUMERATOR = 997
            // FEE_DENOMINATOR = 1000

            uint256 amountInWithFee = amountIn * FEE_NUMERATOR; // 997_000e6
            uint256 numerator = amountInWithFee * reserveOut; // 997_000e6 * 500e18
            uint256 denominator = (reserveIn * FEE_DENOMINATOR) +
                amountInWithFee; // (1_000_000e6 * 1000) + 997_000e6
            amountOut = numerator / denominator;
        }

        require(amountOut > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
    }
}
