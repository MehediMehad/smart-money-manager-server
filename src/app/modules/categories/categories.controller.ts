import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { CategoriesServices } from './categories.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helpers/pick';

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

const createCategoriesIntoDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const body = req.body;
  const result = await CategoriesServices.createCategories(userId, body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Categories created successfully',
    data: result,
  });
})

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const filter = pick(req.query, ['searchTerm', 'type', 'year', 'month']); // year, month
  const result = await CategoriesServices.getCategories(userId, filter);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

const defaultCategories = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['searchTerm', 'type']);
  const result = await CategoriesServices.defaultCategories(filter);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

const hideCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { categoryId } = req.params;
  const result = await CategoriesServices.hideCategory(userId, categoryId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category hidden successfully',
    data: result,
  });
});

export const CategoriesControllers = {
  createCategoryIntoDB,
  createCategoriesIntoDB,
  getCategories,
  defaultCategories,
  hideCategory,
};