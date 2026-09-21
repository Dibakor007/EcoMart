import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoEcoProfileModel } from '../models/MongoSchemas';
import { memoryGetEcoProfile } from '../store/memoryStore';

export const getEcoProfile = async (req: any, res: Response): Promise<void> => {
  const userId = req.user ? req.user.id : 500;

  // 1. Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const profile = await MongoEcoProfileModel.findOne({ user_id: userId }).lean();
      if (profile) {
        res.json({
          success: true,
          data: {
            profile: {
              user_id: (profile as any).user_id,
              eco_points: (profile as any).eco_points || 0,
              total_plastic_saved_grams: (profile as any).total_plastic_saved_grams || 0,
              total_waste_reduced_grams: (profile as any).total_waste_reduced_grams || 0,
              total_co2_reduced_grams: (profile as any).total_co2_reduced_grams || 0,
              total_eco_purchases: (profile as any).total_eco_purchases || 0,
            },
            badges: (profile as any).badges || [],
            transactions: []
          }
        });
        return;
      }
    } catch (err: any) {
      console.warn('MongoDB eco profile query error:', err.message);
    }
  }

  // 2. Fallback to in-memory store
  const memoryData = memoryGetEcoProfile(userId);
  res.json({
    success: true,
    data: memoryData
  });
};
