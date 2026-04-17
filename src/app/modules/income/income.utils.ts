import { formatDate } from "../../utils/date";
import { COLORS } from "./income.constant";
import { IncomeWithCategory } from "./income.interface";

export const buildIncomeSummary = (
    incomes: IncomeWithCategory[],
    today: string,
    year: number,
    month: number
) => {
    let totalThisMonth = 0;
    let todayIncome = 0;

    const categoryMap = new Map<string, number>();

    for (const income of incomes) {
        const amount = Number(income.amount);
        const categoryName = income.category?.name ?? "Others";
        const incomeDate = formatDate(income.date);

        totalThisMonth += amount;

        if (incomeDate === today) {
            todayIncome += amount;
        }

        categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + amount);
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const avgDaily = totalThisMonth > 0 ? Math.round(totalThisMonth / daysInMonth) : 0;

    const categorySummary = Array.from(categoryMap.entries()).map(
        ([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length],
        })
    );

    const mainCategory =
        categorySummary.reduce(
            (max, item) => (item.value > max.value ? item : max),
            { name: "N/A", value: 0, color: COLORS[0] }
        );

    return {
        totalThisMonth,
        todayIncome,
        avgDaily,
        mainCategory: {
            name: mainCategory.name,
            value: mainCategory.value,
        },
        categorySummary,
    };
};


