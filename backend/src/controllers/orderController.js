import Order from "../models/orderModel.js";

/* =========================
   CREATE ORDER
========================= */

export const createOrder = async (req, res) => {

    try {

        const userId = req.user.id;

        const totalAmount = req.body.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const order = new Order({
            user: req.user.id,
            items: req.body.items,
            totalAmount, // ✅ calculated automatically
            status: "Processing"
        });

        const savedOrder = await order.save();
        res.json(savedOrder);

    } catch (error) {

        console.error("Order Error:", error);

        res.status(500).json({
            message: "Failed to create order"
        });

    }

};


/* =========================
   GET USER ORDERS
========================= */

export const getOrders = async (req, res) => {

    try {

        const userId = req.user.id;

        const orders = await Order.find({ user: userId })
            .populate("items.product", "name price img")
            .sort({ createdAt: -1 });

        // console.log(JSON.stringify(orders, null, 2));

        res.json(orders);


    } catch (error) {

        console.error("Get Orders Error:", error);

        res.status(500).json({
            message: "Error fetching orders"
        });

    }


};