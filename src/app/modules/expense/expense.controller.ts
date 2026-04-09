import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helpers/pick';
import { ExpenseServices } from './expense.service';

const createExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await ExpenseServices.createExpense(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Expense created successfully',
    data: result,
  });
});

const getAllExpenses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const filters = pick(req.query, [
    'searchTerm',
    'categoryId',
    'month',
    'year',
    'date_range',
  ]);

  const result = await ExpenseServices.getAllExpenses(userId, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expenses fetched successfully',
    data: result,
  });
});

const getSingleExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await ExpenseServices.getSingleExpense(userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense fetched successfully',
    data: result,
  });
});

const updateExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await ExpenseServices.updateExpense(
    userId,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense updated successfully',
    data: result,
  });
});

const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  await ExpenseServices.deleteExpense(userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense deleted successfully',
    data: null,
  });
});

export const ExpenseControllers = {
  createExpense,
  getAllExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense,
};