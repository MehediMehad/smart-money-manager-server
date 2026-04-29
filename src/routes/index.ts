import express from 'express';

import { AuthsRoutes } from '../app/modules/auths/auths.route';
import { BudgetRoutes } from '../app/modules/budget/budget.route';
import { CategoriesRoutes } from '../app/modules/categories/categories.route';
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route';
import { DebtRoutes } from '../app/modules/debts/debts.route';
import { ExpenseRoutes } from '../app/modules/expense/expense.route';
import { IncomeRoutes } from '../app/modules/income/income.route';
import { SavingsGoalRoutes } from '../app/modules/savingsgoal/savingsGoal.route';
import { TodayRoutes } from '../app/modules/today/today.route';

const router = express.Router();

type TModuleRoutes = {
  path: string;
  route: express.Router;
};

const moduleRoutes: TModuleRoutes[] = [
  {
    path: '/auth',
    route: AuthsRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/today',
    route: TodayRoutes,
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
  {
    path: '/debts',
    route: DebtRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
