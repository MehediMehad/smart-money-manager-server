import type { Prisma } from '@prisma/client';
import { DebtStatus, DebtType } from '@prisma/client';
import httpStatus from 'http-status';

import type { IDebtFilters, TCreateDebtsPayload } from './debts.interface';
import ApiError from '../../errors/ApiError';
import prisma from '../../libs/prisma';

type IUpdateDebtPayload = Partial<TCreateDebtsPayload>;

const debtSelect = {
  id: true,
  userId: true,
  person: true,
  amount: true,
  type: true,
  dueDate: true,
  status: true,
  note: true,
  createdAt: true,
} satisfies Prisma.DebtSelect;

const createDebt = async (userId: string, payload: TCreateDebtsPayload) => {
  const result = await prisma.debt.create({
    data: {
      userId,
      person: payload.person,
      amount: payload.amount,
      type: payload.type,
      dueDate: payload.dueDate,
      status: payload.status,
      note: payload.note,
    },
    select: debtSelect,
  });

  return result;
};

const getAllDebts = async (userId: string, filters: IDebtFilters) => {
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.DebtWhereInput[] = [{ userId }];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          person: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          note: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  if (filterData.type) {
    andConditions.push({
      type: filterData.type,
    });
  }

  if (filterData.status) {
    andConditions.push({
      status: filterData.status,
    });
  }

  const whereConditions: Prisma.DebtWhereInput = andConditions.length ? { AND: andConditions } : {};

  const [data, totalGivenAgg, totalTakenAgg, upcomingPayableAgg, upcomingReceivableAgg] =
    await Promise.all([
      prisma.debt.findMany({
        where: whereConditions,
        orderBy: {
          createdAt: 'desc',
        },
        select: debtSelect,
      }),
      prisma.debt.aggregate({
        where: {
          userId,
          type: DebtType.GIVEN,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.debt.aggregate({
        where: {
          userId,
          type: DebtType.TAKEN,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.debt.aggregate({
        where: {
          userId,
          type: DebtType.GIVEN,
          status: DebtStatus.PENDING,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.debt.aggregate({
        where: {
          userId,
          type: DebtType.TAKEN,
          status: DebtStatus.PENDING,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

  return {
    meta: {
      total: data.length,
      totalGiven: totalGivenAgg._sum.amount || 0,
      totalTaken: totalTakenAgg._sum.amount || 0,
      upcomingPayableIn7Days: upcomingPayableAgg._sum.amount || 0,
      upcomingReceivableIn7Days: upcomingReceivableAgg._sum.amount || 0,
    },
    data,
  };
};

const getSingleDebt = async (userId: string, id: string) => {
  const result = await prisma.debt.findFirst({
    where: {
      id,
      userId,
    },
    select: debtSelect,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Debt not found');
  }

  return result;
};

const updateDebt = async (userId: string, id: string, payload: IUpdateDebtPayload) => {
  const existingDebt = await prisma.debt.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingDebt) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Debt not found');
  }

  const result = await prisma.debt.update({
    where: {
      id,
    },
    data: payload,
    select: debtSelect,
  });

  return result;
};

const deleteDebt = async (userId: string, id: string) => {
  const existingDebt = await prisma.debt.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingDebt) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Debt not found');
  }

  const result = await prisma.debt.delete({
    where: {
      id,
    },
    select: debtSelect,
  });

  return result;
};

export const DebtServices = {
  createDebt,
  getAllDebts,
  getSingleDebt,
  updateDebt,
  deleteDebt,
};
