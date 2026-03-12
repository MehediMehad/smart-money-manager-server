import express from 'express';

import { AuthsRoutes } from '../app/modules/auths/auths.route';
import { CategoriesRoutes } from '../app/modules/categories/categories.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
