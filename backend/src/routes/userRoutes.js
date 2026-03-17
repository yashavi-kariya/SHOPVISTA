import express from "express";
import { loginUser, getProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js"; // ✅ correct default import

const router = express.Router();

router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

export default router;