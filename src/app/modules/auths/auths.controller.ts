import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { AuthsServices } from './auths.service';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import config from '../../../configs';

const registerUserIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthsServices.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully. Please check your email to verify.',
    data: result,
  });
});

const loginUserIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthsServices.loginUser(req.body);

  // Set Access token in cookie
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: config.jwt.access_cookie_max_age * 24 * 60 * 60 * 1000,
  });

  // Set refresh token in cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: config.jwt.refresh_cookie_max_age * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: result.user,
  });
});

const verifyEmailIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthsServices.verifyEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message || 'Email verified successfully',
    data: result.result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthsServices.getMe(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const forgotPasswordIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthsServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message || 'Password reset email sent successfully',
    data: result.message,
  });
});

const resetPasswordIntoDB = catchAsync(async (req: Request, res: Response) => {
  await AuthsServices.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successful',
  });
});

const changePasswordIntoDB = catchAsync(async (req: Request, res: Response) => {
  await AuthsServices.changePassword(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
  });
});

const refreshTokenIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'No refresh token provided');
  }
  const result = await AuthsServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token refreshed',
    data: result,
  });
});

const resendOtpIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthsServices.resendOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

export const AuthsControllers = {
  registerUserIntoDB,
  loginUserIntoDB,
  verifyEmailIntoDB,
  getMyProfile,
  forgotPasswordIntoDB,
  resetPasswordIntoDB,
  changePasswordIntoDB,
  refreshTokenIntoDB,
  resendOtpIntoDB,
};
