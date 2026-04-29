import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import { useCart } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { CompareContext } from "../context/CompareContext";
import { Link, useNavigate } from "react-router-dom";
import heart from "../assets/img/icon/heart.png";
import compareIcon from "../assets/img/icon/compare.png";
import search from "../assets/img/icon/search.png";

const Product = () => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { compare, toggleCompare, isInCompare, clearCompare } = useContext(CompareContext);

    const [products, setProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState("best-sellers");
    const [loading, setLoading] = useState(false);
    const isLoggedIn = !!localStorage.getItem("token");
    const navigate = useNavigate();

    const handleAddToCart = (product) => {
        if (!isLoggedIn) {
            alert("Please login first to add items to your cart!");
            navigate("/login");
            return;
        }
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

    const handleWishlist = (e, product) => {
        e.preventDefault();
        if (!isLoggedIn) { navigate("/login"); return; }
        toggleWishlist(product);
    };

    const handleCompare = (e, product) => {
        e.preventDefault();
        const normalized = { ...product, id: product._id };
        if (!isInCompare(product._id) && compare.length >= 3) {
            alert("You can compare up to 3 products only.");
            return;
        }
        toggleCompare(normalized);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/products?filter=${activeFilter}`);
                setProducts(res.data);
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
        if (path.startsWith("http")) return path;
        return `${import.meta.env.VITE_API_URL || ""}${path}`;
    };

    return (
        <>
            <style>{`
              /* Wishlist active — red background + white icon */
               .product__hover li a.wishlisted {
                    background: #e74c3c !important;
                    border-color: #e74c3c !important;
                }
                .product__hover li a.wishlisted img {
                    filter: brightness(0) invert(1) !important;
                }

                /* Compare active — green background + white icon */
                .product__hover li a.compared {
                    background: #27ae60 !important;
                    border-color: #27ae60 !important;
                }
                .product__hover li a.compared img {
                    filter: brightness(0) invert(1) !important;
                }

                /* Make sure hover area has dark bg so icons are always visible by default */
                .product__hover li a {
                    background: rgba(255,255,255,0.92);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s, border-color 0.2s;
                }
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
                .compare-bar__items {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .compare-bar__label {
                    font-size: 12px;
                    opacity: 0.5;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .compare-bar__chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #2a2a2a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 6px 10px;
                    font-size: 12px;
                }
                .compare-bar__chip img {
                    width: 32px; height: 32px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .compare-bar__chip button {
                    background: none; border: none;
                    color: #888; cursor: pointer;
                    font-size: 18px; line-height: 1;
                    padding: 0; margin-left: 2px;
                }
                .compare-bar__chip button:hover { color: #fff; }
                .compare-bar__actions { display: flex; gap: 8px; }
                .cb-btn {
                    padding: 8px 20px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    cursor: pointer;
                    border: none;
                    text-decoration: none;
                    display: inline-block;
                }
                .cb-btn--white { background: #fff; color: #1a1a1a; }
                .cb-btn--white:hover { background: #f0f0f0; color: #1a1a1a; }
                .cb-btn--ghost {
                    background: transparent;
                    color: #aaa;
                    border: 1px solid #444;
                }
                .cb-btn--ghost:hover { color: #fff; border-color: #fff; }
                @media (max-width: 576px) {
                    .compare-bar { padding: 10px 14px; }
                    .compare-bar__chip span { display: none; }
                }
            `}</style>

            <section className="product spad" style={{ paddingBottom: "0" }}>
                <div className="container">

                    {/* Filters */}
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

                    {/* Product Grid */}
                    <div className="row product__filter">
                        {loading ? (
                            <div className="col-12 text-center py-5">Loading Products...</div>
                        ) : products.length > 0 ? (
                            products.map((product) => {
                                const wishlisted = isInWishlist(product._id);
                                const compared = isInCompare(product._id);

                                return (
                                    <div key={product._id} className="col-lg-3 col-md-6 col-sm-6">
                                        <div className={`product__item ${product.discount > 0 ? "sale" : ""}`}>

                                            <div
                                                className="product__item__pic"
                                                style={{
                                                    backgroundImage: `url(${getImgUrl(product.image || product.img)})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                }}
                                            >
                                                {product.discount > 0 && (
                                                    <span className="label">-{product.discount}%</span>
                                                )}
                                                {activeFilter === "new-arrivals" && !product.discount && (
                                                    <span className="label">New</span>
                                                )}

                                                <ul className="product__hover">
                                                    {/* ❤️ Wishlist */}
                                                    <li>

                                                        <a href="#"
                                                            onClick={(e) => handleWishlist(e, product)}
                                                            className={wishlisted ? "wishlisted" : ""}
                                                            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                        >
                                                            <img src={heart} alt="wishlist" />
                                                        </a>
                                                    </li>

                                                    {/* 🔄 Compare */}
                                                    <li>

                                                        <a href="#"
                                                            onClick={(e) => handleCompare(e, product)}
                                                            className={compared ? "compared" : ""}
                                                            title={compared ? "Remove from compare" : "Add to compare"}
                                                        >
                                                            <img src={compareIcon} alt="compare" />
                                                            <span>Compare</span>
                                                        </a>
                                                    </li>

                                                    {/* 🔍 Quick View */}
                                                    <li>
                                                        <Link to={`/product/${product._id}`} title="View product">
                                                            <img src={search} alt="view" />
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="product__item__text">
                                                <h6>{product.name}</h6>
                                                <button
                                                    className="add-cart"
                                                    onClick={() => handleAddToCart(product)}
                                                    style={{
                                                        opacity: !isLoggedIn ? 0.6 : 1,
                                                        cursor: "pointer",
                                                        color: "#fff",
                                                        backgroundColor: "#7e8286",
                                                        border: "none",
                                                        padding: "5px 10px",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    + Add To Cart
                                                </button>
                                                <h5>Rs. {product.price}</h5>
                                                <div className="product__color__select">
                                                    {product.colors?.map((color, idx) => (
                                                        <label
                                                            key={idx}
                                                            style={{
                                                                backgroundColor: color,
                                                                border: "1px solid #ebebeb",
                                                                borderRadius: "50%",
                                                            }}
                                                        >
                                                            <input type="radio" name={`color-${product._id}`} />
                                                        </label>
                                                    ))}
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
            </section >

            {/* Compare Bar */}
            {
                compare.length > 0 && (
                    <div className="compare-bar">
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
                            <Link to="/compare" className="cb-btn cb-btn--white">
                                Compare Now
                            </Link>
                            <button
                                className="cb-btn cb-btn--ghost"
                                onClick={clearCompare}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Product;