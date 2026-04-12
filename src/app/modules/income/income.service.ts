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
      // userId,
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
      totalPage: Math.ceil(total / limit),
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

const getDashboardSummary2 = async (
  userId: string,
  year: number,
  month: number,
  today: string
) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0); // last day of month

  // 1. This month's total + today's income + source breakdown
  const monthlyIncomes = await prisma.income.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: {
        select: { id: true, name: true, emoji: true },
      },
    },
  });

  const totalThisMonth = monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);

  const todayIncome = monthlyIncomes
    .filter((i) => i.date.toISOString().split("T")[0] === today)
    .reduce((sum, i) => sum + i.amount, 0);

  const avgDaily = totalThisMonth > 0 ? Math.round(totalThisMonth / endOfMonth.getDate()) : 0;

  // Source summary (for Pie + cards)
  const sourceMap = new Map();
  monthlyIncomes.forEach((inc) => {
    const name = inc.category?.name || "Others";
    if (!sourceMap.has(name)) {
      sourceMap.set(name, { name, value: 0, color: "" });
    }
    sourceMap.get(name).value += inc.amount;
  });

  const sourceSummary = Array.from(sourceMap.values());

  // Main source
  const mainSource = sourceSummary.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    sourceSummary[0] || { name: "N/A", value: 0 }
  );

  // 2. Monthly trend - last 6 months
  const sixMonthsAgo = new Date(year, month - 6, 1);

  const trendData = await prisma.income.groupBy({
    by: ["date"],
    where: {
      userId,
      date: { gte: sixMonthsAgo },
    },
    _sum: { amount: true },
  });

  // Group by month name
  const monthlyTrendMap = new Map();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  trendData.forEach((item) => {
    const d = new Date(item.date);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!monthlyTrendMap.has(key)) monthlyTrendMap.set(key, 0);
    monthlyTrendMap.set(key, monthlyTrendMap.get(key) + (item._sum.amount || 0));
  });

  const monthlyTrendDummy = Array.from(monthlyTrendMap.entries())
    .map(([month, amount]) => ({ month, amount: Number(amount) }))
    .sort((a, b) => a.month.localeCompare(b.month)); // optional sort

  // 3. Recent incomes for table (limit 20)
  const recentIncomes = await prisma.income.findMany({
    where: { userId },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return {
    totalThisMonth,
    todayIncome,
    avgDaily,
    mainSource: {
      name: mainSource.name,
      value: mainSource.value,
    },
    sourceSummary: sourceSummary.map((s, index) => ({
      name: s.name,
      value: s.value,
      color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#f97316"][index % 6],
    })),
    monthlyTrend: monthlyTrendDummy.length > 0 ? monthlyTrendDummy : [
      { month: "Oct", amount: 32000 },
      { month: "Nov", amount: 38000 },
      { month: "Dec", amount: 41000 },
      { month: "Jan", amount: 42000 },
      { month: "Feb", amount: 46500 },
      { month: "Mar", amount: 79500 },
    ],
    incomes: recentIncomes.map((inc) => ({
      id: inc.id,
      date: inc.date.toISOString().split("T")[0],
      source: inc.category?.name || "Others",
      amount: Number(inc.amount),
      note: inc.note || "",
    })),
  };
};


const getDashboardSummary = async (
  userId: string,
  year: number,
  month: number,
  today: string
) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  // 1. Selected month's total + selected day's income + source breakdown
  const monthlyIncomes = await prisma.income.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: {
        select: { id: true, name: true, emoji: true },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  const totalThisMonth = monthlyIncomes.reduce(
    (sum, i) => sum + Number(i.amount),
    0
  );

  const todayIncome = monthlyIncomes
    .filter((i) => i.date.toISOString().split("T")[0] === today)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const daysInMonth = new Date(year, month, 0).getDate();
  const avgDaily =
    totalThisMonth > 0 ? Math.round(totalThisMonth / daysInMonth) : 0;

  // Source summary
  const sourceMap = new Map<string, { name: string; value: number }>();

  monthlyIncomes.forEach((inc) => {
    const name = inc.category?.name || "Others";

    if (!sourceMap.has(name)) {
      sourceMap.set(name, { name, value: 0 });
    }

    sourceMap.get(name)!.value += Number(inc.amount);
  });

  const sourceSummary = Array.from(sourceMap.values());

  const mainSource = sourceSummary.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    sourceSummary[0] || { name: "N/A", value: 0 }
  );

  // 2. Monthly trend - last 6 months from selected month
  const sixMonthsAgo = new Date(year, month - 6, 1);

  const trendData = await prisma.income.findMany({
    where: {
      userId,
      date: {
        gte: sixMonthsAgo,
        lte: endOfMonth,
      },
    },
    select: {
      date: true,
      amount: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const monthlyTrendMap = new Map<string, number>();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  trendData.forEach((item) => {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const prev = monthlyTrendMap.get(key) || 0;
    monthlyTrendMap.set(key, prev + Number(item.amount));
  });

  const monthlyTrend = Array.from(monthlyTrendMap.entries()).map(
    ([key, amount]) => {
      const [y, m] = key.split("-").map(Number);
      return {
        month: `${monthNames[m - 1]} ${y}`,
        amount,
        sortKey: key,
      };
    }
  );

  monthlyTrend.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // 3. Recent incomes for table (selected month or all? তুমি যেটা চাও)
  // এখানে selected month-এর recent দিলাম
  const recentIncomes = await prisma.income.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return {
    filter: {
      year,
      month,
      date: today,
    },
    totalThisMonth,
    todayIncome,
    avgDaily,
    mainSource: {
      name: mainSource.name,
      value: mainSource.value,
    },
    sourceSummary: sourceSummary.map((s, index) => ({
      name: s.name,
      value: s.value,
      color: [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#f97316",
      ][index % 6],
    })),
    monthlyTrend: monthlyTrend.map(({ sortKey, ...rest }) => rest),
    incomes: recentIncomes.map((inc) => ({
      id: inc.id,
      date: inc.date.toISOString().split("T")[0],
      source: inc.category?.name || "Others",
      amount: Number(inc.amount),
      note: inc.note || "",
    })),
  };
};

export const IncomeServices = {
  createIncome,
  getAllIncomes,
  getSingleIncome,
  updateIncome,
  deleteIncome,
  getDashboardSummary
};