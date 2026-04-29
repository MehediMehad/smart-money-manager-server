import { Router } from 'express';

import { TodayControllers } from './today.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/', auth('USER'), TodayControllers.getTodayUpdate);

export const TodayRoutes = router;
