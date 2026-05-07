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
            enum: ["Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Confirmed"],
            default: "Processing"
        }
    },
    { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;