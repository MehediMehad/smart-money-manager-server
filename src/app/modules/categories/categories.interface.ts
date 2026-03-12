import type { z } from 'zod';

import type { createCategoriesSchema } from './categories.validation';
import { CategoryTypeEnum } from '@prisma/client';

export type TCreateCategoriesPayload = z.infer<typeof createCategoriesSchema>;


export type TGetCategoriesFilter = {
    searchTerm?: string;
    type?: CategoryTypeEnum;
};