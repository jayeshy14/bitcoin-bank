import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import { 
  createCollateral,
  getMyCollaterals,
  getCollateralDetails,
  updateCollateral,
  verifyCollateral
} from '../controllers/collateralController.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes
router.use(protect);

// Use multer to parse form data and handle file uploads
router.post('/create', upload.single('propertyDocument'), createCollateral);

router.get('/my-collaterals', getMyCollaterals);
router.get('/:id', getCollateralDetails);
router.put('/:id', updateCollateral);

// Admin routes
router.put('/:id/verify', authorize('admin'), verifyCollateral);

export default router;