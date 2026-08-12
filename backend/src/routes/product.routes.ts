import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { Role } from '../types/enums';

const router = Router();

router.use(requireAuth);

router.get('/', productController.getProducts);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(createProductSchema),
  productController.createProduct
);

router.get('/:id', productController.getProductById);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  productController.deleteProduct
);

export default router;
