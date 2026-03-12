import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DailyBudgetValidations } from './daily-budget.validation';
import { DailyBudgetControllers } from './daily-budget.controller';

const router = Router();

router.post(
  '/',
  auth('USER'),
  validateRequest(DailyBudgetValidations.createSchema),
  DailyBudgetControllers.createBudget,
);

router.get('/all', auth('USER'), DailyBudgetControllers.getBudgets);

router.get(
  '/',
  auth('USER'),
  DailyBudgetControllers.getBudgetByDate,
);

router.get(
  '/progress',
  auth('USER'),
  DailyBudgetControllers.getBudgetProgress,
);

router.get(
  '/today-progress',
  auth('USER'),
  DailyBudgetControllers.getTodayProgress,
);

router.patch(
  '/:id',
  auth('USER'),
  validateRequest(DailyBudgetValidations.updateSchema),
  DailyBudgetControllers.updateBudget,
);

router.delete('/:id', auth('USER'), DailyBudgetControllers.deleteBudget);

export const DailyBudgetRoutes = router;