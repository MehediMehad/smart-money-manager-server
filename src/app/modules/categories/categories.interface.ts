import type { z } from 'zod';

import type { createCategoriesSchema } from './categories.validation';

export type TCreateCategoriesPayload = z.infer<typeof createCategoriesSchema>;
