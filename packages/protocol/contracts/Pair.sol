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
 * @notice Automated Market Maker (AMM) contract for a token pair
 * @dev Implements constant product formula (x * y = k) with a 0.3% swap fee
 *      Issues ERC20 LP tokens representing shares of the pool
 *      Uses reentrancy protection for all state-changing operations
 */
contract Pair is IPair, ERC20 {
    using SafeERC20 for IERC20;

    address public token0; // @audit : gas optimization - should be immutable
    address public token1; // @audit : gas optimization - should be immutable

    uint256 private reserve0;
    uint256 private reserve1;

    uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
    uint256 internal constant FEE_NUMERATOR = 997;
    uint256 internal constant FEE_DENOMINATOR = 1000;
    uint8 internal unlocked = 1;

    modifier lock() {
        // @audit : check this assertion : Uses reentrancy protection for all state-changing operations
        if (unlocked == 0) revert Pair_Locked();
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") IPair() {
        // @audit : unnecessary constructor for interface
        token0 = _token0;
        token1 = _token1;
    }
    /*//////////////////////////////////////////////////////////////
                                EXTERNAL & PUBLIC
    //////////////////////////////////////////////////////////////*/
    // @audit : missing fallback function. Users can send ether to the contract and lose their funds

    /**
     * @notice Adds liquidity to the pool by depositing token0 and token1
     * @dev Mints LP tokens proportional to the contribution relative to current reserves
     * @param amount0 Amount of token0 to add
     * @param amount1 Amount of token1 to add
     */
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        // @audit : reentrancy guard set on the `_addLiquidity` helper function instead of the `addLiquidity` function
        if (amount0 == 0 || amount1 == 0) revert Pair_InsufficientInput();

        uint256 liquidity = getLiquidityToMint(amount0, amount1);

        if (liquidity == 0) revert Pair_InsufficientLiquidityMinted();

        _addLiquidity(amount0, amount1, liquidity);
    }

    /**
     * @notice Removes liquidity from the pool and burns LP tokens
     * @dev Returns token0 and token1 proportional to the LP amount burned
     * @param amount Amount of LP tokens to burn
     */
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
        // @audit : CEI pattern

        IERC20(token0).safeTransfer(msg.sender, amount0);
        IERC20(token1).safeTransfer(msg.sender, amount1);
        _burn(msg.sender, amount);

        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Pair_Burn(msg.sender, amount0, amount1, amount);
    }

    /**
     * @notice Swaps one token for another using the constant product formula
     * @dev Takes a 0.3% fee that remains in the pool as additional reserves
     * @param fromToken Token sent by the user (must be token0 or token1)
     * @param targetToken Token received by the user (must be token0 or token1)
     * @param amountIn Amount of fromToken to swap
     */
    function swap(address fromToken, address targetToken, uint256 amountIn) external lock {
        // @audit : no check that the token addresses match the pair tokens
        uint256 amountOut = getAmountOut(fromToken, targetToken, amountIn);

        if (amountOut == 0) revert Pair_InsufficientOutput();

        // First transfer FROM user TO pair
        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
        // Then transfer FROM pair TO user
        IERC20(targetToken).safeTransfer(msg.sender, amountOut);

        // @audit : update reserves based on final balances making an external call to the token contract. This contrast with the way of way of updating reserves in the `addLiquidity` and `removeLiquidity` functions where the reserves are updated in the contract itself by adding or removing the amount of tokens from the balance of the contract.
        // @audit : gas optimization: update the reserves in the same function instead of making an external call to the token contract

        // Update reserves based on final balances
        reserve0 = IERC20(token0).balanceOf(address(this));
        reserve1 = IERC20(token1).balanceOf(address(this));

        emit Pair_Swap(msg.sender, fromToken, targetToken, amountIn, amountOut);
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
        // @audit : CEI pattern
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

    /**
     * @notice Returns the current reserves of both tokens in the pair
     * @return _reserve0 Current reserve of token0
     * @return _reserve1 Current reserve of token1
     */
    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }
    /**
     * @notice Calculates the amount of LP tokens to mint for a given deposit
     * @dev For initial deposit: sqrt(amount0 * amount1)
     *      For subsequent deposits: min((amount0 * totalSupply) / reserve0, (amount1 * totalSupply) / reserve1)
     * @param amount0 Amount of token0 to deposit
     * @param amount1 Amount of token1 to deposit
     * @return liquidity Amount of LP tokens to mint
     */

    function getLiquidityToMint(uint256 amount0, uint256 amount1) public view returns (uint256 liquidity) {
        (uint256 _reserve0, uint256 _reserve1) = getReserves();

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // First liquidity provision
            // Require minimum amounts to prevent dust attacks // @audit : how effective is this check ?
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

    /**
     * @notice Calculates the expected output amount for a swap
     * @dev Uses constant product formula with a 0.3% fee: (x * y = k)
     * @param fromToken Token to swap from
     * @param targetToken Token to swap to
     * @param amountIn Amount of fromToken to swap
     * @return amountOut Expected amount of targetToken to receive
     */
    function getAmountOut(address fromToken, address targetToken, uint256 amountIn)
        public
        view
        returns (uint256 amountOut)
    {
        // @audit : no check that the token addresses match the pair tokens
        // @audit : no check that the amountIn is not 0

        uint256 reserveIn = _getReserveFromToken(fromToken);
        uint256 reserveOut = _getReserveFromToken(targetToken);

        uint256 amountInWithoutFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 numerator = amountInWithoutFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithoutFee;
        amountOut = numerator / denominator;
    }
}
