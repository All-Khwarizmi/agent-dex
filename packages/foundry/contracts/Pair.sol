// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { IFactory } from "./interfaces/IFactory.sol";
import { IPair } from "./interfaces/IPair.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pair is IPair, ERC20 {
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

        (uint8 currentDecimalsToken0, uint8 currentDecimalsToken1) = getTokensDecimals();

        uint256 normalizedAmount0 = normalizeAmount(amount0, currentDecimalsToken0, this.decimals());

        uint256 normalizedAmount1 = normalizeAmount(amount1, currentDecimalsToken1, this.decimals());

        (uint256 normalizedReserve0, uint256 normalizedReserve1) = normalizedReserves();

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // First liquidity provision
            // Require minimum amounts to prevent dust attacks
            if (amount0 < MINIMUM_LIQUIDITY || amount1 < MINIMUM_LIQUIDITY) {
                revert Pair_InsufficientInitialLiquidity();
            }

            // Initial LP tokens = sqrt(normalizedAmount0 * amount1)
            // This formula ensures that the initial deposit sets the price
            // and subsequent deposits must match this ratio
            uint256 liquidity = Math.sqrt(normalizedAmount0 * normalizedAmount1);

            _mint(address(this), liquidity);
            this.transfer(msg.sender, liquidity);

            _safeTransferFrom(token0, msg.sender, address(this), amount0);
            _safeTransferFrom(token1, msg.sender, address(this), amount1);

            reserve0 = amount0;
            reserve1 = amount1;

            emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
        } else {
            // Subsequent liquidity provisions

            // Calculate the optimal ratio based on current reserves
            uint256 amount1Optimal = (normalizedAmount0 * normalizedReserve1) / normalizedReserve0;

            // Check if provided amounts maintain the price ratio within tolerance
            // We allow a small deviation (e.g., 1%) to account for rounding
            uint256 difference = normalizedAmount1 > amount1Optimal
                ? normalizedAmount1 - amount1Optimal
                : amount1Optimal - normalizedAmount1;

            if (difference * 100 > amount1Optimal) {
                revert Pair_InvalidPairRatio();
            }

            // Calculate LP tokens to mint
            // We use the minimum of both ratios to ensure fair distribution
            // and maintain the constant product formula
            uint256 liquidity = Math.min(
                (normalizedAmount0 * _totalSupply) / normalizedReserve0,
                (normalizedAmount1 * _totalSupply) / normalizedReserve1
            );
            if (liquidity == 0) revert Pair_InsufficientLiquidityMinted();

            _mint(msg.sender, liquidity);
            _safeTransferFrom(token0, msg.sender, address(this), amount0);
            _safeTransferFrom(token1, msg.sender, address(this), amount1);

            reserve0 += amount0;
            reserve1 += amount1;

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
        uint256 amount1 = (amount * reserve1) / _totalSupply;

        if (amount0 == 0 || amount1 == 0) {
            revert Pair_InsufficientLiquidityBurnt();
        }

        _burn(msg.sender, amount);
        _safeTransfer(token0, msg.sender, amount0);
        _safeTransfer(token1, msg.sender, amount1);

        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Pair_Burn(msg.sender, amount0, amount1, msg.sender, amount);
    }

    function swap(address targetToken, address fromToken, uint256 amountIn) external lock {
        if (amountIn == 0) revert Pair_InsufficientInput();

        uint256 normalizedAmountIn = normalizeAmount(amountIn, ERC20(fromToken).decimals(), this.decimals());

        uint256 amountOut = getAmountOut(targetToken, fromToken, normalizedAmountIn);

        if (amountOut == 0) revert Pair_InsufficientOutput();

        // 2. And if we can swap locally
        bool _shouldSwap = shouldSwap(targetToken, fromToken, amountIn);

        // 3. If uniswap has better price or we can't swap locally, swap with uniswapV2
        if (!_shouldSwap) {
            revert Pair_SwapNotSupported();
        }

        // First transfer FROM user TO pair
        _safeTransferFrom(fromToken, msg.sender, address(this), amountIn);

        // Then transfer FROM pair TO user
        _safeTransfer(targetToken, msg.sender, amountOut);

        // Update reserves based on final balances
        uint256 balance0 = ERC20(token0).balanceOf(address(this));
        uint256 balance1 = ERC20(token1).balanceOf(address(this));
        if (balance0 == 0 || balance1 == 0) revert Pair_InsufficientLiquidity();

        reserve0 = balance0;
        reserve1 = balance1;

        emit Pair_Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
    }

    /* ========== VIEWS ========== */
    function getTokensDecimals() private view returns (uint8, uint8) {
        return (ERC20(token0).decimals(), ERC20(token1).decimals());
    }

    function getReserveFromToken(address token) private view returns (uint256 reserve) {
        if (token == token0) {
            return reserve0;
        } else if (token == token1) {
            return reserve1;
        }
    }

    function getReserveNormalizedFromToken(address token) private view returns (uint256 reserve) {
        return normalizeAmount(getReserveFromToken(token), ERC20(token).decimals(), this.decimals());
    }

    function normalizeAmount(uint256 amount, uint8 currentDecimals, uint8 targetDecimals)
        internal
        pure
        returns (uint256)
    {
        if (currentDecimals == targetDecimals) {
            return amount;
        }
        if (currentDecimals > targetDecimals) {
            return amount / (10 ** (currentDecimals - targetDecimals));
        }
        return amount * (10 ** (targetDecimals - currentDecimals));
    }

    function _safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        if (!success || data.length == 0 || !abi.decode(data, (bool))) {
            revert Pair_TransferFailed();
        }
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(ERC20.transferFrom.selector, from, to, value));
        if (!success || data.length == 0 || !abi.decode(data, (bool))) {
            revert Pair_TransferFailed();
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
        uint256 reserveIn = getReserveNormalizedFromToken(fromToken);
        uint256 reserveOut = getReserveNormalizedFromToken(targetToken);

        uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        amountOut = numerator / denominator;

        // Normalize to target token decimals
        amountOut = normalizeAmount(amountOut, this.decimals(), ERC20(targetToken).decimals());
    }

    // Normalize reserves to 18 decimals
    function normalizedReserves() public view returns (uint256 normalizedReserve0, uint256 normalizedReserve1) {
        normalizedReserve0 = normalizeAmount(reserve0, ERC20(token0).decimals(), this.decimals());

        normalizedReserve1 = normalizeAmount(reserve1, ERC20(token1).decimals(), this.decimals());

        return (normalizedReserve0, normalizedReserve1);
    }

    /* *
     * @notice shouldSwap
     * @description This function checks if the amount of tokens received when swapping from the
     * `fromToken` to the `targetToken` is greater than the amount of tokens received when swapping
     * from the `fromToken` to the `targetToken` using Uniswap V2.
     * @dev This normalizes the amounts to 18 decimals before performing the calculations.
     * @param targetToken
     * @param fromToken
     * @param amountIn
     */
    function shouldSwap(address targetToken, address fromToken, uint256 amountIn) public view returns (bool) {
        // Get reserves and normalize amounts to 18 decimals
        uint256 reserveIn = getReserveNormalizedFromToken(fromToken);
        uint256 reserveOut = getReserveNormalizedFromToken(targetToken);
        uint256 normalizedAmountIn = normalizeAmount(amountIn, ERC20(fromToken).decimals(), this.decimals());

        uint256 amountOut = getAmountOut(targetToken, fromToken, normalizedAmountIn);
        if (amountOut == 0) revert Pair_InsufficientOutput();

        uint256 priceImpact = (normalizedAmountIn * 10000) / reserveIn;

        uint256 reserveRatio = (amountOut * 10000) / reserveOut;

        bool sufficientReserves = amountOut <= reserveOut / 2;
        bool acceptablePriceImpact = priceImpact <= 25; // 0.25%
        bool acceptableReserveRatio = reserveRatio <= 10; // 0.1%

        return sufficientReserves && acceptablePriceImpact && acceptableReserveRatio;
    }

    function getReserves() external view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }

    function poolBalance() external view returns (uint256) {
        return totalSupply();
    }
}
