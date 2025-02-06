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
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    Pair public pair;
    address public alice;
    address public bob;

    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;

    function setUp() public {
        // Create alice account
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        vm.startPrank(alice);

        // Deploy mock tokens
        tokenA = new MockERC20("Token A", "TKNA");
        tokenB = new MockERC20("Token B", "TKNB");

        // Deploy uniswap factory
        IUniswapV2Factory factory = IUniswapV2Factory(
            0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
        );
        // Deploy uniswap router
        IUniswapV2Router router = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );

        // Deploy pair
        pair = new Pair(
            address(tokenA),
            address(tokenB),
            address(factory),
            address(router)
        );

        // Mint tokens to alice
        tokenA.mint(alice, 1000000 * 10 ** 18);
        tokenB.mint(alice, 1000000 * 10 ** 18);

        // Mint tokens to bob
        tokenA.mint(bob, 1000000 * 10 ** 18);
        tokenB.mint(bob, 1000000 * 10 ** 18);

        // Setup alice's approvals
        vm.startPrank(alice);
        tokenA.approve(address(pair), type(uint256).max);
        tokenB.approve(address(pair), type(uint256).max);
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
        tokenA.approve(address(pair), type(uint256).max);
        tokenB.approve(address(pair), type(uint256).max);

        // Alice adds liquidity
        pair.addLiquidity(1500, 1500);

        vm.stopPrank();
    }

    function testMultipleUsers() public {
        // Test multiple users adding liquidity
        // Setup Alice
        vm.prank(alice);
        tokenA.approve(address(pair), type(uint256).max);
        vm.prank(alice);
        tokenB.approve(address(pair), type(uint256).max);

        // Setup Bob
        vm.prank(bob);
        tokenA.approve(address(pair), type(uint256).max);
        vm.prank(bob);
        tokenB.approve(address(pair), type(uint256).max);

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
        uint256 initialTokenABalance = tokenA.balanceOf(alice);
        uint256 initialTokenBBalance = tokenB.balanceOf(alice);

        // Remove liquidity
        pair.removeLiquidity(removeAmount);

        // Record final reserves
        (uint256 finalReserve0, uint256 finalReserve1) = pair.getReserves();

        uint256 expectedFinalReserve = initialAmount - expectedTokenReturn;

        // Get token balance changes
        uint256 tokenAReceived = tokenA.balanceOf(alice) - initialTokenABalance;
        uint256 tokenBReceived = tokenB.balanceOf(alice) - initialTokenBBalance;
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
}
