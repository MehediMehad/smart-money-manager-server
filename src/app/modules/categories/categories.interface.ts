import type { CategoryTypeEnum } from '@prisma/client';
import type { z } from 'zod';

import type { createCategorySchema } from './categories.validation';

export type TCreateCategoriesPayload = z.infer<typeof createCategorySchema>;

export type TGetCategoriesFilter = {
  searchTerm?: string;
  type?: CategoryTypeEnum;
  year?: string;
  month?: string;
};
