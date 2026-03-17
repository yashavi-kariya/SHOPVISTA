import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import heartIcon from "../assets/img/icon/heart.png";
import compareIcon from "../assets/img/icon/compare.png";

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Fetch product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/products/${id}`);
                const data = res.data.product || res.data;
                setProduct(data);
                setSelectedImage(data.img || data.images?.[0] || "");
                setSelectedColor(data.colors?.[0] || "");
                setSelectedSize(data.sizes?.[0] || "");
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };
        fetchProduct();
    }, [id]);

    const getImage = (path) => path ? `http://localhost:3001${path}` : "/no-image.png";

    if (!product) return <div className="text-center py-5">Loading...</div>;

    const handleAddToCart = () => {
        addToCart({ ...product, selectedColor, selectedSize, quantity });
        alert("Product added to cart!");
    };

    const handleBuyNow = () => {
        addToCart({ ...product, selectedColor, selectedSize, quantity });
        navigate("/checkout");
    };

    return (
        <section className="product-details py-5">
            <div className="container">
                <div className="row g-5">

                    {/* LEFT IMAGE */}
                    <div className="col-lg-6">
                        <div className="card shadow-sm border-0">
                            <img
                                src={getImage(selectedImage)}
                                alt={product.name}
                                className="card-img-top rounded"
                                onError={(e) => { e.target.src = "/no-image.png"; }}
                            />
                            {product.images?.length > 1 && (
                                <div className="d-flex mt-3 gap-2 justify-content-center flex-wrap">
                                    {product.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getImage(img)}
                                            alt={`thumb-${idx}`}
                                            className={`border rounded ${selectedImage === img ? "border-primary" : "border-light"}`}
                                            style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
                                            onClick={() => setSelectedImage(img)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT DETAILS */}
                    <div className="col-lg-6">
                        <h2 className="fw-bold">{product.name}</h2>

                        {/* Rating */}
                        <div className="mb-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <i key={n} className={n <= (product.rating || 0) ? "fa fa-star text-warning" : "fa fa-star-o text-muted"}></i>
                            ))}
                            <span className="ms-2 text-muted">({product.rating || 0})</span>
                        </div>

                        {/* Price */}
                        <h4 className="text-success mb-3">Rs {product.price}</h4>

                        {/* Description */}
                        <p className="text-secondary">{product.description || "No description available."}</p>

                        {/* Color Options */}
                        {product.colors?.length > 0 && (
                            <div className="mb-3">
                                <span className="fw-semibold me-2">Color:</span>
                                {product.colors.map((color) => (
                                    <span
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        style={{
                                            background: color,
                                            width: "25px",
                                            height: "25px",
                                            display: "inline-block",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                            border: selectedColor === color ? "2px solid #000" : "1px solid #ccc",
                                            cursor: "pointer",
                                        }}
                                    ></span>
                                ))}
                            </div>
                        )}

                        {/* Size Options */}
                        {product.sizes?.length > 0 && (
                            <div className="mb-3">
                                <span className="fw-semibold me-2">Size:</span>
                                {product.sizes.map((size) => (
                                    <span
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1 me-2 rounded ${selectedSize === size ? "border border-dark" : "border border-secondary text-muted"}`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {size}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="d-flex align-items-center mb-4">
                            <button className="btn btn-outline-secondary me-2" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input type="text" readOnly value={quantity} className="form-control text-center" style={{ width: "60px" }} />
                            <button className="btn btn-outline-secondary ms-2" onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>

                        {/* Add to Cart & Buy Now */}
                        <div className="d-flex gap-2 mb-3 flex-wrap">
                            <button onClick={handleAddToCart} className="btn btn-primary flex-grow-1">Add to Cart</button>
                            <button onClick={handleBuyNow} className="btn btn-success flex-grow-1">Buy Now</button>

                            {/* Wishlist */}
                            <button
                                onClick={() => toggleWishlist(product)}
                                className="btn btn-outline-danger"
                                style={{ width: "50px", display: "flex", justifyContent: "center", alignItems: "center" }}
                            >
                                <img
                                    src={heartIcon}
                                    alt="wishlist"
                                    width="20"
                                    style={{
                                        filter: isInWishlist(product._id)
                                            ? "invert(36%) sepia(89%) saturate(6799%) hue-rotate(336deg) brightness(100%) contrast(101%)"
                                            : "none",
                                    }}
                                />
                            </button>
                        </div>

                        {/* Extra Info */}
                        <ul className="list-unstyled text-muted mt-4">
                            <li><strong>Availability:</strong> {product.stock > 0 ? "In stock" : "Out of stock"}</li>
                            <li><strong>Shipping:</strong> Free – 1 to 2 days</li>
                            <li><strong>Brand:</strong> {product.brand}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetails;