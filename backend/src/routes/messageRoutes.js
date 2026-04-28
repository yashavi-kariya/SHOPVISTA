import express from "express";
import { sendMessage, getMessages, markAsRead, replyToMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/", getMessages);
router.patch("/:id/read", markAsRead);
router.patch("/:id/reply", replyToMessage);

export default router;