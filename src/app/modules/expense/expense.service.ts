import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
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
  options: IPaginationOptions,
) => {
  const { searchTerm, categoryId, date, month, year } = filters;

  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

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

  // specific day
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    whereClause.date = {
      gte: start,
      lt: end,
    };
  }

  // month filter
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    whereClause.date = {
      gte: start,
      lt: end,
    };
  }

  // year filter
  if (year) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    whereClause.date = {
      gte: start,
      lte: end,
    };
  }

  const result = await prisma.expense.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: {
      date: "desc", // newest first
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

  const total = await prisma.expense.count({
    where: whereClause,
  });

  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };

  return {
    meta,
    data: result,
  };
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