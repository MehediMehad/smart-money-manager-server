import httpStatus from 'http-status';

import ApiError from '../errors/ApiError';

const toPrismaDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    if (isNaN(date.getTime())) throw new Error('Invalid Date object');
    return date;
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid date format: ${date}. Expected ISO-8601 string or Date object.`,
    );
  }

  return parsed;
};

/** 
 example 01:
const prismaDate = toPrismaDate('2002-09-15');
//* Output: 2002-09-15T00:00:00.000Z

example 02:
const prismaDate = toPrismaDate(new Date('2002-09-15'));
//* Output: 2002-09-15T00:00:00.000Z
**/

const matchDay = (dayOne: string = new Date().toISOString(), dayTwo: string) => {
  const dayOneSplit = dayOne.split('T')[0];
  const dayTwoSplit = dayTwo.split('T')[0];
  return dayOneSplit === dayTwoSplit;
};

// example 03:
// const { start, end } = getDateRange('2002-09-15');
//* Output: { start: 2002-09-15T00:00:00.000Z, end: 2002-09-15T23:59:59.999Z }


const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// example 04:
// const { start, end } = getMonthRange(2002, 9);
//* Output: { start: 2002-09-01T00:00:00.000Z, end: 2002-09-30T23:59:59.999Z }



const getDayDateRange = (dateStr: string) => {
  const start = new Date(dateStr);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(dateStr);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

// output: { start: 2026-03-16T00:00:00.000Z, end: 2026-03-16T23:59:59.999Z }

const getMonthDateRange = (dateStr: string) => { // 2026-03-16
  const date = new Date(dateStr);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return { start, end, month, year };
};

// output: { start: 2026-03-16T00:00:00.000Z, end: 2026-03-16T23:59:59.999Z, month: 3, year: 2026 }

export const dateHelpers = {
  toPrismaDate,
  matchDay,
  getMonthRange,
  getDayDateRange,
  getMonthDateRange
};
