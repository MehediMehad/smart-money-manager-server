import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import type {
  TCreateSavingsGoalPayload,
  TUpdateSavingsGoalPayload,
  TAddSavingsAmountPayload,
  TMonth,
  TMonthlySavingsTrend,
} from './savingsGoal.interface';
import { monthNames } from './savingsGoal.constant';
import { getYearRange } from '../../utils/date';

const createSavingsGoal = async (
  userId: string,
  payload: TCreateSavingsGoalPayload,
) => {
  const result = await prisma.savingsGoal.create({
    data: {
      userId,
      name: payload.name,
      targetAmount: payload.targetAmount,
      savedAmount: payload.savedAmount ?? 0,
      deadline: new Date(payload.deadline),
    },
  });

  return result;
};

const getAllSavingsGoals = async (userId: string) => {
  const whereClause: Prisma.SavingsGoalWhereInput = {
    userId,
  };

  const savingsGoal = await prisma.savingsGoal.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      targetAmount: true,
      savedAmount: true,
      deadline: true,
    },
  });

  const goalIds = savingsGoal.map(goal => goal.id);


  const monthlySavingsMap: Record<TMonth, number> = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  if (goalIds.length > 0) {
    const currentYear = new Date().getFullYear();
    const { yearStart, yearEnd } = getYearRange(currentYear);


    const savingsTransactions = await prisma.savingsTransaction.findMany({
      where: {
        goalId: {
          in: goalIds,
        },
        createdAt: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    for (const transaction of savingsTransactions) {
      const monthIndex = new Date(transaction.createdAt).getMonth();
      const monthName = monthNames[monthIndex];
      monthlySavingsMap[monthName] += transaction.amount;
    }
  }

  const currentMonthIndex = new Date().getMonth();

  const orderedMonths: TMonth[] = [
    ...monthNames.slice(currentMonthIndex + 1),
    ...monthNames.slice(0, currentMonthIndex + 1),
  ];

  const monthlySavingsTrend: TMonthlySavingsTrend[] = orderedMonths.map(
    month => ({
      month,
      saved: monthlySavingsMap[month],
    }),
  );

  return {
    savingsGoal,
    monthlySavingsTrend,
  };
};

const getSingleSavingsGoal = async (userId: string, id: string) => {
  const savingsGoal = await prisma.savingsGoal.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      transactions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!savingsGoal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Savings goal not found');
  }

  return savingsGoal;
};

const updateSavingsGoal = async (
  userId: string,
  id: string,
  payload: TUpdateSavingsGoalPayload,
) => {
  await getSingleSavingsGoal(userId, id);

  const updateData: Record<string, unknown> = { ...payload };

  if (payload.deadline) {
    updateData.deadline = new Date(payload.deadline);
  }

  const result = await prisma.savingsGoal.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const addSavingsAmount = async (
  userId: string,
  goalId: string,
  payload: TAddSavingsAmountPayload,
) => {
  await getSingleSavingsGoal(userId, goalId);

  const result = await prisma.$transaction(async tx => {
    const updatedGoal = await tx.savingsGoal.update({
      where: { id: goalId },
      data: {
        savedAmount: {
          increment: payload.amount,
        },
      },
    });

    await tx.savingsTransaction.create({
      data: {
        goalId,
        amount: payload.amount,
      },
    });

    return updatedGoal;
  });

  return result;
};

const deleteSavingsGoal = async (userId: string, id: string) => {
  await getSingleSavingsGoal(userId, id);

  await prisma.$transaction(async tx => {
    await tx.savingsTransaction.deleteMany({
      where: {
        goalId: id,
      },
    });

    await tx.savingsGoal.delete({
      where: { id },
    });
  });

  return null;
};

export const SavingsGoalServices = {
  createSavingsGoal,
  getAllSavingsGoals,
  getSingleSavingsGoal,
  updateSavingsGoal,
  addSavingsAmount,
  deleteSavingsGoal,
};