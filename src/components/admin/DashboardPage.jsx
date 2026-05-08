import React, { useEffect, useState } from "react";
import api from "../../api";
import PageHeader from "./PageHeader";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS = {
    delivered: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    processing: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    shipped: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
    packed: { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
};

const Badge = ({ status = "" }) => {
    const s = STATUS_COLORS[status.toLowerCase()] || { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
            background: s.bg, color: s.color
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
            {status}
        </span>
    );
};

const BarChart = ({ data = [] }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginTop: 8 }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, color: "#aaa" }}>
                        {d.value > 0 ? `₹${(d.value / 1000).toFixed(0)}k` : ""}
                    </span>
                    <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        background: `rgba(229,57,53,${0.2 + 0.8 * (d.value / max)})`,
                        height: `${Math.max(4, (d.value / max) * 60)}px`,
                        transition: `height 0.8s ${i * 80}ms cubic-bezier(.4,0,.2,1)`,
                    }} />
                    <span style={{ fontSize: 10, color: "#bbb" }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const DonutChart = ({ segments = [], size = 80 }) => {
    const r = 32, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    let offset = 0;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth="12"
                style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
            {segments.map((seg, i) => {
                const dash = (seg.value / total) * circ;
                const el = (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={seg.color} strokeWidth="12"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-offset}
                        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 1s ease" }}
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
};

const STYLES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.dv2-row2 { display:grid; grid-template-columns:1.8fr 1fr; gap:14px; margin-top:14px; }
.dv2-row3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:20px; }
.dv2-panel { background:#fff; border:1px solid #e8e8e8; border-radius:12px; padding:18px 20px; animation:fadeUp .45s ease both; }
.dv2-panel-title { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.6px; color:#bbb; margin:0 0 14px; }
.dv2-order-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:0.5px solid #f5f5f5; font-size:13px; }
.dv2-order-row:last-child { border-bottom:none; }
.dv2-avatar { width:30px; height:30px; border-radius:50%; background:#fce8e8; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:600; color:#e53935; flex-shrink:0; }
.dv2-quick { display:flex; gap:8px; margin-top:16px; padding-top:14px; border-top:0.5px solid #f5f5f5; }
.dv2-quick-item { flex:1; text-align:center; }
@media(max-width:860px){ .dv2-row2{grid-template-columns:1fr;} .dv2-row3{grid-template-columns:1fr 1fr;} }
@media(max-width:480px){ .dv2-row3{grid-template-columns:1fr;} }
`;

const DashboardPage = ({ toggleSidebar, sidebarOpen }) => {
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 });
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");
    const h = { headers: { Authorization: `Bearer ${token}` } };
    const [lowStockItems, setLowStockItems] = useState([]);
    const [threshold, setThreshold] = useState(5);

    useEffect(() => {
        api.get("/api/admin/dashboard", h)
            .then(res => setStats(res.data))
            .catch(() => { });

        api.get("/api/orders", h)
            .then(res => setOrders(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });

        api.get("/api/users/admin/users", h)
            .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });

        api.get("/api/settings")
            .then(res => {
                const t = res.data.lowStockThreshold ?? 5;
                setThreshold(t);
                return api.get("/api/products");
            })
            .then(res => {
                const products = Array.isArray(res.data) ? res.data : [];
                const low = [];
                products.forEach(p => {
                    p.variants?.forEach((v, idx) => {
                        if (v.stock <= threshold) {
                            low.push({
                                productId: p._id,
                                productName: p.name,
                                color: v.attributes?.color || "—",
                                size: v.attributes?.size || "—",
                                stock: v.stock,
                                variantIndex: idx,
                            });
                        }
                    });
                });
                setLowStockItems(low.sort((a, b) => a.stock - b.stock));
            })
            .catch(() => { });
    }, []);

    const now = new Date();

    const monthlyRevenue = Array(6).fill(0).map((_, i) => {
        const m = (now.getMonth() - 5 + i + 12) % 12;
        const yr = now.getFullYear() - (now.getMonth() - 5 + i < 0 ? 1 : 0);
        const val = orders
            .filter(o => {
                const d = new Date(o.createdAt);
                return d.getMonth() === m && d.getFullYear() === yr && o.status?.toLowerCase() !== "cancelled";
            })
            .reduce((s, o) => s + (o.totalAmount || o.amount || 0), 0);
        return { label: MONTHS[m], value: val };
    });

    const statusCounts = orders.reduce((acc, o) => {
        const k = o.status || "Unknown";
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});

    const donutSegments = [
        { label: "Processing", value: statusCounts["Processing"] || 0, color: "#f59e0b" },
        { label: "Shipped", value: statusCounts["Shipped"] || 0, color: "#3b82f6" },
        { label: "Delivered", value: statusCounts["Delivered"] || 0, color: "#10b981" },
        { label: "Cancelled", value: statusCounts["Cancelled"] || 0, color: "#ef4444" },
        { label: "Packed", value: statusCounts["Packed"] || 0, color: "#8b5cf6" },
    ].filter(s => s.value > 0);

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

    const todayOrders = orders.filter(o =>
        new Date(o.createdAt).toDateString() === now.toDateString()
    ).length;

    const todayRevenue = orders
        .filter(o => new Date(o.createdAt).toDateString() === now.toDateString() && o.status?.toLowerCase() !== "cancelled")
        .reduce((s, o) => s + (o.totalAmount || o.amount || 0), 0);

    return (
        <div className="page">
            <style>{STYLES}</style>
            <PageHeader
                title="Admin Dashboard"
                subtitle="Overview of your store performance"
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            {/* existing stat cards — untouched */}
            <div className="stats-grid">
                <div className="stat-card">Total Products: {stats.totalProducts}</div>
                <div className="stat-card">Total Orders: {stats.totalOrders}</div>
                <div className="stat-card">Total Users: {stats.totalUsers}</div>
                <div className="stat-card">Revenue: ₹{stats.revenue}</div>
            </div>

            {/* ── Today snapshot ── */}
            <div className="dv2-row3">
                {[
                    { label: "Today's Orders", value: todayOrders, color: "#e53935" },
                    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString("en-IN")}`, color: "#10b981" },
                    { label: "Pending Orders", value: statusCounts["Processing"] || 0, color: "#f59e0b" },
                ].map((s, i) => (
                    <div className="dv2-panel" key={s.label}
                        style={{ animationDelay: `${i * 60}ms`, textAlign: "center" }}>
                        <p style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: ".6px", margin: "0 0 6px" }}>{s.label}</p>
                        <p style={{ fontSize: 26, fontWeight: 600, color: s.color, margin: 0 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Revenue chart + Order status donut ── */}
            <div className="dv2-row2">
                <div className="dv2-panel" style={{ animationDelay: "120ms" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p className="dv2-panel-title" style={{ margin: 0 }}>Revenue — Last 6 Months</p>
                        <span style={{ fontSize: 11, color: "#aaa" }}>₹{Number(stats.revenue).toLocaleString("en-IN")}</span>
                    </div>
                    <BarChart data={monthlyRevenue} />
                </div>

                <div className="dv2-panel" style={{ animationDelay: "160ms" }}>
                    <p className="dv2-panel-title">Order Status</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <DonutChart segments={donutSegments} size={80} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                            {donutSegments.length === 0
                                ? <span style={{ fontSize: 12, color: "#ccc" }}>No data</span>
                                : donutSegments.map(s => (
                                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: "#555", flex: 1 }}>{s.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>{s.value}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recent Orders + Recent Users ── */}
            <div className="dv2-row2" style={{ marginBottom: 24 }}>
                <div className="dv2-panel" style={{ animationDelay: "200ms" }}>
                    <p className="dv2-panel-title">Recent Orders</p>
                    {recentOrders.length === 0
                        ? <p style={{ fontSize: 13, color: "#ccc" }}>No orders yet.</p>
                        : recentOrders.map((o, i) => {
                            const name = o.user?.name || o.userId?.name || "Customer";
                            return (
                                <div className="dv2-order-row" key={o._id}
                                    style={{ animation: `fadeUp .4s ${220 + i * 50}ms ease both` }}>
                                    <div className="dv2-avatar">{initials(name)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: "#bbb" }}>
                                            #{o._id?.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600 }}>
                                            ₹{(o.totalAmount || o.amount || 0).toLocaleString("en-IN")}
                                        </p>
                                        <Badge status={o.status} />
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                {lowStockItems.length > 0 && (
                    <div className="dv2-panel" style={{ marginTop: 14, animationDelay: "280ms" }}>
                        <p className="dv2-panel-title" style={{ color: "#ef4444" }}>
                            ⚠ Low Stock Alert ({lowStockItems.length} variants)
                        </p>
                        {lowStockItems.map((item, i) => (
                            <div className="dv2-order-row" key={i}>
                                <div className="dv2-avatar" style={{ background: "#fee2e2", color: "#dc2626" }}>
                                    📦
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{item.productName}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: "#bbb" }}>
                                        {item.color} / {item.size}
                                    </p>
                                </div>
                                <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: item.stock === 0 ? "#dc2626" : "#f59e0b",
                                    background: item.stock === 0 ? "#fee2e2" : "#fef3c7",
                                    padding: "3px 10px", borderRadius: 20
                                }}>
                                    {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="dv2-panel" style={{ animationDelay: "240ms" }}>
                    <p className="dv2-panel-title">Recent Users</p>
                    {recentUsers.length === 0
                        ? <p style={{ fontSize: 13, color: "#ccc" }}>No users yet.</p>
                        : recentUsers.map((u, i) => (
                            <div className="dv2-order-row" key={u._id}
                                style={{ animation: `fadeUp .4s ${260 + i * 50}ms ease both` }}>
                                <div className="dv2-avatar" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                                    {initials(u.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || "—"}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: "#bbb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</p>
                                </div>
                                <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}>
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                                </span>
                            </div>
                        ))
                    }

                    <div className="dv2-quick">
                        {[
                            { label: "Delivered", value: statusCounts["Delivered"] || 0, color: "#10b981" },
                            { label: "Shipped", value: statusCounts["Shipped"] || 0, color: "#3b82f6" },
                            { label: "Cancelled", value: statusCounts["Cancelled"] || 0, color: "#ef4444" },
                        ].map(q => (
                            <div className="dv2-quick-item" key={q.label}>
                                <p style={{ fontSize: 18, fontWeight: 600, color: q.color, margin: 0 }}>{q.value}</p>
                                <p style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: ".4px", margin: "2px 0 0" }}>{q.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;