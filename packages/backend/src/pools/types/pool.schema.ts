import z from 'zod';

export const poolReservesSchema = z.object({
  reserve0: z.number().positive(),
  reserve1: z.number().positive(),
});

export const poolSchema = z.object({
  address: z.string().min(42).max(42),
  token0: z.string().min(42).max(42),
  token1: z.string().min(42).max(42),
  reserve0: z.number(),
  reserve1: z.number(),
  swaps: z.number(),
  id: z.number(),
  created_at: z.date(),
});
