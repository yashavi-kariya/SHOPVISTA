import express from "express";
import {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCart);                 // fetch cart
router.post("/add", protect, addToCart);           // add item
router.put("/update", protect, updateCart);        // update quantity
router.delete("/remove/:productId", protect, removeFromCart); // remove item

export default router;