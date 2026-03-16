import { z } from "zod";

export const createBudgetSchema = z.object({
  // TODO: add your fields here
  // title: z.string().min(1).trim(),
  // date: z.string().datetime({ message: 'Invalid date format' }),
});

export const BudgetValidations = {
  createBudgetSchema,
};