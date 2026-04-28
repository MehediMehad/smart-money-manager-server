import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardServices } from './dashboard.service';

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