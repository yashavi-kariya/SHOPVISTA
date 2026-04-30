import React, { useState, useContext, useMemo, useEffect } from "react";
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
    const [priceRange, setPriceRange] = useState([500, 10000]);
    const [sortOrder, setSortOrder] = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    const [loading, setLoading] = useState(true);

    const categories = {
        men: ["Top Wear", "Bottom Wear", "Casual Wear", "Formal Wear"],
        women: ["Top Wear", "Bottom Wear", "Ethnic Wear", "Western Wear"],
        kids: ["Top Wear", "Bottom Wear", "School Wear"],
        bags: [],
        Footware: [],
        accessories: [],
        Electronics: []
    };
    console.log("TOKEN:", localStorage.getItem("token"));
    console.log("isLoggedIn:", isLoggedIn);
    const requireLogin = () => {
        if (!isLoggedIn) {
            alert("You are not logged in!");
            navigate("/login");
            return false;
        }
        return true;
    };

    //  Listen for login/logout changes
    useEffect(() => {
        const checkLogin = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };
        window.addEventListener("storage", checkLogin);
        checkLogin();
        return () => window.removeEventListener("storage", checkLogin);
    }, [location]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        const handleFocus = () => fetchProducts();

        //  NEW: listen for admin updates
        const handleStorage = (event) => {
            if (event.key === "productUpdated") {
                fetchProducts();
            }
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const handleAddToCart = async (product) => {
        if (!requireLogin()) return;

        try {
            await addToCart(product);
            setAddedProducts(prev => ({ ...prev, [product._id]: true }));
        } catch (error) {
            console.error("Cart error:", error);
            alert("Failed to add product to cart");
        }
    };
    useEffect(() => {
        if (cartItems?.length) {
            const map = {};
            cartItems.forEach(item => {
                if (item.product?._id) map[item.product._id] = true;
            });
            setAddedProducts(map);
        }
    }, [cartItems]);

    const handleBuyNow = (productId) => {
        if (!requireLogin()) return;
        navigate(`/checkout/${productId}`);
    };

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
        // 👇 Auto expand when checked, collapse when unchecked
        setExpandedCategory((prev) => {
            if (prev === cat) return null;
            return cat;
        });
    };

    const toggleSubCategory = (sub) => {
        setSelectedSubCategories((prev) =>
            prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
        );
    };

    const handlePriceChange = (e) => {
        setPriceRange([500, Number(e.target.value)]);
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .filter((p) =>
                selectedCategories.length === 0
                    ? true
                    : selectedCategories.includes(p.category)
            )
            .filter((p) =>
                selectedSubCategories.length === 0
                    ? true
                    : selectedSubCategories.includes(p.subCategory)
            )
            .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
            .sort((a, b) => {
                if (sortOrder === "low") return a.price - b.price;
                if (sortOrder === "high") return b.price - a.price;
                return 0;
            });
    }, [products, search, selectedCategories, selectedSubCategories, priceRange, sortOrder]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    return (
        <>
            <section className="breadcrumb-option">
                <div className="container">
                    <h4>Shop</h4>
                    <div className="breadcrumb__links">
                        <Link to="/">Home</Link>
                        <span>Shop</span>
                    </div>
                </div>
            </section>

            <section className="shop spad">
                <div className="container">
                    <div className="shop__container">

                        {/* SIDEBAR */}
                        <aside className="shop__sidebar">
                            <div className="shop__sidebar__search">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="shop__sidebar__accordion">
                                <div className="card">
                                    <h4>Categories</h4>
                                    <ul>
                                        {Object.keys(categories).map((cat) => (
                                            <li key={cat}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                                                    {/* Checkbox + label */}
                                                    <label style={{ display: "flex", alignItems: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            style={{ marginRight: "10px" }}
                                                            checked={selectedCategories.includes(cat)}
                                                            onChange={() => toggleCategory(cat)}
                                                        />
                                                        {cat.toUpperCase()}
                                                    </label>

                                                    {/* Arrow — OUTSIDE label so it doesn't trigger checkbox */}
                                                    {Object.values(categories)[Object.keys(categories).indexOf(cat)].length > 0 && (
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "12px", padding: "0 8px" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedCategory((prev) => (prev === cat ? null : cat));
                                                            }}
                                                        >
                                                            {expandedCategory === cat ? "▲" : "▼"}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Subcategories */}
                                                {categories[cat].length > 0 && expandedCategory === cat && (
                                                    <ul style={{ paddingLeft: "20px", marginTop: "6px" }}>
                                                        {categories[cat].map((sub) => (
                                                            <li key={sub}>
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        style={{ marginRight: "8px" }}
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

                                <div className="card">
                                    <h4>Price Range</h4>
                                    <input
                                        type="range"
                                        min="500"
                                        max="10000"
                                        step="100"
                                        value={priceRange[1]}
                                        onChange={handlePriceChange}
                                        style={{ width: "100%" }}
                                    />
                                    <p>Rs.{priceRange[0]} - Rs.{priceRange[1]}</p>
                                </div>
                            </div>
                        </aside>

                        {/* PRODUCT SECTION */}
                        <div className="shop__products__wrapper">
                            <div className="shop__product__option">
                                <div className="row mb-4">
                                    <div className="col-lg-6 col-md-6">
                                        <p>
                                            Showing {visibleProducts.length} of {filteredProducts.length} products
                                        </p>
                                    </div>
                                    <div className="col-lg-6 col-md-6 text-right">
                                        <span>Sort by: </span>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="">Default</option>
                                            <option value="low">Price: Low to High</option>
                                            <option value="high">Price: High to Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <p style={{ textAlign: "center", padding: "2rem" }}>Loading products...</p>
                            ) : filteredProducts.length === 0 ? (
                                <p style={{ textAlign: "center", padding: "2rem" }}>No products found.</p>
                            ) : (
                                <div className="shop__product__grid">
                                    {visibleProducts.map((product) => (
                                        <div className="product__item" key={product._id}>
                                            <div
                                                className="product__item__pic"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
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
                                                }}
                                            >
                                                <img
                                                    src={
                                                        product.img && product.img.trim() !== ""
                                                            ? product.img.replace("/public", "")
                                                            : "/placeholder.png"
                                                    }
                                                    alt={product.name}
                                                />

                                                <ul className="product__hover">
                                                    <li
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleWishlist(product);
                                                        }}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: "18px",
                                                                color: isInWishlist(product._id) ? "red" : "inherit",
                                                            }}
                                                        >
                                                            ♥
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="product__item__text">
                                                <h6>{product.category}</h6>
                                                <h5
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        if (!isLoggedIn) {
                                                            alert("Please login to view product details");
                                                            navigate("/login");
                                                            return;
                                                        }
                                                        navigate(`/product/${product._id}`);
                                                    }}
                                                >
                                                    {product.name}
                                                </h5>

                                                {/*  Price hidden if not logged in */}
                                                <span
                                                    className="price"
                                                    style={{ cursor: !isLoggedIn ? "pointer" : "default", color: !isLoggedIn ? "red" : "" }}
                                                    onClick={() => {
                                                        if (!isLoggedIn) navigate("/login");
                                                    }}
                                                >
                                                    {isLoggedIn ? `Rs.${product.price}` : "Login to see price"}
                                                </span>

                                                <div className="product__item__btns">
                                                    {/*  Add to Cart — alerts if not logged in */}
                                                    <button
                                                        className={`add-cart ${addedProducts[product._id] ? "in-cart" : ""}`}
                                                        onClick={() => {
                                                            if (addedProducts[product._id]) {
                                                                navigate("/cart");
                                                            } else {
                                                                handleAddToCart(product);
                                                            }
                                                        }}
                                                        style={{
                                                            opacity: !isLoggedIn ? 0.6 : 1,
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        {addedProducts[product._id] ? "Go to Cart →" : "+ Add To Cart"}
                                                    </button>
                                                    {/* Buy Now — alerts if not logged in */}
                                                    <button
                                                        className="primary-btn"
                                                        onClick={() => handleBuyNow(product._id)}
                                                        style={{
                                                            opacity: !isLoggedIn ? 0.6 : 1,
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {visibleCount < filteredProducts.length && (
                                <div className="product__pagination">
                                    <button
                                        className="primary-btn"
                                        style={{ width: "auto", padding: "12px 30px" }}
                                        onClick={() => setVisibleCount((prev) => prev + 3)}
                                    >
                                        Load More
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
export default Shop;