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

        unchecked {
            uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
            uint256 numerator = amountInWithFee * reserveOut;
            uint256 denominator = (reserveIn * FEE_DENOMINATOR) +
                amountInWithFee;
            amountOut = numerator / denominator;
        }

        require(amountOut > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
    }
}
