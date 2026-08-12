import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createUserSchema } from '../validators/user.validator';
import { Role } from '../types/enums';

const router = Router();

router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

router.get('/', userController.getUsers);
router.post('/', validateRequest(createUserSchema), userController.createUser);

export default router;
