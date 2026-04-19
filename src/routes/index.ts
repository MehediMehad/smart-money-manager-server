import express from 'express';

import { AuthsRoutes } from '../app/modules/auths/auths.route';
import { CategoriesRoutes } from '../app/modules/categories/categories.route';
import { IncomeRoutes } from '../app/modules/income/income.route';
import { ExpenseRoutes } from '../app/modules/expense/expense.route';
import { BudgetRoutes } from '../app/modules/budget/budget.route';
import { SavingsGoalRoutes } from '../app/modules/savingsgoal/savingsGoal.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthsRoutes,
  },
  {
    path: '/categories',
    route: CategoriesRoutes,
  },
  {
    path: '/incomes',
    route: IncomeRoutes,
  },
  {
    path: '/expenses',
    route: ExpenseRoutes,
  },
  {
    path: '/budgets',
    route: BudgetRoutes,
  },
  {
    path: '/savings-goals',
    route: SavingsGoalRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
