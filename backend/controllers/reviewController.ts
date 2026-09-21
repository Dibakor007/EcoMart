import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoReviewModel } from '../models/MongoSchemas';
import { memoryGetReviews, memoryAddReview } from '../store/memoryStore';
import { User } from '../models/User';

let nextReviewId = 1000;

export const createReview = async (req: any, res: Response): Promise<void> => {
  const userId = req.user ? req.user.id : 500;
  const { product_id, rating, comment } = req.body;

  if (!product_id || !rating) {
    res.status(400).json({ success: false, message: 'Product ID and rating are required' });
    return;
  }

  const pid = Number(product_id);
  const stars = Number(rating);

  if (stars < 1 || stars > 5) {
    res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    return;
  }

  // Resolve user name
  let userName = req.user?.name;
  if (!userName) {
    const user = await User.findById(userId);
    userName = user ? user.name : 'EcoMart Shopper';
  }

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const newId = ++nextReviewId;
      await MongoReviewModel.create({
        id: newId,
        product_id: pid,
        user_id: userId,
        user_name: userName,
        rating: stars,
        comment: comment || '',
        status: 'visible',
      });
      res.status(201).json({ success: true, message: 'Review submitted successfully' });
      return;
    } catch (err: any) {
      console.warn('MongoDB review create error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const newRev = memoryAddReview(userId, userName, pid, stars, comment || '');
  res.status(201).json({ success: true, message: 'Review submitted successfully', data: newRev });
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const productId = Number(req.params.productId);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const reviews = await MongoReviewModel.find({ product_id: productId, status: 'visible' })
        .sort({ created_at: -1 }).lean();
      if (reviews) {
        // Merge with memory reviews to include seeded data
        const memoryReviews = memoryGetReviews(productId);
        const mongoIds = new Set((reviews as any[]).map((r: any) => r.id));
        const merged = [
          ...reviews,
          ...memoryReviews.filter(mr => !mongoIds.has(mr.id))
        ];
        res.json({ success: true, data: merged });
        return;
      }
    } catch (err: any) {
      console.warn('MongoDB reviews query error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const memoryReviews = memoryGetReviews(productId);
  res.json({ success: true, data: memoryReviews });
};
