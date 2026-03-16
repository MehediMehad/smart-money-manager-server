import prisma from '../../libs/prisma';
import type { TBudget, TCreateBudgetPayload } from './budget.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';

const createBudget = async (payload: TCreateBudgetPayload) => {
  // TODO: implement create logic here
  // const result = await prisma.budget.create({ data: payload });
  // return result;
};

const mapBudget = (budget: any, type: "DAILY" | "MONTHLY"): TBudget => ({
  id: budget.id,
  categoryId: budget.categoryId,
  category: {
    id: budget.category.id,
    name: budget.category.name,
    emoji: budget.category.emoji,
    type: budget.category.type,
  },
  type,
  amount: budget.amount,
  spent: type === "DAILY" ? budget.spent : 0,
});

const getAllBudgets = async (userId: string, filter: {
  type?: "DAILY" | "MONTHLY";
  date?: string;
  month?: string;
  year?: string;
}) => {

  const whereConditions: any = { userId };


  if (filter.type === "DAILY" && filter.date) {
    const dailyDate = new Date(filter.date);
    whereConditions.date = dailyDate;
  }

  if (filter.type === "MONTHLY" && filter.month && filter.year) {
    whereConditions.month = parseInt(filter.month);
    whereConditions.year = parseInt(filter.year);
  }


  let budgets: any[] = [];

  if (filter.type === "DAILY" || !filter.type) {
    const dailyBudgets = await prisma.dailyBudget.findMany({
      where: whereConditions,
      include: { category: true },
    });
    budgets = budgets.concat(dailyBudgets.map((budget) => mapBudget(budget, "DAILY")));
  }

  if (filter.type === "MONTHLY" || !filter.type) {
    const monthlyBudgets = await prisma.monthlyBudget.findMany({
      where: whereConditions,
      include: { category: true },
    });
    budgets = budgets.concat(monthlyBudgets.map((budget) => mapBudget(budget, "MONTHLY")));
  }

  return budgets;
};



export const BudgetServices = {
  createBudget,
  getAllBudgets
};