import httpStatus from 'http-status';

import type { TBudget, TCreateBudgetPayload, TUpdateBudgetPayload } from './budget.interface';
import ApiError from '../../errors/ApiError';
import { dateHelpers } from '../../helpers/dateHelpers';
import prisma from '../../libs/prisma';

const createBudget = async (userId: string, payload: TCreateBudgetPayload) => {
  const { categoryId, amount, date, type, month, year } = payload;

  // Check if category exists
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid category');
  }

  if (type === 'DAILY') {
    const { start } = dateHelpers.getDayDateRange(date && date ? date : new Date().toISOString());

    const budget = await prisma.dailyBudget.upsert({
      where: {
        // Unique constraint: userId_categoryId_date
        userId_categoryId_date: {
          userId,
          categoryId,
          date: start, // Normalize to start of day
        },
      },
      update: {
        amount,
      },
      create: {
        userId,
        categoryId,
        amount,
        date: start,
      },
      include: {
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

    return budget;
  }

  if (type === 'MONTHLY') {
    if (!month || !year) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid month or year');
    }

    const budget = await prisma.monthlyBudget.upsert({
      where: {
        // Unique constraint: userId_categoryId_month_year
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
      update: {
        amount,
      },
      create: {
        userId,
        categoryId,
        amount,
        month,
        year,
      },
      include: {
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

    return budget;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid budget type');
};

const updateBudget = async (userId: string, budgetId: string, payload: TUpdateBudgetPayload) => {
  const { amount, type } = payload;

  if (type === 'MONTHLY') {
    const isExists = await prisma.monthlyBudget.findFirst({
      where: {
        userId,
        id: budgetId,
      },
    });

    if (!isExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Budget not found');
    }

    const updatedBudget = await prisma.monthlyBudget.update({
      where: { id: budgetId, userId },
      data: { amount },
    });
    return updatedBudget;
  }

  if (type === 'DAILY') {
    const isExists = await prisma.dailyBudget.findFirst({
      where: {
        userId,
        id: budgetId,
      },
    });

    if (!isExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Budget not found');
    }

    const updatedBudget = await prisma.dailyBudget.update({
      where: { id: budgetId, userId },
      data: { amount },
    });
    return updatedBudget;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid budget type');
};

const getAllBudgets = async (
  userId: string,
  filter: {
    type?: 'DAILY' | 'MONTHLY';
    date?: string; // 2026-03-16
    month?: string; // 03
    year?: string; // 2026
  },
): Promise<TBudget[]> => {
  const currentDate = new Date(); // ex: 2026-03-16
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = String(currentDate.getFullYear());
  const currentDateStr: string = currentDate.toISOString().split('T')[0]; // ex: 2026-03-16

  const {
    type = 'DAILY',
    date = currentDateStr,
    month = currentMonth,
    year = currentYear,
  } = filter;

  const budgets: TBudget[] = [];

  if (type === 'DAILY' || type === undefined) {
    const { start: dayStart, end: dayEnd } = dateHelpers.getDayDateRange(date); // ex: 2026-03-16

    const dailyBudgets = await prisma.dailyBudget.findMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
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

    for (const budget of dailyBudgets) {
      const spentData = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      budgets.push({
        id: budget.id,
        categoryId: budget.categoryId,
        category: {
          id: budget.category.id,
          name: budget.category.name,
          emoji: budget.category.emoji,
        },
        type: 'DAILY',
        amount: budget.amount,
        spent: spentData._sum.amount ?? 0,
      });
    }
  }

  if (type === 'MONTHLY' || type === undefined) {
    const monthNum = Number(month);
    const yearNum = Number(year);
    const { start: monthStart, end: monthEnd } = dateHelpers.getMonthRange(yearNum, monthNum);

    const monthlyBudgets = await prisma.monthlyBudget.findMany({
      where: {
        userId,
        month: monthNum,
        year: yearNum,
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

    for (const budget of monthlyBudgets) {
      const spentData = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      budgets.push({
        id: budget.id,
        categoryId: budget.categoryId,
        category: {
          id: budget.category.id,
          name: budget.category.name,
          emoji: budget.category.emoji,
        },
        type: 'MONTHLY',
        amount: budget.amount,
        spent: spentData._sum.amount ?? 0,
      });
    }
  }

  return budgets;
};

export const BudgetServices = {
  createBudget,
  getAllBudgets,
  updateBudget,
};
