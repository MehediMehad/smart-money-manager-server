import { Router } from "express";
import { BudgetControllers } from "./budget.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BudgetValidations } from "./budget.validation";

const router = Router();

router.post(
  "/",
  auth('USER'),
  validateRequest(BudgetValidations.createBudgetSchema),
  BudgetControllers.createBudgetIntoDB,
);

router.get("/", auth('USER'), BudgetControllers.getAllBudgets);

export const BudgetRoutes = router;