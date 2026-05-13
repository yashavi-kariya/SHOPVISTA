import express from "express";
import {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart,
    mergeCart,
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCart);           // GET    /api/cart
router.post("/add", protect, addToCart);         // POST   /api/cart/add
router.put("/update", protect, updateCart);        // PUT    /api/cart/update
router.delete("/remove/:productId", protect, removeFromCart); // DELETE /api/cart/remove/:productId
router.delete("/clear", protect, clearCart);         // DELETE /api/cart/clear
router.post("/merge", protect, mergeCart);         // POST   /api/cart/merge

export default router;