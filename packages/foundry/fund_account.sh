#!/bin/bash
# fund_account.sh

# Check if address argument is provided
if [ -z "$1" ]; then
    echo "Usage: ./fund_account.sh <ADDRESS>"
    exit 1
fi

RECIPIENT=$1
WETH="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
USDC="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
DAI="0x6B175474E89094C44Da98b954EedeAC495271d0F"

WETH_WHALE="0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E"
USDC_WHALE="0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"
DAI_WHALE="0xD1668fB5F690C59Ab4B0CAbAd0f8C1617895052B"

echo "Funding account: $RECIPIENT"

# Fund with ETH
echo "Funding with ETH..."
cast rpc anvil_setBalance $RECIPIENT 0x8AC7230489E80000 # 10 ETH in hex

# Impersonate and fund with WETH
echo "Funding with WETH..."
cast rpc anvil_impersonateAccount $WETH_WHALE
cast send $WETH "transfer(address,uint256)" $RECIPIENT 5000000000000000000 --from $WETH_WHALE
cast rpc anvil_stopImpersonatingAccount $WETH_WHALE

# Impersonate and fund with USDC
echo "Funding with USDC..."
cast rpc anvil_impersonateAccount $USDC_WHALE
cast send $USDC "transfer(address,uint256)" $RECIPIENT 10000000000 --from $USDC_WHALE # 10,000 USDC
cast rpc anvil_stopImpersonatingAccount $USDC_WHALE

# Impersonate and fund with DAI
echo "Funding with DAI..."
cast rpc anvil_impersonateAccount $DAI_WHALE
cast send $DAI "transfer(address,uint256)" $RECIPIENT 10000000000000000000000 --from $DAI_WHALE # 10,000 DAI
cast rpc anvil_stopImpersonatingAccount $DAI_WHALE

# Check balances
echo "Final balances:"
echo "ETH: $(cast balance $RECIPIENT) wei"
echo "WETH: $(cast call $WETH "balanceOf(address)(uint256)" $RECIPIENT) wei"
echo "USDC: $(cast call $USDC "balanceOf(address)(uint256)" $RECIPIENT)"
echo "DAI: $(cast call $DAI "balanceOf(address)(uint256)" $RECIPIENT) wei"