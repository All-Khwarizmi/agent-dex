export const TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  {
    symbol: "SHIB",
    name: "Shiba Inu",
    address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  },
  {
    symbol: "BNB",
    name: "BNB",
    address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  {
    symbol: "AAVE",
    name: "Aave",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
  },
  {
    symbol: "CRO",
    name: "Cronos",
    address: "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b",
  },
  {
    symbol: "LDO",
    name: "Lido DAO Token",
    address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
  },
  {
    symbol: "APE",
    name: "ApeCoin",
    address: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
  },
  {
    symbol: "GRT",
    name: "The Graph",
    address: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
  },
  {
    symbol: "FTM",
    name: "Fantom",
    address: "0x4E15361FD6b4BB609Fa63C81A2be19d873717870",
  },
  {
    symbol: "SAND",
    name: "The Sandbox",
    address: "0x3845badAde8e6dFF049820680d1F14bD3903a5d0",
  },
  {
    symbol: "MANA",
    name: "Decentraland",
    address: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
  },
  {
    symbol: "MKR",
    name: "Maker",
    address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  },
  {
    symbol: "SNX",
    name: "Synthetix Network Token",
    address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  },
] as const;

export const FACTORY_CONTRACT_NAME = "Factory";
export const PAIR_CONTRACT_NAME = "Pair";

export const BASE_BACKEND_URL = process.env.NEXT_PUBLIC_BASE_BACKEND_URL || "http://localhost:5001";
