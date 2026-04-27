import express from "express";
import {
    getProducts,
    addProduct,
    getSingleProduct,
    deleteProduct,
    updateProduct
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

// CREATE
router.post("/", protect, adminOnly, addProduct);

// UPDATE 
router.put("/:id", protect, adminOnly, updateProduct);

// DELETE
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;