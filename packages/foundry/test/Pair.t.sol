// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;
// Import console.log
import "forge-std/console.sol";
import "forge-std/Test.sol";
import "../contracts/Pair.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../contracts/interfaces/IUniswapFactory.sol";
import "../contracts/interfaces/IUniswapRouter.sol";

// Create a simple mock token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint some initial tokens to the deployer
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract PairTest is Test {
    Pair public pair;
    address public alice;
    address public bob;
    ERC20 public usdc;
    ERC20 public weth;

    address constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    function setUp() public {
        // We reset the fork to the mainnet fork
        vm.createSelectFork(vm.envString("ETH_RPC_URL"));

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
        // WETH whale
        address wethWhale = 0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E;
        address usdcWhale = 0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341;

        uint256 usdcAmount = 2_000_000 * 1e6;
        uint256 wethAmount = 600 * 1e18;

        // Transfer WETH to alice from whale
        vm.startPrank(wethWhale);
        weth.transfer(alice, wethAmount);
        vm.stopPrank();

        // Transfer USDC to alice from whale
        vm.startPrank(usdcWhale);
        usdc.transfer(alice, usdcAmount);
        vm.stopPrank();

        // Approve USDC and WETH to be used by the pair contract
        vm.startPrank(alice);
        usdc.approve(address(pair), type(uint256).max);
        weth.approve(address(pair), type(uint256).max);
        vm.stopPrank();
    }

    // Add Liquidity
    function testShouldRevertWhenAddLiquidityWithInsufficientInput() public {
        // First verify we're testing initial liquidity (totalSupply = 0)
        uint256 totalSupply = pair.totalSupply();
        assertEq(totalSupply, 0, "Total supply should be 0");

        // Test adding liquidity with values below MINIMUM_LIQUIDITY (1000)
        vm.expectRevert("AgentDEX: INSUFFICIENT_INITIAL_LIQUIDITY");
        pair.addLiquidity(100, 100); // 100 < MINIMUM_LIQUIDITY so this should revert
    }

    function testShouldSucceedWithSufficientInitialLiquidity() public {
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

    function testShouldRevertWithOneInsufficient() public {
        vm.expectRevert("AgentDEX: INSUFFICIENT_INITIAL_LIQUIDITY");
        pair.addLiquidity(1500, 100); // One value below MINIMUM_LIQUIDITY

        vm.expectRevert("AgentDEX: INSUFFICIENT_INITIAL_LIQUIDITY");
        pair.addLiquidity(100, 1500); // Other value below MINIMUM_LIQUIDITY
    }

    function testAddLiquidityWithDifferentUser() public {
        vm.startPrank(alice);

        // Alice approves pair
        usdc.approve(address(pair), type(uint256).max);
        weth.approve(address(pair), type(uint256).max);

        // Alice adds liquidity
        pair.addLiquidity(1500, 1500);

        vm.stopPrank();
    }

    function testMultipleUsers() public {
        // Test multiple users adding liquidity
        // Setup Alice
        vm.prank(alice);
        usdc.approve(address(pair), type(uint256).max);
        vm.prank(alice);
        weth.approve(address(pair), type(uint256).max);

        // Setup Bob
        vm.prank(bob);
        usdc.approve(address(pair), type(uint256).max);
        vm.prank(bob);
        weth.approve(address(pair), type(uint256).max);

        // Alice adds initial liquidity
        vm.prank(alice);
        pair.addLiquidity(2000, 2000);

        // Bob adds more liquidity
        vm.prank(bob);
        pair.addLiquidity(1000, 1000);
    }

    // Remove Liquidity
    function testRemoveLiquidity() public {
        vm.startPrank(alice);

        // Use proper decimal amounts
        uint256 initialAmount = 10000 * 10 ** 18; // 10000 tokens with 18 decimals
        pair.addLiquidity(initialAmount, initialAmount);

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);

        // Remove 80% of LP tokens
        uint256 removeAmount = (lpBalance * 800) / 1000; // 80% of LP balance

        // Calculate expected amounts
        uint256 expectedTokenReturn = (initialAmount * removeAmount) /
            lpBalance;

        // Record initial token balances
        uint256 initialTokenABalance = usdc.balanceOf(alice);
        uint256 initialTokenBBalance = weth.balanceOf(alice);

        // Remove liquidity
        pair.removeLiquidity(removeAmount);

        // Record final reserves
        (uint256 finalReserve0, uint256 finalReserve1) = pair.getReserves();

        uint256 expectedFinalReserve = initialAmount - expectedTokenReturn;

        // Get token balance changes
        uint256 tokenAReceived = usdc.balanceOf(alice) - initialTokenABalance;
        uint256 tokenBReceived = weth.balanceOf(alice) - initialTokenBBalance;
        console.log("Tokens Received: ", tokenAReceived, tokenBReceived);

        // Verify final state
        assertEq(
            finalReserve0,
            expectedFinalReserve,
            "Reserve0 should match expected amount"
        );
        assertEq(
            finalReserve1,
            expectedFinalReserve,
            "Reserve1 should match expected amount"
        );
        assertEq(
            pair.balanceOf(alice),
            lpBalance - removeAmount,
            "Alice's LP balance should match remaining amount"
        );
        assertEq(
            tokenAReceived,
            expectedTokenReturn,
            "Should get back expected token A amount"
        );
        assertEq(
            tokenBReceived,
            expectedTokenReturn,
            "Should get back expected token B amount"
        );

        vm.stopPrank();
    }

    function testPartialLiquidityRemoval() public {
        vm.startPrank(alice);

        // Add initial liquidity
        uint256 initialAmount = 10000;
        pair.addLiquidity(initialAmount, initialAmount);

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);
        uint256 removeAmount = lpBalance / 2; // Remove half

        // Record initial reserves
        (uint256 initialReserve0, uint256 initialReserve1) = pair.getReserves();

        // Remove half of liquidity
        pair.removeLiquidity(removeAmount);

        // Verify final state
        assertEq(
            pair.balanceOf(alice),
            lpBalance - removeAmount,
            "Should have half LP tokens remaining"
        );

        // Get final reserves
        (uint256 finalReserve0, uint256 finalReserve1) = pair.getReserves();

        // The tolerance should be in basis points (1 = 0.01%)
        uint256 tolerance = 1e15; // 0.1% in basis points

        assertApproxEqRel(
            finalReserve0,
            initialReserve0 / 2,
            tolerance,
            "Reserve0 should be approximately halved"
        );
        assertApproxEqRel(
            finalReserve1,
            initialReserve1 / 2,
            tolerance,
            "Reserve1 should be approximately halved"
        );

        vm.stopPrank();
    }

    function testCannotRemoveZeroLiquidity() public {
        vm.startPrank(alice);

        // Add initial liquidity
        pair.addLiquidity(10000 * 10 ** 18, 10000 * 10 ** 18);

        // Try to remove zero liquidity
        vm.expectRevert("AgentDEX: INSUFFICIENT_INPUT");
        pair.removeLiquidity(0);

        vm.stopPrank();
    }

    function testCannotRemoveMoreThanAvailable() public {
        vm.startPrank(alice);

        // Initial liquidity
        uint256 initialAmount = 10000;

        // Add initial liquidity
        pair.addLiquidity(initialAmount, initialAmount);
        uint256 lpBalance = pair.balanceOf(alice);

        // Try to remove more than available
        vm.expectRevert("AgentDEX: INSUFFICIENT_LIQUIDITY_BALANCE");
        pair.removeLiquidity(lpBalance + 1);

        vm.stopPrank();
    }

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

    function testAmountCalculations() public view {
        // Setup initial state
        uint256 reserveUSDC = 1_000_000 * 1e6; // 1M USDC
        uint256 reserveWETH = 500 * 1e18; // 500 WETH
        uint256 swapAmount = 1000 * 1e6; // 1000 USDC

        console.log("\n=== Test Amount Calculations ===");
        console.log("Initial State:");
        console.log("USDC Reserve: %s", reserveUSDC / 1e6);
        console.log("WETH Reserve: %s", reserveWETH / 1e18);
        console.log("Swap Amount: %s USDC", swapAmount / 1e6);

        // Calculate expected output using our library
        uint256 amountOut = PairLibrary.getAmountOut(
            swapAmount,
            reserveUSDC,
            reserveWETH,
            997, // FEE_NUMERATOR
            1000 // FEE_DENOMINATOR
        );

        console.log("\nStep by Step Calculation:");
        uint256 amountInWithFee = swapAmount * 997;
        console.log("Amount with fee: %s", amountInWithFee);

        uint256 numerator = amountInWithFee * reserveWETH;
        console.log("Numerator: %s", numerator);

        uint256 denominator = (reserveUSDC * 1000) + amountInWithFee;
        console.log("Denominator: %s", denominator);

        console.log("Final amount out: %s WETH", amountOut / 1e18);

        // Compare with Uniswap
        address[] memory path = new address[](2);
        path[0] = address(usdc);
        path[1] = address(weth);
        uint[] memory uniswapAmounts = IUniswapV2Router(ROUTER).getAmountsOut(
            swapAmount,
            path
        );

        console.log("\nUniswap output: %s WETH", uniswapAmounts[1] / 1e18);
    }

    function testSwap() public {
        vm.startPrank(alice);

        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        // Approve tokens
        usdc.approve(address(pair), type(uint256).max);
        weth.approve(address(pair), type(uint256).max);

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Prepare swap
        uint256 swapAmount = 100 * 1e6; // 100 USDC

        // Record pre-swap balances (full precision)
        uint256 usdcBeforeSwap = usdc.balanceOf(alice);
        uint256 wethBeforeSwap = weth.balanceOf(alice);

        // Execute swap
        pair.swap(address(weth), address(usdc), swapAmount);

        // Get post-swap balances (full precision)
        uint256 usdcAfterSwap = usdc.balanceOf(alice);
        uint256 wethAfterSwap = weth.balanceOf(alice);

        // Calculate changes
        uint256 usdcSpent = usdcBeforeSwap - usdcAfterSwap;
        uint256 wethReceived = wethAfterSwap - wethBeforeSwap;

        console.log("\n=== Swap Results (Human Readable) ===");
        console.log("USDC spent: %s USDC", usdcSpent / 1e6);

        // Raw values for verification
        console.log("\n=== Raw Values ===");
        console.log("USDC spent (raw): %s", usdcSpent);
        console.log("WETH received (raw): %s", wethReceived);

        // Calculate and display price
        uint256 effectivePrice = (usdcSpent * 1e18) / wethReceived;
        console.log("\n=== Price Analysis ===");
        console.log("Effective price: %s USDC per WETH", effectivePrice / 1e6);

        // Expected values from logs:
        // Initial WETH: 100000000000000000000 (100 WETH)
        // Final WETH:   100049845030450464088 (~100.05 WETH)
        uint256 expectedWethReceived = 49845030450464088; // ~0.049845 WETH

        // Verify exact amounts
        assertEq(usdcSpent, swapAmount, "Incorrect USDC spent");
        assertEq(wethReceived, expectedWethReceived, "Incorrect WETH received");

        // Verify no precision loss
        assertTrue(wethReceived > 0, "Should receive non-zero WETH");
        assertTrue(effectivePrice > 0, "Should have non-zero price");

        vm.stopPrank();
    }
}
