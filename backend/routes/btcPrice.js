import express from "express";
import { protect } from "../middleware/auth.js";
import { getBTCvalueInUSD } from "../controllers/collateralController.js";

const router = express.Router();

router.use(protect);

router.get("/", getBTCvalueInUSD);

export default router;