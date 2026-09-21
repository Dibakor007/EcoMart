import { fallbackProducts } from '../models/Product';

export interface CartItemRecord {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
}

export interface OrderItemRecord {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderRecord {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
  created_at: string;
  items?: OrderItemRecord[];
}

export interface UserEcoProfileRecord {
  user_id: number;
  eco_points: number;
  total_plastic_saved_grams: number;
  total_waste_reduced_grams: number;
  total_co2_reduced_grams: number;
  total_eco_purchases: number;
}

export interface BadgeRecord {
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface ReviewRecord {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  status: 'visible' | 'flagged';
}

// In-Memory Storage Maps
const userCarts = new Map<number, CartItemRecord[]>();
const userOrders = new Map<number, OrderRecord[]>();
const userProfiles = new Map<number, UserEcoProfileRecord>();
const userBadges = new Map<number, BadgeRecord[]>();
const productReviews = new Map<number, ReviewRecord[]>();

let nextCartItemId = 1000;
let nextOrderId = 100;
let nextReviewId = 100;

// Seed initial demo data
export function seedInitialData() {
  const demoUserId = 500;

  // 1. Pre-seed demo user eco profile
  userProfiles.set(demoUserId, {
    user_id: demoUserId,
    eco_points: 360,
    total_plastic_saved_grams: 2450,
    total_waste_reduced_grams: 1800,
    total_co2_reduced_grams: 6200,
    total_eco_purchases: 3,
  });

  // 2. Pre-seed demo user badges
  userBadges.set(demoUserId, [
    {
      name: 'Plastic-Free Pioneer',
      description: 'Diverted over 1kg of single-use plastic from waterways',
      icon: '🌱',
      earned_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      name: 'Clean Tech Champion',
      description: 'Powered life through renewable solar energy',
      icon: '⚡',
      earned_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      name: 'Zero-Waste Trailblazer',
      description: 'Earned 300+ lifetime Eco Impact Points',
      icon: '🏆',
      earned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ]);

  // 3. Pre-seed demo user past orders
  userOrders.set(demoUserId, [
    {
      id: 101,
      order_number: 'EM-83921-500',
      user_id: demoUserId,
      subtotal: 3250,
      shipping_fee: 50,
      total_amount: 3300,
      status: 'shipped',
      shipping_name: 'Tanvir Ahmed',
      shipping_phone: '+880 1711-223344',
      shipping_address: 'House 42, Road 11, Banani',
      shipping_city: 'Dhaka',
      payment_method: 'Cash on Delivery (COD)',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      items: [
        {
          id: 1,
          order_id: 101,
          product_id: 1,
          product_name: 'Bamboo Utensil Set',
          unit_price: 850,
          quantity: 1,
          subtotal: 850,
        },
        {
          id: 2,
          order_id: 101,
          product_id: 2,
          product_name: 'Solar Power Bank',
          unit_price: 2400,
          quantity: 1,
          subtotal: 2400,
        },
      ],
    },
    {
      id: 102,
      order_number: 'EM-74190-500',
      user_id: demoUserId,
      subtotal: 1200,
      shipping_fee: 50,
      total_amount: 1250,
      status: 'delivered',
      shipping_name: 'Tanvir Ahmed',
      shipping_phone: '+880 1711-223344',
      shipping_address: 'House 42, Road 11, Banani',
      shipping_city: 'Dhaka',
      payment_method: 'Cash on Delivery (COD)',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      items: [
        {
          id: 3,
          order_id: 102,
          product_id: 6,
          product_name: 'Beeswax Food Wraps',
          unit_price: 1200,
          quantity: 1,
          subtotal: 1200,
        },
      ],
    },
  ]);

  // 4. Pre-seed verified reviews across products
  const initialReviews: ReviewRecord[] = [
    {
      id: 1,
      product_id: 2,
      user_id: 500,
      user_name: 'Tanvir Ahmed',
      rating: 5,
      comment: 'Carried this on a 4-day trek in Bandarban. Keeps my phone charged entirely from the sun. Highly durable and zero plastic!',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'visible',
    },
    {
      id: 2,
      product_id: 2,
      user_id: 502,
      user_name: 'Sadia Rahman',
      rating: 5,
      comment: 'Solid build quality. Dual USB output worked nicely for my headlamp and phone during the power outage.',
      created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
      status: 'visible',
    },
    {
      id: 3,
      product_id: 1,
      user_id: 503,
      user_name: 'Kazi Farhan',
      rating: 5,
      comment: 'Very smooth bamboo finish. No splinters, fits in my backpack pouch easily.',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: 'visible',
    },
    {
      id: 4,
      product_id: 9,
      user_id: 500,
      user_name: 'Tanvir Ahmed',
      rating: 5,
      comment: 'Soft bristles that gently clean teeth. Pack of 4 easily lasts our household half a year.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: 'visible',
    },
    {
      id: 5,
      product_id: 10,
      user_id: 504,
      user_name: 'Anika Bushra',
      rating: 5,
      comment: 'Leakproof and very sturdy. Keeps lunch warm and completely eliminated single-use plastic boxes!',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      status: 'visible',
    },
  ];

  initialReviews.forEach((rev) => {
    const list = productReviews.get(rev.product_id) || [];
    list.push(rev);
    productReviews.set(rev.product_id, list);
  });
}

// Run initial seed immediately
seedInitialData();

// Cart Operations
export function memoryGetCart(userId: number): CartItemRecord[] {
  return userCarts.get(userId) || [];
}

export function memoryAddToCart(userId: number, productId: number, quantity: number): CartItemRecord[] {
  const cart = userCarts.get(userId) || [];
  const product = fallbackProducts.find((p) => p.id === productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const existingIndex = cart.findIndex((item) => item.product_id === productId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      cart_item_id: ++nextCartItemId,
      product_id: product.id,
      quantity,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
  }

  userCarts.set(userId, cart);
  return cart;
}

export function memoryUpdateCartQuantity(userId: number, cartItemId: number, quantity: number): CartItemRecord[] {
  let cart = userCarts.get(userId) || [];
  if (quantity <= 0) {
    cart = cart.filter((item) => item.cart_item_id !== cartItemId);
  } else {
    const item = cart.find((i) => i.cart_item_id === cartItemId);
    if (item) {
      item.quantity = quantity;
    }
  }
  userCarts.set(userId, cart);
  return cart;
}

export function memoryRemoveFromCart(userId: number, cartItemId: number): CartItemRecord[] {
  let cart = userCarts.get(userId) || [];
  cart = cart.filter((item) => item.cart_item_id !== cartItemId);
  userCarts.set(userId, cart);
  return cart;
}

export function memoryClearCart(userId: number): void {
  userCarts.set(userId, []);
}

// Order Operations
export function memoryCreateOrder(userId: number, payload: {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method?: string;
  guest_items?: Array<{ product_id: number; quantity: number }>;
}): OrderRecord {
  let itemsToOrder: CartItemRecord[] = [];

  if (payload.guest_items && payload.guest_items.length > 0) {
    itemsToOrder = payload.guest_items.map((gi) => {
      const p = fallbackProducts.find((fp) => fp.id === gi.product_id) || fallbackProducts[0];
      return {
        cart_item_id: ++nextCartItemId,
        product_id: p.id,
        quantity: gi.quantity,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        stock: p.stock,
      };
    });
  } else {
    itemsToOrder = memoryGetCart(userId);
  }

  if (itemsToOrder.length === 0) {
    throw new Error('Your cart is empty');
  }

  let subtotal = 0;
  let plasticSaved = 0;
  let co2Reduced = 0;
  let wasteReduced = 0;
  let ecoPoints = 0;

  const orderItems: OrderItemRecord[] = itemsToOrder.map((item, idx) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const prod = fallbackProducts.find((p) => p.id === item.product_id);
    if (prod) {
      plasticSaved += (prod.plastic_saved_grams || 0) * item.quantity;
      co2Reduced += (prod.co2_reduced_grams || 0) * item.quantity;
      wasteReduced += (prod.waste_reduced_grams || 0) * item.quantity;
      ecoPoints += Math.floor(itemSubtotal / 100) + (prod.eco_score || 80);
    }

    return {
      id: idx + 1,
      order_id: nextOrderId + 1,
      product_id: item.product_id,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    };
  });

  const shippingFee = 50;
  const totalAmount = subtotal + shippingFee;
  const orderNumber = 'EM-' + Math.floor(10000 + Math.random() * 90000) + '-' + userId;
  const orderId = ++nextOrderId;

  const newOrder: OrderRecord = {
    id: orderId,
    order_number: orderNumber,
    user_id: userId,
    subtotal,
    shipping_fee: shippingFee,
    total_amount: totalAmount,
    status: 'confirmed',
    shipping_name: payload.shipping_name,
    shipping_phone: payload.shipping_phone,
    shipping_address: payload.shipping_address,
    shipping_city: payload.shipping_city,
    payment_method: payload.payment_method || 'Cash on Delivery (COD)',
    created_at: new Date().toISOString(),
    items: orderItems,
  };

  const currentOrders = userOrders.get(userId) || [];
  currentOrders.unshift(newOrder);
  userOrders.set(userId, currentOrders);

  // Update Eco Profile
  const profile = userProfiles.get(userId) || {
    user_id: userId,
    eco_points: 0,
    total_plastic_saved_grams: 0,
    total_waste_reduced_grams: 0,
    total_co2_reduced_grams: 0,
    total_eco_purchases: 0,
  };

  profile.eco_points += ecoPoints;
  profile.total_plastic_saved_grams += plasticSaved;
  profile.total_waste_reduced_grams += wasteReduced;
  profile.total_co2_reduced_grams += co2Reduced;
  profile.total_eco_purchases += 1;
  userProfiles.set(userId, profile);

  // Clear user cart
  memoryClearCart(userId);

  return newOrder;
}

export function memoryGetOrders(userId: number): OrderRecord[] {
  return userOrders.get(userId) || [];
}

export function memoryGetOrderById(userId: number, orderId: number): OrderRecord | undefined {
  const orders = userOrders.get(userId) || [];
  return orders.find((o) => o.id === orderId);
}

// Eco Profile Operations
export function memoryGetEcoProfile(userId: number) {
  const profile = userProfiles.get(userId) || {
    user_id: userId,
    eco_points: 50,
    total_plastic_saved_grams: 300,
    total_waste_reduced_grams: 200,
    total_co2_reduced_grams: 800,
    total_eco_purchases: 1,
  };

  const badges = userBadges.get(userId) || [
    {
      name: 'Conscious Shopper',
      description: 'Started the journey toward net-zero environmental impact',
      icon: '🌿',
      earned_at: new Date().toISOString(),
    },
  ];

  const transactions = [
    {
      id: 1,
      user_id: userId,
      eco_points: 50,
      plastic_saved_grams: 300,
      waste_reduced_grams: 200,
      co2_reduced_grams: 800,
      description: 'First order reward',
      created_at: new Date().toISOString(),
    },
  ];

  return { profile, badges, transactions };
}

// Review Operations
export function memoryGetReviews(productId: number): ReviewRecord[] {
  return productReviews.get(productId) || [];
}

export function memoryAddReview(
  userId: number,
  userName: string,
  productId: number,
  rating: number,
  comment: string
): ReviewRecord {
  const list = productReviews.get(productId) || [];
  const newReview: ReviewRecord = {
    id: ++nextReviewId,
    product_id: productId,
    user_id: userId,
    user_name: userName || 'EcoMart Customer',
    rating,
    comment,
    created_at: new Date().toISOString(),
    status: 'visible',
  };
  list.unshift(newReview);
  productReviews.set(productId, list);
  return newReview;
}

export function memoryGetAllReviews(): ReviewRecord[] {
  let allReviews: ReviewRecord[] = [];
  productReviews.forEach((reviews) => {
    allReviews = allReviews.concat(reviews);
  });
  return allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function memoryDeleteReview(reviewId: number): boolean {
  for (const [productId, reviews] of productReviews.entries()) {
    const idx = reviews.findIndex((r) => r.id === reviewId);
    if (idx !== -1) {
      reviews.splice(idx, 1);
      return true;
    }
  }
  return false;
}


// Wishlist Operations
interface WishlistItemRecord {
  product_id: number;
  added_at: string;
}

const userWishlists = new Map<number, WishlistItemRecord[]>();

export function memoryGetWishlist(userId: number): WishlistItemRecord[] {
  return userWishlists.get(userId) || [];
}

export function memoryAddToWishlist(userId: number, productId: number): WishlistItemRecord[] {
  const list = userWishlists.get(userId) || [];
  if (!list.some(item => item.product_id === productId)) {
    list.push({ product_id: productId, added_at: new Date().toISOString() });
  }
  userWishlists.set(userId, list);
  return list;
}

export function memoryRemoveFromWishlist(userId: number, productId: number): WishlistItemRecord[] {
  let list = userWishlists.get(userId) || [];
  list = list.filter(item => item.product_id !== productId);
  userWishlists.set(userId, list);
  return list;
}

export function memoryGetAllOrders(): OrderRecord[] {
  let allOrders: OrderRecord[] = [];
  userOrders.forEach((orders) => {
    allOrders = allOrders.concat(orders);
  });
  // Sort by created_at descending
  return allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function memoryUpdateOrderStatus(orderId: number, status: string): OrderRecord | undefined {
  for (const [userId, orders] of userOrders.entries()) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = status as any;
      return orders[orderIndex];
    }
  }
  return undefined;
}

