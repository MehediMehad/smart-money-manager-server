import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { IncomeServices } from './income.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { pick } from '../../utils/objectUtils';

const createIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await IncomeServices.createIncome(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Income created successfully',
    data: result,
  });
});

const getAllIncomes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const filters = pick(req.query, [
    'searchTerm',
    'categoryId',
    'date_range',
    'month',
    'year',
    'sortBy',
    'sortOrder',
  ]);

  const result = await IncomeServices.getAllIncomes(userId, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incomes fetched successfully',
    data: result,
  });
});

const getSingleIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await IncomeServices.getSingleIncome(userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Income fetched successfully',
    data: result,
  });
});

const updateIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await IncomeServices.updateIncome(userId, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Income updated successfully',
    data: result,
  });
});

const deleteIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  await IncomeServices.deleteIncome(userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Income deleted successfully',
    data: null,
  });
});

export const IncomeControllers = {
  createIncome,
  getAllIncomes,
  getSingleIncome,
  updateIncome,
  deleteIncome,
};
