import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  createCollateral,
  getMyCollaterals,
  getCollateralDetails,
  updateCollateral,
  verifyCollateral
} from '../controllers/collateralController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.post('/', createCollateral);
router.get('/my-collaterals', getMyCollaterals);
router.get('/:id', getCollateralDetails);
router.put('/:id', updateCollateral);

// Admin routes
router.put('/:id/verify', authorize('admin'), verifyCollateral);

export default router; 