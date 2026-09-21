import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

// Public route to view reviews
router.get('/product/:productId', getProductReviews);

// Protected route to create a review
router.post('/', protect, createReview);

export default router;
