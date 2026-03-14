import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import type {
  TCreateDailyBudgetPayload,
  TUpdateDailyBudgetPayload,
} from './daily-budget.interface';

const createDailyBudget = async (
  userId: string,
  payload: TCreateDailyBudgetPayload,
) => {
  const { categoryId, date } = payload;

  const exists = await prisma.dailyBudget.findFirst({
    where: {
      userId,
      categoryId,
      date: new Date(date),
    },
  });

  if (exists) {
    const result = await prisma.dailyBudget.update({
      where: {
        id: exists.id,
      },
      data: {
        amount: exists.amount + payload.amount,
      },
    })
    return result
  }

  const result = await prisma.dailyBudget.create({
    data: {
      ...payload,
      date: new Date(payload.date),
      userId,
    },
  });

  return result;
};

const getDailyBudgets = async (
  userId: string,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } =
    paginationHelper.calculatePagination(options);

  const result = await prisma.dailyBudget.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: {
      date: "desc", // newest first
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          emoji: true,
        },
      },
    },
  });

  const total = await prisma.dailyBudget.count({
    where: { userId },
  });

  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return { meta, data: result };
};

const getBudgetByDate = async (userId: string, date: string) => {
  if (!date) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Date is required');
  }
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const budgets = await prisma.dailyBudget.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
    include: {
      category: true,
    },
  });

  return budgets;
};

const getBudgetProgress = async (userId: string, date: string) => {
  if (!date) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Date is required');
  }
  // get all budgets and expenses
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const budgets = await prisma.dailyBudget.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
    select: {
      categoryId: true,
      amount: true,
      category: {
        select: {
          id: true,
          name: true,
          emoji: true,
        },
      },
    }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
  });

  const result = budgets.map((budget) => {
    const spent = expenses
      .filter((e) => e.categoryId === budget.categoryId)
      .reduce((acc, e) => acc + e.amount, 0);

    return {
      category: budget.category,
      budget: budget.amount,
      spent,
      remaining: budget.amount - spent,
      progress: Math.min((spent / budget.amount) * 100, 100),
    };
  });

  return result;
};

const getTodayProgress = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  return getBudgetProgress(userId, today);
};

const updateDailyBudget = async (
  userId: string,
  id: string,
  payload: TUpdateDailyBudgetPayload,
) => {
  const budget = await prisma.dailyBudget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  }

  const result = await prisma.dailyBudget.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteDailyBudget = async (userId: string, id: string) => {
  const budget = await prisma.dailyBudget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  }

  await prisma.dailyBudget.delete({
    where: { id },
  });

  return null;
};

export const DailyBudgetServices = {
  createDailyBudget,
  getDailyBudgets,
  getBudgetByDate,
  getBudgetProgress,
  getTodayProgress,
  updateDailyBudget,
  deleteDailyBudget,
};