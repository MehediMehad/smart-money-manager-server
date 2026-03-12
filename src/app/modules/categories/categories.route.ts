import { Router } from "express";
import { CategoriesControllers } from "./categories.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoriesValidations } from "./categories.validation";

const router = Router();

router.post(
  "/",
  auth('USER', 'ADMIN'),
  validateRequest(CategoriesValidations.createCategorySchema),
  CategoriesControllers.createCategoryIntoDB,
);

router.post(
  "/bulk-create",
  auth('USER', 'ADMIN'),
  validateRequest(CategoriesValidations.createManyCategoriesSchema),
  CategoriesControllers.createCategoriesIntoDB,
);

router.get(
  "/",
  auth('USER', 'ADMIN'),
  CategoriesControllers.getCategories,
);

router.get(
  "/default",
  auth('USER', 'ADMIN'),
  CategoriesControllers.defaultCategories,
);

router.post(
  "/hide/:categoryId",
  auth('USER', 'ADMIN'),
  CategoriesControllers.hideCategory,
);

export const CategoriesRoutes = router;