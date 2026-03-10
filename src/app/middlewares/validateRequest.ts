import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

interface FileFieldMapping {
  [key: string]:
  | 'single'
  | 'array'
  | { target: string; mode: 'single' | 'array'; filedName: string; type?: 'multiple' | 'single' }; // 👈 dynamic nested mapping
}

const validateRequest =
  (schema: z.ZodTypeAny, fileFields?: FileFieldMapping) =>
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        // May actually come as a string from multipart/form-data
        let data = req.body?.data ?? req.body;

        if (typeof data === 'string') {
          data = JSON.parse(data);
        }


        // Validate with Zod
        console.log('🎯 Validated Request:', data);
        await schema.parseAsync(data);

        // Overwrite req.body with parsed & validated object
        req.body = data;

        next();
      } catch (err) {
        next(err);
      }
    };

export const validateRequestArray =
  (schema: z.ZodTypeAny, fileFields?: FileFieldMapping) =>
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        // Parse body if string (multipart/form-data)
        let data = req.body.data ?? req.body;

        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        // Validate with Zod
        await schema.parseAsync(data);

        // Overwrite req.body with parsed & validated object
        req.body = data;

        next();
      } catch (err) {
        next(err);
      }
    };

export default validateRequest;
