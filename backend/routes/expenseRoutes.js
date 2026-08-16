import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

export default router;
