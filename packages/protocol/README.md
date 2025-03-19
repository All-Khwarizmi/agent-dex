# AgentDEX Protocol

[//]: # "contest-details-open"

- Starts: May 15, 2025 Noon UTC
- Ends: May 22, 2025 Noon UTC

- nSLOC: 283

## About the Project

AgentDEX is a decentralized exchange protocol inspired by Uniswap V2 that implements automated market-making (AMM) functionality with a constant product formula (x \* y = k). The protocol enables trading between any ERC20 token pairs and liquidity provision with a 0.3% fee collection mechanism.

What makes AgentDEX unique is its integration with an AI agent interface, allowing users to interact with the protocol through natural language. This creates a more intuitive trading experience while maintaining the security and decentralization principles of DeFi.

The core protocol consists of:

1. A Factory contract that creates and tracks liquidity pools
2. Pair contracts that handle token swaps and liquidity management for specific token pairs

Each Pair implements the ERC20 standard to issue LP tokens representing liquidity shares. The system follows the constant product formula to determine swap rates and uses a reentrancy lock to prevent potential attack vectors. The protocol collects a 0.3% fee on all swaps which accrues to liquidity providers.

## Examples:

Example 1, a basic swap transaction:

User wants to swap 1000 USDC for ETH. They interact with the appropriate Pair contract, either directly or through a front-end interface. The protocol calculates the exchange rate based on the constant product formula (x \* y = k), applies the 0.3% fee, and executes the swap.

Example 2, adding liquidity:

User has 10,000 USDC and 5 ETH they want to provide as liquidity. They call the `addLiquidity` function on the Pair contract, which mints LP tokens representing their share of the pool. These LP tokens can later be redeemed for the underlying assets plus any accrued trading fees.

Example 3, removing liquidity:

A liquidity provider wants to withdraw their position. They call `removeLiquidity` with their LP tokens, and receive back their share of the pool's assets, including any fees that have accumulated since they added liquidity.

## Actors

Actors:

- `Liquidity Providers`: Users who provide token pairs to liquidity pools and earn 0.3% fees from swaps.
- `Traders`: Users who swap tokens through the protocol and pay 0.3% fees.
- `Factory`: Contract that creates and tracks Pair contracts.
- `Pair`: The smart contract that manages a specific token pair, handles liquidity provision, and executes swaps.

## Core Assumptions and Invariants

1. The constant product formula (x \* y = k) must be maintained after every swap operation, adjusted for the 0.3% fee.
2. The `unlocked` state variable should prevent reentrancy attacks through the `lock` modifier.
3. Initial liquidity providers must provide at least `MINIMUM_LIQUIDITY` (10^3) of each token to prevent dust attacks.
4. LP tokens are calculated as `sqrt(amount0 * amount1)` for initial liquidity and proportional to the reserves for subsequent additions.
5. When removing liquidity, users should receive their proportional share of the pool, including accrued fees.
6. The protocol should handle token pairs with different decimals correctly through the constant product formula.
7. The swap fee of 0.3% is accurately implemented via the `FEE_NUMERATOR` (997) and `FEE_DENOMINATOR` (1000) constants.
8. Reserves are always updated after every operation that affects the token balances.
9. Token transfers must use SafeERC20 to handle tokens with non-standard return values.
10. No user can remove liquidity exceeding their LP token balance.

[//]: # "contest-details-close"
[//]: # "scope-open"

## Scope (contracts)

```
All Contracts in `contracts` are in scope.
```

```js
contracts/
├── Factory.sol
├── Pair.sol
└── interfaces/
    ├── IFactory.sol
    └── IPair.sol
```

### Notice:

While the project includes a front-end interface and back-end services for event monitoring, only the smart contracts are in scope for this audit. The AI agent functionality is implemented off-chain and is not part of the security assessment.

## Compatibilities

```
Compatibilities:
  Blockchains:
      - Ethereum
      - Polygon
      - Arbitrum
      - Optimism
  Tokens:
      - ERC20 tokens with standard interfaces
      - Special attention to non-standard ERC20 implementations (e.g., tokens with transfer fees, rebasing tokens)
```

[//]: # "scope-close"
[//]: # "getting-started-open"

## Setup

This is a standard Foundry project, to run it use:

```shell
$ forge install
```

```shell
$ forge build
```

### Test

```shell
$ forge test
```

```shell
$ forge coverage
```

### Local Deployment

For local testing with Anvil:

```shell
$ anvil
$ forge script script/DeployFactory.s.sol --rpc-url http://localhost:8545 --broadcast
```

[//]: # "getting-started-close"
[//]: # "known-issues-open"

## Known Issues

1. The protocol does not handle tokens that take fees on transfers or have rebasing functionality. This is by design and users should be cautious when interacting with such tokens.

2. Like most AMM protocols, there is inherent exposure to impermanent loss for liquidity providers.

3. The protocol does not implement price oracles, making it potentially vulnerable to price manipulation in pools with low liquidity.

4. For subsequent liquidity provisioning, the protocol doesn't strictly enforce the pool ratio, which could potentially lead to price manipulation if not properly checked.

5. The contract doesn't include explicit slippage protection for swaps - this is expected to be handled by the front-end or calling contracts.

6. There is no functionality to pause the contract in case of emergencies.

7. When adding liquidity after the initial provision, the contract verifies liquidity > 0 but doesn't check if the amounts maintain the current ratio, which might lead to unexpected behavior in certain scenarios.

[//]: # "known-issues-close"
