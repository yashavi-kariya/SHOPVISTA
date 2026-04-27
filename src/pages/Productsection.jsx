import React, { useState, useEffect } from "react";
// import api from "api";
import api from "../api";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// Import Icons
import heart from "../assets/img/icon/heart.png";
import compare from "../assets/img/icon/compare.png";
import search from "../assets/img/icon/search.png";

const Product = () => {
    const { addToCart } = useCart();

    // --- NEW STATES ---
    const [products, setProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState("best-sellers"); // Matches your backend logic
    const [loading, setLoading] = useState(false);
    const isLoggedIn = !!localStorage.getItem("token");
    const navigate = useNavigate();

    //Define handleAddToCart
    const handleAddToCart = (product) => {
        if (!isLoggedIn) {
            alert("Please login first to add items to your cart!");
            navigate("/login"); // Redirects to login page
            return;
        }
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };
    // --- FETCH DYNAMIC DATA ---
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Hits your updated backend route: http://localhost:3001/api/products?filter=...
                const res = await api.get(`http://localhost:3001/api/products?filter=${activeFilter}`);
                setProducts(res.data); // Res.data is now the array from backend
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [activeFilter]);



    // Helper to handle image URLs
    const getImgUrl = (path) => {
        if (!path) return "/no-image.png";

        // If already full URL
        if (path.startsWith("http")) return path;

        // If relative path
        return `http://localhost:3001${path}`;
    };

    return (
        <section className="product spad">
            <div className="container">
                {/* Header Filters */}
                <div className="row">
                    <div className="col-lg-12">
                        <ul className="filter__controls">
                            <li
                                className={activeFilter === "best-sellers" ? "active" : ""}
                                onClick={() => setActiveFilter("best-sellers")}
                            >
                                Best Sellers
                            </li>
                            <li
                                className={activeFilter === "new-arrivals" ? "active" : ""}
                                onClick={() => setActiveFilter("new-arrivals")}
                            >
                                New Arrivals
                            </li>
                            <li
                                className={activeFilter === "hot-sales" ? "active" : ""}
                                onClick={() => setActiveFilter("hot-sales")}
                            >
                                Hot Sales
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="row product__filter">
                    {loading ? (
                        <div className="col-12 text-center py-5">Loading Products...</div>
                    ) : products.length > 0 ? (
                        products.map((product) => (

                            <div key={product._id} className="col-lg-3 col-md-6 col-sm-6">
                                <div className={`product__item ${product.discount > 0 ? "sale" : ""}`}>

                                    {/* Product Image */}
                                    <div
                                        className="product__item__pic"
                                        style={{
                                            backgroundImage: `url(${getImgUrl(product.image || product.img)})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}

                                    >
                                        {/* Show "Sale" if there is a discount */}
                                        {product.discount > 0 && <span className="label">-{product.discount}%</span>}
                                        {/* Show "New" if added in the last 7 days (Optional logic) */}
                                        {activeFilter === "new-arrivals" && !product.discount && <span className="label">New</span>}

                                        <ul className="product__hover">
                                            <li><a href="#"><img src={heart} alt="heart" /></a></li>
                                            <li>
                                                <a href="#">
                                                    <img src={compare} alt="compare" /> <span>Compare</span>
                                                </a>
                                            </li>
                                            <li>
                                                <Link to={`/product/${product._id}`}>
                                                    <img src={search} alt="search" />
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Product Text */}
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
                                                borderRadius: "4px"
                                            }}
                                        >
                                            + Add To Cart
                                        </button>
                                        <h5>Rs. {product.price}</h5>

                                        {/* Color Dots (rendering dynamically if they exist) */}
                                        <div className="product__color__select">
                                            {product.colors?.map((color, idx) => (
                                                <label
                                                    key={idx}
                                                    style={{ backgroundColor: color, border: '1px solid #ebebeb', borderRadius: '50%' }}
                                                >
                                                    <input type="radio" name={`color-${product._id}`} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">No products found in this category.</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Product;
