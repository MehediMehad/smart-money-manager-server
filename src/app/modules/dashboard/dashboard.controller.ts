import httpStatus from 'http-status';

import { DashboardServices } from './dashboard.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';

const getDashboardOverview = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await DashboardServices.getDashboardOverview(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard overview retrieved successfully',
    data: result,
  });
});

export const DashboardController = {
  getDashboardOverview,
};
