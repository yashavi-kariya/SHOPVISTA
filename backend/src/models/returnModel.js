import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    img: String,
    price: Number,
    quantity: Number,
    color: String,
    size: String,
    reason: {
        type: String,
        enum: ["Damaged", "Wrong Item", "Not as Described", "Size Issue", "Other"],
        required: true,
    },
}, { _id: false });

const returnRequestSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [returnItemSchema],
        description: { type: String, default: "" },
        photoUrls: { type: [String], default: [] },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        adminNote: { type: String, default: "" },
        // Razorpay refund tracking
        refundId: { type: String, default: null },
        refundStatus: {
            type: String,
            enum: ["not_initiated", "initiated", "completed", "failed"],
            default: "not_initiated",
        },
        refundAmount: { type: Number, default: 0 },
        resolvedAt: { type: Date, default: null },
    },
    { timestamps: true }
);
const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
export default ReturnRequest;