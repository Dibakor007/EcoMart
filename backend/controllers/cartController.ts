import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoCartItemModel, MongoProductModel } from '../models/MongoSchemas';
import { fallbackProducts } from '../models/Product';
import {
  memoryGetCart,
  memoryAddToCart,
  memoryUpdateCartQuantity,
  memoryRemoveFromCart,
} from '../store/memoryStore';

function getProductInfo(productId: number, mongoProducts?: any[]) {
  if (mongoProducts) {
    const mp = mongoProducts.find((p: any) => p.id === productId);
    if (mp) return { name: mp.name, price: mp.price, image_url: mp.image_url, stock: mp.stock || 50 };
  }
  const fp = fallbackProducts.find(p => p.id === productId);
  if (fp) return { name: fp.name, price: fp.price, image_url: fp.image_url, stock: fp.stock };
  return { name: `Product #${productId}`, price: 0, image_url: '', stock: 0 };
}

export const getCart = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const cartItems = await MongoCartItemModel.find({ user_id: userId }).lean();
      const productIds = (cartItems as any[]).map((i: any) => i.product_id);
      let mongoProducts: any[] = [];
      try {
        mongoProducts = await MongoProductModel.find({ id: { $in: productIds } }).lean() as any[];
      } catch {}

      const data = (cartItems as any[]).map((item: any) => {
        const info = getProductInfo(item.product_id, mongoProducts);
        return {
          cart_item_id: item.product_id,
          product_id: item.product_id,
          quantity: item.quantity,
          ...info,
        };
      });

      res.json({ success: true, data });
      return;
    } catch (err: any) {
      console.warn('MongoDB cart query error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const rows = memoryGetCart(userId);
  res.json({ success: true, data: rows });
};

export const addToCart = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    res.status(400).json({ success: false, message: 'Product ID and quantity required' });
    return;
  }

  const pid = Number(product_id);
  const qty = Number(quantity);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await MongoCartItemModel.findOne({ user_id: userId, product_id: pid });
      if (existing) {
        existing.quantity += qty;
        await existing.save();
      } else {
        await MongoCartItemModel.create({ user_id: userId, product_id: pid, quantity: qty });
      }
      res.json({ success: true, message: 'Item added to cart' });
      return;
    } catch (err: any) {
      console.warn('MongoDB cart add error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  try {
    const updatedCart = memoryAddToCart(userId, pid, qty);
    res.json({ success: true, message: 'Item added to cart', data: updatedCart });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCartItem = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  const itemId = Number(id);
  const qty = Number(quantity);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      if (qty <= 0) {
        await MongoCartItemModel.deleteOne({ user_id: userId, product_id: itemId });
      } else {
        await MongoCartItemModel.updateOne(
          { user_id: userId, product_id: itemId },
          { $set: { quantity: qty } }
        );
      }
      res.json({ success: true, message: 'Cart updated successfully' });
      return;
    } catch (err: any) {
      console.warn('MongoDB cart update error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const updated = memoryUpdateCartQuantity(userId, itemId, qty);
  res.json({ success: true, message: 'Cart updated successfully', data: updated });
};

export const removeFromCart = async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { id } = req.params;
  const itemId = Number(id);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await MongoCartItemModel.deleteOne({ user_id: userId, product_id: itemId });
      res.json({ success: true, message: 'Item removed from cart' });
      return;
    } catch (err: any) {
      console.warn('MongoDB cart remove error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const updated = memoryRemoveFromCart(userId, itemId);
  res.json({ success: true, message: 'Item removed from cart', data: updated });
};
