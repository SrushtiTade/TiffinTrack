import express from 'express';
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getPlans).post(createPlan);
router.route('/:id').get(getPlan).put(updatePlan).delete(deletePlan);

export default router;
