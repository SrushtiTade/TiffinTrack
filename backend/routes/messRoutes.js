import express from 'express';
import {
  exploreMesses,
  getMessDetails,
  updateMessSettings,
  getOwnerMess,
} from '../controllers/messController.js';
import { protect, authorize, requireMess } from '../middleware/auth.js';

const router = express.Router();

// Public routes — customers browsing messes
router.get('/', exploreMesses);
router.get('/:id', getMessDetails);

// Owner-only routes
router.get('/my-mess', protect, authorize('OWNER'), getOwnerMess);
router.put('/my-mess', protect, authorize('OWNER'), updateMessSettings);

export default router;
