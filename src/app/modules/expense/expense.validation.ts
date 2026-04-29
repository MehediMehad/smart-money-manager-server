import { z } from 'zod';

export const createExpenseSchema = z.object({
  categoryId: z.string(),
  amount: z.number().int().positive(),
  note: z.string().min(1),
  date: z.string(),
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().optional(),
  amount: z.number().int().positive().optional(),
  note: z.string().optional(),
  date: z.string().optional(),
});

export const ExpenseValidations = {
  createExpenseSchema,
  updateExpenseSchema,
};
