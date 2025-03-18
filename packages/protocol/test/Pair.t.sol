// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { Test, console } from "@forge-std/Test.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import { Pair, IPair } from "../contracts/Pair.sol";

contract PairTest is Test {
    using SafeERC20 for IERC20;

    Pair public pair;
    address public alice;
    address public bob;
    ERC20 public usdc;
    ERC20 public weth;

    address constant ZERO_ADDRESS = address(0);

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        // Setup token instances
        usdc = new ERC20Mock();
        weth = new ERC20Mock();

        _deployPair();
        _setupTokens();
    }

    function _deployPair() internal {
        vm.startPrank(alice);
        pair = new Pair(address(usdc), address(weth));
        vm.stopPrank();
    }

    function _setupTokens() internal {
        uint256 usdcAmount = 25_000_000_000_000_000 * 1e6;
        uint256 wethAmount = 8_000_000_000_000 * 1e18;

        deal(address(usdc), alice, usdcAmount);
        deal(address(weth), alice, wethAmount);
        deal(address(usdc), bob, usdcAmount);
        deal(address(weth), bob, wethAmount);

        // Handle Alice's approvals
        vm.startPrank(alice);
        // First set USDC approval to 0 (if it's not already)
        IERC20(address(usdc)).approve(address(pair), 0);
        // Then set it to max
        IERC20(address(usdc)).approve(address(pair), type(uint256).max);
        // Standard approve for WETH
        IERC20(address(weth)).approve(address(pair), type(uint256).max);
        vm.stopPrank();

        // Handle Bob's approvals
        vm.startPrank(bob);
        // First set USDC approval to 0 (if it's not already)
        IERC20(address(usdc)).approve(address(pair), 0);
        // Then set it to max
        IERC20(address(usdc)).approve(address(pair), type(uint256).max);
        // Standard approve for WETH
        IERC20(address(weth)).approve(address(pair), type(uint256).max);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                             ADD LIQUIDITY
    //////////////////////////////////////////////////////////////*/
    function testPairAddLiquidity() public {
        vm.startPrank(alice);

        uint256 amount = 1500;
        pair.addLiquidity(amount, amount);

        assertGt(pair.totalSupply(), 0, "Total supply should be greater than 0");

        vm.stopPrank();
    }

    function _setLiquidity() internal returns (uint256 usdcLiquidity, uint256 wethLiquidity) {
        usdcLiquidity = 1_000_000_000 * 1e6;
        wethLiquidity = 500000 * 1e18;

        pair.addLiquidity(usdcLiquidity, wethLiquidity);
    }

    function testPairAddLiquidityEmitsMintEvent() public {
        vm.startPrank(alice);

        (uint256 usdcLiquidity, uint256 wethLiquidity) = _setLiquidity();

        vm.expectEmit(true, true, true, false);
        emit IPair.Pair_Mint(alice, usdcLiquidity, wethLiquidity, Math.sqrt(usdcLiquidity * wethLiquidity));

        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        vm.stopPrank();
    }

    function testPairAddLiquiditySetReserves() public {
        vm.startPrank(alice);

        (uint256 usdcLiquidity, uint256 wethLiquidity) = _setLiquidity();

        (uint256 _reserve0, uint256 _reserve1) = pair.getReserves();
        assertEq(_reserve0, usdcLiquidity, "Incorrect reserve0");
        assertEq(_reserve1, wethLiquidity, "Incorrect reserve1");

        vm.stopPrank();
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
        vm.expectRevert(IPair.Pair_InsufficientInput.selector);
        pair.addLiquidity(0, 10000);
        vm.stopPrank();
    }

    function testPairAddLiquidityRevertsWhenAmount1IsZero() public {
        vm.startPrank(alice);
        vm.expectRevert(IPair.Pair_InsufficientInput.selector);
        pair.addLiquidity(10000, 0);
        vm.stopPrank();
    }

    function testPairAddLiquidityRevertsWhenBothAmountsAreZero() public {
        vm.startPrank(alice);
        vm.expectRevert(IPair.Pair_InsufficientInput.selector);
        pair.addLiquidity(0, 0);
        vm.stopPrank();
    }

    function testPairAddLiquidityRevertsWhenInsufficientEitherTokenInput() public {
        vm.startPrank(alice);
        vm.expectRevert(IPair.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(1500, 100); // One value below MINIMUM_LIQUIDITY

        vm.expectRevert(IPair.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(100, 1500); // Other value below MINIMUM_LIQUIDITY
    }

    function testPairAddLiquidityRevertsWhenInsufficientInput() public {
        // First verify we're testing initial liquidity (totalSupply = 0)
        uint256 totalSupply = pair.totalSupply();
        assertEq(totalSupply, 0, "Total supply should be 0");

        // Test adding liquidity with values below MINIMUM_LIQUIDITY (1000)
        vm.expectRevert(IPair.Pair_InsufficientInitialLiquidity.selector);
        pair.addLiquidity(100, 100); // 100 < MINIMUM_LIQUIDITY so this should revert
    }
    /*//////////////////////////////////////////////////////////////
                            REMOVE LIQUIDITY
    //////////////////////////////////////////////////////////////*/

    function testPairRemoveLiquiditySucceeds() public {
        vm.startPrank(alice);

        _setLiquidity();

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);

        // Alice balances
        uint256 aliceUSDCBalance = usdc.balanceOf(alice);
        uint256 aliceWETHBalance = weth.balanceOf(alice);

        // Remove 6% of LP tokens
        uint256 removeAmount = (lpBalance * 60) / 1000;

        // Remove liquidity
        pair.removeLiquidity(removeAmount);

        // Alice balances
        uint256 aliceUSDCBalanceAfter = usdc.balanceOf(alice);
        uint256 aliceWETHBalanceAfter = weth.balanceOf(alice);
        vm.stopPrank();

        // Since when adding liquidity, we calculate it by doing sqrt(reserve0 * reserve1), one of the reserves will be less than the other
        assert(aliceUSDCBalanceAfter >= aliceUSDCBalance);
        assert(aliceWETHBalanceAfter >= aliceWETHBalance);
    }

    function testPairRemoveLiquidityEmitsBurnEvent() public {
        vm.startPrank(alice);

        (uint256 usdcLiquidity, uint256 wethLiquidity) = _setLiquidity();

        vm.expectEmit(true, true, true, false);
        emit IPair.Pair_Burn(alice, usdcLiquidity, wethLiquidity, Math.sqrt(usdcLiquidity * wethLiquidity));

        pair.removeLiquidity((ERC20(pair).balanceOf(alice) * 50) / 1000);

        vm.stopPrank();
    }

    function testPairRemoveLiquidityUpdatesReserves() public {
        vm.startPrank(alice);

        _setLiquidity();

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);

        // Record initial balances
        uint256 initialUSDCBalance = usdc.balanceOf(alice);
        uint256 initialWETHBalance = weth.balanceOf(alice);

        (uint256 initialReserveUSDC, uint256 initialReserveWETH) = pair.getReserves();

        // Remove 5% of LP tokens
        uint256 removeAmount = (lpBalance * 10) / 1000; // 5% of LP tokens

        // Remove liquidity
        pair.removeLiquidity(removeAmount);

        // Calculate actual returns
        uint256 usdcReceived = usdc.balanceOf(alice) - initialUSDCBalance;
        uint256 wethReceived = weth.balanceOf(alice) - initialWETHBalance;

        (uint256 finalReserveUSDC, uint256 finalReserveWETH) = pair.getReserves();

        assertEq(finalReserveUSDC, initialReserveUSDC - usdcReceived, "USDC reserve should match expected");
        assertEq(finalReserveWETH, initialReserveWETH - wethReceived, "WETH reserve should match expected");

        vm.stopPrank();
    }

    function testPairRemoveLiquidityUpdateLiquidityProviderBalance() public {
        vm.startPrank(alice);

        _setLiquidity();

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);

        // Remove 30% of LP tokens
        uint256 removeAmount = (lpBalance * 300) / 1000;

        // Remove liquidity
        pair.removeLiquidity(removeAmount);
        assertEq(pair.balanceOf(alice), lpBalance - removeAmount, "LP balance should match remaining amount");
    }

    function testPairRemoveLiquidityTransferExpectedAmountsToLiquidityProvider() public {
        vm.startPrank(alice);

        (uint256 usdcLiquidity, uint256 wethLiquidity) = _setLiquidity();

        // Get LP tokens balance
        uint256 lpBalance = pair.balanceOf(alice);

        // Remove 5% of LP tokens
        uint256 removeAmount = (lpBalance * 100) / 1000;

        // Record initial balances
        uint256 initialUSDCBalance = usdc.balanceOf(alice);
        uint256 initialWETHBalance = weth.balanceOf(alice);

        // Calculate expected returns
        uint256 expectedUSDC = (usdcLiquidity * removeAmount) / lpBalance;
        uint256 expectedWETH = (wethLiquidity * removeAmount) / lpBalance;

        // Remove liquidity
        pair.removeLiquidity(removeAmount);

        // Calculate actual returns
        uint256 usdcReceived = usdc.balanceOf(alice) - initialUSDCBalance;
        uint256 wethReceived = weth.balanceOf(alice) - initialWETHBalance;

        assertEq(usdcReceived, expectedUSDC, "Should get back expected USDC amount");
        assertEq(wethReceived, expectedWETH, "Should get back expected WETH amount");

        vm.stopPrank();
    }

    function testPairCollectsFees() public {
        // Setup with more appropriate values
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH

        // Alice adds initial liquidity
        vm.startPrank(alice);
        pair.addLiquidity(usdcLiquidity, wethLiquidity);
        vm.stopPrank();

        // Bob adds liquidity (same proportion)
        vm.startPrank(bob);
        pair.addLiquidity(usdcLiquidity / 4, wethLiquidity / 4); // 25% of Alice's liquidity

        // Record Bob's LP tokens
        uint256 bobLPBalance = pair.balanceOf(bob);

        // Store initial token balances
        uint256 bobUsdcInitial = usdc.balanceOf(bob);
        uint256 bobWethInitial = weth.balanceOf(bob);
        vm.stopPrank();

        // Check initial reserves
        (uint256 reserve0Before, uint256 reserve1Before) = pair.getReserves();
        console.log("Initial reserves - USDC:", reserve0Before, "WETH:", reserve1Before);

        // Perform multiple swaps in both directions to generate fees
        vm.startPrank(alice);

        // Multiple USDC->WETH swaps
        for (uint256 i = 0; i < 5; i++) {
            pair.swap(address(weth), address(usdc), 10_000 * 1e6); // 10K USDC each time
        }

        // Multiple WETH->USDC swaps
        for (uint256 i = 0; i < 5; i++) {
            pair.swap(address(usdc), address(weth), 1 * 1e18); // 1 WETH each time
        }

        vm.stopPrank();

        // Check post-swap reserves
        (uint256 reserve0After, uint256 reserve1After) = pair.getReserves();
        console.log("Post-swap reserves - USDC:", reserve0After, "WETH:", reserve1After);

        // Important: Calculate the expected amount without fees as a baseline
        uint256 expectedUsdcWithoutFees =
            bobUsdcInitial - usdcLiquidity / 4 + (bobLPBalance * reserve0After) / pair.totalSupply();
        uint256 expectedWethWithoutFees =
            bobWethInitial - wethLiquidity / 4 + (bobLPBalance * reserve1After) / pair.totalSupply();

        console.log("Expected USDC without fees:", expectedUsdcWithoutFees);
        console.log("Expected WETH without fees:", expectedWethWithoutFees);

        // Bob removes all his liquidity
        vm.startPrank(bob);
        pair.removeLiquidity(bobLPBalance);

        // Get final balances
        uint256 bobUsdcFinal = usdc.balanceOf(bob);
        uint256 bobWethFinal = weth.balanceOf(bob);
        vm.stopPrank();

        console.log("Bob's initial USDC:", bobUsdcInitial);
        console.log("Bob's final USDC:", bobUsdcFinal);
        console.log("Bob's initial WETH:", bobWethInitial);
        console.log("Bob's final WETH:", bobWethFinal);

        // We should see an increase compared to the expected amounts without fees
        assertGt(bobUsdcFinal, expectedUsdcWithoutFees, "Bob should get extra USDC from fees");
        assertGt(bobWethFinal, expectedWethWithoutFees, "Bob should get extra WETH from fees");
    }

    function testPairRemoveLiquidityRevertsWhenMoreThanAvailable() public {
        vm.startPrank(alice);

        // Initial liquidity
        uint256 initialAmount = 10000;

        // Add initial liquidity
        pair.addLiquidity(initialAmount, initialAmount);
        uint256 lpBalance = pair.balanceOf(alice);

        // Try to remove more than available
        vm.expectRevert(IPair.Pair_InsufficientBalance.selector);
        pair.removeLiquidity(lpBalance + 1);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                                  SWAP
    //////////////////////////////////////////////////////////////*/
    function testPairSwapEmitsSwapEvent() public {
        vm.startPrank(alice);

        _setUniswapLiquidity();

        uint256 amountIn = 1000 * 1e6;
        vm.expectEmit(true, true, true, false);
        emit IPair.Pair_Swap(alice, address(usdc), address(weth), amountIn, 1000 * 1e16);

        pair.swap(address(weth), address(usdc), amountIn);

        vm.stopPrank();
    }

    function testPairSwapFromToken0ToToken1() public {
        vm.startPrank(alice);
        _setUniswapLiquidity();

        uint256 amountIn = 100 * 1e6;

        // Get pre-swap balances
        uint256 usdcBeforeSwap = usdc.balanceOf(alice);
        uint256 wethBeforeSwap = weth.balanceOf(alice);

        // Swap
        pair.swap(address(usdc), address(weth), amountIn);

        // Get post-swap balances
        uint256 usdcAfterSwap = usdc.balanceOf(alice);
        uint256 wethAfterSwap = weth.balanceOf(alice);

        // Calculate changes
        uint256 usdcSpent = usdcBeforeSwap - usdcAfterSwap;

        assertEq(usdcSpent, amountIn, "Incorrect USDC spent");
        assertGt(wethAfterSwap, wethBeforeSwap, "Incorrect WETH received");

        vm.stopPrank();
    }

    function testPairSwapFromToken1ToToken0() public {
        vm.startPrank(alice);
        _setUniswapLiquidity();

        uint256 amountIn = 10 * 1e18;

        // Get pre-swap balances
        uint256 usdcBeforeSwap = usdc.balanceOf(alice);
        uint256 wethBeforeSwap = weth.balanceOf(alice);

        // Swap
        pair.swap(address(weth), address(usdc), amountIn);

        // Get post-swap balances
        uint256 usdcAfterSwap = usdc.balanceOf(alice);
        uint256 wethAfterSwap = weth.balanceOf(alice);

        // Calculate changes
        uint256 wethSpent = wethBeforeSwap - wethAfterSwap;

        assertEq(wethSpent, amountIn, "Incorrect WETH spent");
        assertGt(usdcAfterSwap, usdcBeforeSwap, "Incorrect USDC received");

        vm.stopPrank();
    }

    function _setUniswapLiquidity() internal returns (uint256 usdcLiquidity, uint256 wethLiquidity) {
        usdcLiquidity = 21381921535549; // ~21,381 USDC (6 decimals)
        wethLiquidity = 7944862667241816919899; // ~7,944 WETH (18 decimals)

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);
    }

    /*//////////////////////////////////////////////////////////////
                              GET RESERVES
    //////////////////////////////////////////////////////////////*/
    function testGetReserves() public {
        vm.startPrank(alice);

        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        // Check balances before adding liquidity
        uint256 aliceUsdcBefore = IERC20(address(usdc)).balanceOf(alice);
        uint256 aliceWethBefore = IERC20(address(weth)).balanceOf(alice);

        console.log("Alice USDC balance:", aliceUsdcBefore);
        console.log("Alice WETH balance:", aliceWethBefore);

        // Make sure we have enough tokens
        require(aliceUsdcBefore >= usdcLiquidity, "Not enough USDC");
        require(aliceWethBefore >= wethLiquidity, "Not enough WETH");

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        // Get reserves
        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        // Verify reserves
        assertEq(reserve0, usdcLiquidity, "Incorrect reserve0");
        assertEq(reserve1, wethLiquidity, "Incorrect reserve1");

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                              POOL BALANCE
    //////////////////////////////////////////////////////////////*/
    function testPoolBalanceAfterAddingLiquidityOneTime() public {
        vm.startPrank(alice);

        // Setup with proper decimals
        uint256 usdcLiquidity = 1_000_000 * 1e6; // 1M USDC (6 decimals)
        uint256 wethLiquidity = 500 * 1e18; // 500 WETH (18 decimals)

        // Add liquidity
        pair.addLiquidity(usdcLiquidity, wethLiquidity);

        (uint256 reserve0, uint256 reserve1) = pair.getReserves();

        // Get pool balance
        uint256 poolBalance = pair.poolBalance();

        // Verify pool balance
        assertApproxEqRel(poolBalance, Math.sqrt(reserve0 * reserve1), 1e5, "Incorrect pool balance");

        vm.stopPrank();
    }
}
