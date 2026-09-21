import mongoose from 'mongoose';
import { MongoCategoryModel } from './MongoSchemas';

const fallbackCategories = [
  { id: 1, name: 'Kitchen', slug: 'kitchen', status: 1 },
  { id: 2, name: 'Electronics', slug: 'electronics', status: 1 },
  { id: 3, name: 'Home', slug: 'home', status: 1 },
  { id: 4, name: 'Fashion', slug: 'fashion', status: 1 },
  { id: 5, name: 'Accessories', slug: 'accessories', status: 1 },
];

export const Category = {
  async findAll() {
    // 1. Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await MongoCategoryModel.countDocuments();
        if (count === 0) {
          await MongoCategoryModel.insertMany(fallbackCategories);
        }
        const categories = await MongoCategoryModel.find({ status: 1 }).lean();
        if (categories && categories.length > 0) return categories;
      } catch (err: any) {
        console.warn('MongoDB categories query warning:', err.message);
      }
    }

    // 2. Resilient in-memory fallback
    return fallbackCategories;
  }
};
