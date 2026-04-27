import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// import api from "api";
import api from "../api";

const CollectionProducts = () => {
    const { type } = useParams(); // "summer" or "winter"
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get(
                    `/api/products?collection=${type}`
                );
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [type]);

    const config = {
        summer: { emoji: "☀️", title: "Summer Collection", color: "#e67e22", bg: "#fff8f0" },
        winter: { emoji: "❄️", title: "Winter Collection", color: "#2980b9", bg: "#f0f7ff" }
    };

    const { emoji, title, color, bg } = config[type] || config.summer;

    return (
        <section style={{ minHeight: "100vh", background: bg }}>
            {/* Banner */}
            <div style={{
                background: color,
                padding: "48px 24px",
                textAlign: "center",
                color: "#fff"
            }}>
                <h1 style={{ fontSize: "36px", margin: 0 }}>{emoji} {title}</h1>
                <p style={{ opacity: 0.85, marginTop: "8px" }}>
                    {products.length} products available
                </p>
            </div>

            <div className="container py-5">
                {loading && <p className="text-center">Loading...</p>}

                {!loading && products.length === 0 && (
                    <div className="text-center py-5">
                        <h4>No products in this collection yet.</h4>
                        <Link to="/shop" className="btn btn-dark mt-3">
                            Browse All Products
                        </Link>
                    </div>
                )}

                <div className="row g-4">
                    {products.map(p => (
                        <div key={p._id} className="col-6 col-md-4 col-lg-3">
                            <Link to={`/product/${p._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <img
                                        src={p.img || "/placeholder.png"}
                                        alt={p.name}
                                        className="card-img-top rounded-top-4"
                                        style={{ height: "220px", objectFit: "cover" }}
                                        onError={e => e.target.src = "/placeholder.png"}
                                    />
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-1">{p.name}</h6>
                                        <p className="text-muted small mb-0">{p.category}</p>
                                        <p className="fw-semibold mt-1">
                                            ₹{p.variants?.[0]?.price || p.price || 0}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
export default CollectionProducts;