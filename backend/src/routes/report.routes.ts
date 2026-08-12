import { Request, Response, NextFunction, Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', reportController.getDashboard);

router.get(
  '/reports',
  requireRole(Role.ADMIN, Role.ACCOUNTS),
  reportController.getReports
);

export default router;
