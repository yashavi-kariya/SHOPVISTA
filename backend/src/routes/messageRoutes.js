import express from "express";
import { sendMessage, getMessages, markAsRead, replyToMessage, getMyMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/", getMessages);
router.patch("/:id/read", markAsRead);
router.patch("/:id/reply", replyToMessage);
router.get("/my", getMyMessages);

export default router;