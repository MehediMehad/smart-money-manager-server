import { Router } from 'express';

import { ExpenseControllers } from './expense.controller';
import { ExpenseValidations } from './expense.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  auth('USER'),
  validateRequest(ExpenseValidations.createExpenseSchema),
  ExpenseControllers.createExpense,
);

router.get('/', auth('USER'), ExpenseControllers.getAllExpenses);

router.get('/:id', auth('USER'), ExpenseControllers.getSingleExpense);

router.patch(
  '/:id',
  auth('USER'),
  validateRequest(ExpenseValidations.updateExpenseSchema),
  ExpenseControllers.updateExpense,
);

router.delete('/:id', auth('USER'), ExpenseControllers.deleteExpense);

export const ExpenseRoutes = router;
