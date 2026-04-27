// const OrderSuccess = () => {
//     return (
//         <div className="container text-center mt-5">
//             <h2>🎉 Order Placed Successfully!</h2>
//             <p>Thank you for shopping with us.</p>
//         </div>
//     );
// };

// export default OrderSuccess;

import React, { useEffect, useState } from "react";
// import api from "api";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const statusConfig = {
    Processing: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: "⚙️", label: "Processing" },
    Shipped: { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", icon: "🚚", label: "Shipped" },
    Delivered: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: "✅", label: "Delivered" },
    Cancelled: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "❌", label: "Cancelled" },
    Packed: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: "📦", label: "Packed" },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("http://localhost:3001/api/orders/my", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setCancellingId(orderId);
        try {
            const token = localStorage.getItem("token");
            await api.put(
                `http://localhost:3001/api/orders/${orderId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev =>
                prev.map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o));
        } catch (err) {
            alert("Failed to cancel order. Please try again.");
        } finally {
            setCancellingId(null);
        }
    };

    const filteredOrders = filterStatus === "all"
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <section style={{ minHeight: "100vh", background: "#f8f7f4", paddingBottom: "60px" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

                .orders-page * { font-family: 'DM Sans', sans-serif; }
                .orders-page h1, .orders-page h2 { font-family: 'Playfair Display', serif; }

                .order-card {
                    background: #fff;
                    border-radius: 16px;
                    border: 1.5px solid #ede9e3;
                    margin-bottom: 20px;
                    overflow: hidden;
                    transition: box-shadow 0.25s ease, transform 0.25s ease;
                    animation: slideUp 0.4s ease both;
                }
                .order-card:hover {
                    box-shadow: 0 8px 32px rgba(0,0,0,0.09);
                    transform: translateY(-2px);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .order-card:nth-child(1) { animation-delay: 0.05s; }
                .order-card:nth-child(2) { animation-delay: 0.10s; }
                .order-card:nth-child(3) { animation-delay: 0.15s; }
                .order-card:nth-child(4) { animation-delay: 0.20s; }
                .order-card:nth-child(5) { animation-delay: 0.25s; }

                .order-header {
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    user-select: none;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .order-items-preview {
                    padding: 0 24px 20px;
                    border-top: 1px solid #f0ece5;
                    animation: expandIn 0.3s ease;
                }
                @keyframes expandIn {
                    from { opacity: 0; transform: scaleY(0.95); }
                    to   { opacity: 1; transform: scaleY(1); }
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px dashed #ede9e3;
                    gap: 12px;
                }
                .item-row:last-child { border-bottom: none; }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1.5px solid;
                }

                .filter-btn {
                    padding: 7px 18px;
                    border-radius: 999px;
                    border: 1.5px solid #ddd;
                    background: #fff;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'DM Sans', sans-serif;
                }
                .filter-btn:hover { border-color: #222; background: #f8f7f4; }
                .filter-btn.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }

                .cancel-btn {
                    padding: 8px 18px;
                    border-radius: 8px;
                    border: 1.5px solid #fca5a5;
                    background: #fef2f2;
                    color: #dc2626;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'DM Sans', sans-serif;
                }
                .cancel-btn:hover { background: #fee2e2; border-color: #f87171; }
                .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .accordion-arrow {
                    transition: transform 0.3s ease;
                    font-size: 12px;
                    color: #999;
                }
                .accordion-arrow.open { transform: rotate(180deg); }

                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    animation: slideUp 0.5s ease;
                }
                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .skeleton {
                    background: linear-gradient(90deg, #f0ece5 25%, #e8e3dc 50%, #f0ece5 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 8px;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .page-header {
                    background: #1a1a1a;
                    padding: 40px 0 32px;
                    margin-bottom: 40px;
                    animation: fadeIn 0.5s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; } to { opacity: 1; }
                }

                .summary-strip {
                    background: #fff;
                    border-top: 1px solid #f0ece5;
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-size: 14px;
                }

                @media (max-width: 576px) {
                    .order-header { padding: 16px; }
                    .order-items-preview { padding: 0 16px 16px; }
                    .summary-strip { padding: 12px 16px; }
                    .order-meta { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
                }
            `}</style>

            <div className="orders-page">
                {/* PAGE HEADER */}
                <div className="page-header">
                    <div className="container">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <h1 style={{ color: "#fff", margin: 0, fontSize: "clamp(24px, 4vw, 32px)" }}>My Orders</h1>
                                <p style={{ color: "#999", margin: "4px 0 0", fontSize: "14px" }}>
                                    {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                                </p>
                            </div>
                            <Link to="/shop" style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                background: "#fff", color: "#1a1a1a", padding: "10px 20px",
                                borderRadius: "8px", fontWeight: "600", fontSize: "14px",
                                textDecoration: "none", transition: "opacity 0.2s"
                            }}>
                                🛍️ Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="container">
                    {/* FILTER TABS */}
                    {!loading && orders.length > 0 && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
                            {["all", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"].map(s => (
                                <button
                                    key={s}
                                    className={`filter-btn ${filterStatus === s ? "active" : ""}`}
                                    onClick={() => setFilterStatus(s)}
                                >
                                    {s === "all" ? "All Orders" : statusConfig[s]?.icon + " " + statusConfig[s]?.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* LOADING SKELETONS */}
                    {loading && (
                        <div>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", border: "1.5px solid #ede9e3" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div className="skeleton" style={{ width: "160px", height: "16px", marginBottom: "10px" }} />
                                            <div className="skeleton" style={{ width: "100px", height: "13px" }} />
                                        </div>
                                        <div className="skeleton" style={{ width: "90px", height: "30px", borderRadius: "999px" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && filteredOrders.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h2 style={{ color: "#1a1a1a", marginBottom: "8px" }}>
                                {filterStatus === "all" ? "No orders yet" : `No ${filterStatus} orders`}
                            </h2>
                            <p style={{ color: "#888", marginBottom: "24px" }}>
                                {filterStatus === "all"
                                    ? "You haven't placed any orders. Start shopping!"
                                    : `You have no ${filterStatus} orders right now.`}
                            </p>
                            {filterStatus !== "all" ? (
                                <button className="filter-btn active" onClick={() => setFilterStatus("all")}>
                                    View All Orders
                                </button>
                            ) : (
                                <Link to="/shop" style={{
                                    display: "inline-block", background: "#1a1a1a", color: "#fff",
                                    padding: "12px 28px", borderRadius: "8px", fontWeight: "600",
                                    textDecoration: "none", fontSize: "15px"
                                }}>
                                    Shop Now
                                </Link>
                            )}
                        </div>
                    )}

                    {/* ORDER CARDS */}
                    {!loading && filteredOrders.map((order, idx) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        const isExpanded = expandedOrder === order._id;
                        const canCancel = ["Pending", "Processing"].includes(order.status);

                        return (
                            <div className="order-card" key={order._id} style={{ animationDelay: `${idx * 0.06}s` }}>

                                {/* CARD HEADER — clickable to expand */}
                                <div className="order-header" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                                        {/* Order icon */}
                                        <div style={{
                                            width: "44px", height: "44px", borderRadius: "12px",
                                            background: status.bg, border: `1.5px solid ${status.border}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "20px", flexShrink: 0
                                        }}>
                                            {status.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: "600", fontSize: "15px", color: "#1a1a1a" }}>
                                                Order #{order._id?.slice(-8).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
                                                {formatDate(order.createdAt)} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span
                                            className="status-badge"
                                            style={{ color: status.color, background: status.bg, borderColor: status.border }}
                                        >
                                            {status.label}
                                        </span>
                                        <span style={{ fontWeight: "700", fontSize: "16px", color: "#1a1a1a" }}>
                                            Rs.{order.totalPrice?.toFixed(2)}
                                        </span>
                                        <span className={`accordion-arrow ${isExpanded ? "open" : ""}`}>▼</span>
                                    </div>
                                </div>
                                {/* EXPANDED DETAILS */}
                                {isExpanded && (
                                    <>
                                        <div className="order-items-preview">
                                            <p style={{ fontWeight: "600", fontSize: "13px", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 8px" }}>
                                                Items Ordered
                                            </p>
                                            {order.items?.map((item, i) => (
                                                <div className="item-row" key={i}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <img
                                                            src={item.product?.img || "/placeholder.png"}
                                                            alt={item.product?.name}
                                                            style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ede9e3" }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>
                                                                {item.product?.name || "Product"}
                                                            </div>
                                                            <div style={{ fontSize: "13px", color: "#888" }}>
                                                                Qty: {item.quantity} × Rs.{(item.price || item.product?.price || 0).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontWeight: "600", color: "#1a1a1a", fontSize: "14px", flexShrink: 0 }}>
                                                        Rs.{((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* SUMMARY STRIP */}
                                        <div className="summary-strip">
                                            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                                                <span style={{ color: "#888" }}>
                                                    📍 {order.billing?.city}, {order.billing?.state}
                                                </span>
                                                {order.coupon && (
                                                    <span style={{ color: "#16a34a", fontWeight: "600" }}>
                                                        🎟️ {order.coupon}
                                                    </span>
                                                )}
                                                {order.discount > 0 && (
                                                    <span style={{ color: "#16a34a" }}>
                                                        💰 Saved Rs.{order.discount?.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {canCancel && (
                                                <button
                                                    className="cancel-btn"
                                                    onClick={(e) => { e.stopPropagation(); cancelOrder(order._id); }}
                                                    disabled={cancellingId === order._id}
                                                >
                                                    {cancellingId === order._id ? "Cancelling..." : "✖ Cancel Order"}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Orders;