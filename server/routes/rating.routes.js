import express from 'express';
import { addRating } from '../controllers/rating.controller.js';
import { protect } from '../middlewares/authprotect.js';

const router = express.Router();

router.post('/rate/:productId', protect, addRating);

export default router;
