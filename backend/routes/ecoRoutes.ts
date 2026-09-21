import { Router } from 'express';
import { getEcoProfile } from '../controllers/ecoController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/profile', getEcoProfile);

export default router;
