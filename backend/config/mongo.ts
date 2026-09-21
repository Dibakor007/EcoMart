import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let connectionAttempted = false;

export const connectMongoDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    if (!connectionAttempted) {
      console.log('ℹ️ MONGODB_URI not provided. Running with integrated in-memory & fallback engine.');
      connectionAttempted = true;
    }
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connection.readyState === 1;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Auto-seed products into MongoDB if connected
    await autoSeedProducts();

    return true;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection attempt failed (${error.message}). Continuing with local resilient storage.`);
    isConnected = false;
    return false;
  }
};

async function autoSeedProducts() {
  try {
    const { MongoProductModel } = await import('../models/MongoSchemas');
    const { fallbackProducts } = await import('../models/Product');

    for (const p of fallbackProducts) {
      await MongoProductModel.updateOne(
        { id: p.id },
        {
          $set: {
            id: p.id,
            name: p.name,
            slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: p.description,
            price: p.price,
            category: p.category_name,
            image_url: p.image_url,
            stock: p.stock,
            eco_score: p.eco_score,
            material: p.material,
            reusable: p.reusable,
            recyclable: p.recyclable,
            packaging: p.packaging,
            plastic_reduction: p.plastic_reduction,
            sustainability_description: p.sustainability_description,
            is_featured: true
          }
        },
        { upsert: true }
      );
    }
  } catch (e) {}
}


export const getMongoConnectionStatus = () => {
  const readyState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return {
    connected: readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][readyState] || 'disconnected',
    database: mongoose.connection.name || (process.env.DB_NAME || 'ecomart'),
    configured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI)
  };
};

export default mongoose;
