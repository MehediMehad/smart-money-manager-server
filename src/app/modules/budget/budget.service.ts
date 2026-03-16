import prisma from '../../libs/prisma';
import type { TBudget, TCreateBudgetPayload } from './budget.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import { dateHelpers } from '../../helpers/dateHelpers';

const createBudget = async (payload: TCreateBudgetPayload) => {
  // TODO: implement create logic here
  // const result = await prisma.budget.create({ data: payload });
  // return result;
};

const getAllBudgets = async (
  userId: string,
  filter: {
    type?: "DAILY" | "MONTHLY";
    date?: string; // 2026-03-16
    month?: string; // 03
    year?: string; // 2026
  }
): Promise<TBudget[]> => {
  const currentDate = new Date(); // ex: 2026-03-16
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());
  const currentDateStr: string = currentDate.toISOString().split("T")[0]; // ex: 2026-03-16

  const {
    type = "DAILY",
    date = currentDateStr,
    month = currentMonth,
    year = currentYear,
  } = filter;

  const budgets: TBudget[] = [];


  if (type === "DAILY" || type === undefined) {
    const { start: dayStart, end: dayEnd } = dateHelpers.getDateRange(date); // ex: 2026-03-16

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
            type: true,
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
          type: budget.category.type as "INCOME" | "EXPENSE",
        },
        type: "DAILY",
        amount: budget.amount,
        spent: spentData._sum.amount ?? 0,
      });
    }
  }


  if (type === "MONTHLY" || type === undefined) {
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
            type: true,
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
          type: budget.category.type as "INCOME" | "EXPENSE",
        },
        type: "MONTHLY",
        amount: budget.amount,
        spent: spentData._sum.amount ?? 0,
      });
    }
  }

  return budgets;
};



export const BudgetServices = {
  createBudget,
  getAllBudgets
};