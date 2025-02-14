// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IFactory.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "forge-std/console.sol";

import "./interfaces/IUniswapFactory.sol";
import "./interfaces/IUniswapRouter.sol";
import "./interfaces/PairCore.sol";

// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// internal & private view & pure functions
// external & public view & pure functions

contract Pair is PairCore, ERC20 {
    //TODO: remove pairFactory?
    address private immutable pairFactory;
    address public token0;
    address public token1;

    uint256 private reserve0;
    uint256 private reserve1;

    constructor(
        address _token0,
        address _token1,
        address _factory,
        address _router
    ) ERC20("AgentDEX LP", "LP") PairCore(_factory, _router) {
        token0 = _token0;
        token1 = _token1;
        pairFactory = msg.sender;
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external lock {
        if (amount0 == 0 || amount1 == 0) revert Pair_ZeroAmount();

        (
            uint8 currentDecimalsToken0,
            uint8 currentDecimalsToken1
        ) = getTokensDecimals();

        uint256 normalizedAmount0 = normalizeAmount(
            amount0,
            currentDecimalsToken0,
            this.decimals()
        );

        uint256 normalizedAmount1 = normalizeAmount(
            amount1,
            currentDecimalsToken1,
            this.decimals()
        );

        (
            uint256 normalizedReserve0,
            uint256 normalizedReserve1
        ) = normalizeReserves();

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // First liquidity provision
            // Require minimum amounts to prevent dust attacks
            if (amount0 < MINIMUM_LIQUIDITY || amount1 < MINIMUM_LIQUIDITY)
                revert Pair_InsufficientInitialLiquidity();

            // Initial LP tokens = sqrt(normalizedAmount0 * amount1)
            // This formula ensures that the initial deposit sets the price
            // and subsequent deposits must match this ratio
            uint256 liquidity = Math.sqrt(
                normalizedAmount0 * normalizedAmount1
            );

            // Lock minimum liquidity forever by burning it
            // This prevents the pool from being fully drained and price manipulation
            _mint(address(this), liquidity); // Lock minimum liquidity forever by burning to address(0)
            _burn(address(this), MINIMUM_LIQUIDITY);
            this.transfer(msg.sender, liquidity - MINIMUM_LIQUIDITY);

            _safeTransferFrom(token0, msg.sender, address(this), amount0);
            _safeTransferFrom(token1, msg.sender, address(this), amount1);

            reserve0 = amount0;
            reserve1 = amount1;

            emit Investment(msg.sender, liquidity);
            emit Mint(msg.sender, amount0, amount1, liquidity);
        } else {
            // Subsequent liquidity provisions

            // Calculate the optimal ratio based on current reserves
            // amount1Optimal = normalizedAmount0 * (reserve1 / reserve0)
            uint256 amount1Optimal = (normalizedAmount0 * normalizedReserve1) /
                normalizedReserve0;

            // Check if provided amounts maintain the price ratio within tolerance
            // We allow a small deviation (e.g., 1%) to account for rounding
            uint256 difference = normalizedAmount1 > amount1Optimal
                ? normalizedAmount1 - amount1Optimal
                : amount1Optimal - normalizedAmount1;

            require(
                difference * 100 <= amount1Optimal,
                "AgentDEX: INVALID_RATIO"
            );

            // Calculate LP tokens to mint
            // We use the minimum of both ratios to ensure fair distribution
            // and maintain the constant product formula
            uint256 liquidity = Math.min(
                (normalizedAmount0 * _totalSupply) / normalizedReserve0,
                (normalizedAmount1 * _totalSupply) / normalizedReserve1
            );
            require(liquidity > 0, "AgentDEX: INSUFFICIENT_LIQUIDITY_MINTED");

            _mint(msg.sender, liquidity);
            _safeTransferFrom(token0, msg.sender, address(this), amount0);
            _safeTransferFrom(token1, msg.sender, address(this), amount1);

            reserve0 += amount0;
            reserve1 += amount1;

            emit Investment(msg.sender, liquidity);
            emit Mint(msg.sender, amount0, amount1, liquidity);
        }
    }

    function removeLiquidity(uint256 amount) external lock {
        require(amount > 0, "AgentDEX: INSUFFICIENT_INPUT");

        uint256 _totalSupply = totalSupply();

        uint256 liquidity = balanceOf(msg.sender);

        require(
            liquidity >= amount,
            "AgentDEX: INSUFFICIENT_LIQUIDITY_BALANCE"
        );
        // Check the amount do not exceed 10% of the total supply
        console.log("Total Supply:", _totalSupply);
        console.log("Amount:", amount);
        require(
            (amount * 10000) / _totalSupply < 1000,
            "AgentDEX: INSUFFICIENT_LIQUIDITY_BALANCE"
        );

        uint256 amount0 = (amount * reserve0) / _totalSupply;
        uint256 amount1 = (amount * reserve1) / _totalSupply;

        require(
            amount0 > 0 && amount1 > 0,
            "AgentDEX: INSUFFICIENT_LIQUIDITY_BURNED"
        );

        _burn(msg.sender, amount);
        _safeTransfer(token0, msg.sender, amount0);
        _safeTransfer(token1, msg.sender, amount1);

        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Divestment(msg.sender, amount);

        emit Burn(msg.sender, amount0, amount1, msg.sender, amount);
    }

    function swap(
        address targetToken,
        address fromToken,
        uint amountIn
    ) external lock {
        require(amountIn > 0, "AgentDEX: INSUFFICIENT_INPUT_AMOUNT");

        uint256 normalizedAmountIn = normalizeAmount(
            amountIn,
            ERC20(fromToken).decimals(),
            this.decimals()
        );

        // Log initial state with token addresses
        console.log("\n=== Pre-Swap State ===");
        console.log("From Token:", fromToken);
        console.log("Target Token:", targetToken);
        console.log("Token0:", token0);
        console.log("Token1:", token1);

        // Calculate amount out
        uint256 amountOut = getAmountOut(
            targetToken,
            fromToken,
            normalizedAmountIn
        );
        require(amountOut > 0, "AgentDEX: INSUFFICIENT_OUTPUT_AMOUNT");

        // 1. Check if uniswapV2 has better price
        (bool shouldSwapLocally, uint256 uniswapAmount) = uniswapHasBetterPrice(
            amountIn,
            fromToken,
            targetToken,
            amountOut
        );

        console.log("\n=== Should Swap With Uniswap? ===");
        console.log("Should Swap With Uniswap:", !shouldSwapLocally);
        console.log("Uniswap Amount:", uniswapAmount);

        // 2. And if we can swap locally
        bool _shouldSwap = shouldSwap(targetToken, fromToken, amountIn);

        // 3. If uniswap has better price or we can't swap locally, swap with uniswapV2
        if (!shouldSwapLocally || !_shouldSwap) {
            // First transfer FROM user TO pair
            _safeTransferFrom(fromToken, msg.sender, address(this), amountIn);

            // Calculate fees
            uint256 fees = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
            amountIn = amountIn - fees;
            uniswapAmount = uniswapAmount - fees;

            // Approve the router to spend the amountIn
            ERC20(fromToken).approve(address(i_uniswapV2Router), amountIn);

            uint256 amountOutMin = (uniswapAmount * 999) / 1000;
            address[] memory path = new address[](2);
            path[0] = fromToken;
            path[1] = targetToken;

            uint[] memory amounts = i_uniswapV2Router.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                address(this),
                block.timestamp
            );

            // Transfer tokens to user
            ERC20(targetToken).transfer(msg.sender, amounts[1]);

            console.log("\n=== Post-Transfer Balances ===");
            console.log("amount from uniswap:", amounts[amounts.length - 1]);
            console.log(
                "Pair From Token:",
                ERC20(fromToken).balanceOf(address(this))
            );
            console.log(
                "Pair Target Token:",
                ERC20(targetToken).balanceOf(address(this))
            );
            console.log(
                "User From Token:",
                ERC20(fromToken).balanceOf(msg.sender)
            );
            console.log(
                "User Target Token:",
                ERC20(targetToken).balanceOf(msg.sender)
            );

            emit SwapForwarded(
                msg.sender,
                fromToken,
                targetToken,
                amountIn,
                amountOut
            );

            return;
        }

        // Log pre-transfer balances
        console.log("\n=== Pre-Transfer Balances ===");
        console.log(
            "Pair From Token:",
            ERC20(fromToken).balanceOf(address(this))
        );
        console.log(
            "Pair Target Token:",
            ERC20(targetToken).balanceOf(address(this))
        );
        console.log("User From Token:", ERC20(fromToken).balanceOf(msg.sender));
        console.log(
            "User Target Token:",
            ERC20(targetToken).balanceOf(msg.sender)
        );

        // First transfer FROM user TO pair
        _safeTransferFrom(fromToken, msg.sender, address(this), amountIn);

        // Verify first transfer
        require(
            ERC20(fromToken).balanceOf(address(this)) >= amountIn,
            "AgentDEX: INPUT_TRANSFER_FAILED"
        );

        // Then transfer FROM pair TO user
        require(
            ERC20(targetToken).balanceOf(address(this)) >= amountOut,
            "AgentDEX: INSUFFICIENT_TARGET_BALANCE"
        );

        _safeTransfer(targetToken, msg.sender, amountOut);

        // Verify second transfer
        uint256 userTargetBalance = ERC20(targetToken).balanceOf(msg.sender);
        require(userTargetBalance > 0, "AgentDEX: OUTPUT_TRANSFER_FAILED");

        // Update reserves based on final balances
        uint256 balance0 = ERC20(token0).balanceOf(address(this));
        uint256 balance1 = ERC20(token1).balanceOf(address(this));

        console.log("\n=== Post-Transfer Balances ===");
        console.log(
            "Pair From Token:",
            ERC20(fromToken).balanceOf(address(this))
        );
        console.log(
            "Pair Target Token:",
            ERC20(targetToken).balanceOf(address(this))
        );
        console.log("User From Token:", ERC20(fromToken).balanceOf(msg.sender));
        console.log(
            "User Target Token:",
            ERC20(targetToken).balanceOf(msg.sender)
        );

        reserve0 = balance0;
        reserve1 = balance1;

        require(
            reserve0 > 0 && reserve1 > 0,
            "AgentDEX: INSUFFICIENT_LIQUIDITY"
        );

        emit Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
    }

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(SELECTOR, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "AgentDEX: TRANSFER_FAILED"
        );
    }

    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint value
    ) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(ERC20.transferFrom.selector, from, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "AgentDEX: TRANSFER_FAILED"
        );
    }

    // Normalize amount to 18 decimals
    function normalizeAmount(
        uint256 amount,
        uint8 currentDecimals,
        uint8 targetDecimals
    ) public pure returns (uint256) {
        if (currentDecimals == targetDecimals) {
            return amount;
        }
        if (currentDecimals > targetDecimals) {
            return amount / (10 ** (currentDecimals - targetDecimals));
        }
        return amount * (10 ** (targetDecimals - currentDecimals));
    }

    // Normalize reserves to 18 decimals
    function normalizeReserves()
        public
        view
        returns (uint256 normalizedReserve0, uint256 normalizedReserve1)
    {
        normalizedReserve0 = normalizeAmount(
            reserve0,
            ERC20(token0).decimals(),
            this.decimals()
        );

        normalizedReserve1 = normalizeAmount(
            reserve1,
            ERC20(token1).decimals(),
            this.decimals()
        );

        return (normalizedReserve0, normalizedReserve1);
    }

    /* ========== VIEWS ========== */
    function getTokensDecimals() private view returns (uint8, uint8) {
        return (ERC20(token0).decimals(), ERC20(token1).decimals());
    }

    function getReserves()
        external
        view
        returns (uint256 _reserve0, uint256 _reserve1)
    {
        return (reserve0, reserve1);
    }

    function poolBalance() external view returns (uint256) {
        return totalSupply();
    }

    function getReservesFromToken(
        address token
    ) public view returns (uint256 reserves) {
        if (token == token0) {
            return reserve0;
        } else if (token == token1) {
            return reserve1;
        }
    }

    function getReservesNormalizedFromToken(
        address token
    ) private view returns (uint256 reserves) {
        if (token == token0) {
            return
                normalizeAmount(
                    reserve0,
                    ERC20(token0).decimals(),
                    this.decimals()
                );
        } else if (token == token1) {
            return
                normalizeAmount(
                    reserve1,
                    ERC20(token1).decimals(),
                    this.decimals()
                );
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
    function getAmountOut(
        address targetToken,
        address fromToken,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        uint256 reserveIn = getReservesNormalizedFromToken(fromToken);
        uint256 reserveOut = getReservesNormalizedFromToken(targetToken);

        uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        amountOut = numerator / denominator;

        // Normalize to target token decimals
        amountOut = normalizeAmount(
            amountOut,
            this.decimals(),
            ERC20(targetToken).decimals()
        );
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
    function shouldSwap(
        address targetToken,
        address fromToken,
        uint256 amountIn
    ) public view returns (bool) {
        // Get reserves and normalize amounts to 18 decimals
        uint256 reserveIn = getReservesNormalizedFromToken(fromToken);
        uint256 reserveOut = getReservesNormalizedFromToken(targetToken);
        uint256 normalizedAmountIn = normalizeAmount(
            amountIn,
            ERC20(fromToken).decimals(),
            this.decimals()
        );

        // Log initial values
        console.log("\n=== Should Swap Check ===");
        console.log("Input Amount:", amountIn);
        console.log("Input Amount Normalized:", normalizedAmountIn);
        console.log("Reserve In (normalized):", reserveIn / 1e18);
        console.log("Reserve Out (normalized):", reserveOut / 1e18);

        uint256 amountOut = getAmountOut(
            targetToken,
            fromToken,
            normalizedAmountIn
        );
        require(amountOut > 0, "INSUFFICIENT_OUTPUT_AMOUNT");

        uint256 priceImpact = (normalizedAmountIn * 10000) / reserveIn;

        uint256 reserveRatio = (amountOut * 10000) / reserveOut;

        console.log("Amount Out:", amountOut);
        console.log("Price Impact (bps):", priceImpact);
        console.log("Reserve Ratio (bps):", reserveRatio);

        bool sufficientReserves = amountOut <= reserveOut / 2;
        bool acceptablePriceImpact = priceImpact <= 25; // 0.25%
        bool acceptableReserveRatio = reserveRatio <= 10; // 0.1%

        console.log("\n=== Swap Checks ===");
        console.log("Sufficient Reserves:", sufficientReserves);
        console.log("Acceptable Price Impact:", acceptablePriceImpact);
        console.log("Acceptable Reserve Ratio:", acceptableReserveRatio);

        return
            sufficientReserves &&
            acceptablePriceImpact &&
            acceptableReserveRatio;
    }

    function uniswapHasBetterPrice(
        uint256 amountIn,
        address fromToken,
        address targetToken,
        uint256 amountOut
    ) public view returns (bool shouldSwapLocally, uint256 uniswapAmount) {
        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = targetToken;
        uint256[] memory amounts = i_uniswapV2Router.getAmountsOut(
            amountIn,
            path
        );
        uniswapAmount = amounts[amounts.length - 1];

        shouldSwapLocally = amountOut >= uniswapAmount;
        console.log("Better than Uniswap: %s", shouldSwapLocally);
    }
}
