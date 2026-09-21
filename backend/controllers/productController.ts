import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const products = await ProductModel.getAllProducts(category);
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    const product = await ProductModel.getProductById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
