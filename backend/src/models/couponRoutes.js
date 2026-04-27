import express from 'express';
import { getBestCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get('/best', getBestCoupon);

export default router;
