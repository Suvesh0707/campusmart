import Razorpay from "razorpay";
import nodemailer from 'nodemailer';
import Product from "../models/product.model.js";
import dotenv from 'dotenv'
import SoldProduct from "../models/sold.product.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const buyProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, email, address, phone } = req.body;

    // Populate seller info
    const product = await Product.findById(productId).populate('seller', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sold) return res.status(400).json({ message: 'Product already sold' });

    // Mark as sold immediately
    product.sold = true;
    await product.save();

    // Save to SoldProduct collection WITH buyer._id included!
    const soldProduct = new SoldProduct({
      product, // complete product details
      buyer: { 
        _id: req.user.id, // ✅ save buyer's _id here (from token)
        name, 
        email, 
        address, 
        phone 
      },
      seller: {
        id: product.seller._id,
        name: product.seller.name,
        email: product.seller.email,
      },
    });

    await soldProduct.save();

    // Create Razorpay Payment Link (demo purpose)
    const paymentLink = await razorpay.paymentLink.create({
      amount: product.price * 100,
      currency: 'INR',
      description: `Payment for ${product.title}`,
      customer: { name, email, contact: phone },
      notify: { sms: true, email: true },
      reminder_enable: true,
      callback_url: "https://suvesh-music-melody.vercel.app/",
      callback_method: "get"
    });

    // Send Payment Link via Email
    const mailOptions = {
      from: 'suveshpagam@gmail.com',
      to: email,
      subject: 'Complete Your Purchase on Campus Mart',
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for showing interest in <b>${product.title}</b>.</p>
        <p>Click the link below to complete your payment:</p>
        <a href="${paymentLink.short_url}">Pay Now</a>
        <p>Regards,<br/>Campus Mart Team</p>
      `
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Product marked sold, stored in SoldProduct & Payment link sent!',
      link: paymentLink.short_url
    });

  } catch (error) {
    console.error("Error in buyProduct:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getBuyHistory = async (req, res) => {
  try {
    const userId = req.user.id; // From protect middleware (decoded.userId)

    // Fetch all SoldProducts where buyer._id matches this user ID
    const history = await SoldProduct.find({ 'buyer._id': userId });

    if (!history.length) {
      return res.status(404).json({ message: 'No purchase history found for this user.' });
    }

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });

  } catch (error) {
    console.error("Error in getBuyHistory:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
