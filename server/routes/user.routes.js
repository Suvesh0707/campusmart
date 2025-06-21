import express from 'express';
import { getCurrentUser, login, logout, register } from '../controllers/user.controller.js';
import { protect } from '../middlewares/authprotect.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',  login);
router.post('/logout', logout);

router.get('/getcurrentuser',protect, getCurrentUser);

export default router;
