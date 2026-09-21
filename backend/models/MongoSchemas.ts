import mongoose, { Schema } from 'mongoose';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  avatar_url?: string;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}

const UserSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'customer' },
    status: { type: String, default: 'active' },
    avatar_url: { type: String },
    phone: { type: String }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const MongoUserModel: any =
  mongoose.models.User || mongoose.model('User', UserSchema);

export interface IProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  eco_score: number;
  material?: string;
  reusable?: string;
  recyclable?: string;
  packaging?: string;
  plastic_reduction?: string;
  sustainability_description?: string;
  plastic_saved_grams?: number;
  co2_reduced_grams?: number;
  waste_diverted_grams?: number;
  materials?: string[];
  certifications?: string[];
  is_featured: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const ProductSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    image_url: { type: String, required: true },
    stock: { type: Number, default: 50 },
    eco_score: { type: Number, default: 85 },
    material: { type: String, default: 'Organic Sustainable Blend' },
    reusable: { type: String, default: 'Yes' },
    recyclable: { type: String, default: 'Yes' },
    packaging: { type: String, default: '100% Recyclable Paper' },
    plastic_reduction: { type: String, default: '~1.5 kg/year' },
    sustainability_description: { type: String, default: 'Certified eco-friendly item crafted with zero single-use plastic.' },
    plastic_saved_grams: { type: Number, default: 100 },
    co2_reduced_grams: { type: Number, default: 250 },
    waste_diverted_grams: { type: Number, default: 150 },
    materials: [{ type: String }],
    certifications: [{ type: String }],
    is_featured: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);


export const MongoProductModel: any =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export interface IOrderItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
  items: IOrderItem[];
  created_at?: Date;
  updated_at?: Date;
}

const OrderSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    order_number: { type: String, required: true, unique: true, index: true },
    user_id: { type: Number, required: true, index: true },
    subtotal: { type: Number, required: true },
    shipping_fee: { type: Number, default: 50 },
    total_amount: { type: Number, required: true },
    status: { type: String, default: 'pending', index: true },
    shipping_name: { type: String, required: true },
    shipping_phone: { type: String, required: true },
    shipping_address: { type: String, required: true },
    shipping_city: { type: String, required: true },
    payment_method: { type: String, required: true },
    items: [
      {
        product_id: { type: Number, required: true },
        product_name: { type: String, required: true },
        unit_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const MongoOrderModel: any =
  mongoose.models.Order || mongoose.model('Order', OrderSchema);

export interface IEcoProfile {
  user_id: number;
  eco_points: number;
  total_plastic_saved_grams: number;
  total_waste_reduced_grams: number;
  total_co2_reduced_grams: number;
  total_eco_purchases: number;
  badges?: Array<{
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  created_at?: Date;
  updated_at?: Date;
}

const EcoProfileSchema = new Schema(
  {
    user_id: { type: Number, required: true, unique: true, index: true },
    eco_points: { type: Number, default: 0 },
    total_plastic_saved_grams: { type: Number, default: 0 },
    total_waste_reduced_grams: { type: Number, default: 0 },
    total_co2_reduced_grams: { type: Number, default: 0 },
    total_eco_purchases: { type: Number, default: 0 },
    badges: [
      {
        name: { type: String },
        description: { type: String },
        icon: { type: String },
        earned_at: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const MongoEcoProfileModel: any =
  mongoose.models.EcoProfile || mongoose.model('EcoProfile', EcoProfileSchema);

// ─── Review Schema ────────────────────────────────────────────────────────────

export interface IReview {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

const ReviewSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    product_id: { type: Number, required: true, index: true },
    user_id: { type: Number, required: true, index: true },
    user_name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    status: { type: String, default: 'visible', index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const MongoReviewModel: any =
  mongoose.models.Review || mongoose.model('Review', ReviewSchema);

// ─── Category Schema ──────────────────────────────────────────────────────────

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  status: number;
}

const CategorySchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const MongoCategoryModel: any =
  mongoose.models.EcoCategory || mongoose.model('EcoCategory', CategorySchema);

// ─── Cart Item Schema ─────────────────────────────────────────────────────────

export interface ICartItem {
  user_id: number;
  product_id: number;
  quantity: number;
}

const CartItemSchema = new Schema(
  {
    user_id: { type: Number, required: true, index: true },
    product_id: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

CartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const MongoCartItemModel: any =
  mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);

// ─── Wishlist Item Schema ─────────────────────────────────────────────────────

export interface IWishlistItem {
  user_id: number;
  product_id: number;
}

const WishlistItemSchema = new Schema(
  {
    user_id: { type: Number, required: true, index: true },
    product_id: { type: Number, required: true },
  },
  { timestamps: true }
);

WishlistItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const MongoWishlistItemModel: any =
  mongoose.models.WishlistItem || mongoose.model('WishlistItem', WishlistItemSchema);

