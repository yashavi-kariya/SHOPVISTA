import express from "express";
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    getMyOrders,
    cancelOrder,
    getOrderById,
    returnOrder,
    handleReturn,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

console.log("✅ orderRoutes.js loaded");
const router = express.Router();

// ── Static / specific routes FIRST (before /:id) ──────────────
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);          // ← MUST be before /:id
router.get("/", protect, adminOnly, getOrders);   // ← MUST be before /:id

// ── Dynamic :id routes AFTER static ones ──────────────────────
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, returnOrder);
router.put("/:id/handle-return", protect, adminOnly, handleReturn);

export default router;
// import express from "express";
// import {
//     createOrder,
//     getOrders,
//     updateOrderStatus,
//     getMyOrders,
//     cancelOrder,
//     getOrderById
// } from "../controllers/orderController.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";
// console.log("✅ orderRoutes.js loaded");
// const router = express.Router();

// router.post("/", protect, createOrder);
// router.get("/my", protect, getMyOrders);
// router.get("/:id", protect, getOrderById);

// router.get("/", protect, adminOnly, getOrders);
// router.put("/:id/status", protect, adminOnly, updateOrderStatus);
// router.put("/:id/cancel", protect, cancelOrder);

// export default router;
