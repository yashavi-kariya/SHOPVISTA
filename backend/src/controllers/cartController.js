import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCart = async (req, res) => {
    try {

        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const qty = parseInt(quantity) || 1;

        // find product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += qty;
        } else {

            cart.items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                img: product.img,
                quantity: qty
            });

        }

        await cart.save();

        res.json({
            message: "Product added to cart",
            items: cart.items
        });

    } catch (error) {

        console.error("Cart Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }
};


/* =========================
   GET CART
========================= */

export const getCart = async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId })
            .populate("items.product");

        if (!cart) {
            return res.json({ items: [] });
        }

        res.json({
            items: cart.items
        });

    } catch (error) {

        console.error("GetCart Error:", error);

        res.status(500).json({
            message: "Error fetching cart"
        });

    }

};


/* =========================
   UPDATE QUANTITY
========================= */

export const updateCart = async (req, res) => {

    try {

        const { productId, quantity } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.json({
            success: true,
            items: updatedCart.items
        });

    } catch (error) {

        console.error("UpdateCart Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }
};


/* =========================
   REMOVE ITEM
========================= */

export const removeFromCart = async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const productId = req.params.productId;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.json({
            success: true,
            items: updatedCart.items
        });

    } catch (error) {

        console.error("RemoveCart Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

};