import express from "express";
import {
    checkReturnEligibility,
    createReturnRequest,
    getMyReturnRequests,
    getAllReturnRequests,
    approveReturnRequest,
    rejectReturnRequest,
} from "../controllers/returnController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer routes
router.get("/my", protect, getMyReturnRequests);
router.get("/check/:orderId", protect, checkReturnEligibility);
router.post("/", protect, createReturnRequest);

// Admin routes
router.get("/", protect, adminOnly, getAllReturnRequests);
router.put("/:id/approve", protect, adminOnly, approveReturnRequest);
router.put("/:id/reject", protect, adminOnly, rejectReturnRequest);

export default router;