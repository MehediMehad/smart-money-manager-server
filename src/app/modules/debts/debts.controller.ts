import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { DebtServices } from './debts.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { pick } from '../../utils/objectUtils';

const createDebt = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };

  const result = await DebtServices.createDebt(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Debt created successfully',
    data: result,
  });
});

const getAllDebts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };

  const filters = pick(req.query, ['searchTerm', 'type', 'status']);

  const result = await DebtServices.getAllDebts(user.userId, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Debts retrieved successfully',
    data: result,
  });
});

const getSingleDebt = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };

  const result = await DebtServices.getSingleDebt(user.userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Debt retrieved successfully',
    data: result,
  });
});

const updateDebt = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };

  const result = await DebtServices.updateDebt(user.userId, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Debt updated successfully',
    data: result,
  });
});

const deleteDebt = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };

  const result = await DebtServices.deleteDebt(user.userId, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Debt deleted successfully',
    data: result,
  });
});

export const DebtControllers = {
  createDebt,
  getAllDebts,
  getSingleDebt,
  updateDebt,
  deleteDebt,
};
