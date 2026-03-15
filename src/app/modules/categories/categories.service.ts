import prisma from '../../libs/prisma';
import type { TCreateCategoriesPayload, TGetCategoriesFilter } from './categories.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { findAdminId } from '../../helpers/db/categories.seed';

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
      })

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
      })
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
  return await prisma.$transaction(async (tx) => {
    // Get all categories of user that match any of the payload names+types
    const existingCategories = await tx.category.findMany({
      where: {
        userId,
        OR: payloads.map(p => ({ name: p.name, type: p.type })),
      },
    });

    const hiddenCategories = await tx.hiddenCategory.findMany({
      where: {
        userId,
        categoryId: { in: existingCategories.map(c => c.id) },
      },
    });

    const results = [];

    for (const payload of payloads) {
      const existing = existingCategories.find(c => c.name === payload.name && c.type === payload.type);

      if (existing) {
        const hidden = hiddenCategories.find(h => h.categoryId === existing.id);

        if (hidden) {
          await tx.hiddenCategory.delete({
            where: { userId_categoryId: { userId, categoryId: existing.id } },
          });
          const updated = await tx.category.update({
            where: { id: existing.id },
            data: { emoji: payload.emoji },
          });
          results.push(updated);
        } else {
          const updated = await tx.category.update({
            where: { id: existing.id },
            data: { emoji: payload.emoji },
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
    select: {
      id: true,
      emoji: true,
      name: true,
      type: true
    },
    orderBy: {
      name: 'desc'
    }
  });

  return { count: categories.length, categories };
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
      type: true
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
  createCategories,
  getCategories,
  defaultCategories,
  hideCategory,
};