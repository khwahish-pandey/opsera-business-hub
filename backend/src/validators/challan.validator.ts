import { z } from 'zod';

export const createChallanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().gt(0, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').optional(),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(createChallanItemSchema).min(1, 'Challan must contain at least 1 item'),
});

export const updateChallanSchema = createChallanSchema.partial();

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
