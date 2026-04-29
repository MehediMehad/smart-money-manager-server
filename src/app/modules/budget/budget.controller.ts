import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { BudgetServices } from './budget.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { pick } from '../../utils/objectUtils';

const createBudgetIntoDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const body = req.body;
  const result = await BudgetServices.createBudget(userId, body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Budget created successfully',
    data: result,
  });
});

const getAllBudgets = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const filter = pick(req.query, ['type', 'date', 'month', 'year']);
  const result = await BudgetServices.getAllBudgets(userId, filter);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budgets fetched successfully',
    data: result,
  });
});

const updateBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const budgetId = req.params.budgetId;
  const body = req.body;
  const result = await BudgetServices.updateBudget(userId, budgetId, body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget updated successfully',
    data: result,
  });
});

export const BudgetControllers = {
  createBudgetIntoDB,
  getAllBudgets,
  updateBudget,
};
