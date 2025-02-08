```bash
# Fund default user on local chain
make fund

# Fund specific address on local chain
make fund USER_ADDRESS=0x123...

# Fund user on Sepolia
make fund-sepolia USER_ADDRESS=0x123...

# Fund specific tokens for specific user
make fund-user USER=0x123... TOKENS="USDC,WETH,DAI"

```
