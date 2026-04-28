import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message)
            return res.status(400).json({ error: "All fields required" });

        const msg = new Message({ name, email, message });
        await msg.save();
        res.status(201).json({ success: true, id: msg._id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const msg = await Message.findByIdAndUpdate(
            req.params.id,
            { status: "read" },
            { new: true }
        );
        res.json(msg);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const replyToMessage = async (req, res) => {
    try {
        const { adminReply } = req.body;
        const msg = await Message.findByIdAndUpdate(
            req.params.id,
            { adminReply, status: "replied" },
            { new: true }
        );
        res.json(msg);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};