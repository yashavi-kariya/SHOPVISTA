import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

/* =========================
   ADD TO CART
   Works for both variant and non-variant products
========================= */
export const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity, color, size, price, img } = req.body;
        const userId = req.user.id;
        const qty = parseInt(quantity) || 1;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ── Resolve variant details ──────────────────────────────────────
        let resolvedVariant = null;
        if (variantId) {
            resolvedVariant = product.variants?.id(variantId);
            if (!resolvedVariant) {
                return res.status(404).json({ message: "Variant not found" });
            }
            if (resolvedVariant.stock !== undefined && resolvedVariant.stock < qty) {
                return res.status(400).json({ message: "Insufficient stock" });
            }
        }
        const finalPrice = price || resolvedVariant?.price || product.price;
        const finalImg = img
            || resolvedVariant?.images?.[0]
            || resolvedVariant?.image
            || product.images?.[0]
            || product.img
            || "";
        const finalColor = color || resolvedVariant?.attributes?.color || "";
        const finalSize = size || resolvedVariant?.attributes?.size || "";

        // ── Find or create cart ──────────────────────────────────────────
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // ── Check for existing item (same product + same variant) ────────
        const itemIndex = cart.items.findIndex(item => {
            const sameProduct = item.product.toString() === productId;
            const sameVariant =
                (item.variantId?.toString() || null) === (variantId || null);
            return sameProduct && sameVariant;
        });

        if (itemIndex > -1) {
            // Already exists — increment quantity
            cart.items[itemIndex].quantity += qty;
        } else {
            // New item
            cart.items.push({
                product: product._id,
                variantId: resolvedVariant?._id || null,
                name: product.name,
                price: finalPrice,
                img: finalImg,
                color: finalColor,
                size: finalSize,
                quantity: qty,
            });
        }

        await cart.save();

        // Populate and return
        const populated = await Cart.findById(cart._id).populate("items.product");
        res.json({ message: "Product added to cart", items: populated.items });

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
   UPDATE QUANTITY
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
        const variantId = req.query.variantId || null;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (itemId) {
            // Remove by cart item _id (most precise)
            cart.items = cart.items.filter(
                item => item._id.toString() !== itemId
            );
        } else if (productId && variantId) {
            // Remove specific variant of a product
            cart.items = cart.items.filter(
                item =>
                    !(item.product.toString() === productId &&
                        (item.variantId?.toString() || null) === variantId)
            );
        } else {
            // Remove all items of this product (any variant)
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

/* =========================
   CLEAR CART
========================= */
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/* =========================
   MERGE GUEST CART
========================= */
export const mergeCart = async (req, res) => {
    try {
        const { items: guestItems } = req.body;
        const userId = req.user.id;

        if (!guestItems?.length) return res.json({ message: "Nothing to merge" });

        let cart = await Cart.findOne({ user: userId });
        if (!cart) cart = new Cart({ user: userId, items: [] });

        for (const guestItem of guestItems) {
            const { productId, variantId, quantity, price, img, color, size } = guestItem;
            const qty = parseInt(quantity) || 1;

            const existing = cart.items.find(i => {
                const sameProduct = i.product.toString() === productId;
                const sameVariant = (i.variantId?.toString() || null) === (variantId || null);
                return sameProduct && sameVariant;
            });

            if (existing) {
                existing.quantity += qty;
            } else {
                const product = await Product.findById(productId);
                if (!product) continue;
                cart.items.push({
                    product: product._id,
                    variantId: variantId || null,
                    name: product.name,
                    price: price || product.price,
                    img: img || product.img || "",
                    color: color || "",
                    size: size || "",
                    quantity: qty,
                });
            }
        }
        await cart.save();
        const populated = await Cart.findById(cart._id).populate("items.product");
        res.json({ success: true, items: populated.items });
    } catch (error) {
        console.error("MergeCart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};