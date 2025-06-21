import Product from "../models/product.model.js";
import Buyer from "../models/sold.product.js";
import User from '../models/user.model.js'
import Razorpay from "razorpay";
import crypto from 'crypto';

export const createProduct = async (req, res) => {
  const { title, price, description, condition, category, location, images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: 'At least one image URL is required' });
  }

  const product = new Product({
    title,
    price,
    description,
    condition,
    category,
    location,
    images, 
    seller: req.user.id,
  });

  await product.save();
  res.status(201).json({ message: 'Product created successfully', product });
};



export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      sold: false, 
      seller: { $ne: req.user.id } 
    }).populate('seller', 'name email');
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





export const getMyProducts = async (req, res) => {
  try {
    const myProducts = await Product.find({ seller: req.user.id }).populate('seller', 'name email');
    res.status(200).json(myProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const filterFromAllProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, location, sold } = req.query;

    const products = await Product.find().populate('seller', 'name email');

    const filteredProducts = products.filter(product => {
      let isMatch = true;
      if (query) {
        isMatch = isMatch && product.title.toLowerCase().includes(query.toLowerCase());
      }
      if (category) {
        isMatch = isMatch && product.category.toLowerCase() === category.toLowerCase();
      }
      if (minPrice) {
        isMatch = isMatch && product.price >= parseInt(minPrice);
      }
      if (maxPrice) {
        isMatch = isMatch && product.price <= parseInt(maxPrice);
      }
      if (location) {
        isMatch = isMatch && product.location.toLowerCase().includes(location.toLowerCase());
      }
      if (sold !== undefined) { 
        isMatch = isMatch && product.sold === (sold === 'true');
      }

      return isMatch;
    });

    res.status(200).json(filteredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, name, email, phone, address } = req.body;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      product.sold = true;
      await product.save();

      const newBuyer = new Buyer({
        product: productId,
        buyer: req.user?.id,
        name, email, address, phone
      });
      await newBuyer.save();

      res.status(200).json({ message: 'Payment verified & product sold!', buyer: newBuyer });
    } else {
      res.status(400).json({ message: 'Invalid payment signature!' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};