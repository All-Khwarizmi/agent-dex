import { TOKENS } from "./constants";
import { get } from "http";
import { formatUnits, parseUnits } from "viem";
import { FormattedPool, TokenMetadata } from "~~/types/tokens";

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

export async function fetchTokenMetadata(symbols: string[]): Promise<TokenMetadata[]> {
  try {
    const metadata: TokenMetadata[] = [];
    console.log(symbols);
    // Make url on this format: 'https://deep-index.moralis.io/api/v2.2/erc20/metadata/symbols?chain=eth&symbols%5B0%5D=LINK&symbols%5B1%5D=USDC'
    //https://deep-index.moralis.io/api/v2.2/erc20/metadata/symbols?chain=eth&symbols%5B0%5D=DAI&symbols%5B1%5D=USDC&symbols%5B2%5D=ETH&symbols%5B3%5D=USDT
    const url = new URL("https://deep-index.moralis.io/api/v2.2/erc20/metadata/symbols?chain=eth");
    symbols.forEach((symbol, index) => {
      url.searchParams.append(`symbols[${index}]`, symbol);
    });
    console.log(url.toString());
    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
        // Set no-cors header to allow CORS requests from the frontend
        "Access-Control-Allow-Origin": "*",
      },
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch token metadata");
    }
    const data = await response.json();
    console.log(data);
    data.forEach((token: TokenMetadata) => {
      metadata.push(token);
    });

    return metadata;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return [];
  }
}

export function getSymbolsFromAddresses(addresses: string[]) {
  const symbols: (typeof TOKENS)[number]["symbol"][] = [];
  for (const address of addresses) {
    const symbol = TOKENS.find(token => token.address.toLowerCase() === address.toLowerCase())?.symbol;
    if (symbol) {
      symbols.push(symbol);
    }
  }
  return symbols;
}

export function getSymbolFromAddress(address: string) {
  return TOKENS.find(token => token.address.toLowerCase() === address.toLowerCase())?.symbol;
}

export function formatPoolPair(
  pool: {
    address: string;
    token0: string;
    token1: string;
    reserve0: number;
    reserve1: number;
    swaps: number;
  },
  tokenMetadata?: TokenMetadata[],
): FormattedPool {
  // Find metadata for both tokens
  const token0Metadata = tokenMetadata?.find(t => t.address.toLowerCase() === pool.token0.toLowerCase());
  const token1Metadata = tokenMetadata?.find(t => t.address.toLowerCase() === pool.token1.toLowerCase());

  return {
    address: pool.address,
    token0Symbol: token0Metadata?.symbol || getSymbolFromAddress(pool.token0) || "",
    token1Symbol: token1Metadata?.symbol || getSymbolFromAddress(pool.token1) || "",
    token0Logo: token0Metadata?.logo,
    token1Logo: token1Metadata?.logo,
    token0Address: pool.token0 || "",
    token1Address: pool.token1 || "",
    reserve0: Number(
      formatTokensAccordingToDecimals(getSymbolFromAddress(pool.token0) || "WETH", BigInt(pool.reserve0)),
    ),
    reserve1: Number(
      formatTokensAccordingToDecimals(getSymbolFromAddress(pool.token1) || "WETH", BigInt(pool.reserve1)),
    ),
    swaps: pool.swaps,
  };
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokensAccordingToDecimals(symbol: (typeof TOKENS)[number]["symbol"], amount: bigint) {
  const token = TOKENS.find(token => token.symbol === symbol);
  if (!token) {
    return amount?.toString();
  }
  return formatUnits(amount, token.decimals);
}

export function parseUserInput(value: string) {
  const regex = /^[0-9]*\.?[0-9]*$/;
  if (!regex.test(value)) {
    return 0;
  }
  return parseFloat(value);
}

export function getDecimalsFromSymbol(symbol: (typeof TOKENS)[number]["symbol"]) {
  const token = TOKENS.find(token => token.symbol === symbol);
  if (!token) {
    return 0;
  }
  return token.decimals;
}

export function parseTokenAmountToBaseUnit(amount: string, symbol: (typeof TOKENS)[number]["symbol"]) {
  return parseUnits(amount.toString(), getDecimalsFromSymbol(symbol));
}
