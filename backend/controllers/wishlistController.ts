import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoWishlistItemModel, MongoProductModel } from '../models/MongoSchemas';
import { fallbackProducts } from '../models/Product';
import { memoryGetWishlist, memoryAddToWishlist, memoryRemoveFromWishlist } from '../store/memoryStore';

export const getWishlist = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const items = await MongoWishlistItemModel.find({ user_id: userId }).lean();
      const productIds = (items as any[]).map((i: any) => i.product_id);

      let products: any[] = [];
      try {
        products = await MongoProductModel.find({ id: { $in: productIds } }).lean() as any[];
      } catch {}

      const data = (items as any[]).map((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id) ||
          fallbackProducts.find(p => p.id === item.product_id);
        return {
          product_id: item.product_id,
          name: product?.name || `Product #${item.product_id}`,
          price: product?.price || 0,
          image_url: product?.image_url || '',
          category_name: product?.category || product?.category_name || '',
          eco_score: product?.eco_score || 0,
          added_at: item.createdAt,
        };
      });

      res.json({ success: true, data });
      return;
    } catch (err: any) {
      console.warn('MongoDB wishlist query error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const items = memoryGetWishlist(userId);
  res.json({ success: true, data: items });
};

export const addToWishlist = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { product_id } = req.body;

  if (!product_id) {
    res.status(400).json({ success: false, message: 'Product ID is required' });
    return;
  }

  const pid = Number(product_id);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await MongoWishlistItemModel.findOne({ user_id: userId, product_id: pid });
      if (existing) {
        res.json({ success: true, message: 'Item already in wishlist' });
        return;
      }
      await MongoWishlistItemModel.create({ user_id: userId, product_id: pid });
      res.json({ success: true, message: 'Item added to wishlist' });
      return;
    } catch (err: any) {
      console.warn('MongoDB wishlist add error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const items = memoryAddToWishlist(userId, pid);
  res.json({ success: true, message: 'Item added to wishlist', data: items });
};

export const removeFromWishlist = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await MongoWishlistItemModel.deleteOne({ user_id: userId, product_id: productId });
      res.json({ success: true, message: 'Item removed from wishlist' });
      return;
    } catch (err: any) {
      console.warn('MongoDB wishlist remove error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const items = memoryRemoveFromWishlist(userId, productId);
  res.json({ success: true, message: 'Item removed from wishlist', data: items });
};

export const checkWishlist = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await MongoWishlistItemModel.findOne({ user_id: userId, product_id: productId });
      res.json({ success: true, data: { inWishlist: !!existing } });
      return;
    } catch (err: any) {
      console.warn('MongoDB wishlist check error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const items = memoryGetWishlist(userId);
  const inWishlist = items.some((i: any) => i.product_id === productId);
  res.json({ success: true, data: { inWishlist } });
};
