import { Router } from 'express';
import auth from '../../middlewares/auth';
import { DashboardController } from './dashboard.controller';

const router = Router();


router.get(
    '/overview',
    auth('USER'),
    DashboardController.getDashboardOverview,
);


export const DashboardRoutes = router;