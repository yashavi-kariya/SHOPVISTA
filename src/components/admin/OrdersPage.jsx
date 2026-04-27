import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";

const OrdersPage = ({ token, toggleSidebar, sidebarOpen }) => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {

            try {
                const res = await api.get("http://localhost:3001/api/orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Orders fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);
    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(
                `http://localhost:3001/api/orders/${orderId}/status`,  // ← verify this matches your backend route
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev =>
                prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
            );
        } catch (err) {
            console.error("Update error:", err.response?.data || err.message); // ← add this to see exact error
            alert("Failed to update status");
        }
    };
    const filtered = orders
        .filter(o => {
            const q = search.toLowerCase();
            const userId = o.userId?._id || o.userId || "";
            const userName = o.userId?.name || o.userName || "";
            return !q || userId.toLowerCase().includes(q) || userName.toLowerCase().includes(q) || o._id.toLowerCase().includes(q);
        })
        .filter(o => statusFilter === "all" || o.status === statusFilter)
        .sort((a, b) => {
            if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sort === "highest") return b.amount - a.amount;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const stats = [
        ["Total orders", orders.length],
        ["Delivered", orders.filter(o => o.status === "Delivered").length],
        ["Processing", orders.filter(o => o.status === "Processing").length],
        ["Revenue", `₹${orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.amount || 0), 0).toLocaleString("en-IN")}`],
    ];

    const STATUS_MAP = {
        Delivered: { bg: "#dcfce7", color: "#166534", dot: "#16a34a", label: "Delivered" },
        Processing: { bg: "#fef9c3", color: "#854d0e", dot: "#ca8a04", label: "Processing" },
        Shipped: { bg: "#dbeafe", color: "#1e40af", dot: "#2563eb", label: "Shipped" },
        Cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#dc2626", label: "Cancelled" },
        Packed: { bg: "#ede9fe", color: "#5b21b6", dot: "#7c3aed", label: "Packed" },
    };

    const Badge = ({ status }) => {
        const s = STATUS_MAP[status] || STATUS_MAP.processing;
        return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                {s.label}
            </span>
        );
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const STATUSES = ["Processing", "Packed", "Shipped", "Delivered", "Cancelled"];
    return (
        <div className="page">
            <style>{`
                .op-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;}
                .op-stat{background:#f5f5f5;border-radius:8px;padding:14px 16px;}
                .op-stat-label{font-size:12px;color:#888;margin-bottom:4px;}
                .op-stat-val{font-size:22px;font-weight:500;}
                .op-toolbar{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center;}
                .op-toolbar input,.op-toolbar select{padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;color:#111;outline:none;}
                .op-toolbar input{flex:1;min-width:160px;}
                .op-desktop{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;}
                .op-th{display:grid;grid-template-columns:2fr 2.5fr 1.5fr 1.2fr 1.5fr 1.4fr;padding:11px 16px;background:#f8f8f8;border-bottom:1px solid #f0f0f0;font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.06em;}
                .op-td{display:grid;grid-template-columns:2fr 2.5fr 1.5fr 1.2fr 1.5fr 1.4fr;padding:12px 16px;border-bottom:1px solid #f7f7f7;align-items:center;font-size:13px;}
                .op-td:last-child{border-bottom:none;}
                .op-td:hover{background:#fafafa;}
                .op-avatar{width:32px;height:32px;border-radius:50%;background:#f0e8ea;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:#6b2737;flex-shrink:0;}
                .op-prod-img{width:36px;height:36px;border-radius:6px;object-fit:cover;background:#f0f0f0;border:1px solid #eee;flex-shrink:0;}
                .op-btn{padding:5px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer;margin-right:4px;}
                .op-btn:hover{background:#f5f5f5;}
                .op-select{padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:11px;background:#fff;cursor:pointer;}
                .op-mobile{display:none;}
                .op-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:14px 16px;margin-bottom:10px;}
                .op-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
                .op-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;}
                .op-card-field label{font-size:11px;color:#aaa;display:block;margin-bottom:2px;}
                .op-card-field span{font-size:13px;font-weight:500;}
                .op-card-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f5f5f5;padding-top:10px;}
                @media(max-width:640px){.op-desktop{display:none;}.op-mobile{display:block;}.op-toolbar input{min-width:100px;}}
            `}</style>

            <PageHeader title="Orders" subtitle="All customer orders" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

            {/* Stats */}
            <div className="op-stats">
                {stats.map(([label, val]) => (
                    <div className="op-stat" key={label}>
                        <div className="op-stat-label">{label}</div>
                        <div className="op-stat-val">{val}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="op-toolbar">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user ID or name..." />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="Delivered">Delivered</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Packed">Packed</option>
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest amount</option>
                </select>
            </div>

            {loading && <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading orders...</p>}

            {/* Desktop Table */}
            {!loading && (
                <div className="op-desktop">
                    <div className="op-th">
                        <span>User</span><span>Product</span><span>Date</span>
                        <span>Amount</span><span>Status</span><span>Actions</span>
                    </div>
                    {filtered.length === 0 && (
                        <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No orders found.</p>
                    )}
                    {filtered.map(o => {
                        const userId = o.userId?._id || o.userId || "—";
                        const userName = o.userId?.name || o.userName || "User";
                        const items = o.items || o.products || [];
                        const firstItem = items[0] || {};
                        const productName = firstItem.productId?.name || firstItem.name || "Product";
                        const productImg = firstItem.productId?.images?.[0] || firstItem.productId?.img || firstItem.img || "";
                        const qty = firstItem.quantity || firstItem.qty || 1;

                        return (
                            <div className="op-td" key={o._id}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <div className="op-avatar">{initials(userName)}</div>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 13 }}>{userName}</div>
                                        <div style={{ fontSize: 11, color: "#aaa" }}>{typeof userId === "string" ? userId.slice(-6) : userId}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {productImg
                                        ? <img className="op-prod-img" src={productImg} alt="" onError={e => e.target.src = "/placeholder.png"} />
                                        : <div className="op-prod-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ccc" }}>IMG</div>
                                    }
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 500, maxWidth: 130, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{productName}</div>
                                        <div style={{ fontSize: 11, color: "#aaa" }}>Qty: {qty}{items.length > 1 ? ` +${items.length - 1} more` : ""}</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 13, color: "#888" }}>{fmtDate(o.createdAt || o.date)}</span>
                                <span style={{ fontWeight: 500, color: "#6b2737" }}>₹{(o.amount || o.totalAmount || 0).toLocaleString("en-IN")}</span>
                                <Badge status={o.status} />
                                <div>
                                    <select className="op-select" value={o.status}
                                        onChange={e => updateStatus(o._id, e.target.value)}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mobile Cards */}
            {!loading && (
                <div className="op-mobile">
                    {filtered.length === 0 && (
                        <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No orders found.</p>
                    )}
                    {filtered.map(o => {
                        const userId = o.userId?._id || o.userId || "—";
                        const userName = o.userId?.name || o.userName || "User";
                        const items = o.items || o.products || [];
                        const firstItem = items[0] || {};
                        const productName = firstItem.productId?.name || firstItem.name || "Product";
                        const productImg = firstItem.productId?.images?.[0] || firstItem.productId?.img || firstItem.img || "";
                        const qty = firstItem.quantity || firstItem.qty || 1;

                        return (
                            <div className="op-card" key={o._id}>
                                <div className="op-card-top">
                                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                        <div className="op-avatar">{initials(userName)}</div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: 13 }}>{userName}</div>
                                            <div style={{ fontSize: 11, color: "#aaa" }}>{typeof userId === "string" ? userId.slice(-6) : userId} · {o._id.slice(-6)}</div>
                                        </div>
                                    </div>
                                    <Badge status={o.status} />
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                                    {productImg
                                        ? <img src={productImg} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #eee" }} alt="" onError={e => e.target.src = "/placeholder.png"} />
                                        : <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ccc" }}>IMG</div>
                                    }
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{productName}</div>
                                        <div style={{ fontSize: 12, color: "#aaa" }}>Qty: {qty}{items.length > 1 ? ` +${items.length - 1} more` : ""}</div>
                                    </div>
                                </div>
                                <div className="op-card-grid">
                                    <div className="op-card-field"><label>Order date</label><span>{fmtDate(o.createdAt || o.date)}</span></div>
                                    <div className="op-card-field"><label>Amount</label><span style={{ color: "#6b2737" }}>₹{(o.amount || o.totalAmount || 0).toLocaleString("en-IN")}</span></div>
                                </div>
                                <div className="op-card-footer">
                                    <span style={{ fontSize: 12, color: "#bbb" }}>#{o._id.slice(-8)}</span>
                                    <select className="op-select" value={o.status}
                                        onChange={e => updateStatus(o._id, e.target.value)}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;