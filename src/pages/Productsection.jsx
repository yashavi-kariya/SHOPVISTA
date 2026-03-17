import React from "react";
import { useCart } from "../context/CartContext";

// Import Product Images
import p1 from "../assets/img/product/person_1.jpg";
import p2 from "../assets/img/product/person_2.jpg";
import p3 from "../assets/img/product/children.jpg";
import p4 from "../assets/img/product/bag.jpg";
import p5 from "../assets/img/product/about_1.jpg";
import p6 from "../assets/img/product/about_1.png";
import p7 from "../assets/img/product/model_7.png";
import p8 from "../assets/img/product/model_5.png";

// Import Icons
import heart from "../assets/img/icon/heart.png";
import compare from "../assets/img/icon/compare.png";
import search from "../assets/img/icon/search.png";

const Product = () => {
    const { addToCart } = useCart();

    const productData = [
        { id: 1, title: "Spectacles", price: 999, img: p1, category: "new-arrivals", label: "New", rating: 0 },
        { id: 2, title: "Piqué Biker Jacket", price: 67.24, img: p2, category: "hot-sales", rating: 0 },
        { id: 3, title: "Multi-pocket Chest Bag", price: 43.48, img: p3, category: "new-arrivals", label: "Sale", rating: 4 },
        { id: 4, title: "Bag", price: 2699, img: p4, category: "hot-sales", rating: 0 },
        { id: 5, title: "Leather Backpack", price: 31.37, img: p5, category: "new-arrivals", rating: 0 },
        { id: 6, title: "Ankle Boots", price: 98.49, img: p6, category: "hot-sales", label: "Sale", rating: 4 },
        { id: 7, title: "T-shirt Contrast Pocket", price: 49.66, img: p7, category: "new-arrivals", rating: 0 },
        { id: 8, title: "Basic Flowing Scarf", price: 26.28, img: p8, category: "hot-sales", rating: 0 },
    ];

    return (
        <section className="product spad">
            <div className="container">

                {/* Header Filters */}
                <div className="row">
                    <div className="col-lg-12">
                        <ul className="filter__controls">
                            <li className="active" data-filter="*">Best Sellers</li>
                            <li className="active" data-filter=".new-arrivals">New Arrivals</li>
                            <li className="active" data-filter=".hot-sales">Hot Sales</li>
                        </ul>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="row product__filter">
                    {productData.map((product) => (
                        <div
                            key={product.id}
                            className={`col-lg-3 col-md-6 col-sm-6 mix ${product.category}`}
                        >
                            <div className={`product__item ${product.label ? "sale" : ""}`}>

                                {/* Product Image */}
                                <div
                                    className="product__item__pic"
                                    style={{ backgroundImage: `url(${product.img})` }}
                                >
                                    {product.label && <span className="label">{product.label}</span>}

                                    <ul className="product__hover">
                                        <li><a><img src={heart} alt="heart" /></a></li>
                                        <li>
                                            <a>
                                                <img src={compare} alt="compare" /> <span>Compare</span>
                                            </a>
                                        </li>
                                        <li><a><img src={search} alt="search" /></a></li>
                                    </ul>
                                </div>

                                {/* Product Text */}
                                <div className="product__item__text">
                                    <h6>{product.title}</h6>

                                    {/* ✅ WORKING ADD TO CART BUTTON */}
                                    <button
                                        className="add-cart"
                                        onClick={() => addToCart(product)}
                                    >
                                        + Add To Cart
                                    </button>

                                    {/* Stars */}
                                    {/* <div className="rating">
                                        {[...Array(5)].map((_, index) => (
                                            <i
                                                key={index}
                                                className={`fa ${index < product.rating ? "fa-star" : "fa-star-o"}`}
                                            ></i>
                                        ))}
                                    </div> */}

                                    <h5>Rs.{product.price}</h5>

                                    <div className="product__color__select">
                                        <label><input type="radio" /></label>
                                        <label className="active black"><input type="radio" /></label>
                                        <label className="grey"><input type="radio" /></label>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Product;