import express from 'express';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getPayments).post(createPayment);
router.route('/:id').put(updatePayment).delete(deletePayment);

export default router;
