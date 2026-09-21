import { Router } from 'express';
import { registerUser, loginUser, getMe, googleAuth, getAuthConfig } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/config', getAuthConfig);
router.post('/google', googleAuth);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;
