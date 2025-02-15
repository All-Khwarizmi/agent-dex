import z from 'zod';

export const poolReservesSchema = z.object({
  reserve0: z.number().positive(),
  reserve1: z.number().positive(),
});
