import type { Prisma } from '@prisma/client';

import type { TCreateCategoriesPayload, TGetCategoriesFilter } from './categories.interface';
import { findAdminId } from '../../helpers/db/categories.seed';
import prisma from '../../libs/prisma';

const createCategory = async (userId: string, payload: TCreateCategoriesPayload) => {
  const { name, type, emoji } = payload;

  // check category exists
  const existing = await prisma.category.findUnique({
    where: {
      name_type: {
        name,
        type,
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
          emoji,
        },
      });

      return existing;
    }
    const adminId = await findAdminId();

    if (existing.userId !== adminId && userId === adminId) {
      return await prisma.category.update({
        where: {
          id: existing.id,
        },
        data: {
          userId: adminId,
        },
      });
    }

    // if not hidden → update
    return existing;
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

const createCategories = async (userId: string, payloads: TCreateCategoriesPayload[]) => {
  const adminId = await findAdminId();

  const results = await prisma.$transaction(async (tx) => {
    // Get all categories of user that match any of the payload names+types
    const existingCategories = await tx.category.findMany({
      where: {
        OR: payloads.map((p) => ({ name: p.name, type: p.type })),
      },
    });

    const hiddenCategories = await tx.hiddenCategory.findMany({
      where: {
        userId,
        categoryId: { in: existingCategories.map((c) => c.id) },
      },
    });

    const results = [];

    for (const payload of payloads) {
      const existing = existingCategories.find(
        (c) => c.name === payload.name && c.type === payload.type,
      );

      if (existing) {
        const hidden = hiddenCategories.find((h) => h.categoryId === existing.id);

        if (hidden) {
          await tx.hiddenCategory.delete({
            where: { userId_categoryId: { userId, categoryId: existing.id } },
          });
          const updated = await tx.category.update({
            where: { id: existing.id },
            data: { emoji: payload.emoji },
          });
          results.push(updated);
        } else if (existing.userId === adminId && userId === adminId) {
          const updated = await tx.category.update({
            where: { id: existing.id },
            data: { userId: adminId },
          });
          results.push(updated);
        } else {
          const updated = await tx.category.update({
            where: { id: existing.id },
            data: {},
          });
          results.push(updated);
        }
      } else {
        const created = await tx.category.create({
          data: { ...payload, userId },
        });
        results.push(created);
      }
    }

    return results;
  });

  return results;
};
const getCategories = async (userId: string, filter: TGetCategoriesFilter) => {
  const { searchTerm, type, year, month } = filter;
  const adminId = await findAdminId();

  const whereClause: Prisma.CategoryWhereInput = {
    OR: [{ userId }, { userId: adminId }],
    hiddenByUsers: {
      none: {
        userId,
      },
    },
    name: {
      contains: searchTerm || '',
      mode: 'insensitive',
    },
    ...(type && {
      type: {
        equals: type,
      },
    }),
  };

  if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);

    if (type === 'EXPENSE') {
      whereClause.expenses = {
        some: {
          userId,
          date: {
            gte: start,
            lt: end,
          },
        },
      };
    }

    if (type === 'INCOME') {
      whereClause.incomes = {
        some: {
          userId,
          date: {
            gte: start,
            lt: end,
          },
        },
      };
    }
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    select: {
      id: true,
      emoji: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: 'desc',
    },
  });

  return categories;
};

const defaultCategories = async (filter: TGetCategoriesFilter) => {
  const { searchTerm, type } = filter;
  const adminId = await findAdminId();
  const categories = await prisma.category.findMany({
    where: {
      userId: adminId,
      hiddenByUsers: {
        none: {
          userId: adminId,
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
    select: {
      id: true,
      emoji: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: 'desc',
    },
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
  createCategories,
  getCategories,
  defaultCategories,
  hideCategory,
};
