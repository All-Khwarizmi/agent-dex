export const REPOSITORIES = {
  USER: 'USER_REPOSITORY',
  POOL: 'POOL_REPOSITORY',
  EVENT: 'EVENT_REPOSITORY',
  LIQUIDITY_PROVIDER: 'LIQUIDITY_PROVIDER_REPOSITORY',
  DB: 'DATA_SOURCE',
} as const;

export const EVENT_NAMES = {
  MINT: 'Mint',
  BURN: 'Burn',
  SWAP: 'Swap',
  SWAP_FORWARDED: 'SwapForwarded',
  INVESTMENT: 'Investment',
  DIVESTMENT: 'Divestment',
  PAIR_CREATED: 'PariCreated',
};
