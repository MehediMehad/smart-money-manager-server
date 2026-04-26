import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TodayServices } from './today.service';

const getTodayUpdate = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result = await TodayServices.getTodayUpdate(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Today's update fetched successfully",
        data: result,
    });
});

export const TodayControllers = {
    getTodayUpdate,
};