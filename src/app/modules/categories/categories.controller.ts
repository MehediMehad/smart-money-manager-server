import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { CategoriesServices } from './categories.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createCategoriesIntoDB = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await CategoriesServices.createCategories(body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Categories created successfully',
    data: result,
  });
});

export const CategoriesControllers = {
  createCategoriesIntoDB,
};