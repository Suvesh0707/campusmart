import express from 'express';
import { getAllChatsForBuyer, getAllChatsForSeller, getChatByProduct, getChatForSeller, sendMessage } from '../controllers/chat.controller.js';
import { protect } from '../middlewares/authprotect.js';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/chat/:productId', protect, getChatByProduct);
router.get('/all', protect, getAllChatsForBuyer);
router.get('/allchatseller', protect, getAllChatsForSeller);
router.get('/chatseller/:productId/:buyerId', protect, getChatForSeller);




export default router;
