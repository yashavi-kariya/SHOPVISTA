import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    if (wishlist.length === 0)
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty 😔</h2>
                <p className="text-gray-500">Start adding some favorite products!</p>
            </div>
        );

    return (
        <div className="container mx-auto py-10 px-4">
            <h2 className="text-3xl font-bold mb-6">My Wishlist</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                    <div
                        key={product.id || product._id} // ✅ unique key
                        className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
                    >
                        {/* Product Image */}
                        <img
                            src={`http://localhost:3001${product.img}`}
                            alt={product.name}
                            className="w-full h-60 object-cover" // ✅ bigger image
                        />

                        {/* Product Info */}
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                            <p className="text-gray-700 mb-2">Rs {product.price}</p>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                                <button
                                    onClick={() => addToCart(product)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#2563eb", // blue
                                        color: "#fff",
                                        padding: "8px 12px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Add to Cart
                                </button>

                                <button
                                    onClick={() => toggleWishlist(product)}
                                    style={{
                                        flex: "none",
                                        backgroundColor: "#ef4444", // red
                                        color: "#fff",
                                        padding: "8px 12px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;