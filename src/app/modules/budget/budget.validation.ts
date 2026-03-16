import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string(),
  amount: z.number().int().positive(),
  date: z.string(),
  type: z.enum(['DAILY', 'MONTHLY']),
});

export const updateSchema = z.object({
  categoryId: z.string().optional(),
  amount: z.number().int().positive().optional(),
  date: z.string().optional(),
  type: z.enum(['DAILY', 'MONTHLY']).optional(),
});

export const BudgetValidations = {
  createBudgetSchema,
  updateSchema,
};