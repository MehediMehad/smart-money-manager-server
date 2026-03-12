import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helpers/pick';
import { DailyBudgetServices } from './daily-budget.service';

const createBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const body = req.body;
  const result = await DailyBudgetServices.createDailyBudget(userId, body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Daily budget created successfully',
    data: result,
  });
});

const getBudgets = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await DailyBudgetServices.getDailyBudgets(userId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budgets fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getBudgetByDate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const date = req.query.date as string;
  const result = await DailyBudgetServices.getBudgetByDate(userId, date);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budgets fetched successfully',
    data: result,
  });
});

const getBudgetProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const date = req.query.date as string;
  const result = await DailyBudgetServices.getBudgetProgress(userId, date);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget progress fetched',
    data: result,
  });
});

const getTodayProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await DailyBudgetServices.getTodayProgress(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Today progress fetched',
    data: result,
  });
});

const updateBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const budgetId = req.params.id;
  const body = req.body;

  const result = await DailyBudgetServices.updateDailyBudget(userId, budgetId, body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget updated successfully',
    data: result,
  });
});

const deleteBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const budgetId = req.params.id;
  await DailyBudgetServices.deleteDailyBudget(userId, budgetId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget deleted successfully',
    data: null,
  });
});

export const DailyBudgetControllers = {
  createBudget,
  getBudgets,
  getBudgetByDate,
  getBudgetProgress,
  getTodayProgress,
  updateBudget,
  deleteBudget,
};