import Chat from '../models/chat.model.js';
import Product from '../models/product.model.js';

export const sendMessage = async (req, res) => {
  try {
    const { productId, buyerId, message } = req.body;
    const userId = req.user.id; // Comes from protect middleware

    if (!productId || !message) {
      return res.status(400).json({ message: 'Product ID and message are required' });
    }

    const product = await Product.findById(productId).populate('seller');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let chat;

    // If seller is sending message
    if (product.seller._id.toString() === userId) {
      if (!buyerId) {
        return res.status(400).json({ message: 'Buyer ID is required when seller sends message' });
      }

      chat = await Chat.findOne({ product: productId, buyer: buyerId });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found for this buyer and product' });
      }
    } 
    // If buyer is sending message
    else {
      chat = await Chat.findOne({ product: productId, buyer: userId });

      // If no chat exists, create new one
      if (!chat) {
        chat = new Chat({
          product: productId,
          buyer: userId,
          messages: [{ sender: userId, message }]
        });

        await chat.save();
        return res.status(201).json(chat);
      }
    }

    // Chat exists — append new message
    chat.messages.push({ sender: userId, message });
    await chat.save();
    res.status(200).json(chat);

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getChatByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user.id;

    const chat = await Chat.findOne({ product: productId, buyer: buyerId })
      .populate('product', 'title price images')
      .populate('buyer', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'No chat found for this product and buyer' });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ message: 'Server error while fetching chat' });
  }
};

export const getAllChatsForBuyer = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const chats = await Chat.find({ buyer: buyerId })
      .populate('product', 'title price images');

    const modifiedChats = chats.map(chat => ({
      ...chat._doc,
      product: {
        ...chat.product._doc,
        image: chat.product.images?.[0] || null
      }
    }));

    res.json(modifiedChats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ message: 'Error fetching chats' });
  }
};

export const getAllChatsForSeller = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Product.find({ seller: sellerId });

    const chats = await Chat.find({ product: { $in: products.map(p => p._id) } })
      .populate('product', 'title price images')
      .populate('buyer', 'name email');

    res.json(chats);
  } catch (err) {
    console.error('Error fetching seller chats:', err);
    res.status(500).json({ message: 'Error fetching seller chats' });
  }
};

export const getChatForSeller = async (req, res) => {
  try {
    const { productId, buyerId } = req.params;
    const sellerId = req.user.id;

    const product = await Product.findById(productId).populate('seller');
    if (!product || !product.seller) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }

    if (product.seller._id.toString() !== sellerId) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    const chat = await Chat.findOne({ product: productId, buyer: buyerId })
      .populate('buyer', 'name email')
      .populate('product', 'title price');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found with this buyer' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching seller chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
