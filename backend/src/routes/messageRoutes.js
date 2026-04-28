import express from "express";
import { sendMessage, getMessages, markAsRead, replyToMessage, getMyMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/my", getMyMessages);
router.post("/", sendMessage);
router.get("/", getMessages);
router.patch("/:id/read", markAsRead);
router.patch("/:id/reply", replyToMessage);

export default router;