import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { IncomeControllers } from "./income.controller";
import { IncomeValidations } from "./income.validation";

const router = Router();

router.post(
    "/",
    auth("USER"),
    validateRequest(IncomeValidations.createIncomeSchema),
    IncomeControllers.createIncome
);

router.get("/", auth("USER"), IncomeControllers.getAllIncomes);

router.get("/:id", auth("USER"), IncomeControllers.getSingleIncome);

router.patch(
    "/:id",
    auth("USER"),
    validateRequest(IncomeValidations.updateIncomeSchema),
    IncomeControllers.updateIncome
);

router.delete("/:id", auth("USER"), IncomeControllers.deleteIncome);

export const IncomeRoutes = router;