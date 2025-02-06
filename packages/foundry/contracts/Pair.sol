// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IFactory.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./libraries/PairLibrary.sol";

import "forge-std/console.sol";

import "./interfaces/IUniswapFactory.sol";
import "./interfaces/IUniswapRouter.sol";

contract Pair is ERC20 {
    IUniswapV2Factory private uniswapFactory;
    IUniswapV2Router private uniswapRouter;

    address public factory;
    address public token0;
    address public token1;

    uint256 private reserve0;
    uint256 private reserve1;

    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;
    bytes4 private constant SELECTOR =
        bytes4(keccak256(bytes("transfer(address,uint256)")));
    uint private unlocked = 1;

    uint256 private constant FEE_NUMERATOR = 997;
    uint256 private constant FEE_DENOMINATOR = 1000;

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(
        address indexed sender,
        uint amount0,
        uint amount1,
        address indexed to
    );
    event Swap(address indexed sender, uint amountIn, uint amountOut);

    event Investment(
        address indexed liquidityProvider,
        uint256 indexed sharesPurchased
    );
    event Divestment(
        address indexed liquidityProvider,
        uint256 indexed sharesBurned
    );

    constructor(
        address _token0,
        address _token1,
        address _factory,
        address _router
    ) ERC20("AgentDEX LP", "LP") {
        require(_token0 != address(0), "AgentDEX: ZERO_ADDRESS");
        require(_token1 != address(0), "AgentDEX: ZERO_ADDRESS");
        token0 = _token0;
        token1 = _token1;
        factory = msg.sender;
        uniswapFactory = IUniswapV2Factory(_factory);
        uniswapRouter = IUniswapV2Router(_router);
    }

    modifier lock() {
        require(unlocked == 1, "UniswapV2: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function getReserves()
        public
        view
        returns (uint256 _reserve0, uint256 _reserve1)
    {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external lock {
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
            uint256 liquidity = Math.sqrt(amount0 * amount1);

            // Lock minimum liquidity forever by burning it
            // This prevents the pool from being fully drained and price manipulation
            _mint(address(this), MINIMUM_LIQUIDITY); // Lock minimum liquidity forever by burning to address(0)
            _burn(address(this), MINIMUM_LIQUIDITY);

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

    function removeLiquidity(uint256 amount) external lock {
        require(amount > 0, "AgentDEX: INSUFFICIENT_INPUT");

        uint256 _totalSupply = totalSupply();

        uint256 liquidity = balanceOf(msg.sender);
        require(
            liquidity - MINIMUM_LIQUIDITY >= amount,
            "AgentDEX: INSUFFICIENT_LIQUIDITY_BALANCE"
        );

        // Calculate amounts
        uint256 amount0 = (amount * reserve0) / _totalSupply;
        uint256 amount1 = (amount * reserve1) / _totalSupply;

        // Check for zero returns
        require(
            amount0 > 0 && amount1 > 0,
            "AgentDEX: INSUFFICIENT_LIQUIDITY_BURNED"
        );

        _burn(msg.sender, amount);
        _safeTransfer(token0, msg.sender, amount0);
        _safeTransfer(token1, msg.sender, amount1);

        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Burn(msg.sender, amount0, amount1, msg.sender);
    }

    function swap(
        address targetToken,
        address fromToken,
        uint amountIn
    ) external lock {
        require(amountIn > 0, "AgentDEX: INSUFFICIENT_INPUT_AMOUNT");

        // Log initial state with token addresses
        console.log("\n=== Pre-Swap State ===");
        console.log("From Token:", fromToken);
        console.log("Target Token:", targetToken);
        console.log("Token0:", token0);
        console.log("Token1:", token1);

        bool _shouldSwap = shouldSwap(targetToken, fromToken, amountIn);
        require(_shouldSwap, "AgentDEX: SWAP_CONDITION_NOT_MET");

        // Calculate amount out
        uint256 amountOut = getAmountOut(targetToken, fromToken, amountIn);
        require(amountOut > 0, "AgentDEX: INSUFFICIENT_OUTPUT_AMOUNT");

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

        emit Swap(msg.sender, amountIn, amountOut);
    }

    function shouldSwap(
        address targetToken,
        address fromToken,
        uint amountIn
    ) public view returns (bool) {
        uint256 reserveIn = getReservesFromToken(fromToken);
        uint256 reserveOut = getReservesFromToken(targetToken);

        // Log initial values
        console.log("\n=== Should Swap Check ===");
        console.log("Input Amount:", amountIn);
        console.log("Reserve In:", reserveIn);
        console.log("Reserve Out:", reserveOut);

        // Get output amount
        uint256 amountOut = PairLibrary.getAmountOut(
            amountIn,
            reserveIn,
            reserveOut,
            FEE_NUMERATOR,
            FEE_DENOMINATOR
        );

        // Calculate price impact: (amountIn / reserveIn) * 10000 for bps
        uint256 priceImpact = (amountIn * 10000) / reserveIn;

        // Calculate reserve ratio: (amountOut / reserveOut) * 10000 for bps
        uint256 reserveRatio = (amountOut * 10000) / reserveOut;

        console.log("Amount Out:", amountOut);
        console.log("Price Impact (bps):", priceImpact);
        console.log("Reserve Ratio (bps):", reserveRatio);

        bool sufficientReserves = amountOut <= reserveOut / 2; // Changed to avoid overflow
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
    ) public view returns (bool) {
        // Compare with Uniswap
        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = targetToken;
        uint[] memory amounts = uniswapRouter.getAmountsOut(amountIn, path);
        uint256 uniswapAmount = amounts[1];

        bool betterThanUniswap = amountOut >= uniswapAmount;
        console.log("Better than Uniswap: %s", betterThanUniswap);

        return betterThanUniswap;
    }

    function getReservesFromToken(
        address token
    ) public view returns (uint reserves) {
        if (token == token0) {
            return reserve0;
        } else if (token == token1) {
            return reserve1;
        }
    }

    function getAmountOut(
        address targetToken,
        address fromToken,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        uint256 reserveIn = getReservesFromToken(fromToken);
        uint256 reserveOut = getReservesFromToken(targetToken);

        console.log("Reserves for calculation:");
        console.log("Reserve In (From Token):", reserveIn);
        console.log("Reserve Out (Target Token):", reserveOut);

        return
            PairLibrary.getAmountOut(
                amountIn,
                reserveIn,
                reserveOut,
                FEE_NUMERATOR,
                FEE_DENOMINATOR
            );
    }

    function calculatePriceImpact(
        address targetToken,
        address fromToken,
        uint amountIn
    ) public view returns (uint256 priceImpact) {
        uint256 reserveIn = getReservesFromToken(fromToken);
        uint256 reserveOut = getReservesFromToken(targetToken);
        uint256 amountOut = PairLibrary.getAmountOut(
            amountIn,
            reserveIn,
            reserveOut,
            FEE_NUMERATOR,
            FEE_DENOMINATOR
        );

        priceImpact = ((amountOut) * 100) / reserveOut;
    }

    function calculateReservesBalanceVariation(
        address targetToken,
        address fromToken,
        uint amountIn
    ) public view returns (uint256 reservesBalance) {
        uint256 reserveIn = getReservesFromToken(fromToken);
        uint256 reserveOut = getReservesFromToken(targetToken);

        // Calculate reserves balance before swap
        uint256 balanceBefore = reserveOut > reserveIn
            ? reserveOut - reserveIn
            : reserveIn - reserveOut;

        // Calculate amount out
        uint256 amountOut = PairLibrary.getAmountOut(
            amountIn,
            reserveIn,
            reserveOut,
            FEE_NUMERATOR,
            FEE_DENOMINATOR
        );

        // Calculate new reserves
        uint256 newReserveOut = reserveOut + amountOut;
        uint256 newReserveIn = reserveIn + amountIn;

        // Calculate new reserves balance
        uint256 balanceAfter = newReserveOut > newReserveIn
            ? newReserveOut - newReserveIn
            : newReserveIn - newReserveOut;

        // Calculate variation in reserves in percentage
        reservesBalance = balanceBefore > balanceAfter
            ? balanceBefore - balanceAfter
            : balanceAfter - balanceBefore;

        reservesBalance = Math.max(
            (reservesBalance * 100) / reserve0,
            (reservesBalance * 100) / reserve1
        );
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
            abi.encodeWithSelector(ERC20.transferFrom.selector, from, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "AgentDEX: TRANSFER_FAILED"
        );
    }

    function _safeApprove(address token, address to, uint value) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(ERC20.approve.selector, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "AgentDEX: APPROVE_FAILED"
        );
    }
}
