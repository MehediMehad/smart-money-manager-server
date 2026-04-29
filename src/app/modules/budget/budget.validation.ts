import { z } from 'zod';

export const createBudgetSchema = z
  .object({
    categoryId: z.string(),
    amount: z.number().int(),
    date: z.string().optional(),
    month: z.number().optional(),
    year: z.number().optional(),
    type: z.enum(['DAILY', 'MONTHLY']),
  })
  .refine((data) => {
    if (data.type === 'DAILY' && !data.date) {
      return false;
    }
    if (data.type === 'MONTHLY' && !data.month) {
      return false;
    }
    if (data.type === 'MONTHLY' && !data.year) {
      return false;
    }
    return true;
  });

export const updateBudgetSchema = z.object({
  amount: z.number().int(),
  type: z.enum(['DAILY', 'MONTHLY']),
});

export const BudgetValidations = {
  createBudgetSchema,
  updateBudgetSchema,
};
