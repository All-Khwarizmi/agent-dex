// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IFactory } from "./interfaces/IFactory.sol";
import { IPair } from "./interfaces/IPair.sol";

/**
 * @title Pair
 * @author Jason Suárez
 * @notice This contract is inspired by UniswapV2Pair.sol and should be deployed from the Factory contract.
 * @notice Being an AMM that allows users to swap tokens with each other and provide liquidity to the pool for earning fees, it collects 0.3% of all swaps.
 * @dev  The main invariant of the pair is the constant product of the reserves of both tokens.
 */
contract Pair is IPair, ERC20 {
    using SafeERC20 for IERC20;

    address public token0;
    address public token1;

    uint256 private reserve0;
    uint256 private reserve1;

    uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
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
    /*//////////////////////////////////////////////////////////////
                                EXTERNAL & PUBLIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice This function is used to add liquidity to the pair. It takes two parameters:
     * @param amount0  the amount of `token0` in the pair.
     * @param amount1  the amount of `token1` in the pair.
     */
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        if (amount0 == 0 || amount1 == 0) revert Pair_InsufficientInput();

        uint256 liquidity = getLiquidityToMint(amount0, amount1);

        if (liquidity == 0) revert Pair_InsufficientLiquidityMinted();

        _addLiquidity(amount0, amount1, liquidity);
    }

    function removeLiquidity(uint256 amount) external lock {
        uint256 _totalSupply = totalSupply();

        uint256 liquidity = balanceOf(msg.sender);

        if (liquidity < amount) {
            revert Pair_InsufficientBalance();
        }

        uint256 amount0 = (amount * reserve0) / _totalSupply;
        uint256 amount1 = (amount * reserve1) / _totalSupply;

        if (amount0 == 0 || amount1 == 0) {
            revert Pair_InsufficientLiquidityBurnt();
        }

        IERC20(token0).safeTransfer(msg.sender, amount0);
        IERC20(token1).safeTransfer(msg.sender, amount1);
        _burn(msg.sender, amount);

        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Pair_Burn(msg.sender, amount0, amount1, amount);
    }

    /**
     * @notice This function swaps tokens from one token to another.
     * @dev The core logic of the amountOut calculation is in the `getAmountOut` function which is responsible for maintaining the invariant.
     * @param targetToken address of the token to send
     * @param fromToken address of the token to receive
     * @param amountIn amount of tokens to be swapped
     */
    function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
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

        reserve0 = balance0;
        reserve1 = balance1;

        emit Pair_Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
    }

    /**
     * @notice This function calculates the amount of tokens that will be received when swapping
     * from the `fromToken` to the `targetToken` using the current reserves.
     * @param targetToken address of the token to send
     * @param fromToken address of the token to receive
     * @param amountIn  amount of tokens to be swapped
     * @return amountOut amount of tokens that will be received
     */
    function getAmountOut(address targetToken, address fromToken, uint256 amountIn)
        public
        view
        returns (uint256 amountOut)
    {
        uint256 reserveIn = _getReserveFromToken(fromToken);
        uint256 reserveOut = _getReserveFromToken(targetToken);

        uint256 amountInWithoutFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 numerator = amountInWithoutFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithoutFee;
        amountOut = numerator / denominator;
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNAL
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice This is an internal function to add liquidity to the pool.
     * @param amount0 It correspond to token0
     * @param amount1 It correspond to token1
     * @param liquidity The amount of liquidity provided by the sender that will be minted on its behalf.
     */
    function _addLiquidity(uint256 amount0, uint256 amount1, uint256 liquidity) internal lock {
        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);

        reserve0 += amount0;
        reserve1 += amount1;

        _mint(msg.sender, liquidity);

        emit Pair_Mint(msg.sender, amount0, amount1, liquidity);
    }

    /**
     * @notice This is an internal utility function to get the reserve of a given token.
     * @param token address of the token to get the reserve from
     * @return reserve the reserve of the token
     */
    function _getReserveFromToken(address token) internal view returns (uint256 reserve) {
        if (token == token0) {
            return reserve0;
        } else if (token == token1) {
            return reserve1;
        }
    }
    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }
    /**
     * @notice This is an internal function to calculate the liquidity to mint.
     * @param amount0 the amount of `token0` in the pair.
     * @param amount1 the amount of `token1` in the pair.
     * @return liquidity the amount of liquidity to mint
     */

    function getLiquidityToMint(uint256 amount0, uint256 amount1) public view returns (uint256 liquidity) {
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
            liquidity = Math.sqrt(amount0 * amount1);
        } else {
            // Subsequent liquidity provisions

            // Calculate LP tokens to mint
            // We use the minimum of both ratios to ensure fair distribution
            // and maintain the constant product formula
            liquidity = Math.min((amount0 * _totalSupply) / _reserve0, (amount1 * _totalSupply) / _reserve1);
        }
    }

    function poolBalance() external view returns (uint256) {
        return totalSupply();
    }
}
