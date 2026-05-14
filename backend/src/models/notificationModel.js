import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["return_submitted", "return_approved", "return_rejected"],
            required: true,
        },
        message: { type: String, required: true },
        forAdmin: { type: Boolean, default: false }, // true = admin sees it, false = customer sees it
        read: { type: Boolean, default: false },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
        returnId: { type: mongoose.Schema.Types.ObjectId, ref: "ReturnRequest", default: null },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;