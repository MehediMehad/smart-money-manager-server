import { CategoryTypeEnum } from '@prisma/client';
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).trim(),
  type: z.nativeEnum(CategoryTypeEnum),
  emoji: z.string(),
});

const createManyCategoriesSchema = createCategorySchema.array();

export const CategoriesValidations = {
  createCategorySchema,
  createManyCategoriesSchema,
};
