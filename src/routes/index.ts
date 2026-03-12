import express from 'express';

import { AuthsRoutes } from '../app/modules/auths/auths.route';
import { CategoriesRoutes } from '../app/modules/categories/categories.route';
import { IncomeRoutes } from '../app/modules/income/income.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
