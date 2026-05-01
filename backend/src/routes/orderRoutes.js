import express from "express";
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    getMyOrders,
    cancelOrder,
    getOrderById      //  add this
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/", protect, adminOnly, getOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
// // orderRoutes.js

// import express from "express";
// import { createOrder, getOrders, updateOrderStatus, getMyOrders, cancelOrder } from "../controllers/orderController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/", protect, createOrder);
// router.get("/my", protect, getMyOrders);
// router.get("/", protect, getOrders);
// router.put("/:id/status", protect, updateOrderStatus);
// router.put("/:id/cancel", protect, cancelOrder);

// export default router;