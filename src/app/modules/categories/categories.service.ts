import prisma from '../../libs/prisma';
import type { TCreateCategoriesPayload } from './categories.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';


const createCategories = async (userId: string, expenseCategories: TCreateCategoriesPayload[], incomeCategories: TCreateCategoriesPayload[]) => {

  if (expenseCategories.length === 0 && incomeCategories.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No categories provided');
  }
  const categoriesData = [...expenseCategories, ...incomeCategories];

  // 🔹 get existing categories
  const existingCategories = await prisma.category.findMany({
    where: { userId },
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

export const CategoriesServices = {
  createCategories,
};