import { Router } from 'express';
import { getCart, addToCart, removeFromCart, updateCartItem } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // All cart routes require auth
router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.patch('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);

export default router;
