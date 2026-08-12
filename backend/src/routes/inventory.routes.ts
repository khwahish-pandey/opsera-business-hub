import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { stockAdjustmentSchema } from '../validators/inventory.validator';
import { Role } from '../types/enums';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  inventoryController.getInventory
);

router.get(
  '/movements',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  inventoryController.getStockMovements
);

router.post(
  '/:productId/in',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(stockAdjustmentSchema),
  inventoryController.addStockIn
);

router.post(
  '/:productId/out',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(stockAdjustmentSchema),
  inventoryController.removeStockOut
);

export default router;
