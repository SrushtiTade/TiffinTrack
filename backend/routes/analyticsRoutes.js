import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import {
  getRevenueReport,
  getExpenseReport,
  getProfitReport,
  getCustomerReport,
  getPlanReport,
} from '../controllers/reportController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('OWNER'), requireMess);
router.get('/dashboard', requireMess, getDashboard);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/expenses', getExpenseReport);
router.get('/reports/profit', getProfitReport);
router.get('/reports/customers', getCustomerReport);
router.get('/reports/plans', getPlanReport);

export default router;
