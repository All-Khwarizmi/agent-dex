// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "./IUniswapFactory.sol";
import "./IUniswapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract PairCore {
    error Pair_ZeroAddress();
    error Pair_IdenticalAddress();
    error Pair_Locked();
    error Pair_InsufficientLiquidity();
    error Pair_InsufficientBalance();
    error Pair_InsufficientLiquidityMinted();
    error Pair_InsufficientLiquidityBurnt();
    error Pair_ExceededMaxLiquidityRemoval();
    error Pair_InsufficientInitialLiquidity();
    error Pair_InsufficientInput();
    error Pair_InsufficientOutput();
    error Pair_InvalidPairRatio();
    error Pair_TransferFailed();

    IUniswapV2Factory internal immutable i_uniswapV2Factory;
    IUniswapV2Router internal immutable i_uniswapV2Router;

    uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
    bytes4 internal constant SELECTOR =
        bytes4(keccak256(bytes("transfer(address,uint256)")));

    uint256 internal constant FEE_NUMERATOR = 997;
    uint256 internal constant FEE_DENOMINATOR = 1000;
    uint8 internal unlocked = 1;

    event Pair_Mint(
        address indexed sender,
        uint amount0,
        uint amount1,
        uint mintedLiquidity
    );
    event Pair_Burn(
        address indexed sender,
        uint amount0,
        uint amount1,
        address indexed to,
        uint burntLiquidity
    );
    event Pair_Swap(
        address indexed sender,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut
    );
    event Pair_SwapForwarded(
        address user,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut
    );

    modifier lock() {
        if (unlocked == 0) revert Pair_Locked();
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(address _factory, address _router) {
        i_uniswapV2Factory = IUniswapV2Factory(_factory);
        i_uniswapV2Router = IUniswapV2Router(_router);
    }

    // Normalize amount to 18 decimals
    function normalizeAmount(
        uint256 amount,
        uint8 currentDecimals,
        uint8 targetDecimals
    ) internal pure returns (uint256) {
        if (currentDecimals == targetDecimals) {
            return amount;
        }
        if (currentDecimals > targetDecimals) {
            return amount / (10 ** (currentDecimals - targetDecimals));
        }
        return amount * (10 ** (targetDecimals - currentDecimals));
    }

    function _safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(SELECTOR, to, value)
        );
        if (!success || data.length == 0 || !abi.decode(data, (bool)))
            revert Pair_TransferFailed();
    }

    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint value
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(ERC20.transferFrom.selector, from, to, value)
        );
        if (!success || data.length == 0 || !abi.decode(data, (bool)))
            revert Pair_TransferFailed();
    }
}
