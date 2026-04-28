import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["unread", "read", "replied"], default: "unread" },
    adminReply: { type: String, default: "" },
    aiSuggestion: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);