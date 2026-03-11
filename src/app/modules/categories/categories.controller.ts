import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { CategoriesServices } from './categories.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createCategoryIntoDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const body = req.body;
  const result = await CategoriesServices.createCategory(userId, body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Categories created successfully',
    data: result,
  });
});

export const CategoriesControllers = {
  createCategoryIntoDB,
};