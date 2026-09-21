import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);

export default router;
