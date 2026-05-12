import React, { useState, useContext, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { getProducts } from "../services/productService";
import { toast } from "../components/Toast";

const Shop = () => {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart, cartItems } = useContext(CartContext);
    const [addedProducts, setAddedProducts] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [sortOrder, setSortOrder] = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const gridRef = useRef(null);
    const [gridInView, setGridInView] = useState(false);

    const categories = {
        men: ["Top Wear", "Bottom Wear", "Casual Wear", "Formal Wear"],
        women: ["Top Wear", "Bottom Wear", "Ethnic Wear", "Western Wear"],
        kids: ["Top Wear", "Bottom Wear", "School Wear"],
        bags: [],
        Footware: [],
        accessories: [],
        Electronics: []
    };

    useEffect(() => {
        const checkLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
        window.addEventListener("storage", checkLogin);
        checkLogin();
        return () => window.removeEventListener("storage", checkLogin);
    }, [location]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
                setTimeout(() => setGridInView(true), 100);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
        const onFocus = () => fetchProducts();
        const onStorage = (e) => { if (e.key === "productUpdated") fetchProducts(); };
        window.addEventListener("focus", onFocus);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    useEffect(() => {
        if (cartItems?.length) {
            const map = {};
            cartItems.forEach(item => { if (item.product?._id) map[item.product._id] = true; });
            setAddedProducts(map);
        }
    }, [cartItems]);

    // ── Fix 1: requireLogin uses toast instead of alert ──
    const requireLogin = () => {
        if (!isLoggedIn) {
            toast({
                type: "warn",
                title: "Login required",
                message: "Please sign in to continue.",
                actions: [{ label: "Sign in", onClick: () => navigate("/login") }]
            });
            return false;
        }
        return true;
    };

    // ── Fix 1: Optimistic update — instant button response ──
    const handleAddToCart = async (product) => {
        if (!requireLogin()) return;

        // If already in cart, go to cart immediately
        if (addedProducts[product._id]) {
            navigate("/cart");
            return;
        }

        // Optimistic update — show "Go to Cart" instantly without waiting for API
        setAddedProducts(prev => ({ ...prev, [product._id]: true }));

        try {
            await addToCart(product);
        } catch (err) {
            console.error("Cart error:", err);
            // Revert on failure
            setAddedProducts(prev => ({ ...prev, [product._id]: false }));
            toast({
                type: "error",
                title: "Failed to add",
                message: "Could not add product to cart. Try again.",
            });
        }
    };

    const handleBuyNow = (productId) => {
        if (!requireLogin()) return;
        navigate(`/checkout/${productId}`);
    };

    const toggleCategory = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
        setExpandedCategory(prev => prev === cat ? null : cat);
    };

    const toggleSubCategory = (sub) => {
        setSelectedSubCategories(prev =>
            prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
        );
    };

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        return products
            .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
            .filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category))
            .filter(p => selectedSubCategories.length === 0 || selectedSubCategories.includes(p.subCategory))
            .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
            .sort((a, b) => {
                if (sortOrder === "low") return a.price - b.price;
                if (sortOrder === "high") return b.price - a.price;
                return 0;
            });
    }, [products, search, selectedCategories, selectedSubCategories, priceRange, sortOrder]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    return (
        <>
            {/* ── Breadcrumb ── */}
            <section className="sv-breadcrumb">
                <div className="sv-breadcrumb__bar" />
                <div className="container">
                    <h4>Shop</h4>
                    <nav className="sv-breadcrumb__links">
                        <Link to="/">Home</Link>
                        <span>Shop</span>
                    </nav>
                </div>
            </section>

            {/* ── Shop Section ── */}
            <section className="sv-shop">
                <div className="container">

                    {/* Mobile filter button */}
                    <button className="sv-filter-toggle" onClick={() => setSidebarOpen(true)}>
                        <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                            <rect y="0" width="16" height="2" rx="1" fill="currentColor" />
                            <rect x="3" y="6" width="10" height="2" rx="1" fill="currentColor" />
                            <rect x="6" y="12" width="4" height="2" rx="1" fill="currentColor" />
                        </svg>
                        Filters
                        {(selectedCategories.length + selectedSubCategories.length) > 0 && (
                            <span className="sv-filter-toggle__badge">
                                {selectedCategories.length + selectedSubCategories.length}
                            </span>
                        )}
                    </button>

                    {/* Mobile overlay */}
                    {sidebarOpen && (
                        <div className="sv-overlay" onClick={() => setSidebarOpen(false)} />
                    )}

                    <div className="sv-shop__layout">

                        {/* ── SIDEBAR ── */}
                        <aside className={`sv-sidebar${sidebarOpen ? " sv-sidebar--open" : ""}`}>
                            <div className="sv-sidebar__inner">

                                <div className="sv-sidebar__mobile-header">
                                    <span>Filters</span>
                                    <button onClick={() => setSidebarOpen(false)}>✕</button>
                                </div>

                                <div className="sv-sidebar__search">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <span className="sv-sidebar__search-icon">⌕</span>
                                </div>

                                {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
                                    <div className="sv-chips">
                                        {selectedCategories.map(c => (
                                            <span key={c} className="sv-chip">
                                                {c}
                                                <button onClick={() => toggleCategory(c)}>✕</button>
                                            </span>
                                        ))}
                                        {selectedSubCategories.map(s => (
                                            <span key={s} className="sv-chip">
                                                {s}
                                                <button onClick={() => toggleSubCategory(s)}>✕</button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="sv-sidebar__card">
                                    <h4>Categories</h4>
                                    <ul className="sv-cat-list">
                                        {Object.keys(categories).map((cat) => (
                                            <li key={cat}>
                                                <div className="sv-cat-row">
                                                    <label className="sv-cat-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(cat)}
                                                            onChange={() => toggleCategory(cat)}
                                                        />
                                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                    </label>
                                                    {categories[cat].length > 0 && (
                                                        <button
                                                            className="sv-expand-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedCategory(prev => prev === cat ? null : cat);
                                                            }}
                                                        >
                                                            {expandedCategory === cat ? "▲" : "▼"}
                                                        </button>
                                                    )}
                                                </div>
                                                {categories[cat].length > 0 && expandedCategory === cat && (
                                                    <ul className="sv-sub-list">
                                                        {categories[cat].map((sub) => (
                                                            <li key={sub}>
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedSubCategories.includes(sub)}
                                                                        onChange={() => toggleSubCategory(sub)}
                                                                    />
                                                                    {sub}
                                                                </label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="sv-sidebar__card sv-price-range">
                                    <h4>Price Range</h4>
                                    <input
                                        type="range"
                                        min="0" max="100000" step="100"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                    />
                                    <div className="sv-price-label">
                                        <span>Rs.{priceRange[0].toLocaleString()}</span>
                                        <span>Rs.{priceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ── PRODUCTS ── */}
                        <div className="sv-products">

                            <div className="sv-toolbar">
                                <p>
                                    Showing <strong>{visibleProducts.length}</strong> of{" "}
                                    <strong>{filteredProducts.length}</strong> products
                                </p>
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                    <option value="">Default</option>
                                    <option value="low">Price: Low to High</option>
                                    <option value="high">Price: High to Low</option>
                                </select>
                            </div>

                            {loading ? (
                                <div className="sv-grid">
                                    {[...Array(6)].map((_, i) => (
                                        <div className="sv-skeleton" key={i}>
                                            <div className="sv-skeleton__img" />
                                            <div className="sv-skeleton__line" />
                                            <div className="sv-skeleton__line sv-skeleton__line--short" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="sv-empty">
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                        <circle cx="32" cy="32" r="28" stroke="#111" strokeWidth="2" />
                                        <path d="M20 24h24M20 32h16M20 40h10" stroke="#111" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <p>No products match your filters.</p>
                                </div>
                            ) : (
                                <div className="sv-grid" ref={gridRef}>
                                    {visibleProducts.map((product, i) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            index={i}
                                            inView={gridInView}
                                            isLoggedIn={isLoggedIn}
                                            isInWishlist={isInWishlist}
                                            toggleWishlist={toggleWishlist}
                                            addedProducts={addedProducts}
                                            handleAddToCart={handleAddToCart}
                                            handleBuyNow={handleBuyNow}
                                            navigate={navigate}
                                        />
                                    ))}
                                </div>
                            )}

                            {visibleCount < filteredProducts.length && (
                                <div className="sv-load-more">
                                    <button onClick={() => setVisibleCount(prev => prev + 3)}>
                                        Load More Products
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

/* ── ProductCard ── */
const ProductCard = ({
    product, index, inView,
    isLoggedIn, isInWishlist, toggleWishlist,
    addedProducts, handleAddToCart, handleBuyNow, navigate
}) => {
    const [wished, setWished] = useState(false);

    // ── Fix 2: Wishlist requires login + shows toast ──
    const handleWish = (e) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            toast({
                type: "warn",
                title: "Login required",
                message: "Please sign in to add items to your wishlist.",
                actions: [{ label: "Sign in", onClick: () => navigate("/login") }]
            });
            return;
        }

        const alreadyWished = isInWishlist(product._id);
        setWished(true);
        setTimeout(() => setWished(false), 400);
        toggleWishlist(product);

        toast({
            type: alreadyWished ? "info" : "success",
            title: alreadyWished ? "Removed from wishlist" : "Added to wishlist ♥",
            message: alreadyWished
                ? `${product.name} removed from your wishlist.`
                : `${product.name} added to your wishlist!`,
        });
    };

    const goToProduct = () => {
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
        <div
            className={`sv-product-card${inView ? " sv-product-card--visible" : ""}`}
            style={{ transitionDelay: `${(index % 6) * 0.07}s` }}
        >
            <div className="sv-product-card__pic" onClick={goToProduct}>
                <img
                    src={(() => {
                        const src = product.images?.[0] || product.img
                            || product.variants?.find(v => v.images?.[0])?.images?.[0]
                            || null;
                        if (!src || src.trim() === "") return "/placeholder.png";
                        return src.replace("/public", "");
                    })()}
                    alt={product.name}
                    loading="lazy"
                />
                <div className="sv-product-card__actions">
                    <button
                        className={`sv-wish-btn${wished ? " sv-wish-btn--pulse" : ""}`}
                        onClick={handleWish}
                        title={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <span className={isInWishlist(product._id) ? "sv-wish-icon sv-wish-icon--active" : "sv-wish-icon"}>
                            ♥
                        </span>
                    </button>
                </div>
            </div>

            <div className="sv-product-card__info">
                <p className="sv-product-card__category">{product.category}</p>
                <h5 className="sv-product-card__name" onClick={goToProduct}>{product.name}</h5>
                <span
                    className={`sv-product-card__price${!isLoggedIn ? " sv-product-card__price--hidden" : ""}`}
                    onClick={() => { if (!isLoggedIn) navigate("/login"); }}
                >
                    {isLoggedIn ? `Rs.${product.price?.toLocaleString()}` : "Login to see price"}
                </span>
                <div className="sv-product-card__btns">
                    <button
                        className={`sv-btn-cart${addedProducts[product._id] ? " sv-btn-cart--active" : ""}`}
                        onClick={() => {
                            if (addedProducts[product._id]) navigate("/cart");
                            else handleAddToCart(product);
                        }}
                    >
                        <span>{addedProducts[product._id] ? "Go to Cart →" : "+ Add to Cart"}</span>
                    </button>
                    <button className="sv-btn-buy" onClick={() => handleBuyNow(product._id)}>
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shop;