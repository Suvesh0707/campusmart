import Product from '../models/product.model.js';
import Buyer from '../models/sold.product.js';

export const addRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user bought the product
    const isBuyer = await Buyer.findOne({ product: productId, buyer: userId });
    if (!isBuyer) {
      return res.status(403).json({ message: 'Only buyers can rate this product' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already rated
    const alreadyRated = product.ratings.find(r => r.user.toString() === userId);
    if (alreadyRated) {
      return res.status(400).json({ message: 'You have already rated this product' });
    }

    // Add rating to product
    product.ratings.push({
      user: userId,
      rating,
      comment
    });

    await product.save();

    res.status(200).json({ message: 'Rating added successfully', product });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
