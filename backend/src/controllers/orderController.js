import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";

export const createOrder = async (req, res) => {
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
            mappedItems.push({
                product: productId,
                name: product.name,
                img: product.img || "",
                price: product.price,
                quantity: item.quantity
            });
        }
        const totalAmount = mappedItems.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );
        const order = new Order({
            user: userId,
            items: mappedItems,
            totalAmount,
            coupon: req.body.coupon || null,
            discount: req.body.discount || 0,
            billingDetails: req.body.billing || null,
            status: "Processing",
        });
        const savedOrder = await order.save({ session });
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
            .populate("user", "name email")  // ✅ only populate user
            // ❌ removed: .populate("items.product") — name is already saved
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
// import Order from "../models/orderModel.js";
// import Product from "../models/productModel.js";
// import Cart from "../models/cartModel.js";
// import mongoose from "mongoose";
// import Coupon from "../models/Coupon.js";

// export const createOrder = async (req, res) => {
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

//             console.log("productId:", productId);

//             if (!productId) {
//                 return res.status(400).json({ message: "Product ID missing" });
//             }

//             // Atomic stock check + deduct (no race condition)
//             const product = await Product.findOneAndUpdate(
//                 { _id: productId, stock: { $gte: item.quantity } },
//                 { $inc: { stock: -item.quantity, sold: item.quantity } },
//                 { new: true, session }
//             );

//             if (!product) {
//                 // Could be not found OR out of stock
//                 const exists = await Product.findById(productId).session(session);
//                 const msg = !exists
//                     ? "Product not found"
//                     : `${exists.name} has insufficient stock`;
//                 return res.status(400).json({ message: msg });
//             }

//             mappedItems.push({
//                 product: productId,
//                 name: product.name,
//                 price: product.price,
//                 quantity: item.quantity
//             });
//         }

//         //  Always calculate server-side
//         const totalAmount = mappedItems.reduce(
//             (sum, item) => sum + item.price * item.quantity, 0
//         );

//         const order = new Order({
//             user: userId,
//             items: mappedItems,
//             totalAmount,
//             coupon: req.body.coupon || null,
//             discount: req.body.discount || 0,
//             billingDetails: req.body.billing || null,
//             status: "Processing",
//         });

//         const savedOrder = await order.save({ session });

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
//             .populate("items.product", "name price img")
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
// export const getOrderById = async (req, res) => {  // 👈 NEW
//     try {
//         const order = await Order.findById(req.params.id)
//             .populate("items.product", "name price img")
//             .populate("user", "name email");

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
//             .populate("items.product")
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

//         //FIX: also update paymentStatus when Confirmed
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

//         //  FIX: removed semicolon bug
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
// import Order from "../models/orderModel.js";
// import Product from "../models/productModel.js";
// import Cart from "../models/cartModel.js";
// import mongoose from "mongoose";
// import Coupon from "../models/Coupon.js";
// /* =========================
//    CREATE ORDER
// ========================= */
// export const createOrder = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const items = req.body.items;

//         if (!items || !Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({ message: "Cart is empty" });
//         }

//         for (const item of items) {
//             const product = await Product.findById(item.product);

//             if (!product) {
//                 return res.status(404).json({ message: "Product not found" });
//             }

//             if (item.variantId) {
//                 const variant = product.variants.id(item.variantId);
//                 if (!variant) return res.status(404).json({ message: "Variant not found" });
//                 if (variant.stock < item.quantity) return res.status(400).json({ message: `${product.name} stock not available` });
//                 variant.stock -= item.quantity;
//             } else {
//                 if (product.stock < item.quantity) return res.status(400).json({ message: `${product.name} stock not available` });
//             }

//             product.stock -= item.quantity;
//             product.sold += item.quantity;
//             await product.save();
//         }

//         // ✅ replace the items mapping in createOrder
//         const mappedItems = items.map(item => ({
//             product: item.product || item.productId,
//             quantity: item.quantity,
//             price: item.price || item.product?.price || 0,
//         }));

//         const order = new Order({
//             user: userId,
//             items: mappedItems,   // ← use mappedItems
//             totalAmount: req.body.totalPrice,
//             coupon: req.body.coupon || null,
//             discount: req.body.discount || 0,
//             status: "Processing"
//         });

//         const savedOrder = await order.save();

//         // ✅ Mark coupon as used
//         if (req.body.coupon) {
//             await Coupon.findOneAndUpdate(
//                 { code: req.body.coupon },
//                 { isUsed: true }
//             );
//         }

//         // ✅ Clear cart
//         await Cart.findOneAndUpdate(
//             { user: userId },
//             { $set: { items: [] } }
//         );

//         res.json(savedOrder);

//     } catch (error) {
//         console.error("ORDER ERROR:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };
// // /* =========================
// //    GET USER ORDERS
// // ========================= */

// export const getOrders = async (req, res) => {
//     try {
//         //  Check 'role' instead of 'isAdmin'
//         const isAdmin = req.user.role === "admin";

//         const query = isAdmin ? {} : { user: req.user.id };

//         const orders = await Order.find(query)
//             .populate("user", "name email")
//             .populate("items.product", "name price img")
//             .sort({ createdAt: -1 });

//         console.log(`Role: ${req.user.role} | Found ${orders.length} orders`);

//         res.json(orders);

//     } catch (error) {
//         console.error("Get Orders Error:", error);
//         res.status(500).json({ message: "Error fetching orders" });
//     }
// };
// export const updateOrderStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         const order = await Order.findById(id);
//         if (!order) {
//             return res.status(404).json({
//                 message: "Order not found"
//             });
//         }
//         order.status = status;

//         await order.save();

//         res.json({
//             message: "Status updated successfully",
//             order
//         });

//     } catch (error) {
//         console.log("STATUS UPDATE ERROR:", error);

//         res.status(500).json({
//             message: "Server Error"
//         });
//     }
// };
// export const getMyOrders = async (req, res) => {
//     try {
//         const orders = await Order.find({ user: req.user.id })  // ← id not _id
//             .populate("items.product")
//             .sort({ createdAt: -1 });

//         res.json(orders);
//     } catch (error) {
//         console.error("getMyOrders error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// export const cancelOrder = async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id);
//         if (!order) return res.status(404).json({ message: "Order not found" });
//         if (order.user.toString() !== req.user.id.toString());
//         return res.status(403).json({ message: "Not authorized" });

//         order.status = "Cancelled";
//         await order.save();
//         res.json({ message: "Order cancelled", order });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };