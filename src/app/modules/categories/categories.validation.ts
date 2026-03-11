import { CategoryTypeEnum } from "@prisma/client";
import { z } from "zod";

export const createCategoriesSchema = z.object({
  name: z.string().min(1).trim(),
  type: z.nativeEnum(CategoryTypeEnum),
  emoji: z.string(),
  userId: z.string(),
});

export const CategoriesValidations = {
  createCategoriesSchema,
};