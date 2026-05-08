import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSettings);                          // public — Cart & Checkout use this
router.put("/", protect, adminOnly, updateSettings);   // admin only

export default router;