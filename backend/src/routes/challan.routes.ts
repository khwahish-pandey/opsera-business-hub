import { Router } from 'express';
import * as challanController from '../controllers/challan.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator';
import { Role } from '../types/enums';

const router = Router();

router.use(requireAuth);

router.get('/', challanController.getChallans);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(createChallanSchema),
  challanController.createChallan
);

router.get('/:id', challanController.getChallanById);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(updateChallanSchema),
  challanController.updateChallan
);

router.post(
  '/:id/confirm',
  requireRole(Role.ADMIN, Role.SALES),
  challanController.confirmChallan
);

router.post(
  '/:id/cancel',
  requireRole(Role.ADMIN, Role.SALES),
  challanController.cancelChallan
);

export default router;
