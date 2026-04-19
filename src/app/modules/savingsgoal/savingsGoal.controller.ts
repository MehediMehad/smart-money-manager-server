import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helpers/pick';
import { SavingsGoalServices } from './savingsGoal.service';

const createSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await SavingsGoalServices.createSavingsGoal(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Savings goal created successfully',
    data: result,
  });
});

const getAllSavingsGoals = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await SavingsGoalServices.getAllSavingsGoals(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Savings goals fetched successfully',
    data: result,
  });
});

const getSingleSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await SavingsGoalServices.getSingleSavingsGoal(
    userId,
    req.params.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Savings goal fetched successfully',
    data: result,
  });
});

const updateSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await SavingsGoalServices.updateSavingsGoal(
    userId,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Savings goal updated successfully',
    data: result,
  });
});

const addSavingsAmount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await SavingsGoalServices.addSavingsAmount(
    userId,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Amount added to savings goal successfully',
    data: result,
  });
});

const deleteSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  await SavingsGoalServices.deleteSavingsGoal(userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Savings goal deleted successfully',
    data: null,
  });
});

export const SavingsGoalControllers = {
  createSavingsGoal,
  getAllSavingsGoals,
  getSingleSavingsGoal,
  updateSavingsGoal,
  addSavingsAmount,
  deleteSavingsGoal,
};