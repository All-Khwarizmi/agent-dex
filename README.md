# AgentDEX: AI-Powered Decentralized Exchange

## Overview

AgentDEX is a decentralized exchange that combines traditional DEX functionality with an AI agent interface for a more intuitive trading experience. Users can interact with the protocol through both a traditional swap interface and a conversational AI agent that helps manage trades and liquidity positions.

## Features

### Core DEX Functionality

- Token swaps with automatic price calculation
- Liquidity provision and fee collection
- Intelligent forwarding to Uniswap V2 for optimal trade execution
- Support for any ERC20 token pair

### AI Agent Interface

- Natural language interaction for trades and liquidity management
- Conversational interface for managing positions
- Trade suggestions based on pool analysis
- Clear explanations of complex DeFi operations

### Technical Architecture

- Smart contract protocol built with Solidity
- Nest.js backend with GraphQL API
- React frontend with both traditional and chat interfaces
- Automated testing suite

## Getting Started

> Aiming to be able to integrate with Uniswap V2 and other DEX protocols, we decided to use Tenderly Virtual Testnet for testing and development. This allows to fork mainnet and being able to manipulate the state of the blockchain such as adding liquidity and swapping tokens.
> Also, Uniswap V2 is not supported on Sepolia.

> 🚧 If you want to test the protocol on a local environment, you will need a fork of mainnet. You can use [Alchemy](https://www.alchemy.com/) or [Tenderly](https://tenderly.co/) for this.

> 🚧 🚧 The deployed app will be available on the [AgentDEX](https://agentdex.vercel.app) domain.

> 🔑 I'll provide an address funded with ETH and USDC for testing purposes.

### Table of Contents

- [AgentDEX: AI-Powered Decentralized Exchange](#agentdex-ai-powered-decentralized-exchange)
  - [Overview](#overview)
  - [Features](#features)
    - [Core DEX Functionality](#core-dex-functionality)
    - [AI Agent Interface](#ai-agent-interface)
    - [Technical Architecture](#technical-architecture)
  - [Getting Started](#getting-started)
    - [Table of Contents](#table-of-contents)
    - [Step by Step Overview](#step-by-step-overview)
    - [Deploying new Factory Contract or new Virtual Testnet](#deploying-new-factory-contract-or-new-virtual-testnet)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Local Development](#local-development)
    - [MetaMask with Virtual Testnet](#metamask-with-virtual-testnet)
    - [Addresses](#addresses)
      - [Tokens](#tokens)
      - [Users](#users)
      - [Contracts](#contracts)
  - [Usage](#usage)
    - [Traditional Interface](#traditional-interface)
    - [AI Agent Interface](#ai-agent-interface-1)
  - [Protocol Design](#protocol-design)
    - [Smart Contracts](#smart-contracts)
    - [Events](#events)
  - [Security](#security)
    - [Auditing](#auditing)
    - [Considerations](#considerations)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgments](#acknowledgments)

### Step by Step Overview

1. Setup Testnet (Tenderly)
2. Update network rpc url and block explorer in the metamask network and `scaffold.config.ts` file from the nextjs package and the env files (both foundry and nest). Also set the TENDERLY_API_KEY in the `.env` file from foundry package (scripts require it).
3. Setup keystore (scripts)
4. Fund account with ETH for gas (Tenderly Dashboard)
5. Deploy Factory Contract (scripts)
6. Update `FACTORY_ADDRESS` in the `.env` file from nest package.
7. Start backend (nest)
8. Start frontend (nextjs)

### Deploying new Factory Contract or new Virtual Testnet

> 🚧 When deploying a new Factory contract or new Virtual Testnet, you will need to update the following:
>
> - Update network rpc url and block explorer in the metamask network and `scaffold.config.ts` file from the nextjs package and the env files (both nextjs and nest).
> - `FACTORY_ADDRESS` in the `.env` file from nest package.
> - To be able to use the scaffold-eth hooks, you will need to deploy using the `deploy script` command (to trigger the creation of the contract in `nextjs/contracts/deployedContracts.ts`) or recycle the contract from the previous deployment, changing the `address` of the contract and maybe the chain ID.

### Prerequisites

- Node.js >= 16
- MetaMask or other Web3 wallet

### Installation

```bash
git clone https://github.com/All-Khwarizmi/agent-dex.git
cd agent-dex
yarn install
```

### Local Development

```bash
# Start local node (we're using Tenderly's virtual testnet)
yarn chain

# Deploy contracts
# option 1a: deploy script (recommended)
yarn deploy --network mainnet --file Deploy.s.sol

# option 1b: deploy script
forge script script/Deploy.s.sol:Deploy \
--slow \
--verify \
  --verifier-url $TENDERLY_VERIFIER_URL \
  --rpc-url $TENDERLY_VIRTUAL_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY  \
  --etherscan-api-key $TENDERLY_ACCESS_TOKEN \
  --broadcast \

# option 2: deploy via create2
forge create Factory --rpc-url $TENDERLY_VIRTUAL_TESTNET_RPC_URL --private-key $PRIVATE_KEY --etherscan-api-key $TENDERLY_ACCESS_TOKEN --verify --verifier-url $TENDERLY_VERIFIER_URL

# Start backend
yarn nest:start

# Start frontend
yarn start
```

> 🚧 To verify the contracts manually, you can use the [Tenderly Verifier](https://dashboard.tenderly.co/verifier).

```bash
# Get the ABI
forge build --silent && jq '.abi' ./out/Factory.sol/Factory.json

# Copy into the clipboard
yarn foundry:abi

or

forge build --silent && jq '.abi' ./out/Factory.sol/Factory.json | pbcopy

```

### MetaMask with Virtual Testnet

[Tenderly docs](https://docs.tenderly.co/virtual-testnets/interact/add-testnet-to-wallet)

1. Add a network in MetaMask
2. Select Custom RPC
3. Name: Virtual Mainnet
4. RPC URL: https://virtual.mainnet.rpc.tenderly.co/${TENDERLY_API_KEY}
5. Chain ID: 17357
6. Symbol: VETH
7. Block Explorer URL: https://virtual.mainnet.rpc.tenderly.co/${TENDERLY_API_KEY}

### Addresses

#### Tokens

- USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
- WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

#### Users

#### Contracts

- Uniswap V2 Factory: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
- Uniswap V2 Router: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D

## Usage

### Traditional Interface

1. Connect your wallet
2. Select tokens for swap
3. Enter amount
4. Confirm transaction

### AI Agent Interface

1. Connect your wallet
2. Open agent chat interface
3. Type natural language commands like:
   - "Swap 100 DAI for ETH"
   - "Show my liquidity positions"
   - "What's the best time to add liquidity?"

## Protocol Design

### Smart Contracts

- Factory contract for pool creation and management
- Pool contracts for individual token pairs
- Uniswap V2 integration for trade forwarding

### Events

- Pool creation/modification events
- Swap events
- Liquidity addition/removal events

## Security

### Auditing

- Built on proven DEX patterns
- Comprehensive testing suite
- Security-first development approach

### Considerations

- Price manipulation prevention
- Front-running protection
- Proper access controls

## Contributing

We welcome contributions! Please see our contributing guidelines.

## License

MIT

## Contact

[AgentDEX](https://agentdex.vercel.app)
[swarecito](https://twitter.com/swarecito)

## Acknowledgments

- Uniswap V2 team for protocol inspiration
- OpenZeppelin for security patterns
- The Graph protocol for data indexing
