import React, { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem("wishlist");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        setWishlist((prev) => {
            const exists = prev.find((p) => p._id === product._id); // ✅ use _id
            if (exists) {
                return prev.filter((p) => p._id !== product._id); // remove
            } else {
                return [...prev, product]; // add
            }
        });
    };

    const isInWishlist = (_id) => wishlist.some((p) => p._id === _id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};