import mongoose from 'mongoose';
import { MongoProductModel } from './MongoSchemas';
import fs from 'fs';
import path from 'path';

const newImagesToCopy = [
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_2_solar_power_bank_1789968801903.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-2.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_6_beeswax_wraps_1789968960672.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-6.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_7_silicone_bags_1789968984094.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-7.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_10_bento_box_1789969150847.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-10.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_11_coconut_sponges_1789969259513.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-11.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_12_solar_lantern_1789969284470.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-12.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_14_wool_blanket_1789969310070.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-14.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_15_mesh_produce_bags_1789969334026.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-15.jpg' },
  { src: 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\11aed723-762f-4083-87cb-b45535606a48\\product_16_cork_wallet_1789969356241.png', dst: 'c:\\Users\\user\\Desktop\\Project\\ecomart\\public\\images\\products\\product-16.jpg' }
];

try {
  for (const item of newImagesToCopy) {
    if (fs.existsSync(item.src)) {
      fs.copyFileSync(item.src, item.dst);
    }
  }
} catch (e) {}

export const fallbackProducts = [
  {
    id: 1,
    name: 'Bamboo Utensil Set',
    description: 'A reusable bamboo utensil set perfect for zero-waste travel and dining.',
    price: 850,
    stock: 50,
    category_name: 'Kitchen',
    image_url: '/images/products/product-1.jpg',
    eco_score: 98,
    material: 'Bamboo + Organic Cotton',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Recyclable Paper Pouch',
    plastic_reduction: '~2.5 kg/year',
    sustainability_description: 'Handcrafted from fast-growing organic Moso bamboo with zero synthetic pesticides.',
    plastic_saved_grams: 450,
    co2_reduced_grams: 1200,
    waste_reduced_grams: 300,
    status: 'active'
  },
  {
    id: 2,
    name: 'Solar Power Bank',
    description: 'Charge your devices on the go using 100% renewable solar energy.',
    price: 2400,
    stock: 25,
    category_name: 'Electronics',
    image_url: '/images/products/product-2.jpg',
    eco_score: 92,
    material: 'Monocrystalline Silicon + Recycled ABS',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'FSC Certified Cardboard',
    plastic_reduction: '~3.2 kg/year',
    sustainability_description: 'Harnesses clean solar energy to eliminate disposable battery waste.',
    plastic_saved_grams: 300,
    co2_reduced_grams: 3500,
    waste_reduced_grams: 500,
    status: 'active'
  },
  {
    id: 3,
    name: 'Recycled Glass Bottle',
    description: 'Durable water bottle made entirely from post-consumer recycled glass.',
    price: 550,
    stock: 80,
    category_name: 'Home',
    image_url: '/images/products/product-3.jpg',
    eco_score: 89,
    material: 'Post-Consumer Recycled Glass + Cork Lid',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Biodegradable Craft Box',
    plastic_reduction: '~4.1 kg/year',
    sustainability_description: 'Made from 100% recycled glass bottles to keep ocean plastic at zero.',
    plastic_saved_grams: 600,
    co2_reduced_grams: 950,
    waste_reduced_grams: 400,
    status: 'active'
  },
  {
    id: 4,
    name: 'Organic Hemp Tote',
    description: 'A strong, sustainable alternative to plastic bags. Ethically sourced.',
    price: 650,
    stock: 120,
    category_name: 'Fashion',
    image_url: '/images/products/product-4.jpg',
    eco_score: 96,
    material: '100% Raw Organic Hemp Fiber',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Zero Packaging',
    plastic_reduction: '~5.0 kg/year',
    sustainability_description: 'Hemp uses 80% less water than conventional cotton and produces zero toxic runoff.',
    plastic_saved_grams: 520,
    co2_reduced_grams: 1400,
    waste_reduced_grams: 350,
    status: 'active'
  },
  {
    id: 5,
    name: 'Compostable Phone Case',
    description: 'Protect your phone and the planet with this 100% compostable case.',
    price: 900,
    stock: 45,
    category_name: 'Accessories',
    image_url: '/images/products/product-5.jpg',
    eco_score: 88,
    material: 'Flax Straw Shive + Plant Biopolymer',
    reusable: 'Yes',
    recyclable: 'Home Compostable',
    packaging: 'Soy-Ink Printed Cardboard',
    plastic_reduction: '~1.2 kg/year',
    sustainability_description: 'Breaks down into organic humus in backyard compost within 6 months.',
    plastic_saved_grams: 280,
    co2_reduced_grams: 800,
    waste_reduced_grams: 250,
    status: 'active'
  },
  {
    id: 6,
    name: 'Beeswax Food Wraps',
    description: 'Washable, reusable, and fully biodegradable wrap to replace cling film.',
    price: 1200,
    stock: 60,
    category_name: 'Kitchen',
    image_url: '/images/products/product-6.jpg',
    eco_score: 95,
    material: 'GOTS Certified Organic Cotton + Beeswax + Jojoba Oil',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Recyclable Envelope',
    plastic_reduction: '~3.8 kg/year',
    sustainability_description: 'Replaces plastic cling wrap for over 1 year of daily food storage.',
    plastic_saved_grams: 800,
    co2_reduced_grams: 1600,
    waste_reduced_grams: 650,
    status: 'active'
  },
  {
    id: 7,
    name: 'Silicone Storage Bags',
    description: 'Food-grade silicone bags for storing snacks, freezing, and sous-vide.',
    price: 1500,
    stock: 35,
    category_name: 'Kitchen',
    image_url: '/images/products/product-7.jpg',
    eco_score: 90,
    material: '100% Pure Platinum Food-Grade Silicone',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Recyclable Craft Paper',
    plastic_reduction: '~4.5 kg/year',
    sustainability_description: 'One reusable silicone bag replaces over 500 single-use Ziploc plastic bags.',
    plastic_saved_grams: 950,
    co2_reduced_grams: 2100,
    waste_reduced_grams: 700,
    status: 'active'
  },
  {
    id: 8,
    name: 'Detergent Strips',
    description: 'Zero-waste laundry detergent strips that dissolve completely in water.',
    price: 1100,
    stock: 90,
    category_name: 'Home',
    image_url: '/images/products/product-8.jpg',
    eco_score: 94,
    material: 'Plant-Derived Surfactants + Coconut Oil Extracts',
    reusable: 'No (Dissolvable)',
    recyclable: 'Fully Biodegradable',
    packaging: 'Zero-Plastic Cardboard Sleeve',
    plastic_reduction: '~6.0 kg/year',
    sustainability_description: 'Eliminates heavy plastic detergent jugs and reduces shipping emissions by 94%.',
    plastic_saved_grams: 1200,
    co2_reduced_grams: 2800,
    waste_reduced_grams: 900,
    status: 'active'
  },
  {
    id: 9,
    name: 'Biodegradable Bamboo Toothbrush (4-Pack)',
    description: 'Naturally antibacterial moso bamboo toothbrushes with BPA-free castor bean oil bristles.',
    price: 420,
    stock: 150,
    category_name: 'Home',
    image_url: '/images/products/product-9.jpg',
    eco_score: 99,
    material: 'Wild-Harvested Moso Bamboo + Castor Oil Bristles',
    reusable: 'Yes (3 Months per brush)',
    recyclable: 'Compostable Handle',
    packaging: '100% Recycled Kraft Paper',
    plastic_reduction: '~1.8 kg/year',
    sustainability_description: '100% plastic-free handle degrades naturally in soil within 90 days.',
    plastic_saved_grams: 320,
    co2_reduced_grams: 600,
    waste_reduced_grams: 200,
    status: 'active'
  },
  {
    id: 10,
    name: 'Stainless Steel Bento Lunchbox',
    description: '3-tier food-grade 304 stainless steel lunch container with leakproof silicone seal.',
    price: 1850,
    stock: 40,
    category_name: 'Kitchen',
    image_url: '/images/products/product-10.jpg',
    eco_score: 95,
    material: '304 Food-Grade Stainless Steel',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Recyclable Box',
    plastic_reduction: '~3.5 kg/year',
    sustainability_description: 'Lifetime durability steel construction completely eliminates disposable plastic containers.',
    plastic_saved_grams: 850,
    co2_reduced_grams: 2200,
    waste_reduced_grams: 600,
    status: 'active'
  },
  {
    id: 11,
    name: 'Natural Coconut Fiber Scrubber Sponges (6-Pack)',
    description: 'Pack of 6 plant-based dish scrubbers made from coconut coir fiber and natural cellulose.',
    price: 380,
    stock: 110,
    category_name: 'Kitchen',
    image_url: '/images/products/product-11.jpg',
    eco_score: 97,
    material: 'Upcycled Coconut Fiber + Wood Cellulose',
    reusable: 'Yes',
    recyclable: '100% Home Compostable',
    packaging: 'Paper Sleeve',
    plastic_reduction: '~2.0 kg/year',
    sustainability_description: 'Replaces synthetic yellow plastic sponges that shed microplastics into waterways.',
    plastic_saved_grams: 400,
    co2_reduced_grams: 750,
    waste_reduced_grams: 350,
    status: 'active'
  },
  {
    id: 12,
    name: 'Portable Solar Camping Lantern',
    description: 'Collapsible solar-charged waterproof LED lantern with emergency USB phone charging output.',
    price: 1950,
    stock: 30,
    category_name: 'Electronics',
    image_url: '/images/products/product-12.jpg',
    eco_score: 93,
    material: 'Recycled TPU + High-Efficiency Solar Cells',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Recyclable Box',
    plastic_reduction: '~2.8 kg/year',
    sustainability_description: 'Solar charged emergency illumination eliminating toxic chemical batteries.',
    plastic_saved_grams: 500,
    co2_reduced_grams: 4100,
    waste_reduced_grams: 450,
    status: 'active'
  },
  {
    id: 13,
    name: 'Organic Solid Shampoo & Conditioner Bar',
    description: 'Concentrated cold-pressed botanical hair care bars replacing up to 3 plastic bottles.',
    price: 780,
    stock: 85,
    category_name: 'Home',
    image_url: '/images/products/product-13.jpg',
    eco_score: 95,
    material: 'Cold-Pressed Argan Oil + Cocoa Butter + Botanical Extracts',
    reusable: 'No (Bar)',
    recyclable: 'Compostable Box',
    packaging: 'Paperboard Box',
    plastic_reduction: '~3.6 kg/year',
    sustainability_description: 'Water-free formulation saves 3 liquid shampoo bottles per bar.',
    plastic_saved_grams: 700,
    co2_reduced_grams: 1500,
    waste_reduced_grams: 500,
    status: 'active'
  },
  {
    id: 14,
    name: 'Handcrafted Recycled Wool Blanket',
    description: 'Warm heirloom blanket woven from 100% upcycled post-consumer wool fibers.',
    price: 2900,
    stock: 20,
    category_name: 'Home',
    image_url: '/images/products/product-14.jpg',
    eco_score: 91,
    material: '100% Upcycled Recycled Wool',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Jute Bag',
    plastic_reduction: '~2.2 kg/year',
    sustainability_description: 'Woven from textile offcuts to eliminate landfill fabric waste.',
    plastic_saved_grams: 600,
    co2_reduced_grams: 3200,
    waste_reduced_grams: 1200,
    status: 'active'
  },
  {
    id: 15,
    name: 'Organic Cotton Mesh Produce Bags (Set of 6)',
    description: 'Breathable GOTS-certified organic cotton drawstring bags with tare weight labels for grocery shopping.',
    price: 720,
    stock: 95,
    category_name: 'Fashion',
    image_url: '/images/products/product-15.jpg',
    eco_score: 97,
    material: 'GOTS Certified Unbleached Organic Cotton',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Cotton String Wrap',
    plastic_reduction: '~5.5 kg/year',
    sustainability_description: 'Replaces over 300 single-use thin plastic produce bags per year.',
    plastic_saved_grams: 900,
    co2_reduced_grams: 1100,
    waste_reduced_grams: 400,
    status: 'active'
  },
  {
    id: 16,
    name: 'Handcrafted Upcycled Cork Slim Wallet',
    description: 'Cruelty-free, water-resistant minimalist wallet crafted from ethically harvested oak cork bark.',
    price: 1350,
    stock: 55,
    category_name: 'Accessories',
    image_url: '/images/products/product-16.jpg',
    eco_score: 94,
    material: 'Ethically Harvested Oak Cork Bark',
    reusable: 'Yes',
    recyclable: 'Yes',
    packaging: 'Recycled Paper Envelope',
    plastic_reduction: '~1.5 kg/year',
    sustainability_description: 'Cork harvesting protects living oak trees and absorbs 3x more CO2.',
    plastic_saved_grams: 300,
    co2_reduced_grams: 1800,
    waste_reduced_grams: 250,
    status: 'active'
  }
];

export class ProductModel {
  static async getAllProducts(category?: string): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const query: any = {};
        if (category && category !== 'all') {
          query.category = { $regex: new RegExp(category, 'i') };
        }
        const products = await MongoProductModel.find(query).lean();
        if (products && products.length > 0) {
          return products.map((p: any) => {
            const fallback = fallbackProducts.find(f => f.id === p.id);
            if (fallback && (!p.image_url || p.image_url.includes('unsplash.com'))) {
              p.image_url = fallback.image_url;
              MongoProductModel.updateOne({ id: p.id }, { $set: { image_url: fallback.image_url } }).catch(() => {});
            }
            return p;
          });
        }
      } catch (e) {}
    }

    let filtered = [...fallbackProducts];
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category_name.toLowerCase() === category.toLowerCase());
    }
    return filtered;
  }

  static async getProductById(id: number): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const product = await MongoProductModel.findOne({ id: Number(id) }).lean();
        if (product) {
          const fallback = fallbackProducts.find(f => f.id === product.id);
          if (fallback && (!product.image_url || product.image_url.includes('unsplash.com'))) {
            product.image_url = fallback.image_url;
            MongoProductModel.updateOne({ id: product.id }, { $set: { image_url: fallback.image_url } }).catch(() => {});
          }
          return product;
        }
      } catch (e) {}
    }

    return fallbackProducts.find(p => p.id === Number(id)) || null;
  }
}
