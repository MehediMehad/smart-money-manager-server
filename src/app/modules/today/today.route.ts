import { Router } from 'express';
import auth from '../../middlewares/auth';
import { TodayControllers } from './today.controller';

const router = Router();

router.get(
    '/',
    auth('USER'),
    TodayControllers.getTodayUpdate,
);

export const TodayRoutes = router;