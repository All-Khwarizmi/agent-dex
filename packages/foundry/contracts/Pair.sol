// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IFactory.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pair is ERC20 {
    using Math for uint112;
    address public factory;
    address public token0;
    address public token1;

    uint112 private reserve0; // uses single storage slot, accessible via getReserves
    uint112 private reserve1; // uses single storage slot, accessible via getReserves

    uint public constant MINIMUM_LIQUIDITY = 10 ** 3;
    bytes4 private constant SELECTOR =
        bytes4(keccak256(bytes("transfer(address,uint256)")));
    uint private unlocked = 1;

    uint256 public constant FEE_RATE = 500; //fee = 1/feeRate = 0.2%

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(
        address indexed sender,
        uint amount0,
        uint amount1,
        address indexed to
    );
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );

    event Investment(
        address indexed liquidityProvider,
        uint256 indexed sharesPurchased
    );
    event Divestment(
        address indexed liquidityProvider,
        uint256 indexed sharesBurned
    );

    constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") {
        token0 = _token0;
        token1 = _token1;
        factory = msg.sender;
    }

    modifier lock() {
        require(unlocked == 1, "UniswapV2: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function addLiquidity(uint112 amount0, uint112 amount1) external lock {
        require(amount0 > 0 && amount1 > 0, "AgentDEX: INSUFFICIENT_INPUT");

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // First liquidity provision
            // Require minimum amounts to prevent dust attacks
            require(
                amount0 >= MINIMUM_LIQUIDITY && amount1 >= MINIMUM_LIQUIDITY,
                "AgentDEX: INSUFFICIENT_INITIAL_LIQUIDITY"
            );

            // Initial LP tokens = sqrt(amount0 * amount1)
            // This formula ensures that the initial deposit sets the price
            // and subsequent deposits must match this ratio
            uint liquidity = Math.sqrt(uint256(amount0) * amount1);

            // Lock minimum liquidity forever by burning to address(0)
            // This prevents the pool from being fully drained and price manipulation
            _mint(address(0), MINIMUM_LIQUIDITY);
            _mint(msg.sender, liquidity - MINIMUM_LIQUIDITY);

            _safeTransferFrom(token0, msg.sender, address(this), amount0);
            _safeTransferFrom(token1, msg.sender, address(this), amount1);

            reserve0 = amount0;
            reserve1 = amount1;
        } else {
            // Subsequent liquidity provisions

            // Calculate the optimal ratio based on current reserves
            // amount1Optimal = amount0 * (reserve1 / reserve0)
            uint256 amount1Optimal = (amount0 * reserve1) / reserve0;

            // Check if provided amounts maintain the price ratio within tolerance
            // We allow a small deviation (e.g., 1%) to account for rounding
            uint256 difference = amount1 > amount1Optimal
                ? amount1 - amount1Optimal
                : amount1Optimal - amount1;
            require(
                difference * 100 <= amount1Optimal,
                "AgentDEX: INVALID_RATIO"
            );

            // Calculate LP tokens to mint
            // We use the minimum of both ratios to ensure fair distribution
            // and maintain the constant product formula
            uint256 liquidity = Math.min(
                (amount0 * _totalSupply) / reserve0,
                (amount1 * _totalSupply) / reserve1
            );
            require(liquidity > 0, "AgentDEX: INSUFFICIENT_LIQUIDITY_MINTED");

            _mint(msg.sender, liquidity);
            _safeTransferFrom(token0, msg.sender, address(this), amount0);
            _safeTransferFrom(token1, msg.sender, address(this), amount1);

            reserve0 += amount0;
            reserve1 += amount1;
        }

        emit Mint(msg.sender, amount0, amount1);
    }

    function getReserves()
        public
        view
        returns (uint112 _reserve0, uint112 _reserve1)
    {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    function _safeTransfer(address token, address to, uint value) private {
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
            abi.encodeWithSelector(
                IERC20.transferFrom.selector,
                from,
                to,
                value
            )
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "AgentDEX: TRANSFER_FAILED"
        );
    }

    function _safeApprove(address token, address to, uint value) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.approve.selector, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "AgentDEX: APPROVE_FAILED"
        );
    }
}
