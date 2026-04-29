import { Router } from 'express';

import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/overview', auth('USER'), DashboardController.getDashboardOverview);

export const DashboardRoutes = router;
