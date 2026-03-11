import path from 'path';

import dotenv from 'dotenv';

import { getEnvVar } from '../app/helpers/getEnvVar';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  app: {
    name: getEnvVar('APP_NAME'),
    env: getEnvVar('NODE_ENV'),
    port: getEnvVar('PORT'),
    cors_origins: getEnvVar('CORS_ORIGINS').split(','),
  },
  admin: {
    email: getEnvVar('SUPPER_ADMIN_EMAIL'),
    password: getEnvVar('ADMIN_PASSWORD'),
  },
  jwt: {
    access_secret: getEnvVar('JWT_ACCESS_SECRET'),
    access_expires_in: getEnvVar('JWT_ACCESS_EXPIRES_IN'),
    refresh_secret: getEnvVar('JWT_REFRESH_SECRET'),
    refresh_expires_in: getEnvVar('JWT_REFRESH_EXPIRES_IN'),
    reset_pass_secret: getEnvVar('JWT_RESET_PASS_SECRET'),
    reset_pass_expires_in: getEnvVar('JWT_RESET_PASS_EXPIRES_IN'),
    bcrypt_salt_rounds: Number(getEnvVar('BCRYPT_SALT_ROUNDS')),
    access_cookie_max_age: Number(getEnvVar('access_cookie_max_age', '30')),
    refresh_cookie_max_age: Number(getEnvVar('REFRESH_COOKIE_MAX_AGE', '30')),
  },
  mail: {
    email: getEnvVar('NODE_MAILER_EMAIL'),
    host: getEnvVar('SMTP_HOST'),
    port: Number(getEnvVar('SMTP_PORT', '465')),
    secure: getEnvVar('SMTP_SECURE') === 'true',
    auth: {
      user: getEnvVar('NODE_MAILER_EMAIL'),
      pass: getEnvVar('NODE_MAILER_APP_PASSWORD'),
    },
  },
  google: {
    translate_api_key: getEnvVar('GOOGLE_TRANSLATE_API_KEY'),
  },
  firebase: {
    clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
    privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  },
};

export default config;
