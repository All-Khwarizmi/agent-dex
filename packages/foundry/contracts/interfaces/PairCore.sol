// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "./IUniswapFactory.sol";
import "./IUniswapRouter.sol";

abstract contract PairCore {
    error Pair_ZeroAddress();
    error Pair_IdenticalAddress();
    error Pair_Locked();
    error Pair_InsufficientLiquidity();
    error Pair_InsufficientInitialLiquidity();
    error Pair_InsufficientInput();
    error Pair_ZeroAmount();

    IUniswapV2Factory internal immutable i_uniswapV2Factory;
    IUniswapV2Router internal immutable i_uniswapV2Router;

    uint256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
    bytes4 internal constant SELECTOR =
        bytes4(keccak256(bytes("transfer(address,uint256)")));

    uint256 internal constant FEE_NUMERATOR = 997;
    uint256 internal constant FEE_DENOMINATOR = 1000;
    uint8 internal unlocked = 1;

    event Mint(
        address indexed sender,
        uint amount0,
        uint amount1,
        uint mintedLiquidity
    );
    event Burn(
        address indexed sender,
        uint amount0,
        uint amount1,
        address indexed to,
        uint burntLiquidity
    );
    event Swap(
        address indexed sender,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut
    );
    event SwapForwarded(
        address user,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut
    );

    event Investment(
        address indexed liquidityProvider,
        uint256 indexed sharesPurchased
    );
    event Divestment(
        address indexed liquidityProvider,
        uint256 indexed sharesBurned
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
}
