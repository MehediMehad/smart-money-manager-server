import prisma from "../../libs/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { paginationHelper } from "../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interface/pagination.type";
import type {
  TCreateIncomePayload,
  TUpdateIncomePayload,
  IIncomeFilter,
} from "./income.interface";

const createIncome = async (userId: string, payload: TCreateIncomePayload) => {
  const category = await prisma.category.findFirst({
    where: {
      id: payload.categoryId,
      userId,
      type: "INCOME",
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid income category");
  }

  const result = await prisma.income.create({
    data: {
      ...payload,
      userId,
    },
  });

  return result;
};

const getAllIncomes = async (
  userId: string,
  filters: IIncomeFilter,
  options: IPaginationOptions
) => {
  const { searchTerm, categoryId, date, month, year } = filters;

  const { limit, page, skip } =
    paginationHelper.calculatePagination(options);

  const whereClause: Prisma.IncomeWhereInput = {
    userId,
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (searchTerm) {
    whereClause.note = {
      contains: searchTerm,
      mode: "insensitive",
    };
  }

  // Date filter
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    whereClause.date = {
      gte: start,
      lt: end,
    };
  }

  // Month filter
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    whereClause.date = {
      gte: start,
      lt: end,
    };
  }

  // Year filter
  if (year) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    whereClause.date = {
      gte: start,
      lte: end,
    };
  }

  const result = await prisma.income.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: {
      date: "desc", //  newest first
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

  const total = await prisma.income.count({
    where: whereClause,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    data: result,
  };
};

const getSingleIncome = async (userId: string, id: string) => {
  const income = await prisma.income.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!income) {
    throw new ApiError(httpStatus.NOT_FOUND, "Income not found");
  }

  return income;
};

const updateIncome = async (
  userId: string,
  id: string,
  payload: TUpdateIncomePayload
) => {
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