import type { Prisma } from '@prisma/client';
import httpStatus from 'http-status';

import type { TCreateIncomePayload, TUpdateIncomePayload, IIncomeFilter } from './income.interface';
import ApiError from '../../errors/ApiError';
import prisma from '../../libs/prisma';

const createIncome = async (userId: string, payload: TCreateIncomePayload) => {
  const category = await prisma.category.findFirst({
    where: {
      id: payload.categoryId,
      type: 'INCOME',
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid income category');
  }

  const result = await prisma.income.create({
    data: {
      ...payload,
      userId,
    },
  });

  return result;
};

const getAllIncomes = async (userId: string, filters: IIncomeFilter) => {
  const { searchTerm, categoryId, date_range, month, year, sortBy, sortOrder } = filters;

  const whereClause: Prisma.IncomeWhereInput = {
    userId,
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (searchTerm) {
    whereClause.note = {
      contains: searchTerm,
      mode: 'insensitive',
    };
  }

  /**
   * date_range format: "5-12"
   * month: "03"
   * year: "2026"
   *
   * Result => 2026-03-05 to 2026-03-12
   */

  if (year && month && date_range) {
    const y = Number(year);
    const m = Number(month);
    const [startDay, endDay] = date_range.split('-').map(Number);

    if (!isNaN(y) && !isNaN(m) && !isNaN(startDay) && !isNaN(endDay)) {
      const start = new Date(y, m - 1, startDay);
      const end = new Date(y, m - 1, endDay + 1);

      // extra safety check
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        whereClause.date = {
          gte: start,
          lt: end,
        };
      }
    }
  }
  // whole month filter
  else if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);

    whereClause.date = {
      gte: start,
      lt: end,
    };
  }
  // whole year filter
  else if (year) {
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);

    whereClause.date = {
      gte: start,
      lt: end,
    };
  }

  type SortField = 'date' | 'amount';
  const allowedSortFields: SortField[] = ['date', 'amount'];

  const safeSortBy: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : 'date';

  const safeSortOrder: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

  const result = await prisma.income.findMany({
    where: whereClause,
    orderBy: {
      [safeSortBy]: safeSortOrder,
    },
    select: {
      id: true,
      note: true,
      amount: true,
      date: true,
      category: {
        select: {
          id: true,
          name: true,
          emoji: true,
          type: true,
        },
      },
    },
  });

  return result;
};

const getSingleIncome = async (userId: string, id: string) => {
  const income = await prisma.income.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      note: true,
      amount: true,
      date: true,
      category: {
        select: {
          id: true,
          name: true,
          emoji: true,
        },
      },
    },
  });

  if (!income) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Income not found');
  }

  return income;
};

const updateIncome = async (userId: string, id: string, payload: TUpdateIncomePayload) => {
  await getSingleIncome(userId, id);

  const result = await prisma.income.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteIncome = async (userId: string, id: string) => {
  await getSingleIncome(userId, id);

  await prisma.income.delete({
    where: { id },
  });

  return null;
};

export const IncomeServices = {
  createIncome,
  getAllIncomes,
  getSingleIncome,
  updateIncome,
  deleteIncome,
};
