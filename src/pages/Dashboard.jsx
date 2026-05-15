import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const statusColors = {
    delivered: { bg: "#d1fae5", text: "#065f46" },
    processing: { bg: "#fef3c7", text: "#92400e" },
    confirmed: { bg: "#dbeafe", text: "#1e40af" },
    shipped: { bg: "#dbeafe", text: "#1e40af" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
    pending: { bg: "#ede9fe", text: "#5b21b6" },
    refunded: { bg: "#e0f2fe", text: "#0369a1" },
    returned: { bg: "#fce7f3", text: "#9d174d" },
    packed: { bg: "#ede9fe", text: "#5b21b6" },
};
const statusIcons = {
    delivered: "✓", processing: "⏳", confirmed: "✅",
    shipped: "🚚", cancelled: "✕", pending: "◷",
    refunded: "↩", returned: "↩", packed: "📦",
};
const RETURN_REASONS = ["Damaged", "Wrong Item", "Not as Described", "Size Issue", "Other"];
const CANCELLABLE_STATUSES = ["Processing", "Packed", "Shipped"];
const RETURNABLE_STATUS = "Delivered";

const STYLES = `
@keyframes db-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes modal-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes spin { to { transform: rotate(360deg); } }
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
.db2-order__body { background: #fafafa; border-top: 0.5px solid #f0f0f0; max-height: 0; overflow: hidden; transition: max-height .35s ease; }
.db2-order__body.open { max-height: 700px; }
.db2-items { padding: 12px 16px; }
.db2-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid #f0f0f0; }
.db2-item:last-child { border-bottom: none; }
.db2-item__img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #eee; flex-shrink: 0; }
.db2-item__name { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
.db2-item__meta { font-size: 11px; color: #aaa; margin: 0; }
.db2-item__total { margin-left: auto; font-size: 13px; font-weight: 600; color: #111; }
.db2-order__footer { padding: 10px 16px; display: flex; gap: 10px; font-size: 12px; color: #aaa; border-top: 0.5px solid #f0f0f0; flex-wrap: wrap; align-items: center; justify-content: space-between; }
.db2-footer-left { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #aaa; align-items: center; }
.db2-footer-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* Cancel button */
.db2-cancel-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1.5px solid #dc2626; background: #fff; color: #dc2626; cursor: pointer; transition: all .2s; }
.db2-cancel-btn:hover { background: #dc2626; color: #fff; }

/* Return button */
.db2-return-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e53935; background: #fff; color: #e53935; cursor: pointer; transition: all .2s; }
.db2-return-btn:hover { background: #e53935; color: #fff; }
.db2-return-btn:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; background: #fff; }

.db2-return-tag { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
.db2-return-tag.pending  { background: #fef3c7; color: #92400e; }
.db2-return-tag.approved { background: #d1fae5; color: #065f46; }
.db2-return-tag.rejected { background: #fee2e2; color: #991b1b; }

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

/* ── Cancel Confirm Modal ── */
.conf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.conf-modal { background: #fff; border-radius: 14px; padding: 24px; width: 100%; max-width: 380px; }
.conf-modal h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px; }
.conf-modal p { font-size: 13px; color: #888; margin: 0 0 18px; }
.conf-actions { display: flex; gap: 10px; }
.conf-confirm { flex: 1; padding: 10px; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.conf-confirm:hover { background: #b91c1c; }
.conf-back { flex: 1; padding: 10px; background: #f5f5f5; color: #555; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }

/* ── Return Modal ── */
.ret-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: 0; }
@media(min-width:540px) { .ret-overlay { align-items: center; padding: 16px; } }
.ret-modal { background: #fff; border-radius: 20px 20px 0 0; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; padding: 24px 20px 32px; animation: modal-in .25s ease both; position: relative; }
@media(min-width:540px) { .ret-modal { border-radius: 16px; } }
.ret-modal__title { font-size: 17px; font-weight: 700; color: #111; margin: 0 0 4px; }
.ret-modal__sub { font-size: 13px; color: #888; margin: 0 0 20px; }
.ret-close { position: absolute; top: 16px; right: 18px; background: none; border: none; font-size: 22px; color: #aaa; cursor: pointer; line-height: 1; }
.ret-section { margin-bottom: 18px; }
.ret-section label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 8px; }
.ret-item-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1.5px solid #f0f0f0; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: border-color .15s; }
.ret-item-row.selected { border-color: #e53935; background: #fff5f5; }
.ret-item-row img { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; background: #eee; flex-shrink: 0; }
.ret-item-row__info { flex: 1; min-width: 0; }
.ret-item-row__name { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ret-item-row__meta { font-size: 11px; color: #aaa; }
.ret-item-row__check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .15s; }
.ret-item-row.selected .ret-item-row__check { background: #e53935; border-color: #e53935; color: #fff; font-size: 10px; }
.ret-reason-select { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e5e5; border-radius: 10px; font-size: 13px; font-family: inherit; color: #111; background: #fff; outline: none; appearance: none; cursor: pointer; }
.ret-reason-select:focus { border-color: #e53935; }
.ret-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e5e5; border-radius: 10px; font-size: 13px; font-family: inherit; color: #111; resize: vertical; min-height: 80px; outline: none; box-sizing: border-box; }
.ret-textarea:focus { border-color: #e53935; }
.ret-submit { width: 100%; padding: 13px; background: #e53935; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background .2s; }
.ret-submit:hover { background: #c62828; }
.ret-submit:disabled { background: #ccc; cursor: not-allowed; }
.ret-error { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; }
.ret-success { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; text-align: center; font-weight: 600; }

@media (max-width: 480px) {
    .db2-stats { grid-template-columns: 1fr; }
    .db2-profile__grid { grid-template-columns: 1fr; }
}
`;
// ─── Cancel Confirm Modal ─────────────────────────────────────────────────────
const CancelModal = ({ order, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const submit = async () => {
        setLoading(true);
        await onConfirm(order._id);
        setLoading(false);
    };
    return (
        <div className="conf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="conf-modal">
                <h3>Cancel Order?</h3>
                <p>
                    Order #{order._id?.slice(-6).toUpperCase()} · ₹{order.totalAmount?.toLocaleString("en-IN")}<br />
                    This action cannot be undone.
                </p>
                <div className="conf-actions">
                    <button className="conf-back" onClick={onClose}>Go Back</button>
                    <button className="conf-confirm" onClick={submit} disabled={loading}>
                        {loading ? "Cancelling…" : "Yes, Cancel Order"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Return Request Modal ─────────────────────────────────────────────────────
const ReturnModal = ({ order, onClose, onSuccess }) => {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!reason) return setError("Please select a return reason.");
        setError("");
        setSubmitting(true);
        try {
            await api.put(`/api/orders/${order._id}/return`, { reason, description });
            setSuccess(true);
            setTimeout(() => { onSuccess(order._id); onClose(); }, 1800);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ret-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ret-modal">
                <button className="ret-close" onClick={onClose}>×</button>
                <p className="ret-modal__title">Request Return / Refund</p>
                <p className="ret-modal__sub">Order #{order._id?.slice(-6).toUpperCase()} · ₹{order.totalAmount?.toLocaleString("en-IN")}</p>

                {success && <div className="ret-success">✓ Return request submitted! We'll review it shortly.</div>}
                {error && <div className="ret-error">⚠ {error}</div>}

                {!success && (
                    <>
                        {/* Items preview (read-only for full-order return) */}
                        <div className="ret-section">
                            <label>Items in this order</label>
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="ret-item-row selected" style={{ cursor: "default" }}>
                                    {item.img && <img src={item.img} alt={item.name} onError={e => e.target.style.display = "none"} />}
                                    <div className="ret-item-row__info">
                                        <p className="ret-item-row__name">{item.name}</p>
                                        <p className="ret-item-row__meta">
                                            Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}
                                            {item.color && ` · ${item.color}`}
                                            {item.size && ` · ${item.size}`}
                                        </p>
                                    </div>
                                    <div className="ret-item-row__check" style={{ background: "#e53935", borderColor: "#e53935", color: "#fff", fontSize: 10 }}>✓</div>
                                </div>
                            ))}
                        </div>

                        <div className="ret-section">
                            <label>Return Reason</label>
                            <select className="ret-reason-select" value={reason} onChange={e => setReason(e.target.value)}>
                                <option value="">Select a reason…</option>
                                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div className="ret-section">
                            <label>Description (optional)</label>
                            <textarea className="ret-textarea" placeholder="Describe the issue in detail…" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <button className="ret-submit" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Submitting…" : "Submit Return Request"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("orders");
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [cancelModal, setCancelModal] = useState(null);   // order to cancel
    const [returnModal, setReturnModal] = useState(null);   // order to return
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        api.get("/api/users/profile")
            .then(res => {
                const userData = res.data;
                setUser(userData);
                if (userData.role === "admin") { navigate("/admin-dashboard"); return; }
                fetchMessages(userData.email);
                return api.get("/api/orders/my");
            })
            .then(res => { if (res) setOrders(res.data); })
            .catch(() => setError("Something went wrong. Please try again."))
            .finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        api.get("/api/notifications/my")
            .then(res => setNotifications(res.data))
            .catch(() => { });
    }, []);

    const fetchMessages = async (emailOverride) => {
        const email = emailOverride || user.email;
        if (!email) return;
        setMessagesLoading(true);
        try {
            const { data } = await api.get(`/api/messages/my?email=${email}`);
            setMessages(data);
        } catch (e) { }
        setMessagesLoading(false);
    };

    const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

    // Cancel an order
    const handleCancel = async (orderId) => {
        try {
            const res = await api.put(`/api/orders/${orderId}/cancel`);
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "Cancelled", cancelledAt: new Date() } : o));
            setCancelModal(null);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel order.");
            setCancelModal(null);
        }
    };
    // After return submitted — update order returnStatus locally
    const handleReturnSuccess = (orderId) => {
        setOrders(prev => prev.map(o =>
            o._id === orderId ? { ...o, returnStatus: "Pending" } : o
        ));
    };
    const markNotificationsRead = async () => {
        if (unreadNotifications === 0) return;
        try {
            await api.put("/api/notifications/read-all"); // ← correct URL
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark notifications read:", err);
        }
    };
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const EXCLUDED = ["Cancelled", "Refunded", "Returned"];
    const totalSpent = orders
        .filter(o => !EXCLUDED.includes(o.status))
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
    const deliveredCount = orders.filter(o => o.status?.toLowerCase() === "delivered").length;

    if (loading) {
        return (
            <>
                <style>{STYLES}</style>
                <div className="db2-loader"><div className="db2-loader__ring" /><p>Loading your dashboard…</p></div>
            </>
        );
    }

    return (
        <>
            <style>{STYLES}</style>
            <div className="db2-page">
                <div className="db2-wrap">
                    {error && <div className="db2-error">⚠ {error}</div>}

                    <div className="db2-greeting">
                        <h1>Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋</h1>
                        <p>Here's what's happening with your orders</p>
                    </div>

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
                        ].map(t => (
                            <button key={t.id} className={`db2-tab ${activeTab === t.id ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab(t.id);
                                    if (t.id === "messages") {
                                        fetchMessages();
                                        // Mark all notifications as read
                                        markNotificationsRead();
                                    }
                                }}>
                                {t.label}
                                {t.id === "messages" && unreadNotifications > 0 && (
                                    <span style={{ marginLeft: 4, background: "#e53935", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 5px", fontWeight: 700 }}>
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>
                        ))}
                        <button className="db2-tab" style={{ marginLeft: "auto", color: "#e53935" }} onClick={logout}>Logout</button>
                    </div>
                    {/* ── Orders Tab ── */}
                    {activeTab === "orders" && (
                        <section>
                            <p className="db2-section-title">My Orders</p>
                            {orders.length === 0 ? (
                                <div className="db2-empty"><div style={{ fontSize: 36 }}>📭</div><p>No orders yet. Start shopping!</p></div>
                            ) : (
                                orders.map((order, i) => {
                                    const statusKey = order.status?.toLowerCase();
                                    const color = statusColors[statusKey] || { bg: "#f3f4f6", text: "#374151" };
                                    const icon = statusIcons[statusKey] || "•";
                                    const isOpen = expandedOrder === order._id;

                                    // ── Logic for buttons ──────────────────────────────
                                    const canCancel = CANCELLABLE_STATUSES.includes(order.status);
                                    const canReturn = order.status === RETURNABLE_STATUS && (!order.returnStatus || order.returnStatus === "None");
                                    const returnStatus = order.returnStatus && order.returnStatus !== "None" ? order.returnStatus : null;

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
                                                {/* Items */}
                                                {order.items?.length > 0 ? (
                                                    <div className="db2-items">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="db2-item">
                                                                {(item.img || item.image) && (
                                                                    <img src={item.img || item.image} alt={item.name} className="db2-item__img" onError={e => e.target.style.display = "none"} />
                                                                )}
                                                                <div>
                                                                    <p className="db2-item__name">{item.name}</p>
                                                                    <p className="db2-item__meta">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each</p>
                                                                    {(item.color || item.size) && (
                                                                        <p className="db2-item__meta" style={{ marginTop: 2 }}>
                                                                            {item.color && `🎨 ${item.color}`}{item.color && item.size && " · "}{item.size && `📐 ${item.size}`}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <p className="db2-item__total">₹{(item.quantity * item.price)?.toLocaleString("en-IN")}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="db2-items"><p style={{ color: "#aaa", fontSize: 13 }}>No item details available.</p></div>
                                                )}
                                                {/* Footer */}
                                                <div className="db2-order__footer">
                                                    <div className="db2-footer-left">
                                                        {order.createdAt && (
                                                            <span>📅 {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                        )}
                                                        {order.cancelledAt && (
                                                            <span style={{ color: "#dc2626" }}>Cancelled on {new Date(order.cancelledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                                        )}
                                                    </div>

                                                    <div className="db2-footer-right">
                                                        {/* ── CANCEL BUTTON: Processing, Packed, Shipped only ── */}
                                                        {canCancel && (
                                                            <button className="db2-cancel-btn" onClick={e => { e.stopPropagation(); setCancelModal(order); }}>
                                                                ✕ Cancel Order
                                                            </button>
                                                        )}

                                                        {/* ── RETURN BUTTON: Delivered only, no existing return ── */}
                                                        {canReturn && (
                                                            <button className="db2-return-btn" onClick={e => { e.stopPropagation(); setReturnModal(order); }}>
                                                                ↩ Request Return
                                                            </button>
                                                        )}

                                                        {/* ── RETURN STATUS TAG: if return already requested ── */}
                                                        {returnStatus && (
                                                            <span className={`db2-return-tag ${returnStatus.toLowerCase()}`}>
                                                                {returnStatus === "Pending" && "⏳ Return Pending"}
                                                                {returnStatus === "Approved" && "✓ Return Approved"}
                                                                {returnStatus === "Rejected" && "✕ Return Rejected"}
                                                            </span>
                                                        )}

                                                        {/* If approved — show refund info */}
                                                        {returnStatus === "Approved" && order.refundAmount && (
                                                            <span style={{ fontSize: 11, color: "#065f46", background: "#d1fae5", padding: "4px 10px", borderRadius: 20 }}>
                                                                Refund ₹{order.refundAmount.toLocaleString("en-IN")} initiated
                                                            </span>
                                                        )}

                                                        {/* If rejected — show admin note */}
                                                        {returnStatus === "Rejected" && order.returnAdminNote && (
                                                            <span style={{ fontSize: 11, color: "#991b1b" }} title={order.returnAdminNote}>
                                                                Reason: {order.returnAdminNote}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </section>
                    )}

                    {/* ── Profile Tab ── */}
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

                    {/* ── Messages Tab ── */}
                    {activeTab === "messages" && (
                        <section>
                            <p className="db2-section-title">My Messages</p>
                            {messagesLoading ? (
                                <div className="db2-loader"><div className="db2-loader__ring" /></div>
                            ) : messages.length === 0 ? (
                                <div className="db2-empty"><div style={{ fontSize: 36 }}>💬</div><p>No messages sent yet.</p></div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg._id} className="db2-order" style={{ animationDelay: `${i * 60}ms`, marginBottom: 12 }}>
                                        <div style={{ padding: "13px 16px", borderBottom: "0.5px solid #f0f0f0" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: msg.status === "replied" ? "#d1fae5" : msg.status === "read" ? "#dbeafe" : "#fef3c7", color: msg.status === "replied" ? "#065f46" : msg.status === "read" ? "#1e40af" : "#92400e" }}>
                                                    {msg.status === "replied" ? "✓ Replied" : msg.status === "read" ? "👁 Read" : "● Unread"}
                                                </span>
                                                <span style={{ fontSize: 11, color: "#aaa" }}>{new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                            </div>
                                            <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.6 }}>
                                                <span style={{ fontWeight: 600, color: "#111" }}>You: </span>{msg.message}
                                            </p>
                                        </div>
                                        {msg.adminReply ? (
                                            <div style={{ padding: "12px 16px", background: "#f0f7ff" }}>
                                                <p style={{ fontSize: 11, fontWeight: 600, color: "#185FA5", marginBottom: 5 }}>💬 Admin Reply</p>
                                                <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.6 }}>{msg.adminReply}</p>
                                            </div>
                                        ) : (
                                            <div style={{ padding: "10px 16px", background: "#fafafa" }}>
                                                <p style={{ fontSize: 12, color: "#bbb", margin: 0, fontStyle: "italic" }}>Awaiting reply from support…</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </section>
                    )}
                </div>
            </div>

            {/* Cancel Confirm Modal */}
            {cancelModal && (
                <CancelModal
                    order={cancelModal}
                    onClose={() => setCancelModal(null)}
                    onConfirm={handleCancel}
                />
            )}

            {/* Return Request Modal */}
            {returnModal && (
                <ReturnModal
                    order={returnModal}
                    onClose={() => setReturnModal(null)}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </>
    );
};

export default Dashboard;
// import React, { useEffect, useState } from "react";
// import api from "../api";
// import { useNavigate } from "react-router-dom";

// const statusColors = {
//     delivered: { bg: "#d1fae5", text: "#065f46" },
//     processing: { bg: "#fef3c7", text: "#92400e" },
//     confirmed: { bg: "#dbeafe", text: "#1e40af" },
//     shipped: { bg: "#dbeafe", text: "#1e40af" },
//     cancelled: { bg: "#fee2e2", text: "#991b1b" },
//     pending: { bg: "#ede9fe", text: "#5b21b6" },
//     refunded: { bg: "#fce7f3", text: "#9d174d" },
// };
// const statusIcons = {
//     delivered: "✓",
//     processing: "⏳",
//     confirmed: "✅",
//     shipped: "🚚",
//     cancelled: "✕",
//     pending: "◷",
//     refunded: "↩",
// };

// const RETURN_REASONS = ["Damaged", "Wrong Item", "Not as Described", "Size Issue", "Other"];

// const STYLES = `
// @keyframes db-fadeUp {
//     from { opacity: 0; transform: translateY(16px); }
//     to   { opacity: 1; transform: translateY(0); }
// }
// @keyframes modal-in {
//     from { opacity: 0; transform: translateY(24px) scale(0.97); }
//     to   { opacity: 1; transform: translateY(0) scale(1); }
// }
// @keyframes spin { to { transform: rotate(360deg); } }

// .db2-page { min-height: 100vh; background: #f7f7f7; padding: 32px 16px; font-family: 'Segoe UI', sans-serif; }
// .db2-wrap { max-width: 760px; margin: 0 auto; }
// .db2-greeting { animation: db-fadeUp .4s ease both; margin-bottom: 24px; }
// .db2-greeting h1 { font-size: 22px; font-weight: 600; color: #111; margin: 0 0 4px; }
// .db2-greeting h1 span { color: #e53935; }
// .db2-greeting p { font-size: 14px; color: #888; margin: 0; }
// .db2-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
// .db2-stat { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 16px; animation: db-fadeUp .4s ease both; }
// .db2-stat__label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 6px; }
// .db2-stat__val { font-size: 24px; font-weight: 600; color: #111; margin: 0; }
// .db2-stat__val.red { color: #e53935; }
// .db2-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1.5px solid #e5e5e5; }
// .db2-tab { font-size: 13px; padding: 10px 18px; border: none; background: transparent; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1.5px; font-family: inherit; transition: color .2s; }
// .db2-tab.active { color: #e53935; border-bottom-color: #e53935; font-weight: 600; }
// .db2-tab:hover:not(.active) { color: #555; }
// .db2-section-title { font-size: 12px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 14px; }
// .db2-order { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; margin-bottom: 10px; overflow: hidden; animation: db-fadeUp .4s ease both; transition: box-shadow .2s; }
// .db2-order:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
// .db2-order__row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
// .db2-order__left { display: flex; align-items: center; gap: 10px; }
// .db2-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
// .db2-order__id { font-size: 12px; color: #aaa; }
// .db2-order__right { display: flex; align-items: center; gap: 8px; }
// .db2-order__amount { font-size: 14px; font-weight: 600; color: #111; }
// .db2-order__arrow { font-size: 18px; color: #ccc; display: inline-block; transition: transform .2s; }
// .db2-order__arrow.open { transform: rotate(90deg); color: #e53935; }
// .db2-order__body { background: #fafafa; border-top: 0.5px solid #f0f0f0; max-height: 0; overflow: hidden; transition: max-height .35s ease; }
// .db2-order__body.open { max-height: 600px; }
// .db2-items { padding: 12px 16px; }
// .db2-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid #f0f0f0; }
// .db2-item:last-child { border-bottom: none; }
// .db2-item__img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #eee; flex-shrink: 0; }
// .db2-item__name { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
// .db2-item__meta { font-size: 11px; color: #aaa; margin: 0; }
// .db2-item__total { margin-left: auto; font-size: 13px; font-weight: 600; color: #111; }
// .db2-order__footer { padding: 10px 16px; display: flex; gap: 16px; font-size: 12px; color: #aaa; border-top: 0.5px solid #f0f0f0; flex-wrap: wrap; align-items: center; justify-content: space-between; }
// .db2-return-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e53935; background: #fff; color: #e53935; cursor: pointer; transition: all .2s; }
// .db2-return-btn:hover { background: #e53935; color: #fff; }
// .db2-return-btn:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; background: #fff; }
// .db2-return-tag { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
// .db2-return-tag.pending { background: #fef3c7; color: #92400e; }
// .db2-return-tag.approved { background: #d1fae5; color: #065f46; }
// .db2-return-tag.rejected { background: #fee2e2; color: #991b1b; }
// .db2-empty { text-align: center; padding: 40px; color: #aaa; }
// .db2-empty p { font-size: 14px; margin: 8px 0 0; }
// .db2-profile { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 20px; animation: db-fadeUp .4s ease both; }
// .db2-profile__top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 0.5px solid #f0f0f0; }
// .db2-profile__avatar { width: 52px; height: 52px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600; flex-shrink: 0; }
// .db2-profile__name { font-size: 16px; font-weight: 600; color: #111; margin: 0 0 3px; }
// .db2-profile__email { font-size: 13px; color: #aaa; margin: 0; }
// .db2-profile__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
// .db2-profile__field label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 4px; }
// .db2-profile__field p { font-size: 14px; font-weight: 500; color: #111; margin: 0; }
// .db2-error { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
// .db2-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; color: #aaa; font-size: 14px; }
// .db2-loader__ring { width: 32px; height: 32px; border: 2px solid #eee; border-top-color: #e53935; border-radius: 50%; animation: spin .8s linear infinite; }

// /* ---- Return Modal ---- */
// .ret-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: 0; }
// @media(min-width:540px) { .ret-overlay { align-items: center; padding: 16px; } }
// .ret-modal { background: #fff; border-radius: 20px 20px 0 0; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; padding: 24px 20px 32px; animation: modal-in .25s ease both; }
// @media(min-width:540px) { .ret-modal { border-radius: 16px; } }
// .ret-modal__title { font-size: 17px; font-weight: 700; color: #111; margin: 0 0 4px; }
// .ret-modal__sub { font-size: 13px; color: #888; margin: 0 0 20px; }
// .ret-close { position: absolute; top: 16px; right: 18px; background: none; border: none; font-size: 22px; color: #aaa; cursor: pointer; line-height: 1; }
// .ret-section { margin-bottom: 18px; }
// .ret-section label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 8px; }
// .ret-item-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1.5px solid #f0f0f0; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: border-color .15s; }
// .ret-item-row.selected { border-color: #e53935; background: #fff5f5; }
// .ret-item-row img { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; background: #eee; flex-shrink: 0; }
// .ret-item-row__info { flex: 1; min-width: 0; }
// .ret-item-row__name { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
// .ret-item-row__meta { font-size: 11px; color: #aaa; }
// .ret-item-row__check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .15s; }
// .ret-item-row.selected .ret-item-row__check { background: #e53935; border-color: #e53935; color: #fff; font-size: 10px; }
// .ret-reason-select { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e5e5; border-radius: 10px; font-size: 13px; font-family: inherit; color: #111; background: #fff; outline: none; appearance: none; cursor: pointer; }
// .ret-reason-select:focus { border-color: #e53935; }
// .ret-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e5e5; border-radius: 10px; font-size: 13px; font-family: inherit; color: #111; resize: vertical; min-height: 80px; outline: none; box-sizing: border-box; }
// .ret-textarea:focus { border-color: #e53935; }
// .ret-submit { width: 100%; padding: 13px; background: #e53935; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background .2s; }
// .ret-submit:hover { background: #c62828; }
// .ret-submit:disabled { background: #ccc; cursor: not-allowed; }
// .ret-error { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; }
// .ret-success { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; text-align: center; font-weight: 600; }

// /* Notification bell */
// .db2-notif { position: relative; display: inline-flex; align-items: center; }
// .db2-notif-dot { position: absolute; top: 6px; right: 14px; width: 7px; height: 7px; border-radius: 50%; background: #e53935; border: 1.5px solid #f7f7f7; }

// @media (max-width: 480px) {
//     .db2-stats { grid-template-columns: 1fr; }
//     .db2-profile__grid { grid-template-columns: 1fr; }
// }
// `;

// // ─── Return Request Modal ─────────────────────────────────────────────────────
// const ReturnModal = ({ order, onClose, onSuccess }) => {
//     const [selectedItems, setSelectedItems] = useState([]);
//     const [reason, setReason] = useState("");
//     const [description, setDescription] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);

//     const toggleItem = (item) => {
//         setSelectedItems((prev) => {
//             const exists = prev.find((i) => i.product === item.product && i.color === item.color && i.size === item.size);
//             if (exists) return prev.filter((i) => i !== exists);
//             return [...prev, { ...item, reason }];
//         });
//     };

//     const isSelected = (item) =>
//         !!selectedItems.find((i) => i.product === item.product && i.color === item.color && i.size === item.size);

//     const handleSubmit = async () => {
//         if (selectedItems.length === 0) return setError("Please select at least one item to return.");
//         if (!reason) return setError("Please select a return reason.");
//         setError("");
//         setSubmitting(true);
//         try {
//             const itemsWithReason = selectedItems.map((i) => ({ ...i, reason }));
//             await api.post("/api/returns", {
//                 orderId: order._id,
//                 items: itemsWithReason,
//                 description,
//             });
//             setSuccess(true);
//             setTimeout(() => { onSuccess(); onClose(); }, 1800);
//         } catch (err) {
//             setError(err.response?.data?.message || "Something went wrong. Please try again.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <div className="ret-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//             <div className="ret-modal" style={{ position: "relative" }}>
//                 <button className="ret-close" onClick={onClose}>×</button>
//                 <p className="ret-modal__title">Request Return / Refund</p>
//                 <p className="ret-modal__sub">Order #{order._id?.slice(-6).toUpperCase()} · ₹{order.totalAmount?.toLocaleString("en-IN")}</p>

//                 {success && <div className="ret-success">✓ Return request submitted successfully!</div>}
//                 {error && <div className="ret-error">⚠ {error}</div>}

//                 {!success && (
//                     <>
//                         {/* Step 1: Select items */}
//                         <div className="ret-section">
//                             <label>Select Items to Return</label>
//                             {order.items?.map((item, idx) => (
//                                 <div
//                                     key={idx}
//                                     className={`ret-item-row ${isSelected(item) ? "selected" : ""}`}
//                                     onClick={() => toggleItem(item)}
//                                 >
//                                     {item.img && <img src={item.img} alt={item.name} />}
//                                     <div className="ret-item-row__info">
//                                         <p className="ret-item-row__name">{item.name}</p>
//                                         <p className="ret-item-row__meta">
//                                             Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}
//                                             {item.color && ` · ${item.color}`}
//                                             {item.size && ` · ${item.size}`}
//                                         </p>
//                                     </div>
//                                     <div className="ret-item-row__check">{isSelected(item) && "✓"}</div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Step 2: Reason */}
//                         <div className="ret-section">
//                             <label>Return Reason</label>
//                             <select
//                                 className="ret-reason-select"
//                                 value={reason}
//                                 onChange={(e) => setReason(e.target.value)}
//                             >
//                                 <option value="">Select a reason…</option>
//                                 {RETURN_REASONS.map((r) => (
//                                     <option key={r} value={r}>{r}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Step 3: Description */}
//                         <div className="ret-section">
//                             <label>Description (optional)</label>
//                             <textarea
//                                 className="ret-textarea"
//                                 placeholder="Describe the issue in detail…"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                             />
//                         </div>

//                         <button className="ret-submit" onClick={handleSubmit} disabled={submitting}>
//                             {submitting ? "Submitting…" : "Submit Return Request"}
//                         </button>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// // ─── Main Dashboard ───────────────────────────────────────────────────────────
// const Dashboard = () => {
//     const [orders, setOrders] = useState([]);
//     const [user, setUser] = useState({});
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [expandedOrder, setExpandedOrder] = useState(null);
//     const [activeTab, setActiveTab] = useState("orders");
//     const [messages, setMessages] = useState([]);
//     const [messagesLoading, setMessagesLoading] = useState(false);
//     const [returnRequests, setReturnRequests] = useState([]);
//     const [notifications, setNotifications] = useState([]);
//     const [returnModal, setReturnModal] = useState(null); // order object
//     const [eligibilityCache, setEligibilityCache] = useState({}); // orderId → {eligible, reason, existingRequest}
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (!token) { navigate("/login"); return; }
//         api.get("/api/users/profile")
//             .then((res) => {
//                 const userData = res.data;
//                 setUser(userData);
//                 if (userData.role === "admin") { navigate("/admin-dashboard"); return; }
//                 fetchMessages(userData.email);
//                 return api.get("/api/orders/my");
//             })
//             .then((res) => { if (res) setOrders(res.data); })
//             .catch(() => setError("Something went wrong. Please try again."))
//             .finally(() => setLoading(false));
//     }, [navigate]);

//     // Fetch my return requests
//     useEffect(() => {
//         if (orders.length > 0) {
//             api.get("/api/returns/my")
//                 .then((res) => setReturnRequests(res.data))
//                 .catch(() => { });
//         }
//     }, [orders]);

//     // Fetch notifications
//     useEffect(() => {
//         api.get("/api/notifications/my")
//             .then((res) => setNotifications(res.data))
//             .catch(() => { });
//     }, []);

//     // Check eligibility when order is expanded
//     const handleExpandOrder = async (orderId) => {
//         const isOpen = expandedOrder === orderId;
//         setExpandedOrder(isOpen ? null : orderId);
//         if (!isOpen && !eligibilityCache[orderId]) {
//             try {
//                 const res = await api.get(`/api/returns/check/${orderId}`);
//                 setEligibilityCache((prev) => ({ ...prev, [orderId]: res.data }));
//             } catch { }
//         }
//     };

//     const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

//     const fetchMessages = async (emailOverride) => {
//         const email = emailOverride || user.email;
//         if (!email) return;
//         setMessagesLoading(true);
//         try {
//             const { data } = await api.get(`/api/messages/my?email=${email}`);
//             setMessages(data);
//         } catch (e) { }
//         setMessagesLoading(false);
//     };

//     const getReturnStatus = (orderId) => {
//         const rr = returnRequests.find((r) => r.order?._id === orderId || r.order === orderId);
//         return rr ? rr.status : null;
//     };

//     const unreadNotifications = notifications.filter((n) => !n.read).length;

//     const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
//     const deliveredCount = orders.filter((o) => o.status?.toLowerCase() === "delivered").length;

//     if (loading) {
//         return (
//             <>
//                 <style>{STYLES}</style>
//                 <div className="db2-loader"><div className="db2-loader__ring" /><p>Loading your dashboard…</p></div>
//             </>
//         );
//     }

//     return (
//         <>
//             <style>{STYLES}</style>
//             <div className="db2-page">
//                 <div className="db2-wrap">
//                     {error && <div className="db2-error">⚠ {error}</div>}

//                     <div className="db2-greeting">
//                         <h1>Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋</h1>
//                         <p>Here's what's happening with your orders</p>
//                     </div>

//                     <div className="db2-stats">
//                         {[
//                             { label: "Total Orders", value: orders.length },
//                             { label: "Delivered", value: deliveredCount },
//                             { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, red: true },
//                         ].map((s, i) => (
//                             <div key={s.label} className="db2-stat" style={{ animationDelay: `${i * 80}ms` }}>
//                                 <p className="db2-stat__label">{s.label}</p>
//                                 <p className={`db2-stat__val${s.red ? " red" : ""}`}>{s.value}</p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Tabs */}
//                     <div className="db2-tabs">
//                         {[
//                             { id: "orders", label: "My Orders" },
//                             { id: "returns", label: `Returns${returnRequests.length > 0 ? ` (${returnRequests.length})` : ""}` },
//                             { id: "messages", label: "Messages" },
//                             { id: "profile", label: "Profile" },
//                         ].map((t) => (
//                             <button key={t.id} className={`db2-tab ${activeTab === t.id ? "active" : ""}`}
//                                 onClick={() => { setActiveTab(t.id); if (t.id === "messages") fetchMessages(); }}>
//                                 {t.label}
//                                 {t.id === "orders" && unreadNotifications > 0 && (
//                                     <span style={{ marginLeft: 4, background: "#e53935", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 5px", fontWeight: 700 }}>
//                                         {unreadNotifications}
//                                     </span>
//                                 )}
//                             </button>
//                         ))}
//                         <button className="db2-tab" style={{ marginLeft: "auto", color: "#e53935" }} onClick={logout}>Logout</button>
//                     </div>

//                     {/* ── Orders Tab ── */}
//                     {activeTab === "orders" && (
//                         <section>
//                             <p className="db2-section-title">My Orders</p>
//                             {orders.length === 0 ? (
//                                 <div className="db2-empty"><div style={{ fontSize: 36 }}>📭</div><p>No orders yet. Start shopping!</p></div>
//                             ) : (
//                                 orders.map((order, i) => {
//                                     const key = order.status?.toLowerCase();
//                                     const color = statusColors[key] || { bg: "#f3f4f6", text: "#374151" };
//                                     const icon = statusIcons[key] || "•";
//                                     const isOpen = expandedOrder === order._id;
//                                     const eligibility = eligibilityCache[order._id];
//                                     const returnStatus = getReturnStatus(order._id);

//                                     return (
//                                         <div key={order._id} className="db2-order" style={{ animationDelay: `${i * 60}ms` }}>
//                                             <div className="db2-order__row" onClick={() => handleExpandOrder(order._id)}>
//                                                 <div className="db2-order__left">
//                                                     <span className="db2-badge" style={{ background: color.bg, color: color.text }}>{icon} {order.status}</span>
//                                                     <span className="db2-order__id">#{order._id?.slice(-6).toUpperCase()}</span>
//                                                 </div>
//                                                 <div className="db2-order__right">
//                                                     <span className="db2-order__amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
//                                                     <span className={`db2-order__arrow ${isOpen ? "open" : ""}`}>›</span>
//                                                 </div>
//                                             </div>

//                                             <div className={`db2-order__body ${isOpen ? "open" : ""}`}>
//                                                 {order.items?.length > 0 ? (
//                                                     <div className="db2-items">
//                                                         {order.items.map((item, idx) => (
//                                                             <div key={idx} className="db2-item">
//                                                                 {(item.img || item.image) && <img src={item.img || item.image} alt={item.name} className="db2-item__img" />}
//                                                                 <div>
//                                                                     <p className="db2-item__name">{item.name}</p>
//                                                                     <p className="db2-item__meta">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each</p>
//                                                                     {(item.color || item.size) && (
//                                                                         <p className="db2-item__meta" style={{ marginTop: 2 }}>
//                                                                             {item.color && `🎨 ${item.color}`}{item.color && item.size && " · "}{item.size && `📐 ${item.size}`}
//                                                                         </p>
//                                                                     )}
//                                                                 </div>
//                                                                 <p className="db2-item__total">₹{(item.quantity * item.price)?.toLocaleString("en-IN")}</p>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 ) : (
//                                                     <div className="db2-items"><p style={{ color: "#aaa", fontSize: 13 }}>No item details available.</p></div>
//                                                 )}

//                                                 <div className="db2-order__footer">
//                                                     <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#aaa" }}>
//                                                         {order.createdAt && <span>📅 {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
//                                                         {order.address && <span>📍 {order.address}</span>}
//                                                     </div>

//                                                     {/* ── Return Button ── */}
//                                                     {returnStatus ? (
//                                                         <span className={`db2-return-tag ${returnStatus.toLowerCase()}`}>
//                                                             {returnStatus === "Pending" && "↩ Return Pending"}
//                                                             {returnStatus === "Approved" && "✓ Return Approved"}
//                                                             {returnStatus === "Rejected" && "✕ Return Rejected"}
//                                                         </span>
//                                                     ) : order.status === "Delivered" ? (
//                                                         eligibility === undefined ? (
//                                                             <span style={{ fontSize: 11, color: "#bbb" }}>Checking…</span>
//                                                         ) : eligibility.eligible ? (
//                                                             <button className="db2-return-btn" onClick={(e) => { e.stopPropagation(); setReturnModal(order); }}>
//                                                                 ↩ Request Return
//                                                             </button>
//                                                         ) : (
//                                                             <span style={{ fontSize: 11, color: "#bbb" }} title={eligibility.reason}>
//                                                                 ⏱ {eligibility.reason === "Return window has expired for all items" ? "Window expired" : eligibility.reason}
//                                                             </span>
//                                                         )
//                                                     ) : null}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             )}
//                         </section>
//                     )}

//                     {/* ── Returns Tab ── */}
//                     {activeTab === "returns" && (
//                         <section>
//                             <p className="db2-section-title">My Return Requests</p>
//                             {returnRequests.length === 0 ? (
//                                 <div className="db2-empty"><div style={{ fontSize: 36 }}>↩</div><p>No return requests yet.</p></div>
//                             ) : (
//                                 returnRequests.map((rr, i) => (
//                                     <div key={rr._id} className="db2-order" style={{ animationDelay: `${i * 60}ms` }}>
//                                         <div style={{ padding: "14px 16px" }}>
//                                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//                                                 <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
//                                                     Order #{rr.order?._id?.slice(-6).toUpperCase() || rr.order?.toString().slice(-6).toUpperCase()}
//                                                 </span>
//                                                 <span className={`db2-return-tag ${rr.status.toLowerCase()}`}>
//                                                     {rr.status === "Pending" && "⏳ Pending"}
//                                                     {rr.status === "Approved" && "✓ Approved"}
//                                                     {rr.status === "Rejected" && "✕ Rejected"}
//                                                 </span>
//                                             </div>
//                                             <p style={{ fontSize: 12, color: "#888", margin: "0 0 6px" }}>
//                                                 {rr.items?.length} item{rr.items?.length !== 1 ? "s" : ""} · ₹{rr.refundAmount?.toLocaleString("en-IN")}
//                                                 {rr.items?.[0]?.reason && ` · ${rr.items[0].reason}`}
//                                             </p>
//                                             {rr.status === "Approved" && (
//                                                 <p style={{ fontSize: 12, color: "#065f46", background: "#d1fae5", padding: "6px 10px", borderRadius: 8, margin: "6px 0 0" }}>
//                                                     ✓ Refund of ₹{rr.refundAmount?.toLocaleString("en-IN")} initiated to your original payment method
//                                                 </p>
//                                             )}
//                                             {rr.status === "Rejected" && rr.adminNote && (
//                                                 <p style={{ fontSize: 12, color: "#991b1b", background: "#fee2e2", padding: "6px 10px", borderRadius: 8, margin: "6px 0 0" }}>
//                                                     ✕ Reason: {rr.adminNote}
//                                                 </p>
//                                             )}
//                                             <p style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
//                                                 Submitted {new Date(rr.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </section>
//                     )}

//                     {/* ── Profile Tab ── */}
//                     {activeTab === "profile" && (
//                         <section>
//                             <p className="db2-section-title">My Profile</p>
//                             <div className="db2-profile">
//                                 <div className="db2-profile__top">
//                                     <div className="db2-profile__avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
//                                     <div>
//                                         <p className="db2-profile__name">{user.name || "—"}</p>
//                                         <p className="db2-profile__email">{user.email || "—"}</p>
//                                     </div>
//                                 </div>
//                                 <div className="db2-profile__grid">
//                                     {[
//                                         ["Phone", user.phone],
//                                         ["Member Since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : null],
//                                     ].map(([label, val]) => (
//                                         <div key={label} className="db2-profile__field">
//                                             <label>{label}</label>
//                                             <p>{val || "—"}</p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </section>
//                     )}

//                     {/* ── Messages Tab ── */}
//                     {activeTab === "messages" && (
//                         <section>
//                             <p className="db2-section-title">My Messages</p>
//                             {messagesLoading ? (
//                                 <div className="db2-loader"><div className="db2-loader__ring" /></div>
//                             ) : messages.length === 0 ? (
//                                 <div className="db2-empty"><div style={{ fontSize: 36 }}>💬</div><p>No messages sent yet.</p></div>
//                             ) : (
//                                 messages.map((msg, i) => (
//                                     <div key={msg._id} className="db2-order" style={{ animationDelay: `${i * 60}ms`, marginBottom: 12 }}>
//                                         <div style={{ padding: "13px 16px", borderBottom: "0.5px solid #f0f0f0" }}>
//                                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
//                                                 <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: msg.status === "replied" ? "#d1fae5" : msg.status === "read" ? "#dbeafe" : "#fef3c7", color: msg.status === "replied" ? "#065f46" : msg.status === "read" ? "#1e40af" : "#92400e" }}>
//                                                     {msg.status === "replied" ? "✓ Replied" : msg.status === "read" ? "👁 Read" : "● Unread"}
//                                                 </span>
//                                                 <span style={{ fontSize: 11, color: "#aaa" }}>{new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
//                                             </div>
//                                             <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.6 }}>
//                                                 <span style={{ fontWeight: 600, color: "#111" }}>You: </span>{msg.message}
//                                             </p>
//                                         </div>
//                                         {msg.adminReply ? (
//                                             <div style={{ padding: "12px 16px", background: "#f0f7ff" }}>
//                                                 <p style={{ fontSize: 11, fontWeight: 600, color: "#185FA5", marginBottom: 5 }}>💬 Admin Reply</p>
//                                                 <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.6 }}>{msg.adminReply}</p>
//                                             </div>
//                                         ) : (
//                                             <div style={{ padding: "10px 16px", background: "#fafafa" }}>
//                                                 <p style={{ fontSize: 12, color: "#bbb", margin: 0, fontStyle: "italic" }}>Awaiting reply from support…</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))
//                             )}
//                         </section>
//                     )}
//                 </div>
//             </div>
//             {/* Return Request Modal */}
//             {returnModal && (
//                 <ReturnModal
//                     order={returnModal}
//                     onClose={() => setReturnModal(null)}
//                     onSuccess={() => {
//                         api.get("/api/returns/my").then((r) => setReturnRequests(r.data)).catch(() => { });
//                         setEligibilityCache((prev) => ({ ...prev, [returnModal._id]: { eligible: false, reason: "Return already requested" } }));
//                     }}
//                 />
//             )}
//         </>
//     );
// };
// export default Dashboard;
// // import React, { useEffect, useState } from "react";
// // import api from "../api";
// // import { useNavigate } from "react-router-dom";

// // const statusColors = {
// //     delivered: { bg: "#d1fae5", text: "#065f46" },
// //     processing: { bg: "#fef3c7", text: "#92400e" },
// //     confirmed: { bg: "#dbeafe", text: "#1e40af" },
// //     shipped: { bg: "#dbeafe", text: "#1e40af" },
// //     cancelled: { bg: "#fee2e2", text: "#991b1b" },
// //     pending: { bg: "#ede9fe", text: "#5b21b6" },
// // };
// // const statusIcons = {
// //     delivered: "✓",
// //     processing: "⏳",
// //     confirmed: "✅",
// //     shipped: "🚚",
// //     cancelled: "✕",
// //     pending: "◷",
// // };
// // const STYLES = `
// // @keyframes db-fadeUp {
// //     from { opacity: 0; transform: translateY(16px); }
// //     to   { opacity: 1; transform: translateY(0); }
// // }
// // .db2-page { min-height: 100vh; background: #f7f7f7; padding: 32px 16px; font-family: 'Segoe UI', sans-serif; }
// // .db2-wrap { max-width: 760px; margin: 0 auto; }
// // .db2-greeting { animation: db-fadeUp .4s ease both; margin-bottom: 24px; }
// // .db2-greeting h1 { font-size: 22px; font-weight: 600; color: #111; margin: 0 0 4px; }
// // .db2-greeting h1 span { color: #e53935; }
// // .db2-greeting p { font-size: 14px; color: #888; margin: 0; }
// // .db2-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
// // .db2-stat { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 16px; animation: db-fadeUp .4s ease both; }
// // .db2-stat__label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 6px; }
// // .db2-stat__val { font-size: 24px; font-weight: 600; color: #111; margin: 0; }
// // .db2-stat__val.red { color: #e53935; }
// // .db2-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1.5px solid #e5e5e5; }
// // .db2-tab { font-size: 13px; padding: 10px 18px; border: none; background: transparent; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1.5px; font-family: inherit; transition: color .2s; }
// // .db2-tab.active { color: #e53935; border-bottom-color: #e53935; font-weight: 600; }
// // .db2-tab:hover:not(.active) { color: #555; }
// // .db2-section-title { font-size: 12px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 14px; }
// // .db2-order { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; margin-bottom: 10px; overflow: hidden; animation: db-fadeUp .4s ease both; transition: box-shadow .2s; }
// // .db2-order:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
// // .db2-order__row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
// // .db2-order__left { display: flex; align-items: center; gap: 10px; }
// // .db2-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
// // .db2-order__id { font-size: 12px; color: #aaa; }
// // .db2-order__right { display: flex; align-items: center; gap: 8px; }
// // .db2-order__amount { font-size: 14px; font-weight: 600; color: #111; }
// // .db2-order__arrow { font-size: 18px; color: #ccc; display: inline-block; transition: transform .2s; }
// // .db2-order__arrow.open { transform: rotate(90deg); color: #e53935; }
// // .db2-order__body { background: #fafafa; border-top: 0.5px solid #f0f0f0; max-height: 0; overflow: hidden; transition: max-height .3s ease; }
// // .db2-order__body.open { max-height: 400px; }
// // .db2-items { padding: 12px 16px; }
// // .db2-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid #f0f0f0; }
// // .db2-item:last-child { border-bottom: none; }
// // .db2-item__img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #eee; flex-shrink: 0; }
// // .db2-item__name { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
// // .db2-item__meta { font-size: 11px; color: #aaa; margin: 0; }
// // .db2-item__total { margin-left: auto; font-size: 13px; font-weight: 600; color: #111; }
// // .db2-order__footer { padding: 10px 16px; display: flex; gap: 16px; font-size: 12px; color: #aaa; border-top: 0.5px solid #f0f0f0; }
// // .db2-empty { text-align: center; padding: 40px; color: #aaa; }
// // .db2-empty p { font-size: 14px; margin: 8px 0 0; }
// // .db2-profile { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 20px; animation: db-fadeUp .4s ease both; }
// // .db2-profile__top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 0.5px solid #f0f0f0; }
// // .db2-profile__avatar { width: 52px; height: 52px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600; flex-shrink: 0; }
// // .db2-profile__name { font-size: 16px; font-weight: 600; color: #111; margin: 0 0 3px; }
// // .db2-profile__email { font-size: 13px; color: #aaa; margin: 0; }
// // .db2-profile__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
// // .db2-profile__field label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 4px; }
// // .db2-profile__field p { font-size: 14px; font-weight: 500; color: #111; margin: 0; }
// // .db2-error { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
// // .db2-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; color: #aaa; font-size: 14px; }
// // .db2-loader__ring { width: 32px; height: 32px; border: 2px solid #eee; border-top-color: #e53935; border-radius: 50%; animation: spin .8s linear infinite; }
// // @keyframes spin { to { transform: rotate(360deg); } }
// // @media (max-width: 480px) {
// //     .db2-stats { grid-template-columns: 1fr; }
// //     .db2-profile__grid { grid-template-columns: 1fr; }
// // }
// // `;

// // const Dashboard = () => {
// //     const [orders, setOrders] = useState([]);
// //     const [user, setUser] = useState({});
// //     const [error, setError] = useState("");
// //     const [loading, setLoading] = useState(true);
// //     const [expandedOrder, setExpandedOrder] = useState(null);
// //     const [activeTab, setActiveTab] = useState("orders");
// //     const [messages, setMessages] = useState([]);
// //     const [messagesLoading, setMessagesLoading] = useState(false);
// //     const navigate = useNavigate();

// //     useEffect(() => {
// //         const token = localStorage.getItem("token");
// //         if (!token) { navigate("/login"); return; }
// //         const headers = { Authorization: `Bearer ${token}` };
// //         api.get("/api/users/profile", { headers })
// //             .then((res) => {
// //                 const userData = res.data;
// //                 setUser(userData);
// //                 if (userData.role === "admin") { navigate("/admin-dashboard"); return; }
// //                 fetchMessages(userData.email);
// //                 return api.get("/api/orders/my", { headers });
// //             })
// //             // .then((res) => { if (res) setOrders(res.data); })
// //             .then((res) => {
// //                 if (res) {
// //                     console.log("Orders from API:", res.data.map(o => ({
// //                         id: o._id?.slice(-6),
// //                         totalAmount: o.totalAmount,
// //                         discount: o.discount,
// //                         subtotal: o.subtotal
// //                     })));
// //                     setOrders(res.data);
// //                 }
// //             })
// //             .catch(() => setError("Something went wrong. Please try again."))
// //             .finally(() => setLoading(false));
// //     }, [navigate]);

// //     const logout = () => {
// //         localStorage.removeItem("token");
// //         navigate("/login");
// //     };

// //     const fetchMessages = async (emailOverride) => {
// //         const email = emailOverride || user.email;

// //         if (!email) return;
// //         setMessagesLoading(true);
// //         try {
// //             const token = localStorage.getItem("token");
// //             const { data } = await api.get(`/api/messages/my?email=${email}`, {
// //                 headers: { Authorization: `Bearer ${token}` }
// //             });

// //             setMessages(data);
// //         } catch (e) {
// //         }
// //         setMessagesLoading(false);
// //     };

// //     const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
// //     const deliveredCount = orders.filter((o) => o.status?.toLowerCase() === "delivered").length;

// //     if (loading) {
// //         return (
// //             <>
// //                 <style>{STYLES}</style>
// //                 <div className="db2-loader">
// //                     <div className="db2-loader__ring" />
// //                     <p>Loading your dashboard…</p>
// //                 </div>
// //             </>
// //         );
// //     }

// //     return (
// //         <>
// //             <style>{STYLES}</style>
// //             <div className="db2-page">
// //                 <div className="db2-wrap">

// //                     {error && <div className="db2-error">⚠ {error}</div>}

// //                     {/* Greeting */}
// //                     <div className="db2-greeting">
// //                         <h1>Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋</h1>
// //                         <p>Here's what's happening with your orders</p>
// //                     </div>

// //                     {/* Stats */}
// //                     {/* Stats */}
// //                     <div className="db2-stats">
// //                         {[
// //                             { label: "Total Orders", value: orders.length },
// //                             { label: "Delivered", value: deliveredCount },
// //                             { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, red: true },
// //                         ].map((s, i) => (
// //                             <div key={s.label} className="db2-stat" style={{ animationDelay: `${i * 80}ms` }}>
// //                                 <p className="db2-stat__label">{s.label}</p>
// //                                 <p className={`db2-stat__val${s.red ? " red" : ""}`}>{s.value}</p>
// //                             </div>
// //                         ))}
// //                     </div>

// //                     {/* Tabs */}
// //                     <div className="db2-tabs">
// //                         {[
// //                             { id: "orders", label: "My Orders" },
// //                             { id: "messages", label: "Messages" },
// //                             { id: "profile", label: "Profile" },
// //                         ].map((t) => (
// //                             <button
// //                                 key={t.id}
// //                                 className={`db2-tab ${activeTab === t.id ? "active" : ""}`}
// //                                 onClick={() => {
// //                                     setActiveTab(t.id);
// //                                     if (t.id === "messages") fetchMessages();
// //                                 }}
// //                             >
// //                                 {t.label}
// //                             </button>
// //                         ))}
// //                         <button className="db2-tab" style={{ marginLeft: "auto", color: "#e53935" }} onClick={logout}>
// //                             Logout
// //                         </button>
// //                     </div>
// //                     {/* Orders Tab */}
// //                     {activeTab === "orders" && (
// //                         <section>
// //                             <p className="db2-section-title">My Orders</p>
// //                             {orders.length === 0 ? (
// //                                 <div className="db2-empty">
// //                                     <div style={{ fontSize: 36 }}>📭</div>
// //                                     <p>No orders yet. Start shopping!</p>
// //                                 </div>
// //                             ) : (
// //                                 orders.map((order, i) => {
// //                                     const key = order.status?.toLowerCase();
// //                                     const color = statusColors[key] || { bg: "#f3f4f6", text: "#374151" };
// //                                     const icon = statusIcons[key] || "•";
// //                                     const isOpen = expandedOrder === order._id;
// //                                     return (
// //                                         <div key={order._id} className="db2-order" style={{ animationDelay: `${i * 60}ms` }}>
// //                                             <div className="db2-order__row" onClick={() => setExpandedOrder(isOpen ? null : order._id)}>
// //                                                 <div className="db2-order__left">
// //                                                     <span className="db2-badge" style={{ background: color.bg, color: color.text }}>
// //                                                         {icon} {order.status}
// //                                                     </span>
// //                                                     <span className="db2-order__id">#{order._id?.slice(-6).toUpperCase()}</span>
// //                                                 </div>
// //                                                 <div className="db2-order__right">
// //                                                     <span className="db2-order__amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
// //                                                     <span className={`db2-order__arrow ${isOpen ? "open" : ""}`}>›</span>
// //                                                 </div>
// //                                             </div>
// //                                             <div className={`db2-order__body ${isOpen ? "open" : ""}`}>
// //                                                 {order.items?.length > 0 ? (
// //                                                     <div className="db2-items">
// //                                                         {order.items.map((item, idx) => (
// //                                                             <div key={idx} className="db2-item">
// //                                                                 {(item.img || item.image) && <img src={item.img || item.image} alt={item.name} className="db2-item__img" />}
// //                                                                 <div>
// //                                                                     <p className="db2-item__name">{item.name}</p>
// //                                                                     <p className="db2-item__meta">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each</p>
// //                                                                     {(item.color || item.size) && (
// //                                                                         <p className="db2-item__meta" style={{ marginTop: "2px" }}>
// //                                                                             {item.color && `🎨 ${item.color}`}{item.color && item.size && " · "}{item.size && `📐 ${item.size}`}
// //                                                                         </p>
// //                                                                     )}
// //                                                                 </div>
// //                                                                 <p className="db2-item__total">₹{(item.quantity * item.price)?.toLocaleString("en-IN")}</p>
// //                                                             </div>
// //                                                         ))}
// //                                                     </div>
// //                                                 ) : (
// //                                                     <div className="db2-items"><p style={{ color: "#aaa", fontSize: 13 }}>No item details available.</p></div>
// //                                                 )}
// //                                                 <div className="db2-order__footer">
// //                                                     {order.createdAt && <span>📅 {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
// //                                                     {order.address && <span>📍 {order.address}</span>}
// //                                                 </div>
// //                                             </div>
// //                                         </div>
// //                                     );
// //                                 })
// //                             )}
// //                         </section>
// //                     )}

// //                     {/* Profile Tab */}
// //                     {activeTab === "profile" && (
// //                         <section>
// //                             <p className="db2-section-title">My Profile</p>
// //                             <div className="db2-profile">
// //                                 <div className="db2-profile__top">
// //                                     <div className="db2-profile__avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
// //                                     <div>
// //                                         <p className="db2-profile__name">{user.name || "—"}</p>
// //                                         <p className="db2-profile__email">{user.email || "—"}</p>
// //                                     </div>
// //                                 </div>
// //                                 <div className="db2-profile__grid">
// //                                     {[
// //                                         ["Phone", user.phone],
// //                                         ["Member Since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : null],
// //                                     ].map(([label, val]) => (
// //                                         <div key={label} className="db2-profile__field">
// //                                             <label>{label}</label>
// //                                             <p>{val || "—"}</p>
// //                                         </div>
// //                                     ))}
// //                                 </div>
// //                             </div>
// //                         </section>
// //                     )}
// //                     {activeTab === "messages" && (
// //                         <section>
// //                             <p className="db2-section-title">My Messages</p>
// //                             {messagesLoading ? (
// //                                 <div className="db2-loader">
// //                                     <div className="db2-loader__ring" />
// //                                 </div>
// //                             ) : messages.length === 0 ? (
// //                                 <div className="db2-empty">
// //                                     <div style={{ fontSize: 36 }}>💬</div>
// //                                     <p>No messages sent yet.</p>
// //                                 </div>
// //                             ) : (
// //                                 messages.map((msg, i) => (
// //                                     <div key={msg._id} className="db2-order" style={{ animationDelay: `${i * 60}ms`, marginBottom: 12 }}>
// //                                         {/* Message header */}
// //                                         <div style={{ padding: "13px 16px", borderBottom: "0.5px solid #f0f0f0" }}>
// //                                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
// //                                                 <span style={{
// //                                                     fontSize: 11, fontWeight: 600, padding: "3px 9px",
// //                                                     borderRadius: 20,
// //                                                     background: msg.status === "replied" ? "#d1fae5" : msg.status === "read" ? "#dbeafe" : "#fef3c7",
// //                                                     color: msg.status === "replied" ? "#065f46" : msg.status === "read" ? "#1e40af" : "#92400e"
// //                                                 }}>
// //                                                     {msg.status === "replied" ? "✓ Replied" : msg.status === "read" ? "👁 Read" : "● Unread"}
// //                                                 </span>
// //                                                 <span style={{ fontSize: 11, color: "#aaa" }}>
// //                                                     {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
// //                                                 </span>
// //                                             </div>
// //                                             {/* Your message */}
// //                                             <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.6 }}>
// //                                                 <span style={{ fontWeight: 600, color: "#111" }}>You: </span>{msg.message}
// //                                             </p>
// //                                         </div>

// //                                         {/* Admin reply */}
// //                                         {msg.adminReply ? (
// //                                             <div style={{ padding: "12px 16px", background: "#f0f7ff" }}>
// //                                                 <p style={{ fontSize: 11, fontWeight: 600, color: "#185FA5", marginBottom: 5 }}>
// //                                                     💬 Admin Reply
// //                                                 </p>
// //                                                 <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.6 }}>
// //                                                     {msg.adminReply}
// //                                                 </p>
// //                                             </div>
// //                                         ) : (
// //                                             <div style={{ padding: "10px 16px", background: "#fafafa" }}>
// //                                                 <p style={{ fontSize: 12, color: "#bbb", margin: 0, fontStyle: "italic" }}>
// //                                                     Awaiting reply from support…
// //                                                 </p>
// //                                             </div>
// //                                         )}
// //                                     </div>
// //                                 ))
// //                             )}
// //                         </section>
// //                     )}

// //                 </div>
// //             </div>
// //         </>
// //     );
// // };
// // export default Dashboard;
