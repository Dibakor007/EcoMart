import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoOrderModel, MongoCartItemModel, MongoProductModel, MongoEcoProfileModel } from '../models/MongoSchemas';
import { fallbackProducts } from '../models/Product';
import {
  memoryCreateOrder,
  memoryGetOrders,
  memoryGetOrderById,
} from '../store/memoryStore';

let nextOrderId = 200;

export const checkout = async (req: any, res: Response): Promise<void> => {
  const userId = req.user ? req.user.id : 500;
  const {
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    payment_method,
    guest_items,
  } = req.body;

  if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city) {
    res.status(400).json({ success: false, message: 'Missing required shipping details' });
    return;
  }

  // 1. Try MongoDB as primary
  if (mongoose.connection.readyState === 1) {
    try {
      let itemsToProcess: any[] = [];

      if (guest_items && guest_items.length > 0) {
        // Guest or hybrid checkout — use provided items
        for (const gi of guest_items) {
          let product: any = null;
          try {
            product = await MongoProductModel.findOne({ id: gi.product_id }).lean();
          } catch {}
          if (!product) {
            product = fallbackProducts.find(p => p.id === gi.product_id);
          }
          if (product) {
            itemsToProcess.push({
              product_id: gi.product_id,
              quantity: gi.quantity,
              name: product.name,
              price: product.price,
              eco_score: product.eco_score || 80,
              plastic_saved_grams: product.plastic_saved_grams || 100,
              co2_reduced_grams: product.co2_reduced_grams || 250,
              waste_reduced_grams: product.waste_reduced_grams || product.waste_diverted_grams || 150,
            });
          }
        }
      } else {
        // Authenticated checkout — get from MongoDB cart
        const cartItems = await MongoCartItemModel.find({ user_id: userId }).lean();
        for (const ci of cartItems as any[]) {
          let product: any = null;
          try {
            product = await MongoProductModel.findOne({ id: ci.product_id }).lean();
          } catch {}
          if (!product) {
            product = fallbackProducts.find(p => p.id === ci.product_id);
          }
          if (product) {
            itemsToProcess.push({
              product_id: ci.product_id,
              quantity: ci.quantity,
              name: product.name,
              price: product.price,
              eco_score: product.eco_score || 80,
              plastic_saved_grams: product.plastic_saved_grams || 100,
              co2_reduced_grams: product.co2_reduced_grams || 250,
              waste_reduced_grams: product.waste_reduced_grams || product.waste_diverted_grams || 150,
            });
          }
        }
      }

      if (itemsToProcess.length === 0) {
        res.status(400).json({ success: false, message: 'Cart is empty' });
        return;
      }

      let subtotal = 0;
      let totalPlastic = 0;
      let totalWaste = 0;
      let totalCo2 = 0;
      let totalEcoPoints = 0;

      const orderItems = itemsToProcess.map(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;
        totalPlastic += (item.plastic_saved_grams || 0) * item.quantity;
        totalWaste += (item.waste_reduced_grams || 0) * item.quantity;
        totalCo2 += (item.co2_reduced_grams || 0) * item.quantity;
        totalEcoPoints += Math.floor(itemSubtotal / 100) + (item.eco_score || 80);

        return {
          product_id: item.product_id,
          product_name: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        };
      });

      const shipping_fee = 50;
      const total_amount = subtotal + shipping_fee;
      const orderId = ++nextOrderId;
      const order_number = `EM-${Date.now()}-${userId}`;

      // Create order in MongoDB
      await MongoOrderModel.create({
        id: orderId,
        order_number,
        user_id: userId,
        subtotal,
        shipping_fee,
        total_amount,
        status: 'confirmed',
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        payment_method: payment_method || 'Cash on Delivery (COD)',
        items: orderItems,
      });

      // Update product stock
      for (const item of itemsToProcess) {
        try {
          await MongoProductModel.updateOne(
            { id: item.product_id },
            { $inc: { stock: -item.quantity } }
          );
        } catch {}
      }

      // Update eco profile
      try {
        await MongoEcoProfileModel.findOneAndUpdate(
          { user_id: userId },
          {
            $inc: {
              eco_points: totalEcoPoints,
              total_plastic_saved_grams: totalPlastic,
              total_waste_reduced_grams: totalWaste,
              total_co2_reduced_grams: totalCo2,
              total_eco_purchases: 1,
            },
          },
          { upsert: true, new: true }
        );
      } catch {}

      // Clear user cart
      try {
        await MongoCartItemModel.deleteMany({ user_id: userId });
      } catch {}

      res.json({
        success: true,
        message: 'Order placed successfully',
        data: { orderId, order_number },
      });
      return;
    } catch (err: any) {
      console.warn('MongoDB checkout error, falling back:', err.message);
    }
  }

  // 2. Fallback to memory store
  try {
    const order = memoryCreateOrder(userId, {
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      payment_method,
      guest_items,
    });

    res.json({
      success: true,
      message: 'Order placed successfully',
      data: { orderId: order.id, order_number: order.order_number },
    });
  } catch (memErr: any) {
    res.status(400).json({ success: false, message: memErr.message });
  }
};

export const getMyOrders = async (req: any, res: Response): Promise<void> => {
  const userId = req.user ? req.user.id : 500;

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const mongoOrders = await MongoOrderModel.find({ user_id: userId }).sort({ created_at: -1 }).lean();
      if (mongoOrders && mongoOrders.length > 0) {
        res.json({ success: true, data: mongoOrders });
        return;
      }
    } catch (mongoErr: any) {
      console.warn('MongoDB getMyOrders warning:', mongoErr.message);
    }
  }

  // 2. Memory fallback
  const orders = memoryGetOrders(userId);
  res.json({ success: true, data: orders });
};

export const getOrderById = async (req: any, res: Response): Promise<void> => {
  const userId = req.user ? req.user.id : 500;
  const orderId = Number(req.params.id);

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const mongoOrder = await MongoOrderModel.findOne({ id: orderId, user_id: userId }).lean();
      if (mongoOrder) {
        res.json({ success: true, data: mongoOrder });
        return;
      }
    } catch (mongoErr: any) {
      console.warn('MongoDB getOrderById warning:', mongoErr.message);
    }
  }

  // 2. Memory fallback
  const order = memoryGetOrderById(userId, orderId);
  if (order) {
    res.json({ success: true, data: order });
    return;
  }
  res.status(404).json({ success: false, message: 'Order not found' });
};
