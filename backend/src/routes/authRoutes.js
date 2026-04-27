import express from "express";
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", registerUser);


// router.post("/login", loginUser);

export default router;