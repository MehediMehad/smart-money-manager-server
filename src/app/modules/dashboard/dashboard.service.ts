import prisma from '../../libs/prisma';
import { calculateChange } from '../../utils/calculate';
import { formatDate, getDayRange, getMonthRange } from '../../utils/date';

const getSelectedMonthDate = (monthQuery?: string) => {
    if (!monthQuery) return new Date();

    const [month, year] = monthQuery.split('-').map(Number);

    if (!month || !year || month < 1 || month > 12) {
        return new Date();
    }

    return new Date(year, month - 1, 1);
};

const groupAmountByDate = <T extends { amount: number; date: Date }>(
    items: T[],
) => {
    const map = new Map<string, number>();

    items.forEach((item) => {
        const key = formatDate(item.date);
        map.set(key, (map.get(key) || 0) + item.amount);
    });

    return map;
};

const getDashboardOverview = async (userId: string, monthQuery?: string) => {
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = now;

    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const { startDay, endDay } = getDayRange()

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // chart selected month
    const chartDate = getSelectedMonthDate(monthQuery);
    const chartMonthStart = new Date(chartDate.getFullYear(), chartDate.getMonth(), 1);
    const chartMonthEnd = new Date(
        chartDate.getFullYear(),
        chartDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
    );

    const [
        incomes,
        expenses,
        savingsGoals,
        debts,
        currentIncome,
        previousIncome,
        currentExpense,
        previousExpense,
        currentSavingsTransactions,
        previousSavingsTransactions,
        todayBudget,
        todayExpense,
        monthlyBudget,
        monthlyExpense,
        chartIncomes,
        chartExpenses,
    ] = await Promise.all([
        prisma.income.findMany({
            where: { userId },
            include: {
                category: { select: { name: true } },
            },
            orderBy: { date: 'desc' },
            take: 5,
        }),

        prisma.expense.findMany({
            where: { userId },
            include: {
                category: { select: { name: true } },
            },
            orderBy: { date: 'desc' },
            take: 5,
        }),

        prisma.savingsGoal.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                savedAmount: true,
                targetAmount: true,
                deadline: true,
                transactions: {
                    select: {
                        id: true,
                        amount: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        }),

        prisma.debt.findMany({
            where: {
                userId,
                status: 'PENDING',
            },
            select: {
                id: true,
                person: true,
                amount: true,
                type: true,
                dueDate: true,
            },
            orderBy: { dueDate: 'asc' },
        }),

        prisma.income.aggregate({
            where: {
                userId,
                date: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.income.aggregate({
            where: {
                userId,
                date: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.expense.aggregate({
            where: {
                userId,
                date: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.expense.aggregate({
            where: {
                userId,
                date: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.savingsTransaction.aggregate({
            where: {
                goal: {
                    userId,
                },
                createdAt: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.savingsTransaction.aggregate({
            where: {
                goal: {
                    userId,
                },
                createdAt: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.dailyBudget.aggregate({
            where: {
                userId,
                date: {
                    gte: startDay,
                    lte: endDay,
                },
            },
            _sum: { amount: true },
        }),

        prisma.expense.aggregate({
            where: {
                userId,
                date: {
                    gte: startDay,
                    lte: endDay,
                },
            },
            _sum: { amount: true },
        }),

        prisma.monthlyBudget.aggregate({
            where: {
                userId,
                month: currentMonth,
                year: currentYear,
            },
            _sum: { amount: true },
        }),

        prisma.expense.aggregate({
            where: {
                userId,
                date: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: { amount: true },
        }),

        prisma.income.findMany({
            where: {
                userId,
                date: {
                    gte: chartMonthStart,
                    lte: chartMonthEnd,
                },
            },
            select: {
                amount: true,
                date: true,
            },
        }),

        prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: chartMonthStart,
                    lte: chartMonthEnd,
                },
            },
            select: {
                amount: true,
                date: true,
            },
        }),
    ]);

    const incomeAmount = currentIncome._sum.amount || 0;
    const previousIncomeAmount = previousIncome._sum.amount || 0;

    const expenseAmount = currentExpense._sum.amount || 0;
    const previousExpenseAmount = previousExpense._sum.amount || 0;

    const savingsAmount = currentSavingsTransactions._sum.amount || 0;
    const previousSavingsAmount = previousSavingsTransactions._sum.amount || 0;

    const balance = incomeAmount - expenseAmount;
    const previousBalance = previousIncomeAmount - previousExpenseAmount;

    const transactions = [
        ...incomes.map((item) => ({
            id: item.id,
            title: item.note,
            category: item.category.name,
            amount: item.amount,
            type: 'income',
            date: item.date,
        })),

        ...expenses.map((item) => ({
            id: item.id,
            title: item.note,
            category: item.category.name,
            amount: item.amount,
            type: 'expense',
            date: item.date,
        })),

        ...savingsGoals.flatMap((goal) =>
            goal.transactions.map((tx) => ({
                id: tx.id,
                title: goal.name,
                category: 'Savings',
                amount: tx.amount,
                type: 'savings',
                date: tx.createdAt,
            })),
        ),

        ...debts.map((debt) => ({
            id: debt.id,
            title: debt.person,
            category: debt.type === 'GIVEN' ? 'Debt Receivable' : 'Debt Payable',
            amount: debt.amount,
            type: 'debts',
            date: debt.dueDate,
        })),
    ].sort(
        (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    ).slice(0, 5);

    const receiveDebts = debts
        .filter((debt) => debt.type === 'GIVEN')
        .map((debt) => ({
            id: debt.id,
            name: debt.person,
            amount: debt.amount,
            dueDate: debt.dueDate,
        }));

    const payDebts = debts
        .filter((debt) => debt.type === 'TAKEN')
        .map((debt) => ({
            id: debt.id,
            name: debt.person,
            amount: debt.amount,
            dueDate: debt.dueDate,
        }));

    const goals = savingsGoals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        saved: goal.savedAmount,
        target: goal.targetAmount,
        deadline: goal.deadline,
        percent:
            goal.targetAmount > 0
                ? Math.round((goal.savedAmount / goal.targetAmount) * 100)
                : 0,
    }));

    const buildBudget = (
        title: string,
        budgetAmount: number,
        spentAmount: number,
        color: string,
    ) => {
        const left = budgetAmount - spentAmount;

        return {
            title,
            budget: budgetAmount,
            spent: spentAmount,
            percent:
                budgetAmount > 0
                    ? Math.round((spentAmount / budgetAmount) * 100)
                    : 0,
            left,
            color,
        };
    };

    const budgets = [
        buildBudget(
            "Today's Budget",
            todayBudget._sum.amount || 0,
            todayExpense._sum.amount || 0,
            'green',
        ),
        buildBudget(
            'Monthly Budget',
            monthlyBudget._sum.amount || 0,
            monthlyExpense._sum.amount || 0,
            'purple',
        ),
    ];

    const chartMonth = chartDate.getMonth();
    const chartMonthName = chartDate.toLocaleString('default', { month: 'long' });
    const chartYear = chartDate.getFullYear();
    const daysInChartMonth = new Date(chartYear, chartMonth + 1, 0).getDate();

    const incomeMap = groupAmountByDate(chartIncomes);
    const expenseMap = groupAmountByDate(chartExpenses);

    const chartData = Array.from({ length: daysInChartMonth }, (_, index) => {
        const day = index + 1;
        const date = new Date(chartYear, chartMonth, day);
        const key = formatDate(date);

        return {
            date: `${chartMonthName} ${day}`,
            income: incomeMap.get(key) || 0,
            expense: expenseMap.get(key) || 0,
        };
    });

    return {
        stats: [
            {
                title: 'Total Balance',
                value: balance,
                change: calculateChange(balance, previousBalance),
            },
            {
                title: 'Total Income',
                value: incomeAmount,
                change: calculateChange(incomeAmount, previousIncomeAmount),
            },
            {
                title: 'Total Expense',
                value: expenseAmount,
                change: calculateChange(expenseAmount, previousExpenseAmount),
            },
            {
                title: 'Total Savings',
                value: savingsAmount,
                change: calculateChange(savingsAmount, previousSavingsAmount),
            },
        ],
        transactions,
        debts: {
            receive: receiveDebts,
            pay: payDebts,
        },
        goals,
        budgets,
        chartData
    };
};

export const DashboardServices = {
    getDashboardOverview,
};