import ApiError from "../../errors/ApiError";
import prisma from "../../libs/prisma";
import httpStatus from "http-status";
import { TCreateCategoriesPayload } from "../../modules/categories/categories.interface";

const findAdminId = async (): Promise<string> => {
    const admin = await prisma.user.findFirst({
        where: {
            role: "ADMIN"
        }
    })
    if (!admin) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }
    return admin.id
};

const seedCategories = async () => {
    const adminId = await findAdminId();

    const expenseCategoriesData: TCreateCategoriesPayload[] = [
        { name: "Food", type: "EXPENSE", emoji: "🍔", userId: adminId },
        { name: "Groceries", type: "EXPENSE", emoji: "🛒", userId: adminId },
        { name: "Transport", type: "EXPENSE", emoji: "🚌", userId: adminId },
        { name: "Travel", type: "EXPENSE", emoji: "🛫", userId: adminId },
        { name: "Shopping", type: "EXPENSE", emoji: "🛍️", userId: adminId },
        { name: "Bills", type: "EXPENSE", emoji: "📄", userId: adminId },
        { name: "Electricity", type: "EXPENSE", emoji: "💡", userId: adminId },
        { name: "Internet", type: "EXPENSE", emoji: "🌐", userId: adminId },
        { name: "Mobile Recharge", type: "EXPENSE", emoji: "📱", userId: adminId },
        { name: "Rent", type: "EXPENSE", emoji: "🏠", userId: adminId },
        { name: "Medical", type: "EXPENSE", emoji: "💊", userId: adminId },
        { name: "Education", type: "EXPENSE", emoji: "📚", userId: adminId },
        { name: "Entertainment", type: "EXPENSE", emoji: "🎬", userId: adminId },
        { name: "Gym", type: "EXPENSE", emoji: "🏋️", userId: adminId },
        { name: "Insurance", type: "EXPENSE", emoji: "🛡️", userId: adminId },
        { name: "Gift", type: "EXPENSE", emoji: "🎁", userId: adminId },
        { name: "Family", type: "EXPENSE", emoji: "👨‍👩‍👧", userId: adminId },
        { name: "Pet", type: "EXPENSE", emoji: "🐶", userId: adminId },
        { name: "Subscriptions", type: "EXPENSE", emoji: "📺", userId: adminId },
        { name: "Others", type: "EXPENSE", emoji: "📦", userId: adminId }
    ];

    const incomeCategoriesData: TCreateCategoriesPayload[] = [
        { name: "Salary", type: "INCOME", emoji: "💰", userId: adminId },
        { name: "Freelance", type: "INCOME", emoji: "💻", userId: adminId },
        { name: "Business", type: "INCOME", emoji: "🏢", userId: adminId },
        { name: "Investment", type: "INCOME", emoji: "📈", userId: adminId },
        { name: "Interest", type: "INCOME", emoji: "🏦", userId: adminId },
        { name: "Gift Received", type: "INCOME", emoji: "🎁", userId: adminId },
        { name: "Bonus", type: "INCOME", emoji: "🎉", userId: adminId },
        { name: "Side Hustle", type: "INCOME", emoji: "🧑‍💻", userId: adminId },
        { name: "Refund", type: "INCOME", emoji: "💸", userId: adminId },
        { name: "Other Income", type: "INCOME", emoji: "📥", userId: adminId }
    ];

    const categoriesData = [...expenseCategoriesData, ...incomeCategoriesData];

    // 🔹 get existing categories
    const existingCategories = await prisma.category.findMany({
        where: { userId: adminId },
        select: { name: true, type: true },
    });

    // 🔹 convert to set for fast lookup
    const existingSet = new Set(
        existingCategories.map((cat) => `${cat.name}-${cat.type}`)
    );

    // 🔹 filter duplicates
    const filteredCategories = categoriesData.filter(
        (cat) => !existingSet.has(`${cat.name}-${cat.type}`)
    );

    if (filteredCategories.length === 0) {
        return { message: "All categories already exist" };
    }

    // 🔹 create categories
    const categories = await prisma.category.createMany({
        data: filteredCategories,
    });

    console.log(`✅ ${categories.count} categories created successfully.`);

    return categories;
};

export default seedCategories;