// import Cart from "../models/cartModel.js";
// import Product from "../models/productModel.js";

// export const addToCart = async (req, res) => {
//     try {

//         const { productId, variantId, quantity } = req.body;
//         const userId = req.user.id;

//         const qty = parseInt(quantity) || 1;

//         // find product
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         let cart = await Cart.findOne({ user: userId });

//         if (!cart) {
//             cart = new Cart({
//                 user: userId,
//                 items: []
//             });
//         }

//         const itemIndex = cart.items.findIndex(
//             item => item.product.toString() === productId
//         );

//         if (itemIndex > -1) {
//             cart.items[itemIndex].quantity += qty;
//         } else {

//             cart.items.push({
//                 product: product._id,
//                 variantId: variant._id,
//                 name: product.name,
//                 price: variant.price,
//                 img: variant.image || product.img,
//                 color: variant.attributes.color,
//                 size: variant.attributes.size,
//                 quantity: qty
//             });
//         }

//         await cart.save();

//         res.json({
//             message: "Product added to cart",
//             items: cart.items
//         });

//     } catch (error) {

//         console.error("Cart Error:", error);

//         res.status(500).json({
//             message: "Server error",
//             error: error.message
//         });

//     }
// };

// const variant = product.variants.id(variantId);
// if (!variant) {
//     return res.status(404).json({ message: "Variant not found" });
// }

// if (variant.stock < qty) {
//     return res.status(400).json({ message: "Insufficient stock" });
// }
// /* =========================
//    GET CART
// ========================= */

// export const getCart = async (req, res) => {

//     try {

//         if (!req.user) {
//             return res.status(401).json({ message: "User not authorized" });
//         }

//         const userId = req.user.id;

//         const cart = await Cart.findOne({ user: userId })
//             .populate("items.product");

//         if (!cart) {
//             return res.json({ items: [] });
//         }

//         res.json({
//             items: cart.items
//         });

//     } catch (error) {

//         console.error("GetCart Error:", error);

//         res.status(500).json({
//             message: "Error fetching cart"
//         });

//     }

// };


// /* =========================
//    UPDATE QUANTITY
// ========================= */

// export const updateCart = async (req, res) => {

//     try {

//         const { productId, quantity } = req.body;

//         if (!req.user) {
//             return res.status(401).json({ message: "User not authorized" });
//         }

//         const userId = req.user.id;

//         const cart = await Cart.findOne({ user: userId });

//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         const item = cart.items.find(
//             item => item.product.toString() === productId &&
//                 item.variantId.toString() === variantId
//         );

//         if (item) {
//             item.quantity = Math.max(1, parseInt(quantity));
//         }

//         await cart.save();

//         const updatedCart = await Cart.findById(cart._id)
//             .populate("items.product");

//         res.json({
//             success: true,
//             items: updatedCart.items
//         });

//     } catch (error) {

//         console.error("UpdateCart Error:", error);

//         res.status(500).json({
//             message: "Server error"
//         });

//     }
// };


// /* =========================
//    REMOVE ITEM
// ========================= */

// export const removeFromCart = async (req, res) => {

//     try {

//         if (!req.user) {
//             return res.status(401).json({ message: "User not authorized" });
//         }

//         const productId = req.params.productId;
//         const userId = req.user.id;

//         const cart = await Cart.findOne({ user: userId });

//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         cart.items = cart.items.filter(
//             item => item.product.toString() !== productId
//         );

//         await cart.save();

//         const updatedCart = await Cart.findById(cart._id)
//             .populate("items.product");

//         res.json({
//             success: true,
//             items: updatedCart.items
//         });

//     } catch (error) {

//         console.error("RemoveCart Error:", error);

//         res.status(500).json({
//             message: "Server error"
//         });

//     }

// };

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

        // ✅ Match by productId + variantId (treat null/undefined as the same)
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
        // ✅ Accept itemId (the cart subdocument _id) OR productId+variantId
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
            // ✅ Most reliable — match by the cart item's own _id
            item = cart.items.id(itemId);
        } else if (productId) {
            // ✅ Fallback — match by productId + variantId
            //    Normalize both sides to string|null so null vs undefined never mismatch
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

        item.quantity = newQty;   // ✅ set, don't increment
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

        // ✅ Support removal by itemId (subdoc _id) OR productId param
        const { itemId } = req.query;   // e.g. DELETE /cart/:productId?itemId=xxx
        const productId = req.params.productId;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (itemId) {
            // Remove the exact subdocument — handles multiple variants of same product
            cart.items = cart.items.filter(
                item => item._id.toString() !== itemId
            );
        } else {
            // Fallback: remove all entries for this productId
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