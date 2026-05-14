import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const orders = await Order.find();
        const EXCLUDED = ["Cancelled", "Refunded", "Returned"];
        const revenue = orders
            .filter(order => !EXCLUDED.includes(order.status))
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const roundedRevenue = Math.round(revenue * 100) / 100;
        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            revenue: roundedRevenue
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
};