/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  1: {
    Pair: {
      address: "0x2a264f26859166c5bf3868a54593ee716aebc848",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_token0",
              type: "address",
              internalType: "address",
            },
            {
              name: "_token1",
              type: "address",
              internalType: "address",
            },
            {
              name: "_factory",
              type: "address",
              internalType: "address",
            },
            {
              name: "_router",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "MINIMUM_LIQUIDITY",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "addLiquidity",
          inputs: [
            {
              name: "amount0",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "amount1",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allowance",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "approve",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "balanceOf",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "calculatePriceImpact",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "priceImpact",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "calculateReservesBalanceVariation",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "reservesBalance",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "decimals",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "factory",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getAmountOut",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "amountOut",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getReserves",
          inputs: [],
          outputs: [
            {
              name: "_reserve0",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_reserve1",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getReservesFromToken",
          inputs: [
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "reserves",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "removeLiquidity",
          inputs: [
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "shouldSwap",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "swap",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "symbol",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "token0",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "token1",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "totalSupply",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferFrom",
          inputs: [
            {
              name: "from",
              type: "address",
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "uniswapHasBetterPrice",
          inputs: [
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountOut",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "shouldSwapWithUniswap",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "uniswapAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Burn",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount0",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "amount1",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Divestment",
          inputs: [
            {
              name: "liquidityProvider",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "sharesBurned",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Investment",
          inputs: [
            {
              name: "liquidityProvider",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "sharesPurchased",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Mint",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount0",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "amount1",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Swap",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "amountOut",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "ERC20InsufficientAllowance",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "allowance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InsufficientBalance",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidApprover",
          inputs: [
            {
              name: "approver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidReceiver",
          inputs: [
            {
              name: "receiver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSender",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSpender",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1738877329.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
  31337: {
    Factory: {
      address: "0x8ce361602b935680e8dec218b820ff5056beb7af",
      abi: [
        {
          type: "function",
          name: "allPairs",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createPair",
          inputs: [
            {
              name: "_tokenA",
              type: "address",
              internalType: "address",
            },
            {
              name: "_tokenB",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "pair",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getPair",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPairCount",
          inputs: [],
          outputs: [
            {
              name: "poolCount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "PairCreated",
          inputs: [
            {
              name: "token0",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "token1",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "pair",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1738927515.json",
      deploymentScript: "Deploy.s.sol",
    },
    Pair: {
      address: "0xe1da8919f262ee86f9be05059c9280142cf23f48",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_token0",
              type: "address",
              internalType: "address",
            },
            {
              name: "_token1",
              type: "address",
              internalType: "address",
            },
            {
              name: "_factory",
              type: "address",
              internalType: "address",
            },
            {
              name: "_router",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "MINIMUM_LIQUIDITY",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "addLiquidity",
          inputs: [
            {
              name: "amount0",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "amount1",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allowance",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "approve",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "balanceOf",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "calculatePriceImpact",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "priceImpact",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "calculateReservesBalanceVariation",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "reservesBalance",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "decimals",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "factory",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getAmountOut",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "amountOut",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getReserves",
          inputs: [],
          outputs: [
            {
              name: "_reserve0",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_reserve1",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getReservesFromToken",
          inputs: [
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "reserves",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "removeLiquidity",
          inputs: [
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "shouldSwap",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "swap",
          inputs: [
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "symbol",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "token0",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "token1",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "totalSupply",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferFrom",
          inputs: [
            {
              name: "from",
              type: "address",
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "uniswapHasBetterPrice",
          inputs: [
            {
              name: "amountIn",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "fromToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "targetToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "amountOut",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "shouldSwapWithUniswap",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "uniswapAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Burn",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount0",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "amount1",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Divestment",
          inputs: [
            {
              name: "liquidityProvider",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "sharesBurned",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Investment",
          inputs: [
            {
              name: "liquidityProvider",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "sharesPurchased",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Mint",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount0",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "amount1",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Swap",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amountIn",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "amountOut",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "ERC20InsufficientAllowance",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "allowance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InsufficientBalance",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidApprover",
          inputs: [
            {
              name: "approver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidReceiver",
          inputs: [
            {
              name: "receiver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSender",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSpender",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1738927515.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
