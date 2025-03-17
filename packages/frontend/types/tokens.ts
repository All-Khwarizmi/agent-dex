export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
  logo: string;
  logo_hash: string;
  thumbnail: string;
  block_number: string;
  validated: string;
  possible_spam: string;
  verified_collection: string;
}

export interface FormattedPool {
  address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Logo?: string;
  token1Logo?: string;
  token0Address: string;
  token1Address: string;
  reserve0: number;
  reserve1: number;
  swaps: number;
}
