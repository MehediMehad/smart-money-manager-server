import type { z } from 'zod';

import type { createCategorySchema } from './categories.validation';
import { CategoryTypeEnum } from '@prisma/client';

export type TCreateCategoriesPayload = z.infer<typeof createCategorySchema>;


export type TGetCategoriesFilter = {
    searchTerm?: string;
    type?: CategoryTypeEnum;
    year?: string;
    month?: string;
};