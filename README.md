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

### Table of Contents

- [AgentDEX: AI-Powered Decentralized Exchange](#agentdex-ai-powered-decentralized-exchange)
  - [Overview](#overview)
  - [Features](#features)
    - [Core DEX Functionality](#core-dex-functionality)
    - [AI Agent Interface](#ai-agent-interface)
    - [Technical Architecture](#technical-architecture)
  - [Getting Started](#getting-started)
    - [Table of Contents](#table-of-contents)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Local Development](#local-development)
    - [Addresses](#addresses)
      - [Tokens](#tokens)
      - [Users](#users)
      - [Contracts](#contracts)
  - [Usage](#usage)
    - [Traditional Interface](#traditional-interface)
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

### Prerequisites

- Make sure to set the env variables
- Node.js >= 16
- Docker
- MetaMask or other Web3 wallet

### Installation

```bash
git clone https://github.com/All-Khwarizmi/agent-dex.git

cd agent-dex

yarn install
```

### Local Development

```bash
# Let’s start by forking mainnet
anvil --fork-url https://mainnet.infura.io/v3/$INFURA_KEY

# Deploy contracts
yarn deploy

# Add factory contract address to .env in nest package

# Setup database
yarn db

# Start backend
# You can either use docker
yarn nest:docker
# or run it locally
yarn nest:start

# Start frontend
yarn start

# Fund user wallet with ETH - DAI - USDC - WETH
cd packages/foundry && make fund USER_ADDRESS=xDcc4E41072017A20101B68B9500630A3ab6fE2fF # Use your own address
```

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
