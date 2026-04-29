// import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
// import api from "api";

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

//     // FETCH CART
//     const fetchCart = useCallback(async () => {
//         const config = getAuthConfig();
//         if (!config) return;

//         try {
//             const res = await api.get(API_BASE, config);

//             const items = res.data?.items || [];
//             setCartItems(items);

//         } catch (err) {
//             console.error("Fetch cart error:", err);
//         }
//     }, []);

//     useEffect(() => {
//         fetchCart();
//     }, [fetchCart]);

//     // ADD TO CART
//     const addToCart = async (product) => {
//         const config = getAuthConfig();

//         if (!config) {
//             alert("Please login first");
//             return;
//         }

//         try {
//             await api.post(
//                 `${API_BASE}/add`,
//                 { productId: product._id, quantity: 1 },
//                 config
//             );

//             fetchCart();

//         } catch (err) {
//             console.error("Add to cart failed:", err);
//         }
//     };

//     // UPDATE QUANTITY
//     const updateQty = async (productId, newQty) => {
//         const config = getAuthConfig();
//         if (!config) return;

//         const validatedQty = Math.max(1, parseInt(newQty) || 1);

//         try {
//             await api.put(
//                 `${API_BASE}/update`,
//                 { productId, quantity: validatedQty },
//                 config
//             );

//             setCartItems(prev =>
//                 prev.map(item =>
//                     item.product?._id === productId
//                         ? { ...item, quantity: validatedQty }
//                         : item
//                 )
//             );

//         } catch (err) {
//             console.error("Update quantity failed:", err);
//         }
//     };

//     // REMOVE ITEM
//     const removeItem = async (productId) => {
//         const config = getAuthConfig();
//         if (!config) return;

//         try {
//             await api.delete(`${API_BASE}/remove/${productId}`, config);

//             setCartItems(prev =>
//                 prev.filter(item => item.product?._id !== productId)
//             );

//         } catch (err) {
//             console.error("Remove item failed:", err);
//         }
//     };

//     // SUBTOTAL
//     const subtotal = useMemo(() => {
//         return cartItems.reduce((total, item) => {
//             const price = Number(item.product?.price || 0);
//             const qty = Number(item.quantity || 0);
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
//                 subtotal,
//                 cartCount,
//                 fetchCart
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// };

// export const useCart = () => useContext(CartContext);

import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
// import api from "api";
import api from "../api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // DELETE whatever is there and type this exactly:
    const API_BASE = "/api/cart";
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    // -----------------------------
    // FETCH CART
    // -----------------------------
    const fetchCart = useCallback(async () => {
        const config = getAuthConfig();

        if (config) {
            // Logged-in user → fetch from backend
            try {
                const res = await api.get(API_BASE, config);
                const items = res.data?.items || [];
                setCartItems(items);
            } catch (err) {
                console.error("Fetch cart error:", err);
            }
        } else {
            // Guest → fetch from localStorage
            const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCartItems(guestCart);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // -----------------------------
    // ADD TO CART
    // -----------------------------
    const addToCart = async (product) => {
        const config = getAuthConfig();

        if (config) {
            try {
                await api.post(`${API_BASE}/add`, { productId: product._id, quantity: product.quantity || 1 }, config);
                await fetchCart(); // ← await so state updates immediately
            } catch (err) {
                console.error("Add to cart failed:", err);
            }
        } else {
            const existing = cartItems.find(i => i.productId === product._id);
            let updatedCart;
            if (existing) {
                updatedCart = cartItems.map(i =>
                    i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                updatedCart = [...cartItems, { productId: product._id, quantity: 1, product }];
            }
            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };
    // const addToCart = async (product) => {
    //     const config = getAuthConfig();
    //     console.log("token:", localStorage.getItem("token")); // ← add this
    //     console.log("product._id being sent:", product._id);

    //     if (config) {
    //         // Logged-in → backend
    //         try {
    //             await api.post(`${API_BASE}/add`, { productId: product._id, quantity: product.quantity || 1 }, config);
    //             fetchCart();
    //         } catch (err) {
    //             console.error("Add to cart failed:", err);
    //         }
    //     } else {
    //         // Guest → localStorage
    //         const existing = cartItems.find(i => i.productId === product._id);
    //         let updatedCart;
    //         if (existing) {
    //             updatedCart = cartItems.map(i =>
    //                 i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
    //             );
    //         } else {
    //             updatedCart = [...cartItems, { productId: product._id, quantity: 1, product }];
    //         }
    //         setCartItems(updatedCart);
    //         localStorage.setItem("cart", JSON.stringify(updatedCart));
    //     }
    // };

    // Change signature:
    const updateQty = async (productId, newQty, variantId = null) => {
        const config = getAuthConfig();
        const validatedQty = Math.max(1, parseInt(newQty) || 1);

        if (config) {
            try {
                await api.put(`${API_BASE}/update`, { productId, quantity: validatedQty, variantId }, config);
                setCartItems(prev =>
                    prev.map(item =>
                        item.product?._id === productId &&
                            (!variantId || item.variantId === variantId)
                            ? { ...item, quantity: validatedQty }
                            : item
                    )
                );
            } catch (err) {
                console.error("Update quantity failed:", err);
            }
        } else {
            const updatedCart = cartItems.map(item =>
                item.productId === productId ? { ...item, quantity: validatedQty } : item
            );
            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };

    // -----------------------------
    // REMOVE ITEM
    // -----------------------------
    const removeItem = async (productId) => {
        const config = getAuthConfig();

        if (config) {
            try {
                await api.delete(`${API_BASE}/remove/${productId}`, config);
                setCartItems(prev =>
                    prev.filter(item => item.product?._id !== productId)
                );
            } catch (err) {
                console.error("Remove item failed:", err);
            }
        } else {
            const updatedCart = cartItems.filter(item => item.productId !== productId);
            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("cart"); // remove guest cart too
    };

    // -----------------------------
    // MERGE GUEST CART AFTER LOGIN
    // -----------------------------
    const mergeGuestCart = async () => {
        const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
        const config = getAuthConfig();
        if (!config || guestCart.length === 0) return;

        try {
            await api.post(`${API_BASE}/merge`, { items: guestCart }, config);
            localStorage.removeItem("cart");
            fetchCart();
        } catch (err) {
            console.error("Merge guest cart failed:", err);
        }
    };

    // -----------------------------
    // SUBTOTAL & COUNT
    // -----------------------------
    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.product?.price || 0);
            const qty = Number(item.quantity || 0);
            return total + price * qty;
        }, 0);
    }, [cartItems]);

    const cartCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
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
                mergeGuestCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);