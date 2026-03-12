import prisma from '../../libs/prisma';
import type { TCreateCategoriesPayload, TGetCategoriesFilter } from './categories.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { findAdminId } from '../../helpers/db/categories.seed';
import { CategoryTypeEnum } from '@prisma/client';

const createCategory = async (userId: string, payload: TCreateCategoriesPayload) => {
  const { name, type, emoji } = payload;

  // check category exists
  const existing = await prisma.category.findUnique({
    where: {
      name_type_userId: {
        name,
        type,
        userId,
      },
    },
  });

  if (existing) {
    // check if hidden
    const hidden = await prisma.hiddenCategory.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: existing.id,
        },
      },
    });

    // if hidden → unhide and update
    if (hidden) {
      await prisma.hiddenCategory.delete({
        where: {
          userId_categoryId: {
            userId,
            categoryId: existing.id,
          },
        },
      });

      await prisma.category.update({
        where: {
          id: existing.id,
        },
        data: {
          name,
        },
      })

      return existing;
    }

    // if not hidden → duplicate
    throw new ApiError(
      httpStatus.CONFLICT,
      'Category with this name and type already exists'
    );
  }

  // create new category
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

const getCategories = async (userId: string, filter: TGetCategoriesFilter) => {
  const { searchTerm, type } = filter;
  const adminId = await findAdminId();
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId }, { userId: adminId }],
      hiddenByUsers: {
        none: {
          userId: userId,
        },
      },
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
      type: {
        equals: type,
      },
    },
    orderBy: {
      name: 'desc'
    }
  });

  return categories;
};

const hideCategory = async (userId: string, categoryId: string) => {
  const hiddenCategory = await prisma.hiddenCategory.upsert({
    where: {
      userId_categoryId: {
        userId,
        categoryId,
      },
    },
    update: {},
    create: {
      userId,
      categoryId,
    },
  });

  return hiddenCategory;
};

export const CategoriesServices = {
  createCategory,
  getCategories,
  hideCategory,
};