import express from "express";
import { sendMessage, getMessages, markAsRead, replyToMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);      // user submits contact form
router.get("/", getMessages);      // admin fetches all messages
router.patch("/:id/read", markAsRead);       // admin opens message
router.patch("/:id/reply", replyToMessage);  // admin sends reply

export default router;