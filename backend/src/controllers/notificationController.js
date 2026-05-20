import Notification from "../models/notificationModel.js";

// GET /api/notifications/my — customer: their own notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id,
            forAdmin: false,
        }).sort({ createdAt: -1 }).limit(30);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
// GET /api/notifications/admin — admin: all admin-facing notifications
export const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ forAdmin: true })
            .populate("user", "name email")
            .sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
// PUT /api/notifications/:id/read — mark one as read
export const markNotificationRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
// PUT /api/notifications/read-all — mark all as read (customer)
export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, forAdmin: false, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};