import type { z } from 'zod';

import type { createExpenseSchema, updateExpenseSchema } from './expense.validation';

export type TCreateExpensePayload = z.infer<typeof createExpenseSchema>;
export type TUpdateExpensePayload = z.infer<typeof updateExpenseSchema>;

export interface IExpenseFilter {
  searchTerm?: string;
  categoryId?: string;
  date_range?: string;
  month?: string;
  year?: string;
}
