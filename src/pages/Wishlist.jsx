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
    return `http://localhost:3001${clean}`;
};

const Wishlist = () => {
    const { cartItems, addToCart } = useContext(CartContext);
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const [addedIds, setAddedIds] = useState({});
    const [removingIds, setRemovingIds] = useState({});
    const navigate = useNavigate();

    const isInCart = (productId) =>
        cartItems.some((item) => item.product?._id === productId);

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
        const pid = product._id || product.id;
        setAddedIds((prev) => ({ ...prev, [pid]: true }));
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [pid]: false }));
        }, 1800);
    };

    const handleRemove = (e, product) => {
        e.stopPropagation();
        const id = product._id || product.id;
        setRemovingIds((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => toggleWishlist(product), 320);
    };

    const goToProduct = (product) => {
        const id = product._id || product.id;
        navigate(`/product/${id}`);
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
                    const id = product._id || product.id;
                    const isRemoving = removingIds[id];
                    const isAdded = addedIds[id];
                    const inCart = isInCart(id);

                    const imgSrc = resolveImage(
                        product.images?.[0] || product.img || ""
                    );

                    return (
                        <div
                            key={id}
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

                                {/* Already in cart notice */}
                                {inCart && (
                                    <div style={{
                                        background: "#fff3cd",
                                        border: "1px solid #ffc107",
                                        borderRadius: "8px",
                                        padding: "6px 12px",
                                        marginTop: "8px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: "#856404",
                                        textAlign: "center"
                                    }}>
                                        Already in Cart —{" "}
                                        <a href="/cart" onClick={e => e.stopPropagation()} style={{ color: "#856404", textDecoration: "underline" }}>
                                            View Cart
                                        </a>
                                    </div>
                                )}
                                {/* Remove heart button */}
                                <button
                                    className="wl-card__remove-fab"
                                    onClick={(e) => handleRemove(e, product)}
                                    title="Remove from wishlist"
                                >
                                    <HeartIcon filled />
                                </button>

                                {/* Hover overlay */}
                                <div className="wl-card__overlay">
                                    <button
                                        className={`wl-card__quick-add ${isAdded ? "wl-card__quick-add--added" : ""}`}
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        {isAdded ? "Added!" : "Quick Add"}
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

                                <div className="wl-card__actions">
                                    <button
                                        className={`wl-card__btn wl-card__btn--cart ${isAdded ? "wl-card__btn--added" : ""}`}
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        <CartIcon />
                                        {isAdded ? "Added to Cart!" : "Add to Cart"}
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




