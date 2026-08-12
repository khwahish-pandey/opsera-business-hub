import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { loginSchema } from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
