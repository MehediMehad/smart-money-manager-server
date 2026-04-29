import type { DebtStatus, DebtType } from '@prisma/client';
import type { z } from 'zod';

import type { createDebtZodSchema } from './debts.validation';

export type TCreateDebtsPayload = z.infer<typeof createDebtZodSchema>;

export type IDebtFilters = {
  searchTerm?: string;
  type?: DebtType;
  status?: DebtStatus;
};
