import express from "express";
import {
    getMyNotifications,
    getAdminNotifications,
    markNotificationRead,
    markAllRead,
} from "../controllers/notificationController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyNotifications);
router.get("/admin", protect, adminOnly, getAdminNotifications);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markNotificationRead);

export default router;