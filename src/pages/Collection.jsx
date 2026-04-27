import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Collection = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 100);
    }, []);

    return (
        <section style={{ minHeight: "100vh", background: "#f9f6f2", overflow: "hidden" }}>
            <style>{`
                @keyframes fadeDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .collection-card {
                    border-radius: 24px;
                    padding: 60px 32px;
                    color: #fff;
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.4s ease, box-shadow 0.4s ease;
                    position: relative;
                    overflow: hidden;
                }
                .collection-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
                    pointer-events: none;
                }
                .collection-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.2) !important;
                }
                .collection-card:hover .card-emoji {
                    animation: float 2s ease-in-out infinite;
                }
                .collection-card:hover .shop-btn {
                    background: rgba(255,255,255,0.4);
                    letter-spacing: 2px;
                }
                .shop-btn {
                    display: inline-block;
                    background: rgba(255,255,255,0.25);
                    padding: 12px 28px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    letter-spacing: 1px;
                    border: 1.5px solid rgba(255,255,255,0.4);
                }
                .collection-title {
                    font-size: 30px;
                    font-weight: 700;
                    margin: 16px 0 8px;
                    animation: fadeUp 0.6s ease forwards;
                }
                .card-emoji {
                    font-size: 64px;
                    display: block;
                    transition: transform 0.3s ease;
                }
                .page-title {
                    text-align: center;
                    font-weight: 800;
                    font-size: 36px;
                    margin-bottom: 8px;
                    animation: fadeDown 0.7s ease forwards;
                }
                .page-subtitle {
                    text-align: center;
                    color: #999;
                    margin-bottom: 48px;
                    font-size: 15px;
                    animation: fadeDown 0.9s ease forwards;
                }
                .summer-card {
                    background: linear-gradient(135deg, #eebc6b, #f09d4b, #e69c86);
                    box-shadow: 0 12px 40px rgba(249,168,37,0.35);
                }
                .winter-card {
                    background: linear-gradient(135deg, #81d4fa, #0288d1, #62b1ed);
                    box-shadow: 0 12px 40px rgba(2,136,209,0.35);
                }
                .badge-tag {
                    display: inline-block;
                    background: rgba(255,255,255,0.2);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    margin-bottom: 12px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .decorative-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.08);
                    pointer-events: none;
                }
            `}</style>

            {/* Hero Banner */}
            <div style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #546aa4 50%, #0f3460 100%)",
                padding: "80px 24px",
                textAlign: "center",
                color: "#fff",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
                <div style={{ position: "absolute", bottom: "-60px", right: "-30px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

                <div style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(-20px)",
                    transition: "all 0.8s ease"
                }}>
                    <p style={{
                        fontSize: "12px",
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        color: "#c7c0b6",
                        marginBottom: "12px",
                        fontWeight: 600
                    }}>
                        ✦ Curated For You ✦
                    </p>
                    <h1 style={{ fontSize: "48px", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
                        Shop by Collection
                    </h1>
                    <p style={{ opacity: 0.7, fontSize: "16px", maxWidth: "400px", margin: "0 auto" }}>
                        Discover styles crafted for every season
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div className="container py-5">
                <div className="row g-4" style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.9s ease 0.3s"
                }}>

                    {/* Summer Card */}
                    <div className="col-md-6">
                        <Link to="/collection/summer" style={{ textDecoration: "none" }}>
                            <div className="collection-card summer-card">
                                {/* Decorative circles */}
                                <div className="decorative-circle" style={{ width: "180px", height: "180px", top: "-60px", right: "-40px" }} />
                                <div className="decorative-circle" style={{ width: "100px", height: "100px", bottom: "20px", left: "-30px" }} />

                                <span className="badge-tag">New Season</span>
                                <span className="card-emoji">☀️</span>
                                <h3 className="collection-title">Summer Collection</h3>
                                <p style={{ opacity: 0.85, margin: "0 0 24px", fontSize: "15px" }}>
                                    Light, breezy & vibrant styles
                                </p>
                                <div className="shop-btn">Explore Now →</div>
                            </div>
                        </Link>
                    </div>

                    {/* Winter Card */}
                    <div className="col-md-6">
                        <Link to="/collection/winter" style={{ textDecoration: "none" }}>
                            <div className="collection-card winter-card">
                                {/* Decorative circles */}
                                <div className="decorative-circle" style={{ width: "180px", height: "180px", top: "-60px", left: "-40px" }} />
                                <div className="decorative-circle" style={{ width: "100px", height: "100px", bottom: "20px", right: "-30px" }} />

                                <span className="badge-tag">Trending Now</span>
                                <span className="card-emoji">❄️</span>
                                <h3 className="collection-title">Winter Collection</h3>
                                <p style={{ opacity: 0.85, margin: "0 0 24px", fontSize: "15px" }}>
                                    Warm, cozy & stylish picks
                                </p>
                                <div className="shop-btn">Explore Now →</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Bottom tagline */}
                <div style={{
                    textAlign: "center",
                    marginTop: "48px",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 1.2s ease 0.6s"
                }}>
                    <p style={{ color: "#bbb", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase" }}>
                        ✦ New arrivals added every week ✦
                    </p>
                </div>
            </div>
        </section>
    );
};
export default Collection;