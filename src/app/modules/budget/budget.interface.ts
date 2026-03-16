import type { z } from 'zod';

import type { createBudgetSchema, updateBudgetSchema } from './budget.validation';

export type TCreateBudgetPayload = z.infer<typeof createBudgetSchema>;
export type TUpdateBudgetPayload = z.infer<typeof updateBudgetSchema>;

export type TBudget = {
    id: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
        emoji: string;
        type: "INCOME" | "EXPENSE";
    };
    type: "DAILY" | "MONTHLY";
    amount: number;
    spent: number;
};