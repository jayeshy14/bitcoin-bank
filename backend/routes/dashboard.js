import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// Protect the route
router.use(protect);

// Dashboard stats route
router.get('/stats', getDashboardStats);

export default router; 