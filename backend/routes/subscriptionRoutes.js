import express from 'express';
import {
  getSubscriptions,
  createSubscription,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
} from '../controllers/subscriptionController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getSubscriptions).post(createSubscription);
router.put('/:id/pause', pauseSubscription);
router.put('/:id/resume', resumeSubscription);
router.put('/:id/renew', renewSubscription);

export default router;
