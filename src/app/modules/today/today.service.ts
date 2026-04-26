import prisma from '../../libs/prisma';

const getTodayUpdate = async (userId: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const incomes = await prisma.income.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            category: true,
        },
        orderBy: {
            date: 'desc',
        },
    });

    const expenses = await prisma.expense.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            category: true,
        },
        orderBy: {
            date: 'desc',
        },
    });

    const dailyBudgets = await prisma.dailyBudget.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            category: true,
        },
    });


    const savingsGoals = await prisma.savingsGoal.findMany({
        where: {
            userId,
        },
        include: {
            transactions: {
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            },
        },
    });

    const debts = await prisma.debt.findMany({
        where: {
            userId,
            status: 'PENDING',
            dueDate: {
                gte: startOfDay,
            },
        },
        orderBy: {
            dueDate: 'asc',
        },
        take: 5,
    });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const todayBudget = dailyBudgets.reduce((sum, item) => sum + item.amount, 0);

    const savingsAdded = savingsGoals.reduce((sum, goal) => {
        const goalTodaySavings = goal.transactions.reduce(
            (total, tx) => total + tx.amount,
            0,
        );
        return sum + goalTodaySavings;
    }, 0);

    const budgetRemaining = todayBudget - totalExpense;

    const todaySpentPercent =
        todayBudget > 0 ? Math.round((totalExpense / todayBudget) * 100) : 0;

    const status =
        budgetRemaining < 0 ? 'danger' : todaySpentPercent > 70 ? 'warning' : 'good';

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
        todayBudget: todayBudget,
        todaySpentPercent,
        status,
        transactions,
        reminders,
    };
};

export const TodayServices = {
    getTodayUpdate,
};