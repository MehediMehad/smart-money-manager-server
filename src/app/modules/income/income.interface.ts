import { z } from "zod";
import {
    createIncomeSchema,
    updateIncomeSchema,
} from "./income.validation";

export type TCreateIncomePayload = z.infer<typeof createIncomeSchema>;
export type TUpdateIncomePayload = z.infer<typeof updateIncomeSchema>;

export interface IIncomeFilter {
    searchTerm?: string;
    categoryId?: string;
    date?: string;
    month?: string;
    year?: string;
}

export type IncomeWithCategory = {
    id: string;
    amount: number | string;
    note: string | null;
    date: Date;
    category?: {
        name: string;
        emoji?: string | null;
    } | null;
};
