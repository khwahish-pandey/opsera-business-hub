import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int().gt(0, 'Quantity must be greater than 0'),
  reason: z.string().min(2, 'Reason for stock adjustment is required'),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
