import { Router } from "express";
import { CategoriesControllers } from "./categories.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/s3MulterMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { CategoriesValidations } from "./categories.validation";

const router = Router();

router.post(
  "/create-categories",
  auth('LAWYER', 'FIRM'),
  fileUploader.uploadFields,
  validateRequest(CategoriesValidations.createCategoriesSchema, {
    image: 'single',
  }),
  CategoriesControllers.createCategoriesIntoDB,
);

export const CategoriesRoutes = router;