import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

/* =========================
   ADD TO CART
========================= */
export const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.body;
        const userId = req.user.id;
        const qty = parseInt(quantity) || 1;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        let variant = null;
        if (variantId) {
            variant = product.variants.id(variantId);
            if (!variant) {
                return res.status(404).json({ message: "Variant not found" });
            }
            if (variant.stock < qty) {
                return res.status(400).json({ message: "Insufficient stock" });
            }
        }
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }
        const itemIndex = cart.items.findIndex(item => {
            const sameProduct = item.product.toString() === productId;
            const sameVariant =
                (item.variantId?.toString() || null) === (variantId || null);
            return sameProduct && sameVariant;
        });
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += qty;
        } else {
            cart.items.push({
                product: product._id,
                variantId: variant?._id || null,
                name: product.name,
                price: variant?.price || product.price,
                img: variant?.image || product.img,
                color: variant?.attributes?.color || "",
                size: variant?.attributes?.size || "",
                quantity: qty,
            });
        }
        await cart.save();
        res.json({ message: "Product added to cart", items: cart.items });

    } catch (error) {
        console.error("Cart Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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

        const cart = await Cart.findOne({ user: req.user.id })
            .populate("items.product");

        if (!cart) return res.json({ items: [] });

        res.json({ items: cart.items });

    } catch (error) {
        console.error("GetCart Error:", error);
        res.status(500).json({ message: "Error fetching cart" });
    }
};

/* =========================
   UPDATE QUANTITY  ← main fix here
========================= */
export const updateCart = async (req, res) => {
    try {
        const { itemId, productId, variantId, quantity } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "User not authorized" });
        }
        const newQty = Math.max(1, parseInt(quantity));
        if (isNaN(newQty)) {
            return res.status(400).json({ message: "Invalid quantity" });
        }
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        let item;
        if (itemId) {
            item = cart.items.id(itemId);
        } else if (productId) {
            item = cart.items.find(i => {
                const sameProduct = i.product.toString() === productId;
                const sameVariant =
                    (i.variantId?.toString() || null) === (variantId || null);
                return sameProduct && sameVariant;
            });
        }

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        item.quantity = newQty;
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.product");
        res.json({ success: true, items: updatedCart.items });

    } catch (error) {
        console.error("UpdateCart Error:", error);
        res.status(500).json({ message: "Server error" });
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


        const { itemId } = req.query;
        const productId = req.params.productId;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (itemId) {

            cart.items = cart.items.filter(
                item => item._id.toString() !== itemId
            );
        } else {

            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.product");
        res.json({ success: true, items: updatedCart.items });

    } catch (error) {
        console.error("RemoveCart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};