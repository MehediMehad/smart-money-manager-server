import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DebtValidations } from './debts.validation';
import { DebtControllers } from './debts.controller';

const router = express.Router();

router.post(
  '/',
  auth("USER", "ADMIN"),
  validateRequest(DebtValidations.createDebtZodSchema),
  DebtControllers.createDebt
);

router.get('/', auth("ADMIN", "USER"), DebtControllers.getAllDebts);

router.get(
  '/:id',
  auth("ADMIN", "USER"),
  DebtControllers.getSingleDebt
);

router.patch(
  '/:id',
  auth("ADMIN", "USER"),
  validateRequest(DebtValidations.updateDebtZodSchema),
  DebtControllers.updateDebt
);

router.delete(
  '/:id',
  auth("ADMIN", "USER"),
  DebtControllers.deleteDebt
);

export const DebtRoutes = router;