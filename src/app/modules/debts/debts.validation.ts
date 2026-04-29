import { DebtStatus, DebtType } from '@prisma/client';
import { z } from 'zod';

export const createDebtZodSchema = z.object({
  person: z.string().min(1, 'Person is required').trim(),
  amount: z.number().int('Amount must be an integer').positive('Amount must be greater than 0'),
  type: z.nativeEnum(DebtType),
  dueDate: z.string().datetime().optional(),
  status: z.nativeEnum(DebtStatus).optional(),
  note: z.string().min(1, 'Note is required').trim(),
});

const updateDebtZodSchema = z.object({
  person: z.string().min(1, 'Person is required').trim().optional(),
  amount: z
    .number()
    .int('Amount must be an integer')
    .positive('Amount must be greater than 0')
    .optional(),
  type: z.nativeEnum(DebtType).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.nativeEnum(DebtStatus).optional(),
  note: z.string().min(1, 'Note is required').trim().optional(),
});

export const DebtValidations = {
  createDebtZodSchema,
  updateDebtZodSchema,
};
