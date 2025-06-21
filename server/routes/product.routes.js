import express from 'express';
import {  createProduct, filterFromAllProducts, getAllProducts, getMyProducts, } from '../controllers/product.controller.js';

import { protect } from '../middlewares/authprotect.js';
import { buyProduct, getBuyHistory } from '../utils/razorpay.js';

const router = express.Router();

router.post('/sell',protect, createProduct);
router.get('/all',protect, getAllProducts);   
router.get('/myproducts',protect, getMyProducts);   
router.post('/buy/:id', protect, buyProduct); 

router.get('/filter',protect, filterFromAllProducts);
router.get('/getbuyhistory',protect,getBuyHistory);


export default router;
