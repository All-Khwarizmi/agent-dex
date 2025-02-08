#!/bin/bash
# setup.sh

# Check if Anvil is running
if ! nc -z localhost 8545; then
    echo "Starting Anvil..."
    anvil --fork-url $ETH_RPC_URL --chain-id 31337 &
    sleep 5  # Wait for Anvil to start
fi

# Deploy contracts
echo "Deploying contracts..."
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Fund your address (optional)
echo "Funding your address..."
forge script ./script/FundUser.sol:FundUser --rpc-url http://localhost:8545 --broadcast