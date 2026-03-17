import React, { useState, useContext, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { allProducts } from "../data/categoryData";
import { CartContext } from "../context/CartContext";
import { getProducts } from "../services/productService";
import heartIcon from "../assets/img/icon/heart.png";
import compareIcon from "../assets/img/icon/compare.png";
import axios from "axios";
import { WishlistContext } from "../context/WishlistContext";

const Shop = () => {
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    // STATE
    const { wishlist, toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [priceRange, setPriceRange] = useState([500, 10000]);
    const [sortOrder, setSortOrder] = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    // const [wishlist, setWishlist] = useState([]);
    const [compare, setCompare] = useState([]);


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };
    const handleAddToCart = async (product) => {

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        try {

            await addToCart(product);
            alert("Product added to cart");

            addToCart({
                product: product,
                quantity: 1
            });// update UI
            alert("Product added to cart");

        } catch (error) {
            console.error("Cart error:", error);
        }
    };
    // Sidebar static categories
    const categories = ["men", "women", "bags", "Footware", "accessories", "Electronics"];

    // ===========================
    // TOGGLE FUNCTIONS
    // ===========================
    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat)
                ? prev.filter((c) => c !== cat)
                : [...prev, cat]
        );
    };

    const toggleColor = (color) => {
        setSelectedColors((prev) =>
            prev.includes(color)
                ? prev.filter((c) => c !== color)
                : [...prev, color]
        );
    };

    const toggleSize = (size) => {
        setSelectedSizes((prev) =>
            prev.includes(size)
                ? prev.filter((s) => s !== size)
                : [...prev, size]
        );
    };

    // const toggleWishlist = (id) => {
    //     setWishlist((prev) =>
    //         prev.includes(id)
    //             ? prev.filter((item) => item !== id)
    //             : [...prev, id]
    //     );
    // };

    const toggleCompare = (id) => {
        setCompare((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    // ===========================
    // FILTER LOGIC
    // ===========================
    const filteredProducts = useMemo(() => {
        return products
            .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            )
            .filter((p) =>
                selectedCategories.length === 0
                    ? true
                    : selectedCategories.includes(p.category)
            )
            .filter((p) =>
                (p.price >= priceRange[0] && p.price <= priceRange[1])
            )
            .filter((p) =>
                selectedColors.length === 0
                    ? true
                    : p.colors?.some((c) => selectedColors.includes(c))
            )
            .filter((p) =>
                selectedSizes.length === 0
                    ? true
                    : p.sizes?.some((s) => selectedSizes.includes(s))
            )
            .sort((a, b) => {
                if (sortOrder === "low") return a.price - b.price;
                if (sortOrder === "high") return b.price - a.price;
                return 0;
            });
    }, [products, search, selectedCategories, selectedColors, selectedSizes, priceRange, sortOrder]);

    // Change 'products' to 'filteredProducts' so your filters actually work
    const visibleProducts = filteredProducts.slice(0, visibleCount);

    // ===========================
    // TEMPLATE UI
    // ===========================
    return (
        <>


            {/* Breadcrumb */}
            <section className="breadcrumb-option">
                <div className="container">
                    <h4>Shop</h4>
                    <div className="breadcrumb__links">
                        <Link to="/">Home</Link>
                        <span>Shop</span>
                    </div>
                </div>
            </section>

            {/* Shop Section */}
            <section className="shop spad">
                <div className="container">
                    <div className="row">

                        {/* ====================== SIDEBAR ====================== */}
                        <div className="col-lg-3">
                            <div className="shop__sidebar">

                                {/* Search */}
                                <div className="shop__sidebar__search mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Categories */}
                                <h4>Categories</h4>
                                <ul>
                                    {categories.map((cat) => (
                                        <li key={cat}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                />
                                                {" "}{cat.toUpperCase()}
                                            </label>
                                        </li>
                                    ))}
                                </ul>

                                {/* Price */}
                                <h4 className="mt-4">Price Range</h4>
                                <input
                                    type="range"
                                    min="50"
                                    max="10000000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                />
                                <p>Rs.{priceRange[0]} - Rs.{priceRange[1]}</p>

                                {/* Colors */}
                                <h4 className="mt-4">Colors</h4>
                                <div className="shop__sidebar__color">
                                    {["red", "blue", "black", "white", "yellow", "grey"].map((c) => (
                                        <label
                                            key={c}
                                            onClick={() => toggleColor(c)}
                                            style={{
                                                background: c,
                                                width: 25,
                                                height: 25,
                                                display: "inline-block",
                                                marginRight: 10,
                                                cursor: "pointer",
                                                border: selectedColors.includes(c)
                                                    ? "2px solid #111"
                                                    : "1px solid #ccc",
                                            }}
                                        ></label>
                                    ))}
                                </div>

                                {/* Sizes */}
                                <h4 className="mt-4">Sizes</h4>
                                <div>
                                    {["S", "M", "L", "XL", "2XL"].map((s) => (
                                        <label key={s} style={{ marginRight: 15 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSizes.includes(s)}
                                                onChange={() => toggleSize(s)}
                                            />{" "}
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ====================== PRODUCT GRID ====================== */}
                        <div className="col-lg-9">

                            {/* Sort */}
                            <div className="d-flex justify-content-end mb-3">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="form-select w-auto"
                                >
                                    <option value="">Sort by</option>
                                    <option value="low">Price: Low to High</option>
                                    <option value="high">Price: High to Low</option>
                                </select>
                            </div>

                            <div className="row">
                                {visibleProducts.map((item) => (
                                    <div className="col-lg-4 col-md-6 col-sm-6" key={item._id}>
                                        <div className="product__item">

                                            {/* Product image */}
                                            <div
                                                className="product__item__pic"
                                                style={{
                                                    backgroundImage: `url(${item.img.replace("/public", "")})`
                                                }}
                                                onClick={() => navigate(`/product/${item._id}`)}
                                            >
                                                <ul className="product__hover">
                                                    {/* Wishlist */}
                                                    {/* <li onClick={(e) => { e.stopPropagation(); toggleWishlist(item._id); }}>
                                                        <img src={heartIcon} alt="" />
                                                    </li> */}
                                                    <li
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleWishlist(item); // pass full product or item
                                                        }}
                                                        style={{ cursor: "pointer" }} // just pointer cursor
                                                    >
                                                        <img
                                                            src={heartIcon}
                                                            alt="wishlist"
                                                            width="20"
                                                            style={{
                                                                filter: isInWishlist(item.id)
                                                                    ? "invert(36%) sepia(89%) saturate(6799%) hue-rotate(336deg) brightness(100%) contrast(101%)"
                                                                    : "none",
                                                            }}
                                                        />
                                                    </li>
                                                    {/* Compare */}
                                                    <li onClick={(e) => { e.stopPropagation(); toggleCompare(item._id); }}>
                                                        <img src={compareIcon} alt="" />
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Product text */}
                                            <div className="product__item__text">
                                                <h6
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => navigate(`/product/${item._id}`)}
                                                >
                                                    {item.name}
                                                </h6>

                                                {/* Add to cart */}
                                                <button
                                                    className="add-cart"
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    + Add To Cart
                                                </button>

                                                <h5>Rs.{item.price}</h5>

                                                {/* Buy Now */}
                                                <button
                                                    className="primary-btn mt-2"
                                                    onClick={() => navigate(`/checkout/${item._id}`)}
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            {visibleCount < filteredProducts.length && (
                                <div className="text-center mt-4">
                                    <button
                                        className="primary-btn"
                                        onClick={() => setVisibleCount(visibleCount + 6)}
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