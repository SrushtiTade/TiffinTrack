import express from 'express';
import { register, registerCustomer, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-customer', registerCustomer);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
