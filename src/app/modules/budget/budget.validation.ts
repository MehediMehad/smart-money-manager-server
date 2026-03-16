import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string(),
  amount: z.number().int(),
  date: z.string(),
  type: z.enum(['DAILY', 'MONTHLY']),
});

export const updateBudgetSchema = z.object({
  amount: z.number().int(),
  type: z.enum(['DAILY', 'MONTHLY'])
});

export const BudgetValidations = {
  createBudgetSchema,
  updateBudgetSchema,
};