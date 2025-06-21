import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import nodemailer from 'nodemailer';
import cors from 'cors'
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(express.json());

import userRoutes from './routes/user.routes.js';
app.use('/api/v1/users', userRoutes);

import otpRoutes from './routes/otp.routes.js'
app.use('/api/v1/users', otpRoutes);

import productRoutes from './routes/product.routes.js'
app.use('/api/v1/products', productRoutes)

import ratingRoutes from './routes/rating.routes.js';
app.use('/api/v1/ratings', ratingRoutes);

import chatRoutes from './routes/chat.routes.js'
app.use('/api/v1/chats', chatRoutes)





connectDB();


app.listen(PORT , ()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})