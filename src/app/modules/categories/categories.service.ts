import prisma from '../../libs/prisma';
import type { TCreateCategoriesPayload } from './categories.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { findAdminId } from '../../helpers/db/categories.seed';

const createCategory = async (userId: string, payload: TCreateCategoriesPayload) => {
  const { name, type, emoji } = payload;

  // Check duplicate (same user, same name + type)
  const existing = await prisma.category.findUnique({
    where: {
      name_type_userId: { name, type, userId }
    }
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'Category with this name and type already exists');
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      name,
      type,
      emoji,
      userId,
    },
  });

  return category;
};

const getCategories = async (userId: string) => {
  const adminId = await findAdminId();
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId }, { userId: adminId }],
      hiddenByUsers: {
        none: {
          userId: userId,
        },
      },
    },
    orderBy: {
      name: 'desc'
    }
  });

  return categories;
};

export const CategoriesServices = {
  createCategory,
  getCategories
};