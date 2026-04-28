import prisma from '../../libs/prisma';

const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
        return current > 0 ? '+100%' : '0%';
    }

    const change = ((current - previous) / previous) * 100;
    const formatted = Number(change.toFixed(1));

    return `${formatted > 0 ? '+' : ''}${formatted}%`;
};

const getDashboardOverview = async (userId: string) => {
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = now;

    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

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
    );

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
    };
};

export const DashboardServices = {
    getDashboardOverview,
};