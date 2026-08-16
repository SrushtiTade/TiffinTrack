import express from 'express';
import { getCheckoutPreview, processCheckout } from '../controllers/checkoutController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('CUSTOMER'));
router.get('/preview', getCheckoutPreview);
router.post('/pay', processCheckout);

export default router;
