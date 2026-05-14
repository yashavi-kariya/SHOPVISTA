import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                name: String,
                img: String,
                price: Number,
                quantity: Number,
                color: String,
                size: String,
            }
        ],
        totalAmount: Number,
        billingDetails: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        shippingCharge: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        paymentStatus: { type: String, default: "Pending" },
        razorpayPaymentId: { type: String, default: null },
        razorpaySignature: { type: String, default: null },
        coupon: { type: String, default: null },
        discount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Confirmed", "Refunded", "Returned"],
            default: "Processing"
        },

        // ── Cancel tracking ──────────────────────────────
        cancelledAt: { type: Date, default: null },
        cancelReason: { type: String, default: null },

        // ── Return tracking ──────────────────────────────
        // "None" | "Pending" | "Approved" | "Rejected"
        returnStatus: { type: String, enum: ["None", "Pending", "Approved", "Rejected"], default: "None" },
        returnRequestedAt: { type: Date, default: null },
        returnReason: { type: String, default: null },
        returnDescription: { type: String, default: null },
        returnAdminNote: { type: String, default: null },   // admin rejection note
        refundAmount: { type: Number, default: null },

        returnRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReturnRequest",
            default: null
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
// import mongoose from "mongoose";
// const orderSchema = new mongoose.Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },
//         items: [
//             {
//                 product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//                 name: String,
//                 img: String,
//                 price: Number,
//                 quantity: Number,
//                 color: String,
//                 size: String,
//             }
//         ],
//         totalAmount: Number,
//         billingDetails: {
//             type: mongoose.Schema.Types.Mixed,
//             default: null
//         },
//         shippingCharge: { type: Number, default: 0 },
//         subtotal: { type: Number, default: 0 },
//         paymentStatus: { type: String, default: "Pending" },
//         razorpayPaymentId: { type: String, default: null },
//         razorpaySignature: { type: String, default: null },
//         coupon: { type: String, default: null },
//         discount: { type: Number, default: 0 },
//         status: {
//             type: String,
//             enum: ["Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Confirmed", "Refunded"], // ← added Refunded
//             default: "Processing"
//         },
//         returnRequest: { // ← NEW: easy lookup
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "ReturnRequest",
//             default: null
//         }
//     },
//     { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// export default Order;
