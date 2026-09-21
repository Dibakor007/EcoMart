import { Router } from 'express';
import { getAdminStats, getAllOrders, updateOrderStatus, getAllUsers, updateProduct, createProduct, deleteProduct, getAllReviews, deleteReview } from '../controllers/adminController';
import { protect, admin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);

// Product Management
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Review Management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;
