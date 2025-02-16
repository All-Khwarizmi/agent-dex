// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;
// Import console.log
import "../contracts/Pair.sol";
import "@forge-std/console.sol";
import "@forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/interfaces/IUniswapFactory.sol";
import "../contracts/interfaces/IUniswapRouter.sol";

contract PairTest is Test {
    Pair public pair;
    address public alice;
    address public bob;
    ERC20 public usdc;
    ERC20 public weth;

    address constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    address constant ZERO_ADDRESS = address(0);

    function setUp() public {
        // We reset the fork to the mainnet fork
        vm.createSelectFork(vm.envString("RPC_URL"));

        alice = makeAddr("alice");
        bob = makeAddr("bob");
        vm.deal(alice, 100 ether);

        // Setup token instances
        // Real mainnet token addresses
        usdc = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        weth = ERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

        _deployPair();
        _setupTokens();
    }

    function _deployPair() internal {
        vm.startPrank(alice);
        pair = new Pair(address(usdc), address(weth), FACTORY, ROUTER);
        vm.stopPrank();
    }

    function _setupTokens() internal {
        uint256 usdcAmount = 25_000_000_000_000;
        uint256 wethAmount = 8_000_000 * 1e18;

        deal(address(usdc), alice, usdcAmount);
        deal(address(weth), alice, wethAmount);
        deal(address(usdc), bob, usdcAmount);
        deal(address(weth), bob, wethAmount);

        // Approve USDC and WETH to be used by the pair contract
        vm.startPrank(alice);
        usdc.approve(address(pair), type(uint256).max);
        weth.approve(address(pair), type(uint256).max);
        vm.startPrank(bob);
        usdc.approve(address(pair), type(uint256).max);
        weth.approve(address(pair), type(uint256).max);
        vm.stopPrank();
    }

    // Add Liquidity
    function testPairAddLiquiditySuccessfully() public {
        vm.startPrank(alice);

        // Add initial liquidity
        uint256 amount = 1500;
        pair.addLiquidity(amount, amount);

        assertGt(
            pair.totalSupply(),
            0,
            "Total supply should be greater than 0"
        );

        (uint256 _reserve0, uint256 _reserve1) = pair.getReserves();
        assertEq(_reserve0, 1500, "Reserve0 should be updated");
        assertEq(_reserve1, 1500, "Reserve1 should be updated");
    }

    function testPairAddLiquidityWithMultipleUsers() public {
        uint256 usdcLiquidity = 1_000_000 * 1e6;
        uint256 wethLiquidity = 500 * 1e18;
        // Alice adds initial liquidity
        vm.prank(alice);
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Bob adds more liquidity
        vm.prank(bob);
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        assertTrue(pair.balanceOf(alice) > 0, "Alice should have liquidity");
        assertTrue(pair.balanceOf(bob) > 0, "Bob should have liquidity");
    }

    function testPairAddLiquidityRevertsWhenAmount0IsZero() public {
        vm.startPrank(alice);
        vm.expectRevert(PairCore.Pair_InsufficientInput.selector);
        pair.addLiquidity(0, 10000);
        vm.stopPrank();
    }

    function testPairAddLiquidityRevertsWhenAmount1IsZero() public {
        vm.startPrank(alice);
        vm.expectRevert(PairCore.Pair_InsufficientInput.selector);
        pair.addLiquidity(10000, 0);
        vm.stopPrank();
    }

    function testPairAddLiquidityRevertsWhenBothAmountsAreZero() public {
        vm.startPrank(alice);
        vm.expectRevert(PairCore.Pair_InsufficientInput.selector);
        pair.addLiquidity(0, 0);
        vm.stopPrank();
    }

    function testPairAddLiquidityRevertsWhenInsufficientEitherTokenInput()
        public
    {
        vm.startPrank(alice);
        vm.expectRevert(PairCore.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(1500, 100); // One value below MINIMUM_LIQUIDITY

        vm.expectRevert(PairCore.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(100, 1500); // Other value below MINIMUM_LIQUIDITY
    }

    function testPairAddLiquidityRevertsWhenInsufficientInput() public {
        // First verify we're testing initial liquidity (totalSupply = 0)
        uint256 totalSupply = pair.totalSupply();
        assertEq(totalSupply, 0, "Total supply should be 0");

        // Test adding liquidity with values below MINIMUM_LIQUIDITY (1000)
        vm.expectRevert(PairCore.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(100, 100); // 100 < MINIMUM_LIQUIDITY so this should revert
    }

    // Remove Liquidity
    //? single responsibility
    function testPairRemoveLiquidity() public {
        vm.startPrank(alice);

        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        console.log("\n=== Initial Setup ===");
        console.log("USDC liquidity: %s USDC", usdcLiquidity / 1e6);
        console.log("WETH liquidity: %s WETH", wethLiquidity / 1e18);

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);
        console.log("LP tokens received: %s", lpBalance);

        // Remove 80% of LP tokens
        uint256 removeAmount = (lpBalance * 50) / 1000; // 5%
        console.log("\n=== Removing Liquidity ===");
        console.log("Removing %s LP tokens (%s%%)", removeAmount, 5);

        // Record initial balances
        uint256 initialUSDCBalance = usdc.balanceOf(alice);
        uint256 initialWETHBalance = weth.balanceOf(alice);
        console.log("\n=== Initial Reserves ===");

        (uint256 initialReserveUSDC, uint256 initialReserveWETH) = pair
            .getReserves();

        // Calculate expected returns
        uint256 expectedUSDC = (usdcLiquidity * removeAmount) / lpBalance;
        uint256 expectedWETH = (wethLiquidity * removeAmount) / lpBalance;

        console.log("\n=== Expected Returns ===");
        console.log("Expected USDC: %s", expectedUSDC / 1e6);
        console.log("Expected WETH: %s", expectedWETH / 1e18);

        // Remove liquidity
        pair.removeLiquidity(removeAmount);

        // Calculate actual returns
        uint256 usdcReceived = usdc.balanceOf(alice) - initialUSDCBalance;
        uint256 wethReceived = weth.balanceOf(alice) - initialWETHBalance;
        (uint256 finalReserveUSDC, uint256 finalReserveWETH) = pair
            .getReserves();

        console.log("\n=== Actual Returns ===");
        console.log("USDC received: %s", usdcReceived / 1e6);
        console.log("WETH received: %s", wethReceived / 1e18);

        console.log("\n=== Final Reserves ===");
        console.log("USDC reserve: %s", finalReserveUSDC / 1e6);
        console.log("WETH reserve: %s", finalReserveWETH / 1e18);

        // Verify final state
        assertEq(
            finalReserveUSDC,
            initialReserveUSDC - usdcReceived,
            "USDC reserve should match expected"
        );
        assertEq(
            finalReserveWETH,
            initialReserveWETH - wethReceived,
            "WETH reserve should match expected"
        );
        assertEq(
            pair.balanceOf(alice),
            lpBalance - removeAmount,
            "LP balance should match remaining amount"
        );
        assertEq(
            usdcReceived,
            expectedUSDC,
            "Should get back expected USDC amount"
        );
        assertEq(
            wethReceived,
            expectedWETH,
            "Should get back expected WETH amount"
        );

        vm.stopPrank();
    }

    function testPairRemoveLiquidityRevertsWhenZeroAmount() public {
        vm.startPrank(alice);
        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Try to remove zero liquidity
        vm.expectRevert(PairCore.Pair_InsufficientInput.selector);
        pair.removeLiquidity(0);

        vm.stopPrank();
    }

    function testPairRemoveLiquidityRevertsWhenMoreThanAvailable() public {
        vm.startPrank(alice);

        // Initial liquidity
        uint256 initialAmount = 10000;

        // Add initial liquidity
        pair.addLiquidity(initialAmount, initialAmount);
        uint256 lpBalance = pair.balanceOf(alice);

        // Try to remove more than available
        vm.expectRevert(PairCore.Pair_InsufficientBalance.selector);
        pair.removeLiquidity(lpBalance + 1);

        vm.stopPrank();
    }

    // Swap
    function _getExpectedAmounts(
        uint256 swapAmount
    ) internal view returns (uint256 uniswapOut, uint256 ourAmountOut) {
        address[] memory path = new address[](2);
        path[0] = address(usdc);
        path[1] = address(weth);

        uint[] memory amounts = IUniswapV2Router(ROUTER).getAmountsOut(
            swapAmount,
            path
        );
        uniswapOut = amounts[1];
        ourAmountOut = pair.getAmountOut(
            address(weth),
            address(usdc),
            swapAmount
        );
    }

    //? single responsibility
    function testPairSwap() public {
        vm.startPrank(alice);

        // Setup with Uniswap-like liquidity (from the logs)
        uint256 usdcLiquidity = 21381921535549; // ~21,381 USDC (6 decimals)
        uint256 wethLiquidity = 7944862667241816919899; // ~7,944 WETH (18 decimals)

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Prepare swap - keep same test amount
        uint256 swapAmount = 100 * 1e6; // 100 USDC

        // Record pre-swap balances
        uint256 usdcBeforeSwap = usdc.balanceOf(alice);
        uint256 wethBeforeSwap = weth.balanceOf(alice);

        // Execute swap
        pair.swap(address(weth), address(usdc), swapAmount);

        // Get post-swap balances
        uint256 usdcAfterSwap = usdc.balanceOf(alice);
        uint256 wethAfterSwap = weth.balanceOf(alice);

        // Calculate changes
        uint256 usdcSpent = usdcBeforeSwap - usdcAfterSwap;
        uint256 wethReceived = wethAfterSwap - wethBeforeSwap;

        console.log("\n=== Swap Results (Human Readable) ===");
        console.log("USDC spent: %s USDC", usdcSpent / 1e6);

        console.log("\n=== Raw Values ===");
        console.log("USDC spent (raw): %s", usdcSpent);
        console.log("WETH received (raw): %s", wethReceived);

        // Compare with Uniswap amount from logs
        uint256 expectedWethReceived = 37045272717580447; // From Uniswap logs

        // Verify amounts
        assertEq(usdcSpent, swapAmount, "Incorrect USDC spent");
        assertApproxEqRel(
            wethReceived,
            expectedWethReceived,
            20 * 1e18,
            "Incorrect WETH received"
        );

        vm.stopPrank();
    }

    // Get Reserves
    function testGetReserves() public {
        vm.startPrank(alice);

        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Get reserves
        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        // Verify reserves
        assertEq(reserve0, usdcLiquidity, "Incorrect reserve0");
        assertEq(reserve1, wethLiquidity, "Incorrect reserve1");

        vm.stopPrank();
    }

    // Pool Balance
    function testPoolBalanceAfterAddingLiquidityOneTime() public {
        vm.startPrank(alice);

        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        (uint256 reserve0, uint256 reserve1) = pair.normalizedReserves();

        // Get pool balance
        uint256 poolBalance = pair.poolBalance();

        // Verify pool balance
        assertApproxEqRel(
            poolBalance,
            Math.sqrt(reserve0 * reserve1),
            1e5,
            "Incorrect pool balance"
        );

        vm.stopPrank();
    }
}
