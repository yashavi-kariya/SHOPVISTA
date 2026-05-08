import express from "express";
import {
    getProducts,
    addProduct,
    getSingleProduct,
    deleteProduct,
    updateProduct
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { restockVariant } from "../controllers/productController.js";
const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.post("/", protect, adminOnly, addProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/restock", protect, adminOnly, restockVariant);

export default router;