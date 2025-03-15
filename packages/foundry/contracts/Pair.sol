// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IFactory } from "./interfaces/IFactory.sol";
import { IPair } from "./interfaces/IPair.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { console } from "forge-std/console.sol";

contract Pair is IPair, ERC20 {
    using SafeERC20 for IERC20;

    address public token0;
    address public token1;

    uint256 private reserve0;
    uint256 private reserve1;

    uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
    bytes4 internal constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));

    uint256 internal constant FEE_NUMERATOR = 997;
    uint256 internal constant FEE_DENOMINATOR = 1000;
    uint8 internal unlocked = 1;

    modifier lock() {
        if (unlocked == 0) revert Pair_Locked();
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") IPair() {
        token0 = _token0;
        token1 = _token1;
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external lock {
        if (amount0 == 0 || amount1 == 0) revert Pair_InsufficientInput();

        (uint256 _reserve0, uint256 _reserve1) = getReserves();

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // First liquidity provision
            // Require minimum amounts to prevent dust attacks
            if (amount0 < MINIMUM_LIQUIDITY || amount1 < MINIMUM_LIQUIDITY) {
                revert Pair_InsufficientInitialLiquidity();
            }

            // Initial LP tokens = sqrt(amount0 * amount1)
            // This formula ensures that the initial deposit sets the price
            // and subsequent deposits must match this ratio
            uint256 liquidity = Math.sqrt(amount0 * amount1);

            IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
            IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

            _mint(msg.sender, liquidity);

            reserve0 = amount0;
            reserve1 = amount1;

            emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
        } else {
            // Subsequent liquidity provisions

            // Calculate the optimal ratio based on current reserves
            uint256 amount1Optimal = (amount0 * _reserve1) / _reserve0;

            // Check if provided amounts maintain the price ratio within tolerance
            // We allow a small deviation (e.g., 1%) to account for rounding
            uint256 difference = amount1 > amount1Optimal ? amount1 - amount1Optimal : amount1Optimal - amount1;

            if (difference * 100 > amount1Optimal) {
                revert Pair_InvalidPairRatio();
            }

            // Calculate LP tokens to mint
            // We use the minimum of both ratios to ensure fair distribution
            // and maintain the constant product formula
            uint256 liquidity = Math.min((amount0 * _totalSupply) / _reserve0, (amount1 * _totalSupply) / _reserve1);

            if (liquidity == 0) revert Pair_InsufficientLiquidityMinted();

            IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
            IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

            reserve0 += amount0;
            reserve1 += amount1;

            _mint(msg.sender, liquidity);

            emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
        }
    }

    function removeLiquidity(uint256 amount) external lock {
        if (amount == 0) revert Pair_InsufficientInput();

        uint256 _totalSupply = totalSupply();

        uint256 liquidity = balanceOf(msg.sender);

        if (liquidity < amount) revert Pair_InsufficientBalance();

        // Check the amount do not exceed 50% of the total supply
        if ((amount * 10000) / _totalSupply > 5000) {
            revert Pair_ExceededMaxLiquidityRemoval();
        }

        uint256 amount0 = (amount * reserve0) / _totalSupply;
        console.log("amount0", amount0);
        uint256 amount1 = (amount * reserve1) / _totalSupply;
        console.log("amount1", amount1);

        if (amount0 == 0 || amount1 == 0) {
            revert Pair_InsufficientLiquidityBurnt();
        }

        IERC20(token0).safeTransfer(msg.sender, amount0);
        IERC20(token1).safeTransfer(msg.sender, amount1);
        _burn(msg.sender, amount);

        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Pair_Burn(msg.sender, amount0, amount1, msg.sender, amount);
    }

    function swap(address targetToken, address fromToken, uint256 amountIn) external lock {
        if (amountIn == 0) revert Pair_InsufficientInput();

        uint256 amountOut = getAmountOut(targetToken, fromToken, amountIn);

        if (amountOut == 0) revert Pair_InsufficientOutput();

        // First transfer FROM user TO pair
        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
        // Then transfer FROM pair TO user
        IERC20(targetToken).safeTransfer(msg.sender, amountOut);

        // Update reserves based on final balances
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        if (balance0 == 0 || balance1 == 0) revert Pair_InsufficientLiquidity();

        reserve0 = balance0;
        reserve1 = balance1;

        emit Pair_Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
    }

    /* ========== VIEWS ========== */

    function getReserveFromToken(address token) private view returns (uint256 reserve) {
        if (token == token0) {
            return reserve0;
        } else if (token == token1) {
            return reserve1;
        }
    }

    /* *
     * @notice getAmountOut
     * @description This function calculates the amount of tokens that will be received when swapping
     * from the `fromToken` to the `targetToken` using the current reserves.
     * @dev This normalizes the amounts to 18 decimals before performing the calculations. And then
     * normalizes the result back to the original decimals.
     * @param targetToken
     * @param fromToken
     * @param amountIn the normalized (18 decimals) amount of tokens to be swapped
     * @return amountOut the denormalized (original token decimals) amount of tokens that will be received
     */
    function getAmountOut(address targetToken, address fromToken, uint256 amountIn)
        public
        view
        returns (uint256 amountOut)
    {
        uint256 reserveIn = getReserveFromToken(fromToken);
        uint256 reserveOut = getReserveFromToken(targetToken);

        uint256 amountInWithoutFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 numerator = amountInWithoutFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithoutFee;
        amountOut = numerator / denominator;
    }

    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }

    function poolBalance() external view returns (uint256) {
        return totalSupply();
    }
}
