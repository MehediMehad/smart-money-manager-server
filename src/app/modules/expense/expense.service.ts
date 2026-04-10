import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import type {
  TCreateExpensePayload,
  TUpdateExpensePayload,
  IExpenseFilter,
} from './expense.interface';

const createExpense = async (userId: string, payload: TCreateExpensePayload) => {
  const category = await prisma.category.findFirst({
    where: {
      id: payload.categoryId,
      type: 'EXPENSE',
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid expense category');
  }

  // Convert the date string to a Date object
  const expenseDate = new Date(payload.date);

  // Check if Daily Budget exists for the date
  const existingDailyBudget = await prisma.dailyBudget.findFirst({
    where: {
      userId,
      categoryId: payload.categoryId,
      date: expenseDate,
    },
  });

  // If no daily budget, create it with 0 amount
  if (!existingDailyBudget) {
    await prisma.dailyBudget.create({
      data: {
        userId,
        categoryId: payload.categoryId,
        amount: 0,
        date: expenseDate,
      },
    });
  }

  // Check if Monthly Budget exists for the month and year
  const existingMonthlyBudget = await prisma.monthlyBudget.findFirst({
    where: {
      userId,
      categoryId: payload.categoryId,
      month: expenseDate.getMonth() + 1,  // JavaScript months are 0-based
      year: expenseDate.getFullYear(),
    },
  });

  // If no monthly budget, create it with 0 amount
  if (!existingMonthlyBudget) {
    await prisma.monthlyBudget.create({
      data: {
        userId,
        categoryId: payload.categoryId,
        amount: 0,
        month: expenseDate.getMonth() + 1,
        year: expenseDate.getFullYear(),
      },
    });
  }

  // Finally, create the expense
  const result = await prisma.expense.create({
    data: {
      ...payload,
      userId,
    },
  });

  return result;
};

const getAllExpenses = async (
  userId: string,
  filters: IExpenseFilter,
) => {
  const { searchTerm, categoryId, date_range, month, year } = filters;

  const whereClause: Prisma.ExpenseWhereInput = {
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
    const [startDay, endDay] = date_range.split("-").map(Number);

    if (
      !isNaN(y) &&
      !isNaN(m) &&
      !isNaN(startDay) &&
      !isNaN(endDay)
    ) {
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

  const result = await prisma.expense.findMany({
    where: whereClause,
    orderBy: {
      date: "desc",
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

const getSingleExpense = async (userId: string, id: string) => {
  const expense = await prisma.expense.findFirst({
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
    }
  });

  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }

  return expense;
};

const updateExpense = async (
  userId: string,
  id: string,
  payload: TUpdateExpensePayload,
) => {
  await getSingleExpense(userId, id);

  const result = await prisma.expense.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteExpense = async (userId: string, id: string) => {
  await getSingleExpense(userId, id);

  await prisma.expense.delete({
    where: { id },
  });

  return null;
};

export const ExpenseServices = {
  createExpense,
  getAllExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense,
};