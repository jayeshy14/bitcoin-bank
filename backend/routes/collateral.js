import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  createCollateral,
  getMyCollaterals,
  getCollateralDetails,
  removeCollateral
} from '../controllers/collateralController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Create collateral
router.post('/create', createCollateral);

//Remove collateral
router.delete('/remove/:id', removeCollateral)

// Fetch user's collateral list
router.get('/my-collaterals', getMyCollaterals);

// Get details of a specific collateral item
router.get('/:id', getCollateralDetails);

export default router;
