import { z } from 'zod';
import { CustomerType, CustomerStatus } from '../types/enums';

export const createCustomerSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email format'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (e.g., 07AAAAA0000A1Z5)')
    .optional()
    .or(z.literal(''))
    .nullable(),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.WHOLESALE),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE),
  followUpDate: z.string().datetime().optional().or(z.literal('')).nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(2, 'Follow-up note is required'),
  followUpDate: z.string().datetime('Valid ISO date required for follow-up date'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
