import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import { useCart } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { CompareContext } from "../context/CompareContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../components/Toast";

const Product = () => {
    const { addToCart, cartItems } = useCart();
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { compare, toggleCompare, isInCompare, clearCompare } = useContext(CompareContext);
    const [products, setProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState("best-sellers");
    const [loading, setLoading] = useState(false);
    const isLoggedIn = !!localStorage.getItem("token");
    const navigate = useNavigate();

    const handleAddToCart = async (product) => {
        if (!isLoggedIn) {
            toast({
                type: "warn",
                title: "Login required",
                message: "Please sign in to add items to your cart.",
                actions: [{ label: "Sign in", onClick: () => navigate("/login") }]
            });
            return;
        }
        await addToCart(product);
    };

    const isInCart = (id) => cartItems?.some(item =>
        item.product?._id === id ||
        item.productId === id ||
        item._id === id ||
        item.id === id
    );

    const handleWishlist = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) { navigate("/login"); return; }
        toggleWishlist({
            ...product,
            variantId: null,
            color: null,
            size: null,
            img: product.images?.[0] || product.img
        });
    };

    const handleCompare = (e, product) => {
        e.preventDefault();
        const normalized = { ...product, id: product._id };
        if (!isInCompare(product._id) && compare.length >= 3) {
            toast({ type: "info", title: "Compare limit reached", message: "You can compare up to 3 products." });
            return;
        }
        toggleCompare(normalized);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/products?filter=${activeFilter}`);
                const list = Array.isArray(res.data) ? res.data : res.data.products || res.data.data || [];
                setProducts(list);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [activeFilter]);

    const getImgUrl = (path) => {
        if (!path) return "/no-image.png";
        if (path.startsWith("http") || path.startsWith("/")) return path;
        return `${import.meta.env.VITE_API_URL || ""}/${path}`;
    };

    const goToProduct = (product) => {
        if (!isLoggedIn) {
            toast({
                type: "warn",
                title: "Login required",
                message: "Please sign in to view product details.",
                actions: [{ label: "Sign in", onClick: () => navigate("/login") }]
            });
            return;
        }
        navigate(`/product/${product._id}`);
    };
    return (
        <>
            <section className="product spad" style={{ paddingBottom: "0" }}>
                <div className="container">

                    {/* ── Filter Tabs ── */}
                    <div className="row">
                        <div className="col-lg-12">
                            <ul className="filter__controls">
                                {[
                                    { key: "best-sellers", label: "Best Sellers" },
                                    { key: "new-arrivals", label: "New Arrivals" },
                                    { key: "hot-sales", label: "Hot Sales" },
                                ].map(({ key, label }) => (
                                    <li
                                        key={key}
                                        className={activeFilter === key ? "active" : ""}
                                        onClick={() => setActiveFilter(key)}
                                    >
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ── Product Grid ── */}
                    <div className="row product__filter">
                        {loading ? (
                            /* Skeleton loaders */
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                                    <div className="sv-skeleton">
                                        <div className="sv-skeleton__img" />
                                        <div className="sv-skeleton__line" />
                                        <div className="sv-skeleton__line sv-skeleton__line--short" />
                                    </div>
                                </div>
                            ))
                        ) : products.length > 0 ? (
                            products.map((product) => {
                                const wishlisted = isInWishlist(product._id, null)
                                const inCart = isInCart(product._id);

                                return (
                                    <div key={product._id} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                                        <div className="sv-product-card sv-product-card--visible">

                                            {/* ── Image ── */}
                                            <div
                                                className="sv-product-card__pic"
                                                onClick={() => goToProduct(product)}
                                            >
                                                <img
                                                    src={getImgUrl(product.image || product.img)}
                                                    alt={product.name}
                                                    loading="lazy"
                                                />

                                                {/* Badge */}
                                                {product.discount > 0 && (
                                                    <span style={{
                                                        position: "absolute", top: "12px", left: "12px",
                                                        background: "#e8342a", color: "#fff",
                                                        fontSize: "11px", fontWeight: "700",
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        zIndex: 2
                                                    }}>
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                                {activeFilter === "new-arrivals" && !product.discount && (
                                                    <span style={{
                                                        position: "absolute", top: "12px", left: "12px",
                                                        background: "#111", color: "#fff",
                                                        fontSize: "11px", fontWeight: "700",
                                                        padding: "3px 8px", borderRadius: "4px",
                                                        zIndex: 2
                                                    }}>
                                                        New
                                                    </span>
                                                )}

                                                {/* Action buttons (wishlist + compare) */}
                                                <div className="sv-product-card__actions">
                                                    {/* Wishlist */}
                                                    <button
                                                        className="sv-wish-btn"
                                                        onClick={(e) => handleWishlist(e, product)}
                                                        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                    >
                                                        <span className={wishlisted ? "sv-wish-icon sv-wish-icon--active" : "sv-wish-icon"}>
                                                            ♥
                                                        </span>
                                                    </button>

                                                    {/* Compare */}
                                                    <button
                                                        className="sv-wish-btn"
                                                        onClick={(e) => handleCompare(e, product)}
                                                        title={isInCompare(product._id) ? "Remove from compare" : "Add to compare"}
                                                        style={{ fontSize: "13px" }}
                                                    >
                                                        <span style={{
                                                            color: isInCompare(product._id) ? "#27ae60" : "#888",
                                                            fontWeight: "700",
                                                            fontSize: "15px"
                                                        }}>
                                                            ⇄
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ── Info ── */}
                                            <div className="sv-product-card__info">
                                                <p className="sv-product-card__category">{product.category}</p>
                                                <h5
                                                    className="sv-product-card__name"
                                                    onClick={() => goToProduct(product)}
                                                >
                                                    {product.name}
                                                </h5>
                                                <span className={`sv-product-card__price${!isLoggedIn ? " sv-product-card__price--hidden" : ""}`}
                                                    onClick={() => { if (!isLoggedIn) navigate("/login"); }}
                                                >
                                                    {isLoggedIn ? `Rs.${product.price?.toLocaleString()}` : "Login to see price"}
                                                </span>
                                                <div className="sv-product-card__btns">
                                                    <button
                                                        className={`sv-btn-cart${inCart ? " sv-btn-cart--active" : ""}`}
                                                        onClick={() => inCart ? navigate("/cart") : handleAddToCart(product)}
                                                    >
                                                        <span>{inCart ? "Go to Cart →" : "+ Add to Cart"}</span>
                                                    </button>
                                                    <button
                                                        className="sv-btn-buy"
                                                        onClick={() => {
                                                            if (!isLoggedIn) { navigate("/login"); return; }
                                                            navigate(`/checkout/${product._id}`);
                                                        }}
                                                    >
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-12 text-center py-5">No products found.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Compare Bar ── */}
            {compare.length > 0 && (
                <div className="compare-bar">
                    <style>{`
                        .compare-bar {
                            position: fixed;
                            bottom: 0; left: 0; right: 0;
                            background: #1a1a1a;
                            color: #fff;
                            padding: 12px 24px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            z-index: 9999;
                            animation: slideUp 0.3s ease;
                            flex-wrap: wrap;
                            gap: 10px;
                            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
                        }
                        @keyframes slideUp {
                            from { transform: translateY(100%); }
                            to   { transform: translateY(0); }
                        }
                        .compare-bar__items { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
                        .compare-bar__label { font-size: 12px; opacity: 0.5; letter-spacing: 1px; text-transform: uppercase; }
                        .compare-bar__chip {
                            display: flex; align-items: center; gap: 8px;
                            background: #2a2a2a; border: 1px solid #333;
                            border-radius: 6px; padding: 6px 10px; font-size: 12px;
                        }
                        .compare-bar__chip img { width: 32px; height: 32px; object-fit: cover; border-radius: 4px; }
                        .compare-bar__chip button { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; }
                        .compare-bar__chip button:hover { color: #fff; }
                        .compare-bar__actions { display: flex; gap: 8px; }
                        .cb-btn { padding: 8px 20px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
                        .cb-btn--white { background: #fff; color: #1a1a1a; }
                        .cb-btn--white:hover { background: #f0f0f0; }
                        .cb-btn--ghost { background: transparent; color: #aaa; border: 1px solid #444; }
                        .cb-btn--ghost:hover { color: #fff; border-color: #fff; }
                    `}</style>
                    <div className="compare-bar__items">
                        <span className="compare-bar__label">Compare ({compare.length}/3):</span>
                        {compare.map((p) => (
                            <div key={p.id} className="compare-bar__chip">
                                <img src={getImgUrl(p.image || p.img)} alt={p.name} />
                                <span>{p.name}</span>
                                <button onClick={() => toggleCompare(p)} title="Remove">×</button>
                            </div>
                        ))}
                    </div>
                    <div className="compare-bar__actions">
                        <Link to="/compare" className="cb-btn cb-btn--white">Compare Now</Link>
                        <button className="cb-btn cb-btn--ghost" onClick={clearCompare}>Clear</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Product;
