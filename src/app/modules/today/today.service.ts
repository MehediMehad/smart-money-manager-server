import prisma from '../../libs/prisma';
import { getDayRange } from '../../utils/date';

const getTodayUpdate = async (userId: string) => {
  const { startDay, endDay } = getDayRange();

  const [incomes, expenses, dailyBudgets, savingsGoals, debts] = await Promise.all([
    prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startDay,
          lte: endDay,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    }),

    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDay,
          lte: endDay,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    }),

    prisma.dailyBudget.findMany({
      where: {
        userId,
        date: {
          gte: startDay,
          lte: endDay,
        },
      },
      select: {
        amount: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.savingsGoal.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
        transactions: {
          where: {
            createdAt: {
              gte: startDay,
              lte: endDay,
            },
          },
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    }),

    prisma.debt.findMany({
      where: {
        userId,
        status: 'PENDING',
        dueDate: {
          gte: startDay,
        },
      },
      select: {
        amount: true,
        type: true,
        dueDate: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    }),
  ]);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const todayBudget = dailyBudgets.reduce((sum, item) => sum + item.amount, 0);

  const savingsAdded = savingsGoals.reduce((sum, goal) => {
    const goalTodaySavings = goal.transactions.reduce((total, tx) => total + tx.amount, 0);

    return sum + goalTodaySavings;
  }, 0);

  const budgetRemaining = todayBudget - totalExpense;

  const todaySpentPercent = todayBudget > 0 ? Math.round((totalExpense / todayBudget) * 100) : 0;

  const status = budgetRemaining < 0 ? 'danger' : todaySpentPercent > 70 ? 'warning' : 'good';

  const transactions = [
    ...incomes.map((item) => ({
      id: item.id,
      time: item.date,
      type: 'income',
      category: item.category.name,
      amount: item.amount,
      note: item.note,
    })),

    ...expenses.map((item) => ({
      id: item.id,
      time: item.date,
      type: 'expense',
      category: item.category.name,
      amount: item.amount,
      note: item.note,
    })),

    ...savingsGoals.flatMap((goal) =>
      goal.transactions.map((tx) => ({
        id: tx.id,
        time: tx.createdAt,
        type: 'savings',
        category: 'Savings',
        amount: tx.amount,
        note: `Added ৳${tx.amount} to ${goal.name}`,
      })),
    ),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const reminders = [
    ...debts.map((debt) => ({
      text: `Debt ${debt.type.toLowerCase()} due: ৳${debt.amount}`,
      type: 'alert',
    })),

    ...(todayBudget === 0
      ? [
          {
            text: 'Set your daily budget for today',
            type: 'reminder',
          },
        ]
      : []),

    ...(todayBudget > 0 && budgetRemaining < 0
      ? [
          {
            text: `You crossed today's budget by ৳${Math.abs(budgetRemaining)}`,
            type: 'alert',
          },
        ]
      : []),

    ...(todayBudget > 0 && todaySpentPercent >= 70 && budgetRemaining >= 0
      ? [
          {
            text: `You have used ${todaySpentPercent}% of today's budget`,
            type: 'warning',
          },
        ]
      : []),

    ...(savingsAdded === 0
      ? [
          {
            text: 'Try adding something to your savings today',
            type: 'reminder',
          },
        ]
      : [
          {
            text: `Great! You added ৳${savingsAdded} to savings today`,
            type: 'info',
          },
        ]),

    ...(totalExpense === 0
      ? [
          {
            text: 'No expenses added today yet',
            type: 'info',
          },
        ]
      : []),

    {
      text: 'Check monthly budget',
      type: 'info',
    },
  ];

  return {
    date: new Date(),
    income: totalIncome,
    expense: totalExpense,
    budgetRemaining,
    savingsAdded,
    todayBudget,
    todaySpentPercent,
    status,
    transactions,
    reminders,
  };
};

export const TodayServices = {
  getTodayUpdate,
};
