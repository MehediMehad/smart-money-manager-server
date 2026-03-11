import { Router } from "express";
import { CategoriesControllers } from "./categories.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoriesValidations } from "./categories.validation";

const router = Router();

router.post(
  "/create-categories",
  auth('USER', 'ADMIN'),
  validateRequest(CategoriesValidations.createCategoriesSchema),
  CategoriesControllers.createCategoriesIntoDB,
);

export const CategoriesRoutes = router;