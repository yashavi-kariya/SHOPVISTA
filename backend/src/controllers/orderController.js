import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";

export const createOrder = async (req, res) => {
    console.log("=== BODY RECEIVED ===");
    console.log("totalAmount:", req.body.totalAmount);
    console.log("subtotal:", req.body.subtotal);
    console.log("discount:", req.body.discount);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const items = req.body.items;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        const mappedItems = [];
        for (const item of items) {
            const productId =
                typeof item.product === "object"
                    ? item.product._id
                    : item.product || item.productId;

            if (!productId) {
                return res.status(400).json({ message: "Product ID missing" });
            }
            const product = await Product.findOneAndUpdate(
                { _id: productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity, sold: item.quantity } },
                { new: true, session }
            );

            if (!product) {
                const exists = await Product.findById(productId).session(session);
                const msg = !exists
                    ? "Product not found"
                    : `${exists.name} has insufficient stock`;
                return res.status(400).json({ message: msg });
            }
            // ✅ Use price sent from frontend (variant price), fallback to product.price
            mappedItems.push({
                product: productId,
                name: product.name,
                img: item.img || product.img || "",
                price: Number(item.price) > 0
                    ? Number(item.price)
                    : (() => {
                        // Try to find matching variant price
                        if (product.variants?.length > 0 && (item.color || item.size)) {
                            const variant = product.variants.find(v =>
                                v.attributes.color === item.color &&
                                v.attributes.size === item.size
                            );
                            return variant?.price || product.price;
                        }
                        return product.price;
                    })(),
                quantity: item.quantity,
                color: item.color || null,
                size: item.size || null,
            });
        }

        const order = new Order({
            user: userId,
            items: mappedItems,
            totalAmount: req.body.totalAmount,
            subtotal: req.body.subtotal || 0,          // ← ADD
            shippingCharge: req.body.shippingCharge || 0, // ← ADD
            coupon: req.body.coupon || null,
            discount: req.body.discount || 0,
            billingDetails: req.body.billing || null,
            status: "Processing",
        });

        console.log("PRE-SAVE totalAmount:", order.totalAmount);
        const savedOrder = await order.save({ session });
        console.log("POST-SAVE totalAmount:", savedOrder.totalAmount);

        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { session }
        );
        await session.commitTransaction();
        res.status(201).json(savedOrder);

    } catch (error) {
        await session.abortTransaction();
        console.error("ORDER ERROR:", error);
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

/* =========================
   GET ALL ORDERS
========================= */

export const getOrders = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";
        const query = isAdmin ? {} : { user: req.user.id };
        const orders = await Order.find(query)
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
};

/* =========================
   GET SINGLE ORDER
========================= */
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email");  // ✅ only populate user
        //  removed: .populate("items.product")

        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

/* =========================
   GET MY ORDERS
========================= */

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            //  removed: .populate("items.product") — name is already saved
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("getMyOrders error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* =========================
   UPDATE ORDER STATUS
========================= */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;

        if (status === "Confirmed") {
            order.paymentStatus = "Paid";
        }

        await order.save();
        res.json({ message: "Status updated successfully", order });

    } catch (error) {
        console.log("STATUS UPDATE ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* =========================
   CANCEL ORDER
========================= */
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        order.status = "Cancelled";
        await order.save();
        res.json({ message: "Order cancelled", order });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
