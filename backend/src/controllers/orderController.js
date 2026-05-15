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
            const product = await Product.findById(productId).session(session);
            if (!product) {
                return res.status(400).json({ message: "Product not found" });
            }
            const variantIndex = product.variants.findIndex(v =>
                v.attributes?.color === (item.color || null) &&
                (v.attributes?.size === (item.size || "") || (!v.attributes?.size && !item.size))
            );
            if (variantIndex === -1) {
                return res.status(400).json({ message: `Variant not found for ${product.name}` });
            }
            const variant = product.variants[variantIndex];
            if (variant.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name} (${item.color} / ${item.size})` });
            }
            product.variants[variantIndex].stock -= item.quantity;
            product.sold = (product.sold || 0) + item.quantity;
            product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
            await product.save({ session });
            mappedItems.push({
                product: productId,
                name: product.name,
                img: item.img || product.img || "",
                price: Number(item.price) > 0 ? Number(item.price) : (variant?.price || product.price),
                quantity: item.quantity,
                color: item.color || null,
                size: item.size || null,
            });
        }
        const order = new Order({
            user: userId,
            items: mappedItems,
            totalAmount: req.body.totalAmount,
            subtotal: req.body.subtotal || 0,
            shippingCharge: req.body.shippingCharge || 0,
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
   GET ALL ORDERS (Admin)
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
            .populate("user", "name email");
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
/* =========================
   GET MY ORDERS (User)
========================= */
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("getMyOrders error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
/* =========================
   UPDATE ORDER STATUS (Admin)
========================= */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ── Statuses that should restore stock ──────────────────────
        const restockStatuses = ["Refunded", "Returned", "Cancelled"];
        const alreadyRestocked = restockStatuses.includes(order.status);
        const shouldRestock = restockStatuses.includes(status) && !alreadyRestocked;

        if (shouldRestock) {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product) continue;

                const variantIndex = product.variants.findIndex(v =>
                    v.attributes?.color === (item.color || null) &&
                    (v.attributes?.size === (item.size || "") ||
                        (!v.attributes?.size && !item.size))
                );

                if (variantIndex !== -1) {
                    product.variants[variantIndex].stock += item.quantity;
                    product.sold = Math.max(0, (product.sold || 0) - item.quantity);
                    product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                    await product.save();
                }
            }
        }
        // ──────────────────────────────────────────────────
        order.status = status;
        if (status === "Confirmed") {
            order.paymentStatus = "Paid";
        }
        await order.save();
        res.json({ message: "Status updated successfully", order });

    } catch (error) {
        console.log("STATUS UPDATE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};
/* =========================
   CANCEL ORDER (User)
   — Allowed only for: Processing, Packed, Shipped
   — NOT allowed for: Delivered (must use Return instead)
========================= */
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.user.toString() !== req.user.id.toString())
            return res.status(403).json({ message: "Not authorized" });
        const cancellableStatuses = ["Processing", "Confirmed", "Packed", "Shipped"];
        if (!cancellableStatuses.includes(order.status)) {
            if (order.status === "Delivered")
                return res.status(400).json({ message: "Delivered orders cannot be cancelled. Please use the Return option instead." });
            return res.status(400).json({ message: `Order cannot be cancelled. Current status: ${order.status}` });
        }
        // ── Restore stock for each item ──────────────────
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;
            const variantIndex = product.variants.findIndex(v =>
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
        // ─────────────────────────
        order.status = "Cancelled";
        order.cancelledAt = new Date();
        order.cancelReason = req.body?.reason || null;
        if (!order.returnStatus) order.returnStatus = "None";
        await order.save();

        res.json({ message: "Order cancelled successfully", order });

    } catch (error) {
        console.error("Cancel Order Error:", error.message, error.stack);
        res.status(500).json({ message: error.message });
    }
};
/* =========================
   RETURN ORDER (User)
   — Allowed only for: Delivered orders
   — Updates order.returnStatus to "Pending"
========================= */
export const returnOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Ownership check
        if (order.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Must be Delivered
        if (order.status !== "Delivered") {
            return res.status(400).json({
                message: "Only delivered orders can be returned."
            });
        }
        // Already has a return request
        if (order.returnStatus && order.returnStatus !== "None") {
            return res.status(400).json({
                message: `A return request already exists for this order. Status: ${order.returnStatus}`
            });
        }
        order.returnStatus = "Pending";
        order.returnRequestedAt = new Date();
        order.returnReason = req.body?.reason || null;
        order.returnDescription = req.body?.description || null;
        await order.save();
        res.json({ message: "Return request submitted successfully", order });

    } catch (error) {
        console.error("Return Order Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
/* =========================
   HANDLE RETURN (Admin)
   — Approve or Reject a return request
========================= */
export const handleReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, adminNote, refundAmount } = req.body;

        if (!["Approved", "Rejected"].includes(action))
            return res.status(400).json({ message: "action must be 'Approved' or 'Rejected'" });

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.returnStatus !== "Pending")
            return res.status(400).json({ message: "No pending return request for this order." });

        // ── Restore stock only if Approved ───────────────
        if (action === "Approved") {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product) continue;

                const variantIndex = product.variants.findIndex(v =>
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

            order.status = "Returned";
            order.refundAmount = refundAmount || order.totalAmount;
        }
        // ────────────────────────────────────
        order.returnStatus = action;
        order.returnAdminNote = adminNote || null;
        await order.save();

        res.json({ message: `Return ${action.toLowerCase()} successfully`, order });

    } catch (error) {
        console.error("Handle Return Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
// import Order from "../models/orderModel.js";
// import Product from "../models/productModel.js";
// import Cart from "../models/cartModel.js";
// import mongoose from "mongoose";
// import Coupon from "../models/Coupon.js";

// export const createOrder = async (req, res) => {
//     console.log("=== BODY RECEIVED ===");
//     console.log("totalAmount:", req.body.totalAmount);
//     console.log("subtotal:", req.body.subtotal);
//     console.log("discount:", req.body.discount);
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const userId = req.user.id;
//         const items = req.body.items;

//         if (!items || !Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({ message: "Cart is empty" });
//         }
//         const mappedItems = [];
//         for (const item of items) {
//             const productId =
//                 typeof item.product === "object"
//                     ? item.product._id
//                     : item.product || item.productId;

//             if (!productId) {
//                 return res.status(400).json({ message: "Product ID missing" });
//             }

//             const product = await Product.findById(productId).session(session);
//             if (!product) {
//                 return res.status(400).json({ message: "Product not found" });
//             }

//             // Find matching variant by color + size
//             const variantIndex = product.variants.findIndex(v =>
//                 v.attributes?.color === (item.color || null) &&
//                 (v.attributes?.size === (item.size || "") || (!v.attributes?.size && !item.size))
//             )

//             if (variantIndex === -1) {
//                 return res.status(400).json({ message: `Variant not found for ${product.name}` });
//             }

//             const variant = product.variants[variantIndex];
//             if (variant.stock < item.quantity) {
//                 return res.status(400).json({ message: `Insufficient stock for ${product.name} (${item.color} / ${item.size})` });
//             }

//             // Deduct variant stock
//             product.variants[variantIndex].stock -= item.quantity;
//             product.sold = (product.sold || 0) + item.quantity;

//             // Recalculate top-level stock
//             product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

//             await product.save({ session });

//             mappedItems.push({
//                 product: productId,
//                 name: product.name,
//                 img: item.img || product.img || "",
//                 price: Number(item.price) > 0 ? Number(item.price) : (variant?.price || product.price),
//                 quantity: item.quantity,
//                 color: item.color || null,
//                 size: item.size || null,
//             });
//         }
//         const order = new Order({
//             user: userId,
//             items: mappedItems,
//             totalAmount: req.body.totalAmount,
//             subtotal: req.body.subtotal || 0,          // ← ADD
//             shippingCharge: req.body.shippingCharge || 0, // ← ADD
//             coupon: req.body.coupon || null,
//             discount: req.body.discount || 0,
//             billingDetails: req.body.billing || null,
//             status: "Processing",
//         });

//         console.log("PRE-SAVE totalAmount:", order.totalAmount);
//         const savedOrder = await order.save({ session });
//         console.log("POST-SAVE totalAmount:", savedOrder.totalAmount);

//         await Cart.findOneAndUpdate(
//             { user: userId },
//             { $set: { items: [] } },
//             { session }
//         );
//         await session.commitTransaction();
//         res.status(201).json(savedOrder);

//     } catch (error) {
//         await session.abortTransaction();
//         console.error("ORDER ERROR:", error);
//         res.status(500).json({ message: error.message });
//     } finally {
//         session.endSession();
//     }
// };

// /* =========================
//    GET ALL ORDERS
// ========================= */

// export const getOrders = async (req, res) => {
//     try {
//         const isAdmin = req.user.role === "admin";
//         const query = isAdmin ? {} : { user: req.user.id };
//         const orders = await Order.find(query)
//             .populate("user", "name email")
//             .sort({ createdAt: -1 });
//         res.json(orders);
//     } catch (error) {
//         console.error("Get Orders Error:", error);
//         res.status(500).json({ message: "Error fetching orders" });
//     }
// };

// /* =========================
//    GET SINGLE ORDER
// ========================= */
// export const getOrderById = async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id)
//             .populate("user", "name email");  // ✅ only populate user
//         //  removed: .populate("items.product")

//         if (!order) return res.status(404).json({ message: "Order not found" });

//         res.json(order);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// /* =========================
//    GET MY ORDERS
// ========================= */

// export const getMyOrders = async (req, res) => {
//     try {
//         const orders = await Order.find({ user: req.user.id })
//             //  removed: .populate("items.product") — name is already saved
//             .sort({ createdAt: -1 });

//         res.json(orders);
//     } catch (error) {
//         console.error("getMyOrders error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// /* =========================
//    UPDATE ORDER STATUS
// ========================= */
// export const updateOrderStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         const order = await Order.findById(id);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         order.status = status;

//         if (status === "Confirmed") {
//             order.paymentStatus = "Paid";
//         }

//         await order.save();
//         res.json({ message: "Status updated successfully", order });

//     } catch (error) {
//         console.log("STATUS UPDATE ERROR:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// /* =========================
//    CANCEL ORDER
// ========================= */
// export const cancelOrder = async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id);
//         if (!order) return res.status(404).json({ message: "Order not found" });

//         if (order.user.toString() !== req.user.id.toString()) {
//             return res.status(403).json({ message: "Not authorized" });
//         }
//         order.status = "Cancelled";
//         await order.save();
//         res.json({ message: "Order cancelled", order });

//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };
