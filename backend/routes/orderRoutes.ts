import { Router } from 'express';
import { checkout, getMyOrders, getOrderById } from '../controllers/orderController';
import { protect, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/checkout', optionalAuth, checkout);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

export default router;
