import express from 'express';
import { getMeals, createMeal, updateMeal, deleteMeal } from '../controllers/mealController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('OWNER'), requireMess);
router.route('/').get(getMeals).post(createMeal);
router.route('/:id').put(updateMeal).delete(deleteMeal);
export default router;
