import express from "express";
import {
    getBestCoupon,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/best", getBestCoupon);
// Admin
router.get("/admin/all", protect, adminOnly, getAllCoupons);
router.post("/admin", protect, adminOnly, createCoupon);
router.put("/admin/:id", protect, adminOnly, updateCoupon);
router.delete("/admin/:id", protect, adminOnly, deleteCoupon);

export default router;
// import express from 'express';
// import { getBestCoupon } from '../controllers/couponController.js';

// const router = express.Router();

// router.get('/best', getBestCoupon);

// export default router;
