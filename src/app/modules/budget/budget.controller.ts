import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { BudgetServices } from './budget.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helpers/pick';

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

export const BudgetControllers = {
  createBudgetIntoDB,
  getAllBudgets,
};