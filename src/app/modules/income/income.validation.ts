import { z } from "zod";

export const createIncomeSchema = z.object({
    categoryId: z.string(),
    amount: z.number().int().positive(),
    note: z.string().min(1),
    date: z.string(),
});

export const updateIncomeSchema = z.object({
    categoryId: z.string().optional(),
    amount: z.number().int().positive().optional(),
    note: z.string().optional(),
    date: z.string().optional(),
});

export const IncomeValidations = {
    createIncomeSchema,
    updateIncomeSchema,
};