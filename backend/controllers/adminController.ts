import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoOrderModel, MongoProductModel, MongoUserModel, MongoReviewModel } from '../models/MongoSchemas';
import { fallbackProducts } from '../models/Product';
import { User } from '../models/User';
import { memoryGetAllOrders, memoryUpdateOrderStatus, memoryGetAllReviews, memoryDeleteReview } from '../store/memoryStore';

export const getAdminStats = async (req: any, res: Response): Promise<void> => {
  try {
    let totalProducts = fallbackProducts.length;
    let totalOrders = 0;
    let totalUsers = 0;
    let totalRevenue = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        totalProducts = await MongoProductModel.countDocuments() || fallbackProducts.length;
        totalOrders = await MongoOrderModel.countDocuments();
        totalUsers = await MongoUserModel.countDocuments();

        const revenueResult = await MongoOrderModel.aggregate([
          { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        totalRevenue = revenueResult[0]?.total || 0;
      } catch {}
    } else {
      const allOrders = memoryGetAllOrders();
      totalOrders = allOrders.length;
      totalRevenue = allOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const allUsers = await User.getAll();
      totalUsers = allUsers.length;
    }

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req: any, res: Response): Promise<void> => {
  try {
    let mongoOrders: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        mongoOrders = await MongoOrderModel.find({}).sort({ created_at: -1 }).lean();
      } catch (e) {}
    }
    
    const memOrders = memoryGetAllOrders();
    const orderMap = new Map<string, any>();
    
    for (const o of memOrders) {
      const key = String(o.id || o._id);
      orderMap.set(key, o);
    }
    for (const o of mongoOrders) {
      const key = String(o.id || o._id);
      orderMap.set(key, o);
    }

    const combinedOrders = Array.from(orderMap.values()).sort((a, b) => {
      const dateA = new Date(a.created_at || Date.now()).getTime();
      const dateB = new Date(b.created_at || Date.now()).getTime();
      return dateB - dateA;
    });

    res.json({ success: true, data: combinedOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const result = await MongoOrderModel.findOneAndUpdate(
        { id: orderId },
        { $set: { status } },
        { new: true }
      );
      if (result) {
        res.json({ success: true, message: 'Order status updated', data: result });
        return;
      }
    }

    const order = memoryUpdateOrderStatus(orderId, status);
    if (order) {
      res.json({ success: true, message: 'Order status updated', data: order });
      return;
    }

    res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: any, res: Response): Promise<void> => {
  try {
    const productId = Number(req.params.id);
    const updates = req.body;

    // Prevent updating critical system fields
    delete updates._id;
    delete updates.__v;

    if (mongoose.connection.readyState === 1) {
      const result = await MongoProductModel.findOneAndUpdate(
        { id: productId },
        { $set: updates },
        { new: true }
      );
      if (result) {
        res.json({ success: true, message: 'Product updated', data: result });
        return;
      }
    }
    
    const pIndex = fallbackProducts.findIndex(p => p.id === productId);
    if (pIndex !== -1) {
      Object.assign(fallbackProducts[pIndex], updates);
      res.json({ success: true, message: 'Product updated', data: fallbackProducts[pIndex] });
      return;
    }

    res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: any, res: Response): Promise<void> => {
  try {
    const newProductData = req.body;
    
    // Auto-generate ID if missing
    let newId = newProductData.id;
    if (!newId) {
      const maxId = fallbackProducts.length > 0 ? Math.max(...fallbackProducts.map(p => p.id)) : 100;
      newId = maxId + 1;
    }

    const newProduct = {
      ...newProductData,
      id: newId,
      slug: newProductData.slug || newProductData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + newId,
    };

    if (mongoose.connection.readyState === 1) {
      await MongoProductModel.create(newProduct);
    }
    
    // Always keep fallback in sync for resilience
    fallbackProducts.push(newProduct as any);
    
    res.status(201).json({ success: true, message: 'Product created', data: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: any, res: Response): Promise<void> => {
  try {
    const productId = Number(req.params.id);

    if (mongoose.connection.readyState === 1) {
      const result = await MongoProductModel.findOneAndDelete({ id: productId });
      if (result) {
        // Also remove from fallback
        const pIndex = fallbackProducts.findIndex(p => p.id === productId);
        if (pIndex !== -1) fallbackProducts.splice(pIndex, 1);
        
        res.json({ success: true, message: 'Product deleted' });
        return;
      }
    }
    
    const pIndex = fallbackProducts.findIndex(p => p.id === productId);
    if (pIndex !== -1) {
      fallbackProducts.splice(pIndex, 1);
      res.json({ success: true, message: 'Product deleted' });
      return;
    }

    res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReviews = async (req: any, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const reviews = await MongoReviewModel.find({}).sort({ created_at: -1 }).lean();
      res.json({ success: true, data: reviews });
      return;
    }
    
    const reviews = memoryGetAllReviews();
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: any, res: Response): Promise<void> => {
  try {
    const reviewId = Number(req.params.id);

    if (mongoose.connection.readyState === 1) {
      const result = await MongoReviewModel.findOneAndDelete({ id: reviewId });
      if (result) {
        memoryDeleteReview(reviewId);
        res.json({ success: true, message: 'Review deleted' });
        return;
      }
    }
    
    const deleted = memoryDeleteReview(reviewId);
    if (deleted) {
      res.json({ success: true, message: 'Review deleted' });
      return;
    }

    res.status(404).json({ success: false, message: 'Review not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

