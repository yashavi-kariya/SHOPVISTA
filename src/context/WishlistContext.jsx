// WishlistContext.jsx — replace the entire file

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
            // Always match by _id only — variantId differences don't create duplicates
            const exists = prev.find((p) => p._id === product._id);
            if (exists) {
                return prev.filter((p) => p._id !== product._id);
            } else {
                return [...prev, product];
            }
        });
    };

    // Match by _id only — works for both variant and non-variant products
    const isInWishlist = (_id) =>
        wishlist.some((p) => p._id === _id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
// import React, { createContext, useEffect, useState } from "react";

// export const WishlistContext = createContext();

// export const WishlistProvider = ({ children }) => {
//     const [wishlist, setWishlist] = useState(() => {
//         const saved = localStorage.getItem("wishlist");
//         return saved ? JSON.parse(saved) : [];
//     });

//     useEffect(() => {
//         localStorage.setItem("wishlist", JSON.stringify(wishlist));
//     }, [wishlist]);

//     const toggleWishlist = (product) => {
//         setWishlist((prev) => {
//             const exists = prev.find((p) =>
//                 p._id === product._id &&
//                 (p.variantId || null) === (product.variantId || null)
//             );
//             if (exists) {
//                 return prev.filter((p) =>
//                     !(p._id === product._id &&
//                         (p.variantId || null) === (product.variantId || null))
//                 ); // remove
//             } else {
//                 return [...prev, product]; // add
//             }
//         });
//     };

//     const isInWishlist = (_id, variantId = null) =>
//         wishlist.some((p) => {
//             if (p._id !== _id) return false;
//             // If no variantId on either side, match by product id only
//             if (!variantId && !p.variantId) return true;
//             return (p.variantId || null) === (variantId || null);
//         });

//     return (
//         <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
//             {children}
//         </WishlistContext.Provider>
//     );
// };