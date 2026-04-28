import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const statusColors = {
    delivered: { bg: "#d1fae5", text: "#065f46" },
    processing: { bg: "#fef3c7", text: "#92400e" },
    shipped: { bg: "#dbeafe", text: "#1e40af" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
    pending: { bg: "#ede9fe", text: "#5b21b6" },
};

const statusIcons = {
    delivered: "✓",
    processing: "⏳",
    shipped: "🚚",
    cancelled: "✕",
    pending: "◷",
};

const STYLES = `
@keyframes db-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
.db2-page { min-height: 100vh; background: #f7f7f7; padding: 32px 16px; font-family: 'Segoe UI', sans-serif; }
.db2-wrap { max-width: 760px; margin: 0 auto; }
.db2-greeting { animation: db-fadeUp .4s ease both; margin-bottom: 24px; }
.db2-greeting h1 { font-size: 22px; font-weight: 600; color: #111; margin: 0 0 4px; }
.db2-greeting h1 span { color: #e53935; }
.db2-greeting p { font-size: 14px; color: #888; margin: 0; }
.db2-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.db2-stat { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 16px; animation: db-fadeUp .4s ease both; }
.db2-stat__label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 6px; }
.db2-stat__val { font-size: 24px; font-weight: 600; color: #111; margin: 0; }
.db2-stat__val.red { color: #e53935; }
.db2-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1.5px solid #e5e5e5; }
.db2-tab { font-size: 13px; padding: 10px 18px; border: none; background: transparent; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1.5px; font-family: inherit; transition: color .2s; }
.db2-tab.active { color: #e53935; border-bottom-color: #e53935; font-weight: 600; }
.db2-tab:hover:not(.active) { color: #555; }
.db2-section-title { font-size: 12px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 14px; }
.db2-order { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; margin-bottom: 10px; overflow: hidden; animation: db-fadeUp .4s ease both; transition: box-shadow .2s; }
.db2-order:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.db2-order__row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
.db2-order__left { display: flex; align-items: center; gap: 10px; }
.db2-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
.db2-order__id { font-size: 12px; color: #aaa; }
.db2-order__right { display: flex; align-items: center; gap: 8px; }
.db2-order__amount { font-size: 14px; font-weight: 600; color: #111; }
.db2-order__arrow { font-size: 18px; color: #ccc; display: inline-block; transition: transform .2s; }
.db2-order__arrow.open { transform: rotate(90deg); color: #e53935; }
.db2-order__body { background: #fafafa; border-top: 0.5px solid #f0f0f0; max-height: 0; overflow: hidden; transition: max-height .3s ease; }
.db2-order__body.open { max-height: 400px; }
.db2-items { padding: 12px 16px; }
.db2-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid #f0f0f0; }
.db2-item:last-child { border-bottom: none; }
.db2-item__img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #eee; flex-shrink: 0; }
.db2-item__name { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
.db2-item__meta { font-size: 11px; color: #aaa; margin: 0; }
.db2-item__total { margin-left: auto; font-size: 13px; font-weight: 600; color: #111; }
.db2-order__footer { padding: 10px 16px; display: flex; gap: 16px; font-size: 12px; color: #aaa; border-top: 0.5px solid #f0f0f0; }
.db2-empty { text-align: center; padding: 40px; color: #aaa; }
.db2-empty p { font-size: 14px; margin: 8px 0 0; }
.db2-profile { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 20px; animation: db-fadeUp .4s ease both; }
.db2-profile__top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 0.5px solid #f0f0f0; }
.db2-profile__avatar { width: 52px; height: 52px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600; flex-shrink: 0; }
.db2-profile__name { font-size: 16px; font-weight: 600; color: #111; margin: 0 0 3px; }
.db2-profile__email { font-size: 13px; color: #aaa; margin: 0; }
.db2-profile__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.db2-profile__field label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 4px; }
.db2-profile__field p { font-size: 14px; font-weight: 500; color: #111; margin: 0; }
.db2-error { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.db2-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; color: #aaa; font-size: 14px; }
.db2-loader__ring { width: 32px; height: 32px; border: 2px solid #eee; border-top-color: #e53935; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 480px) {
    .db2-stats { grid-template-columns: 1fr; }
    .db2-profile__grid { grid-template-columns: 1fr; }
}
`;

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("orders");
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const headers = { Authorization: `Bearer ${token}` };
        api.get("/api/users/profile", { headers })
            .then((res) => {
                const userData = res.data;
                setUser(userData);
                if (userData.role === "admin") { navigate("/admin-dashboard"); return; }
                fetchMessages(userData.email);
                return api.get("/api/orders", { headers });
            })
            .then((res) => { if (res) setOrders(res.data); })
            .catch(() => setError("Something went wrong. Please try again."))
            .finally(() => setLoading(false));
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const fetchMessages = async (emailOverride) => {
        const email = emailOverride || user.email;
        if (!email) return;
        setMessagesLoading(true);
        try {
            const token = localStorage.getItem("token");
            const { data } = await api.get(`/api/messages/my?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data);
        } catch (e) {
            console.error("Messages fetch error:", e.response?.status, e.response?.data);
        }
        setMessagesLoading(false);
    };

    const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;

    if (loading) {
        return (
            <>
                <style>{STYLES}</style>
                <div className="db2-loader">
                    <div className="db2-loader__ring" />
                    <p>Loading your dashboard…</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{STYLES}</style>
            <div className="db2-page">
                <div className="db2-wrap">

                    {error && <div className="db2-error">⚠ {error}</div>}

                    {/* Greeting */}
                    <div className="db2-greeting">
                        <h1>Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋</h1>
                        <p>Here's what's happening with your orders</p>
                    </div>

                    {/* Stats */}
                    {/* Stats */}
                    <div className="db2-stats">
                        {[
                            { label: "Total Orders", value: orders.length },
                            { label: "Delivered", value: deliveredCount },
                            { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, red: true },
                        ].map((s, i) => (
                            <div key={s.label} className="db2-stat" style={{ animationDelay: `${i * 80}ms` }}>
                                <p className="db2-stat__label">{s.label}</p>
                                <p className={`db2-stat__val${s.red ? " red" : ""}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="db2-tabs">
                        {[
                            { id: "orders", label: "My Orders" },
                            { id: "messages", label: "Messages" },
                            { id: "profile", label: "Profile" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                className={`db2-tab ${activeTab === t.id ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab(t.id);
                                    if (t.id === "messages") fetchMessages();
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                        <button className="db2-tab" style={{ marginLeft: "auto", color: "#e53935" }} onClick={logout}>
                            Logout
                        </button>
                    </div>

                    {/* <div className="db2-stats">
                        {[
                            { label: "Total Orders", value: orders.length },
                            { label: "Delivered", value: deliveredCount },
                            { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, red: true },
                        ].map((s, i) => (
                            <div key={s.label} className="db2-stat" style={{ animationDelay: `${i * 80}ms` }}>
                                <p className="db2-stat__label">{s.label}</p>
                                <p className={`db2-stat__val${s.red ? " red" : ""}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    {/* <div className="db2-tabs">
                        {[{ id: "orders", label: "My Orders" }, { id: "profile", label: "Profile" }].map((t) => (
                            <button key={t.id} className={`db2-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                                {t.label}
                            </button>
                        ))}
                        <button className="db2-tab" style={{ marginLeft: "auto", color: "#e53935" }} onClick={logout}>
                            Logout
                        </button>
                    </div> */}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <section>
                            <p className="db2-section-title">My Orders</p>
                            {orders.length === 0 ? (
                                <div className="db2-empty">
                                    <div style={{ fontSize: 36 }}>📭</div>
                                    <p>No orders yet. Start shopping!</p>
                                </div>
                            ) : (
                                orders.map((order, i) => {
                                    const key = order.status?.toLowerCase();
                                    const color = statusColors[key] || { bg: "#f3f4f6", text: "#374151" };
                                    const icon = statusIcons[key] || "•";
                                    const isOpen = expandedOrder === order._id;
                                    return (
                                        <div key={order._id} className="db2-order" style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="db2-order__row" onClick={() => setExpandedOrder(isOpen ? null : order._id)}>
                                                <div className="db2-order__left">
                                                    <span className="db2-badge" style={{ background: color.bg, color: color.text }}>
                                                        {icon} {order.status}
                                                    </span>
                                                    <span className="db2-order__id">#{order._id?.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="db2-order__right">
                                                    <span className="db2-order__amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                                                    <span className={`db2-order__arrow ${isOpen ? "open" : ""}`}>›</span>
                                                </div>
                                            </div>
                                            <div className={`db2-order__body ${isOpen ? "open" : ""}`}>
                                                {order.items?.length > 0 ? (
                                                    <div className="db2-items">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="db2-item">
                                                                {item.image && <img src={item.image} alt={item.name} className="db2-item__img" />}
                                                                <div>
                                                                    <p className="db2-item__name">{item.name}</p>
                                                                    <p className="db2-item__meta">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each</p>
                                                                </div>
                                                                <p className="db2-item__total">₹{(item.quantity * item.price)?.toLocaleString("en-IN")}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="db2-items"><p style={{ color: "#aaa", fontSize: 13 }}>No item details available.</p></div>
                                                )}
                                                <div className="db2-order__footer">
                                                    {order.createdAt && <span>📅 {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                                                    {order.address && <span>📍 {order.address}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </section>
                    )}

                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <section>
                            <p className="db2-section-title">My Profile</p>
                            <div className="db2-profile">
                                <div className="db2-profile__top">
                                    <div className="db2-profile__avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                                    <div>
                                        <p className="db2-profile__name">{user.name || "—"}</p>
                                        <p className="db2-profile__email">{user.email || "—"}</p>
                                    </div>
                                </div>
                                <div className="db2-profile__grid">
                                    {[
                                        ["Phone", user.phone],
                                        ["Member Since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : null],
                                    ].map(([label, val]) => (
                                        <div key={label} className="db2-profile__field">
                                            <label>{label}</label>
                                            <p>{val || "—"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                    {activeTab === "messages" && (
                        <section>
                            <p className="db2-section-title">My Messages</p>
                            {messagesLoading ? (
                                <div className="db2-loader">
                                    <div className="db2-loader__ring" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="db2-empty">
                                    <div style={{ fontSize: 36 }}>💬</div>
                                    <p>No messages sent yet.</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg._id} className="db2-order" style={{ animationDelay: `${i * 60}ms`, marginBottom: 12 }}>
                                        {/* Message header */}
                                        <div style={{ padding: "13px 16px", borderBottom: "0.5px solid #f0f0f0" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 600, padding: "3px 9px",
                                                    borderRadius: 20,
                                                    background: msg.status === "replied" ? "#d1fae5" : msg.status === "read" ? "#dbeafe" : "#fef3c7",
                                                    color: msg.status === "replied" ? "#065f46" : msg.status === "read" ? "#1e40af" : "#92400e"
                                                }}>
                                                    {msg.status === "replied" ? "✓ Replied" : msg.status === "read" ? "👁 Read" : "● Unread"}
                                                </span>
                                                <span style={{ fontSize: 11, color: "#aaa" }}>
                                                    {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                            {/* Your message */}
                                            <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.6 }}>
                                                <span style={{ fontWeight: 600, color: "#111" }}>You: </span>{msg.message}
                                            </p>
                                        </div>

                                        {/* Admin reply */}
                                        {msg.adminReply ? (
                                            <div style={{ padding: "12px 16px", background: "#f0f7ff" }}>
                                                <p style={{ fontSize: 11, fontWeight: 600, color: "#185FA5", marginBottom: 5 }}>
                                                    💬 Admin Reply
                                                </p>
                                                <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.6 }}>
                                                    {msg.adminReply}
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ padding: "10px 16px", background: "#fafafa" }}>
                                                <p style={{ fontSize: 12, color: "#bbb", margin: 0, fontStyle: "italic" }}>
                                                    Awaiting reply from support…
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </section>
                    )}

                </div>
            </div>
        </>
    );
};

export default Dashboard;
