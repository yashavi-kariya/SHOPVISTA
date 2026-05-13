import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import api from "../api";

const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const API_BASE = "/api/cart";

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // ─────────────────────────────────────────
    // FETCH CART
    // Backend returns: { items: [ { _id, product: {...}, name, price, img, color, size, quantity, variantId } ] }
    // ─────────────────────────────────────────
    const fetchCart = useCallback(async () => {
        const config = getAuthConfig();
        if (config) {
            try {
                const res = await api.get(API_BASE, config);
                const items = res.data?.items || [];
                setCartItems(Array.isArray(items) ? items : []);
            } catch (err) {
                console.error("Fetch cart error:", err);
                setCartItems([]);
            }
        } else {
            // Guest — read from localStorage
            try {
                const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
                setCartItems(guestCart);
            } catch {
                setCartItems([]);
            }
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ─────────────────────────────────────────
    // ADD TO CART
    // Sends all variant details to backend so they're stored on the cart item
    // ─────────────────────────────────────────
    const addToCart = async (product) => {
        const config = getAuthConfig();
        if (config) {
            try {
                await api.post(
                    `${API_BASE}/add`,
                    {
                        productId: product._id,
                        quantity: product.quantity || 1,
                        variantId: product.variantId || null,
                        color: product.color || "",
                        size: product.size || "",
                        price: product.price || 0,
                        img: product.img || "",
                    },
                    config
                );
                await fetchCart();
            } catch (err) {
                console.error("Add to cart failed:", err);
                throw err; // re-throw so caller can catch & revert optimistic update
            }
        } else {
            // ── Guest cart ──────────────────────────────────────────────
            const existing = cartItems.find(
                i => i.productId === product._id && i.variantId === (product.variantId || null)
            );
            let updatedCart;
            if (existing) {
                updatedCart = cartItems.map(i =>
                    i.productId === product._id && i.variantId === (product.variantId || null)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                updatedCart = [
                    ...cartItems,
                    {
                        productId: product._id,
                        variantId: product.variantId || null,
                        quantity: 1,
                        name: product.name,
                        price: product.price,
                        img: product.img || "",
                        color: product.color || "",
                        size: product.size || "",
                        product,   // keep full product ref for Cart.jsx rendering
                    },
                ];
            }
            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };

    // ─────────────────────────────────────────
    // UPDATE QUANTITY
    // ─────────────────────────────────────────
    const updateQty = async (productId, newQty, variantId = null) => {
        const config = getAuthConfig();
        const validatedQty = Math.max(1, parseInt(newQty) || 1);

        if (config) {
            try {
                await api.put(
                    `${API_BASE}/update`,
                    { productId, quantity: validatedQty, variantId },
                    config
                );
                // Optimistic local update — item._id is the cart subdoc id from backend
                setCartItems(prev =>
                    prev.map(item =>
                        item.product?._id === productId &&
                            (!variantId || (item.variantId?.toString() || null) === (variantId || null))
                            ? { ...item, quantity: validatedQty }
                            : item
                    )
                );
            } catch (err) {
                console.error("Update quantity failed:", err);
                fetchCart(); // re-sync on failure
            }
        } else {
            const updatedCart = cartItems.map(item =>
                item.productId === productId ? { ...item, quantity: validatedQty } : item
            );
            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };

    // ─────────────────────────────────────────
    // REMOVE ITEM  (pass itemId = cart subdoc _id for precision)
    // ─────────────────────────────────────────
    const removeItem = async (productId, variantId = null, itemId = null) => {
        const config = getAuthConfig();
        if (config) {
            try {
                const params = new URLSearchParams();
                if (itemId) params.append("itemId", itemId);
                if (variantId) params.append("variantId", variantId);

                await api.delete(
                    `${API_BASE}/remove/${productId}?${params.toString()}`,
                    config
                );

                setCartItems(prev =>
                    prev.filter(ci => {
                        if (itemId) return ci._id?.toString() !== itemId;
                        const sameProduct = ci.product?._id?.toString() === productId;
                        const sameVariant = (ci.variantId?.toString() || null) === (variantId || null);
                        return !(sameProduct && sameVariant);
                    })
                );
            } catch (err) {
                console.error("Remove item failed:", err);
                fetchCart();
            }
        } else {
            const updated = cartItems.filter(ci => ci.productId !== productId);
            setCartItems(updated);
            localStorage.setItem("cart", JSON.stringify(updated));
        }
    };

    // ─────────────────────────────────────────
    // CLEAR CART
    // ─────────────────────────────────────────
    const clearCart = async () => {
        const config = getAuthConfig();
        if (config) {
            try {
                await api.delete(`${API_BASE}/clear`, config);
            } catch (err) {
                console.error("Clear cart failed:", err);
            }
        }
        setCartItems([]);
        localStorage.removeItem("cart");
    };

    // ─────────────────────────────────────────
    // MERGE GUEST CART AFTER LOGIN
    // ─────────────────────────────────────────
    const mergeGuestCart = async () => {
        const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
        const config = getAuthConfig();
        if (!config || guestCart.length === 0) return;
        try {
            await api.post(`${API_BASE}/merge`, { items: guestCart }, config);
            localStorage.removeItem("cart");
            await fetchCart();
        } catch (err) {
            console.error("Merge guest cart failed:", err);
        }
    };

    // ─────────────────────────────────────────
    // COMPUTED VALUES
    // item shape from backend: { _id, product: {...}, name, price, img, color, size, quantity }
    // ─────────────────────────────────────────
    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.price ?? item.product?.price ?? 0);
            const qty = Number(item.quantity ?? 0);
            return total + price * qty;
        }, 0);
    }, [cartItems]);

    const cartCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQty,
                removeItem,
                clearCart,
                subtotal,
                cartCount,
                fetchCart,
                mergeGuestCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => useContext(CartContext);

export { CartContext, CartProvider, useCart };
// import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
// import api from "../api";
// export const CartContext = createContext();
// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState([]);
//     const API_BASE = "/api/cart";
//     const getAuthConfig = () => {
//         const token = localStorage.getItem("token");
//         if (!token) return null;

//         return {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         };
//     };
//     // -----------------------------
//     // FETCH CART
//     // -----------------------------
//     const fetchCart = useCallback(async () => {
//         const config = getAuthConfig();
//         if (config) {
//             try {
//                 const res = await api.get("/api/cart", config);
//                 // Handle both shapes: { items: [] } or direct array or { cart: { items: [] } }
//                 const items = res.data?.items || res.data?.cart?.items || res.data || [];
//                 setCartItems(Array.isArray(items) ? items : []);
//             } catch (err) {
//                 console.error("Fetch cart error:", err);
//             }
//         } else {
//             const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
//             setCartItems(guestCart);
//         }
//     }, []);
//     // -----------------------------
//     // ADD TO CART
//     // -----------------------------
//     const addToCart = async (product) => {
//         const config = getAuthConfig();
//         if (config) {
//             try {
//                 await api.post(`${API_BASE}/add`, { productId: product._id, quantity: product.quantity || 1, variantId: product.variantId }, config);
//                 await fetchCart();
//             } catch (err) {
//                 console.error("Add to cart failed:", err);
//             }
//         } else {
//             const existing = cartItems.find(i =>
//                 i.productId === product._id &&
//                 i.variantId === product.variantId
//             );
//             let updatedCart;
//             if (existing) {
//                 updatedCart = cartItems.map(i =>
//                     i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
//                 );
//             } else {
//                 updatedCart = [
//                     ...cartItems,
//                     {
//                         productId: product._id,
//                         quantity: 1,
//                         product,
//                         variantId: product.variantId,
//                         color: product.color,
//                         size: product.size,
//                         price: product.price,
//                         img: product.img,
//                     }
//                 ];
//             }
//             setCartItems(updatedCart);
//             localStorage.setItem("cart", JSON.stringify(updatedCart));
//         }
//     };
//     const updateQty = async (productId, newQty, variantId = null) => {
//         const config = getAuthConfig();
//         const validatedQty = Math.max(1, parseInt(newQty) || 1);
//         if (config) {
//             try {
//                 await api.put(`${API_BASE}/update`, { productId, quantity: validatedQty, variantId }, config);
//                 setCartItems(prev =>
//                     prev.map(item =>
//                         item.product?._id === productId &&
//                             (!variantId || item.variantId === variantId)
//                             ? { ...item, quantity: validatedQty }
//                             : item
//                     )
//                 );
//             } catch (err) {
//                 console.error("Update quantity failed:", err);
//             }
//         } else {
//             const updatedCart = cartItems.map(item =>
//                 item.productId === productId ? { ...item, quantity: validatedQty } : item
//             );
//             setCartItems(updatedCart);
//             localStorage.setItem("cart", JSON.stringify(updatedCart));
//         }
//     };
//     // -----------------------------
//     // REMOVE ITEM
//     // -----------------------------
//     const removeItem = async (productId, variantId = null) => {
//         const config = getAuthConfig();
//         if (config) {
//             try {
//                 await api.delete(`${API_BASE}/remove/${productId}`, config);
//                 setCartItems(prev =>
//                     prev.filter(item => !(item.product?._id === productId && (!variantId || item.variantId === variantId))).filter(item => item.product?._id !== productId)
//                 );
//             } catch (err) {
//                 console.error("Remove item failed:", err);
//             }
//         } else {
//             const updatedCart = cartItems.filter(item => item.productId !== productId);
//             setCartItems(updatedCart);
//             localStorage.setItem("cart", JSON.stringify(updatedCart));
//         }
//     };
//     const clearCart = () => {
//         setCartItems([]);
//         localStorage.removeItem("cart"); // remove guest cart too
//     };
//     // -----------------------------
//     // MERGE GUEST CART AFTER LOGIN
//     // -----------------------------
//     const mergeGuestCart = async () => {
//         const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
//         const config = getAuthConfig();
//         if (!config || guestCart.length === 0) return;

//         try {
//             await api.post(`${API_BASE}/merge`, { items: guestCart }, config);
//             localStorage.removeItem("cart");
//             fetchCart();
//         } catch (err) {
//             console.error("Merge guest cart failed:", err);
//         }
//     };
//     // -----------------------------
//     // SUBTOTAL & COUNT
//     // -----------------------------
//     const subtotal = useMemo(() => {
//         return cartItems.reduce((total, item) => {
//             const price = Number(item.price || item.product?.price || 0); const qty = Number(item.quantity || 0);
//             return total + price * qty;
//         }, 0);
//     }, [cartItems]);
//     const cartCount = useMemo(() => {
//         return cartItems.reduce((total, item) => total + item.quantity, 0);
//     }, [cartItems]);
//     return (
//         <CartContext.Provider
//             value={{
//                 cartItems,
//                 addToCart,
//                 updateQty,
//                 removeItem,
//                 clearCart,
//                 subtotal,
//                 cartCount,
//                 fetchCart,
//                 mergeGuestCart
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// };
// export const useCart = () => useContext(CartContext);