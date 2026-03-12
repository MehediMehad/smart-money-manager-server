import { z } from 'zod';
import { createSchema, updateSchema } from './daily-budget.validation';

export type TCreateDailyBudgetPayload = z.infer<typeof createSchema>;
export type TUpdateDailyBudgetPayload = z.infer<typeof updateSchema>;