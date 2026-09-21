import mongoose from 'mongoose';
import { MongoUserModel } from './MongoSchemas';

// In-memory user cache for environment resilience
const memoryUsers = new Map<string, any>();
let nextUserId = 500;

// Pre-seed demo customer
memoryUsers.set('demo@ecomart.org', {
  id: 500,
  name: 'Tanvir Ahmed',
  email: 'demo@ecomart.org',
  // bcrypt hash for 'password123'
  password_hash: '$2b$10$yMk/JOHxs.eDR5Bp/KGZweeOjf8OHXtqSbPtKMYu7/B3kg1A.5AN.',
  role: 'customer',
  status: 'active',
  created_at: new Date(Date.now() - 30 * 86400000)
});

// Pre-seed admin user
memoryUsers.set('admin@ecomart.org', {
  id: 1,
  name: 'Admin',
  email: 'admin@ecomart.org',
  // bcrypt hash for 'password123'
  password_hash: '$2b$10$yMk/JOHxs.eDR5Bp/KGZweeOjf8OHXtqSbPtKMYu7/B3kg1A.5AN.',
  role: 'admin',
  status: 'active',
  created_at: new Date(Date.now() - 60 * 86400000)
});

export const User = {
  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoUser = await MongoUserModel.findOne({ email: normalizedEmail }).lean();
        if (mongoUser) {
          return mongoUser;
        }
      } catch (mongoErr: any) {
        console.warn('MongoDB query warning:', mongoErr.message);
      }
    }

    // 2. Resilient in-memory fallback
    return memoryUsers.get(normalizedEmail);
  },

  async findById(id: number) {
    // 1. Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoUser = await MongoUserModel.findOne({ id }).lean();
        if (mongoUser) {
          return mongoUser;
        }
      } catch (mongoErr: any) {
        console.warn('MongoDB query warning:', mongoErr.message);
      }
    }

    // 2. Resilient in-memory fallback
    for (const user of memoryUsers.values()) {
      if (user.id === id) return user;
    }
    return undefined;
  },

  async create(name: string, email: string, passwordHash: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const newId = ++nextUserId;

    // 1. Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await MongoUserModel.create({
          id: newId,
          name,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: 'customer',
          status: 'active'
        });
        return doc.id;
      } catch (mongoErr: any) {
        console.warn('MongoDB write warning, using fallback store:', mongoErr.message);
      }
    }

    // 2. Resilient in-memory fallback
    const userRecord = {
      id: newId,
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'customer',
      status: 'active',
      created_at: new Date()
    };
    memoryUsers.set(normalizedEmail, userRecord);
    return newId;
  },

  async getAll() {
    let mongoUsers: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        mongoUsers = await MongoUserModel.find({}, { password_hash: 0 }).sort({ created_at: -1 }).lean();
      } catch (mongoErr: any) {
        console.warn('MongoDB query warning:', mongoErr.message);
      }
    }

    const userMap = new Map<string, any>();
    for (const u of memoryUsers.values()) {
      const { password_hash, ...userWithoutPassword } = u;
      if (u.email) {
        userMap.set(u.email.toLowerCase(), userWithoutPassword);
      }
    }
    for (const mu of mongoUsers) {
      if (mu.email) {
        userMap.set(mu.email.toLowerCase(), mu);
      }
    }

    const combinedList = Array.from(userMap.values());
    return combinedList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }
};

export async function seedAdminUser() {
  if (mongoose.connection.readyState === 1) {
    try {
      const adminExists = await MongoUserModel.findOne({ email: 'admin@ecomart.org' });
      if (!adminExists) {
        await MongoUserModel.create({
          id: 1,
          name: 'Admin',
          email: 'admin@ecomart.org',
          password_hash: '$2b$10$yMk/JOHxs.eDR5Bp/KGZweeOjf8OHXtqSbPtKMYu7/B3kg1A.5AN.',
          role: 'admin',
          status: 'active'
        });
        console.log('Seeded admin user into MongoDB');
      }
    } catch (e) {
      console.warn('Failed to seed admin user:', (e as Error).message);
    }
  }
}
