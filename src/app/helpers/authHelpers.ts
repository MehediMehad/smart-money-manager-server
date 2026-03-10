import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import type { SignOptions } from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';

import config from '../../configs';
import ApiError from '../errors/ApiError';

export interface TAccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: string;
}

const createAccessToken = (payload: TAccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.access_expires_in,
    algorithm: 'HS256',
  };

  return sign(payload, config.jwt.access_secret, options);
};

const createRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refresh_expires_in,
    algorithm: 'HS256',
  };

  return sign(payload, config.jwt.refresh_secret, options);
};

const verifyAccessToken = (token: string): TAccessTokenPayload => {
  try {
    return verify(token, config.jwt.access_secret) as TAccessTokenPayload;
  } catch (error) {
    console.error('Error verifying access token:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired access token');
  }
};

const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return verify(token, config.jwt.refresh_secret) as RefreshTokenPayload;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
};

// Hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = config.jwt.bcrypt_salt_rounds; // Salt rounds
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Compare password
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> =>
  await bcrypt.compare(password, hashedPassword);

export const authHelpers = {
  hashPassword,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
