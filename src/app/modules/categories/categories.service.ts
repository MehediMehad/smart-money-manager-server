import prisma from '../../libs/prisma';
import type { TCreateCategoriesPayload } from './categories.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';


const createCategories = async (payload: TCreateCategoriesPayload) => {

};

export const CategoriesServices = {
  createCategories,
};