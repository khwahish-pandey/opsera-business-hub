import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, createFollowUpSchema } from '../validators/customer.validator';
import { Role } from '../types/enums';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  customerController.getCustomers
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(createCustomerSchema),
  customerController.createCustomer
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  customerController.getCustomerById
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(updateCustomerSchema),
  customerController.updateCustomer
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  customerController.deleteCustomer
);

router.get(
  '/:id/followups',
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  customerController.getCustomerFollowUps
);

router.post(
  '/:id/followups',
  requireRole(Role.ADMIN, Role.SALES),
  validateRequest(createFollowUpSchema),
  customerController.addFollowUp
);

export default router;
