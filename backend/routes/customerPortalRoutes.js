import express from 'express';
import {
  getCustomerDashboard,
  getMySubscription,
  renewMySubscription,
  getMyPayments,
  getMyMeals,
  getOpenPolls,
  castVote,
  submitReview,
  updateProfile,
} from '../controllers/customerPortalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('CUSTOMER'));

router.get('/dashboard', getCustomerDashboard);
router.get('/subscription', getMySubscription);
router.post('/subscription/renew', renewMySubscription);
router.get('/payments', getMyPayments);
router.get('/meals', getMyMeals);
router.get('/polls', getOpenPolls);
router.post('/polls/vote', castVote);
router.post('/reviews', submitReview);
router.put('/profile', updateProfile);

export default router;
