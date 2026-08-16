import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);

export default router;
