import express from 'express';
import { getPolls, createPoll, closePoll, publishPollMeal } from '../controllers/pollController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getPolls).post(createPoll);
router.post('/:id/close', closePoll);
router.post('/:id/publish', publishPollMeal);
export default router;
