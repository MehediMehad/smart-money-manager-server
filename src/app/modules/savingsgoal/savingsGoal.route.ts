import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SavingsGoalControllers } from './savingsGoal.controller';
import { SavingsGoalValidations } from './savingsGoal.validation';

const router = Router();

router.post(
  '/',
  auth('USER'),
  validateRequest(SavingsGoalValidations.createSavingsGoalSchema),
  SavingsGoalControllers.createSavingsGoal,
);

router.get('/', auth('USER'), SavingsGoalControllers.getAllSavingsGoals);

router.get('/:id', auth('USER'), SavingsGoalControllers.getSingleSavingsGoal);

router.patch(
  '/:id',
  auth('USER'),
  validateRequest(SavingsGoalValidations.updateSavingsGoalSchema),
  SavingsGoalControllers.updateSavingsGoal,
);

router.patch(
  '/add-amount/:id',
  auth('USER'),
  validateRequest(SavingsGoalValidations.addSavingsAmountSchema),
  SavingsGoalControllers.addSavingsAmount,
);

router.delete('/:id', auth('USER'), SavingsGoalControllers.deleteSavingsGoal);

export const SavingsGoalRoutes = router;