import { Router } from "express";
import { CategoriesControllers } from "./categories.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoriesValidations } from "./categories.validation";

const router = Router();

router.post(
  "/",
  auth('USER', 'ADMIN'),
  validateRequest(CategoriesValidations.createCategoriesSchema),
  CategoriesControllers.createCategoryIntoDB,
);

export const CategoriesRoutes = router;