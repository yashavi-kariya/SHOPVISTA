import React, { useContext, useState } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const HeartIcon = ({ filled }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);
const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const resolveImage = (img) => {
    if (!img) return "/no-image.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const clean = img.startsWith("/") ? img : `/${img}`;
    return `${import.meta.env.VITE_API_URL || ''}${clean}`;
};
const Wishlist = () => {
    const { cartItems } = useContext(CartContext);
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const [removingIds, setRemovingIds] = useState({});
    const navigate = useNavigate();

    const isInCart = (productId, variantId) =>
        cartItems.some((item) =>
            item.product?._id === productId &&
            (item.variantId || null) === (variantId || null)
        );
    // Navigate to product page so user can pick color + size before adding to cart
    const handleGoToProduct = (e, product) => {
        e.stopPropagation();
        navigate(`/product/${product._id}`);
    };
    const handleRemove = (e, product) => {
        e.stopPropagation();
        const id = `${product._id}-${product.variantId || "default"}`;
        setRemovingIds((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => toggleWishlist(product), 320);
    };
    const goToProduct = (product) => {
        navigate(`/product/${product._id}`);
    };
    if (wishlist.length === 0) {
        return (
            <div className="wl-empty">
                <div className="wl-empty__icon"><HeartIcon filled /></div>
                <h2 className="wl-empty__title">Your wishlist is empty</h2>
                <p className="wl-empty__sub">Save items you love — they'll be waiting for you here.</p>
                <a href="/shop" className="wl-empty__cta">Browse Products</a>
            </div>
        );
    }
    return (
        <section className="wl">
            <div className="wl__header">
                <div>
                    <h1 className="wl__title">My Wishlist</h1>
                    <p className="wl__count">
                        {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                    </p>
                </div>
            </div>

            <div className="wl__grid">
                {wishlist.map((product, i) => {
                    const id = `${product._id}-${product.variantId || "default"}`;
                    const isRemoving = removingIds[id];
                    const inCart = isInCart(product._id, product.variantId);
                    const imgSrc = resolveImage(product.img || product.images?.[0] || "");
                    return (
                        <div
                            key={`${product._id}-${product.variantId || "default"}`}
                            className={`wl-card ${isRemoving ? "wl-card--removing" : ""}`}
                            style={{ animationDelay: `${i * 60}ms`, cursor: "pointer" }}
                            onClick={() => goToProduct(product)}
                        >
                            <div className="wl-card__img-wrap">
                                <img
                                    src={imgSrc}
                                    alt={product.name}
                                    className="wl-card__img"
                                    onError={e => { e.target.src = "/no-image.png"; }}
                                />
                                {/* Remove heart button */}
                                <button
                                    className="wl-card__remove-fab"
                                    onClick={(e) => handleRemove(e, product)}
                                    title="Remove from wishlist"
                                >
                                    <HeartIcon filled />
                                </button>

                                {/* Hover overlay — goes to product page to pick color/size */}
                                <div className="wl-card__overlay">
                                    <button
                                        className="wl-card__quick-add"
                                        onClick={(e) => handleGoToProduct(e, product)}
                                    >
                                        {inCart ? "View in Cart" : "Choose Options"}
                                    </button>
                                </div>
                            </div>
                            <div className="wl-card__body">
                                <h3 className="wl-card__name">{product.name}</h3>

                                <div className="wl-card__price-row">
                                    <span className="wl-card__price">
                                        ₹{product.price?.toLocaleString("en-IN")}
                                    </span>
                                    {product.originalPrice && (
                                        <>
                                            <span className="wl-card__original">
                                                ₹{product.originalPrice?.toLocaleString("en-IN")}
                                            </span>
                                            <span className="wl-card__discount">
                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                                            </span>
                                        </>
                                    )}
                                </div>

                                {product.rating && (
                                    <div className="wl-card__rating">
                                        {"★".repeat(Math.round(product.rating))}
                                        {"☆".repeat(5 - Math.round(product.rating))}
                                        <span>{product.rating}</span>
                                    </div>
                                )}

                                {/* Show available colors as small dots */}
                                {product.colors?.length > 0 && (
                                    <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                                        {product.colors.map(c => (
                                            <span key={c} title={c} style={{
                                                width: 12, height: 12, borderRadius: "50%",
                                                background: ({
                                                    Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c",
                                                    Blue: "#5bb0e9", Green: "#27ae60", Yellow: "#f1c40f",
                                                    Pink: "#e91e8c", Beige: "#c9a96e", Brown: "#795548",
                                                    Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
                                                })[c] || c.toLowerCase(),
                                                border: "1.5px solid rgba(0,0,0,.12)", flexShrink: 0,
                                            }} />
                                        ))}
                                    </div>
                                )}

                                <div className="wl-card__actions">
                                    {/* Takes user to product page to select color/size */}
                                    <button
                                        className={`wl-card__btn wl-card__btn--cart ${inCart ? "wl-card__btn--added" : ""}`}
                                        onClick={(e) => handleGoToProduct(e, product)}
                                    >
                                        <CartIcon />
                                        {inCart ? "View in Cart" : "Select & Add"}
                                    </button>
                                    <button
                                        className="wl-card__btn wl-card__btn--remove"
                                        onClick={(e) => handleRemove(e, product)}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Wishlist;

