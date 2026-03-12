import { z } from 'zod';

export const createSchema = z.object({
  categoryId: z.string(),
  amount: z.number().int().positive(),
  date: z.string(),
});

export const updateSchema = z.object({
  categoryId: z.string().optional(),
  amount: z.number().int().positive().optional(),
  date: z.string().optional(),
});

export const DailyBudgetValidations = {
  createSchema,
  updateSchema,
};