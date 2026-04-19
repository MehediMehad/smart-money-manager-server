import { z } from 'zod';

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().int().positive(),
  savedAmount: z.number().int().min(0).default(0),
  deadline: z.string(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().int().positive().optional(),
  savedAmount: z.number().int().min(0).optional(),
  deadline: z.string().optional(),
});

export const addSavingsAmountSchema = z.object({
  amount: z.number().int().positive(),
});

export const SavingsGoalValidations = {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addSavingsAmountSchema,
};