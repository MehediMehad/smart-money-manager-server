import type { z } from 'zod';
import { createDebtZodSchema } from './debts.validation';
import { DebtStatus, DebtType } from '@prisma/client';


export type TCreateDebtsPayload = z.infer<typeof createDebtZodSchema>;

export type IDebtFilters = {
    searchTerm?: string;
    type?: DebtType;
    status?: DebtStatus;
};
