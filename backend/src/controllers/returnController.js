import ReturnRequest from "../models/returnModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Settings from "../models/settingsModel.js";
import Notification from "../models/notificationModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getReturnWindowDays = async (productId) => {
    const product = await Product.findById(productId).select("returnWindowDays");
    if (product?.returnWindowDays != null) return product.returnWindowDays;
    const settings = await Settings.findOne();
    return settings?.defaultReturnWindowDays ?? 7;
};

/* ================================
   CUSTOMER: Check if order is returnable
   GET /api/returns/check/:orderId
================================ */
export const checkReturnEligibility = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.user.toString() !== req.user.id.toString())
            return res.status(403).json({ message: "Not authorized" });

        if (order.status !== "Delivered")
            return res.json({ eligible: false, reason: "Order not delivered yet" });

        // Check if return already submitted
        const existing = await ReturnRequest.findOne({ order: order._id, user: req.user.id });
        if (existing)
            return res.json({ eligible: false, reason: "Return already requested", existingRequest: existing });

        // Check return window per item (use the most restrictive — smallest window)
        const deliveredAt = order.updatedAt; // updatedAt when status changed to Delivered
        const now = new Date();

        const windowChecks = await Promise.all(
            order.items.map(async (item) => {
                const days = await getReturnWindowDays(item.product);
                const diffMs = now - new Date(deliveredAt);
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                return { productId: item.product, name: item.name, windowDays: days, diffDays, eligible: diffDays <= days };
            })
        );

        const allExpired = windowChecks.every((w) => !w.eligible);
        if (allExpired)
            return res.json({ eligible: false, reason: "Return window has expired for all items" });

        return res.json({ eligible: true, windowChecks });
    } catch (err) {
        console.error("checkReturnEligibility error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================================
   CUSTOMER: Submit return request
   POST /api/returns
================================ */
export const createReturnRequest = async (req, res) => {
    try {
        const { orderId, items, description, photoUrls } = req.body;

        if (!orderId || !items || items.length === 0)
            return res.status(400).json({ message: "Order and items are required" });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.user.toString() !== req.user.id.toString())
            return res.status(403).json({ message: "Not authorized" });
        if (order.status !== "Delivered")
            return res.status(400).json({ message: "Only delivered orders can be returned" });

        const existing = await ReturnRequest.findOne({ order: orderId, user: req.user.id });
        if (existing) return res.status(400).json({ message: "Return request already submitted for this order" });

        // Validate return window for each item
        const deliveredAt = order.updatedAt;
        const now = new Date();
        for (const item of items) {
            const days = await getReturnWindowDays(item.product);
            const diffDays = Math.floor((now - new Date(deliveredAt)) / (1000 * 60 * 60 * 24));
            if (diffDays > days)
                return res.status(400).json({ message: `Return window expired for "${item.name}" (${days} days)` });
        }

        const returnRequest = new ReturnRequest({
            order: orderId,
            user: req.user.id,
            items,
            description: description || "",
            photoUrls: photoUrls || [],
            refundAmount: order.totalAmount,
        });

        await returnRequest.save();

        // Notify admin (in-app)
        await Notification.create({
            user: req.user.id,
            type: "return_submitted",
            message: `New return request submitted for order #${order._id.toString().slice(-6).toUpperCase()}`,
            forAdmin: true,
            orderId: order._id,
            returnId: returnRequest._id,
        });

        res.status(201).json({ message: "Return request submitted", returnRequest });
    } catch (err) {
        console.error("createReturnRequest error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================================
   CUSTOMER: My return requests
   GET /api/returns/my
================================ */
export const getMyReturnRequests = async (req, res) => {
    try {
        const returns = await ReturnRequest.find({ user: req.user.id })
            .populate("order", "status totalAmount createdAt")
            .sort({ createdAt: -1 });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

/* ================================
   ADMIN: Get all return requests
   GET /api/returns (admin)
================================ */
export const getAllReturnRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const returns = await ReturnRequest.find(filter)
            .populate("user", "name email")
            .populate("order", "status totalAmount razorpayPaymentId createdAt")
            .sort({ createdAt: -1 });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

/* ================================
   ADMIN: Approve return request
   PUT /api/returns/:id/approve
================================ */
export const approveReturnRequest = async (req, res) => {
    try {
        const returnRequest = await ReturnRequest.findById(req.params.id).populate("order");
        if (!returnRequest) return res.status(404).json({ message: "Return request not found" });
        if (returnRequest.status !== "Pending")
            return res.status(400).json({ message: "Request already resolved" });

        const order = returnRequest.order;

        // 1. Restock products
        for (const item of returnRequest.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            const variantIndex = product.variants.findIndex(
                (v) =>
                    v.attributes?.color === (item.color || null) &&
                    (v.attributes?.size === (item.size || "") || (!v.attributes?.size && !item.size))
            );

            if (variantIndex !== -1) {
                product.variants[variantIndex].stock += item.quantity;
                product.sold = Math.max(0, (product.sold || 0) - item.quantity);
                product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                await product.save();
            }
        }

        // 2. Trigger Razorpay refund
        let refundId = null;
        let refundStatus = "not_initiated";

        if (order.razorpayPaymentId && order.razorpayPaymentId !== "mock_payment") {
            try {
                const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
                    amount: returnRequest.refundAmount * 100, // paise
                    notes: { returnRequestId: returnRequest._id.toString() },
                });
                refundId = refund.id;
                refundStatus = "initiated";
            } catch (razorpayErr) {
                console.error("Razorpay refund error:", razorpayErr);
                refundStatus = "failed";
            }
        }

        // 3. Update return request
        returnRequest.status = "Approved";
        returnRequest.refundId = refundId;
        returnRequest.refundStatus = refundStatus;
        returnRequest.resolvedAt = new Date();
        await returnRequest.save();

        // 4. Update order status
        order.status = "Refunded";
        await order.save();

        // 5. Notify customer
        await Notification.create({
            user: returnRequest.user,
            type: "return_approved",
            message: `Your return request for order #${order._id.toString().slice(-6).toUpperCase()} has been approved. Refund of ₹${returnRequest.refundAmount} initiated.`,
            forAdmin: false,
            orderId: order._id,
            returnId: returnRequest._id,
        });

        res.json({ message: "Return approved, stock restocked, refund initiated", returnRequest });
    } catch (err) {
        console.error("approveReturnRequest error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================================
   ADMIN: Reject return request
   PUT /api/returns/:id/reject
================================ */
export const rejectReturnRequest = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const returnRequest = await ReturnRequest.findById(req.params.id).populate("order");
        if (!returnRequest) return res.status(404).json({ message: "Return request not found" });
        if (returnRequest.status !== "Pending")
            return res.status(400).json({ message: "Request already resolved" });

        returnRequest.status = "Rejected";
        returnRequest.adminNote = adminNote || "";
        returnRequest.resolvedAt = new Date();
        await returnRequest.save();

        // Notify customer
        await Notification.create({
            user: returnRequest.user,
            type: "return_rejected",
            message: `Your return request for order #${returnRequest.order._id.toString().slice(-6).toUpperCase()} was rejected. ${adminNote ? `Reason: ${adminNote}` : ""}`,
            forAdmin: false,
            orderId: returnRequest.order._id,
            returnId: returnRequest._id,
        });

        res.json({ message: "Return request rejected", returnRequest });
    } catch (err) {
        console.error("rejectReturnRequest error:", err);
        res.status(500).json({ message: "Server error" });
    }
};