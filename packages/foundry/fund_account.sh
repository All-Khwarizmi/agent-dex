#!/bin/bash
# fund_account.sh

if [ -z "$1" ]; then
    echo "Usage: ./fund_account.sh <ADDRESS>"
    exit 1
fi

# Local Anvil RPC URL
RPC_URL="http://localhost:8545"

RECIPIENT=$1
WETH="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
USDC="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
DAI="0x6B175474E89094C44Da98b954EedeAC495271d0F"

WETH_WHALE="0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E"
USDC_WHALE="0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"
DAI_WHALE="0xD1668fB5F690C59Ab4B0CAbAd0f8C1617895052B"

echo "Funding account: $RECIPIENT"

# Check if anvil is running
if ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' $RPC_URL > /dev/null; then
    echo "Error: Anvil is not running. Please start anvil first."
    exit 1
fi

# Fund with ETH
echo "Funding with ETH..."
cast rpc anvil_setBalance $RECIPIENT 0x8AC7230489E80000 --rpc-url $RPC_URL

# Fund whales with ETH for gas
echo "Funding whales with ETH for gas..."
cast rpc anvil_setBalance $WETH_WHALE 0x8AC7230489E80000 --rpc-url $RPC_URL
cast rpc anvil_setBalance $USDC_WHALE 0x8AC7230489E80000 --rpc-url $RPC_URL
cast rpc anvil_setBalance $DAI_WHALE 0x8AC7230489E80000 --rpc-url $RPC_URL

# Fund with WETH
echo "Funding with WETH..."
cast rpc anvil_impersonateAccount $WETH_WHALE --rpc-url $RPC_URL
cast send --unlocked $WETH "transfer(address,uint256)" $RECIPIENT 5000000000000000000 --from $WETH_WHALE --rpc-url $RPC_URL
cast rpc anvil_stopImpersonatingAccount $WETH_WHALE --rpc-url $RPC_URL

# Fund with USDC
echo "Funding with USDC..."
cast rpc anvil_impersonateAccount $USDC_WHALE --rpc-url $RPC_URL
cast send --unlocked $USDC "transfer(address,uint256)" $RECIPIENT 10000000000 --from $USDC_WHALE --rpc-url $RPC_URL
cast rpc anvil_stopImpersonatingAccount $USDC_WHALE --rpc-url $RPC_URL

# Fund with DAI
echo "Funding with DAI..."
cast rpc anvil_impersonateAccount $DAI_WHALE --rpc-url $RPC_URL
cast send --unlocked $DAI "transfer(address,uint256)" $RECIPIENT 10000000000000000000000 --from $DAI_WHALE --rpc-url $RPC_URL
cast rpc anvil_stopImpersonatingAccount $DAI_WHALE --rpc-url $RPC_URL

# Format and display balances
echo "Final balances:"
eth_bal=$(cast balance $RECIPIENT --rpc-url $RPC_URL)
weth_bal=$(cast call $WETH "balanceOf(address)(uint256)" $RECIPIENT --rpc-url $RPC_URL)
usdc_bal=$(cast call $USDC "balanceOf(address)(uint256)" $RECIPIENT --rpc-url $RPC_URL)
dai_bal=$(cast call $DAI "balanceOf(address)(uint256)" $RECIPIENT --rpc-url $RPC_URL)

echo "ETH:  $(echo "scale=2; $eth_bal/10^18" | bc) ETH"
echo "WETH: $(echo "scale=2; $weth_bal/10^18" | bc) WETH"
echo "USDC: $(echo "scale=2; $usdc_bal/10^6" | bc) USDC"
echo "DAI:  $(echo "scale=2; $dai_bal/10^18" | bc) DAI"