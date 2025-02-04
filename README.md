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
- TheGraph integration for real-time analytics
- React frontend with both traditional and chat interfaces
- Automated testing suite

## Getting Started

### Prerequisites

- Node.js >= 16
- MetaMask or other Web3 wallet

### Installation

```bash
git clone [repository-url]
cd agent-dex
npm install
```

### Local Development

```bash
# Start local hardhat node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
npm run dev
```

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
