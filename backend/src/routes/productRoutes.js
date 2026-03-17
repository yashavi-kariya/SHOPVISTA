import express from "express";
import { getProducts, createProduct, getSingleProduct } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.get("/:id", getSingleProduct);

export default router;