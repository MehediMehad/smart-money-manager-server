import type { z } from 'zod';

import type {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addSavingsAmountSchema,
} from './savingsGoal.validation';

export type TCreateSavingsGoalPayload = z.infer<typeof createSavingsGoalSchema>;
export type TUpdateSavingsGoalPayload = z.infer<typeof updateSavingsGoalSchema>;
export type TAddSavingsAmountPayload = z.infer<typeof addSavingsAmountSchema>;

export type TMonth =
  | 'Jan'
  | 'Feb'
  | 'Mar'
  | 'Apr'
  | 'May'
  | 'Jun'
  | 'Jul'
  | 'Aug'
  | 'Sep'
  | 'Oct'
  | 'Nov'
  | 'Dec';

export type TMonthlySavingsTrend = {
  month: TMonth;
  saved: number;
};
