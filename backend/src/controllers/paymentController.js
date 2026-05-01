import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/orderModel.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ========================
// CREATE RAZORPAY ORDER
// ========================
export const createRazorpayOrder = async (req, res) => {
    try {
        const { totalAmount } = req.body;

        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Failed to create payment order" });
    }
};

// ========================
// VERIFY PAYMENT
// ========================
export const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,           // your DB order _id
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = req.body;

        // Step 1: Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "❌ Invalid payment signature" });
        }

        // Step 2: Update order → Confirmed
        await Order.findByIdAndUpdate(orderId, {
            status: "Confirmed",          // 👈 Pending → Confirmed
            paymentStatus: "Paid",
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        res.json({ success: true, message: "✅ Payment verified! Order Confirmed." });

    } catch (error) {
        console.error("Payment Verify Error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};

// ========================
// PAYMENT FAILED
// ========================
export const paymentFailed = async (req, res) => {
    try {
        const { orderId } = req.body;

        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "Failed",
            status: "Pending",
        });

        res.json({ success: true, message: "Payment marked as failed" });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};