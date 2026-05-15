import React, { useEffect, useState } from "react";
import api from "../../api";
import PageHeader from "./PageHeader";

const STATUS_COLORS = {
    Pending: { bg: "#fef9c3", color: "#854d0e" },
    Approved: { bg: "#dcfce7", color: "#166534" },
    Rejected: { bg: "#fee2e2", color: "#991b1b" },
};

const STYLES = `
@keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes modal-in { from { opacity:0; transform:translateY(20px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

.rp-wrap { padding: 24px; font-family: 'Segoe UI', sans-serif; }

.rp-mobile-header {
    display: none; align-items: center; gap: 12px;
    padding: 14px 16px; background: #fff;
    border-bottom: 1px solid #e8e8e8;
    margin: -24px -24px 20px -24px;
    position: sticky; top: 0; z-index: 100;
}
.rp-hamburger {
    background: none; border: none; cursor: pointer;
    padding: 4px; display: flex; flex-direction: column;
    gap: 5px; flex-shrink: 0;
}
.rp-hamburger span { display: block; width: 22px; height: 2px; background: #111; border-radius: 2px; }
.rp-mobile-title { font-size: 16px; font-weight: 700; color: #111; margin: 0; }
.rp-mobile-sub   { font-size: 12px; color: #aaa; margin: 0; }

.rp-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.rp-filter {
    font-size: 12px; padding: 6px 14px; border-radius: 20px;
    border: 1.5px solid #e5e5e5; background: #fff; color: #888;
    cursor: pointer; font-family: inherit; transition: all .15s;
}
.rp-filter.active { border-color: #e53935; color: #e53935; font-weight: 600; background: #fff5f5; }

.rp-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 20px;
}
.rp-stat {
    background: #fff; border: 0.5px solid #e5e5e5;
    border-radius: 12px; padding: 16px;
    animation: fadeUp .3s ease both;
}
.rp-stat__label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 4px; }
.rp-stat__val   { font-size: 22px; font-weight: 700; color: #111; margin: 0; }

.rp-section {
    background: #fff; border: 1px solid #e8e8e8;
    border-radius: 12px; overflow: hidden; margin-bottom: 20px;
}
.rp-table { width: 100%; border-collapse: collapse; }
.rp-table th {
    font-size: 11px; color: #aaa; text-transform: uppercase;
    letter-spacing: .5px; padding: 10px 16px; text-align: left;
    border-bottom: 1.5px solid #f0f0f0; background: #fafafa;
}
.rp-table td {
    font-size: 13px; padding: 12px 16px;
    border-bottom: 0.5px solid #f5f5f5;
    vertical-align: middle; color: #333;
}
.rp-table tr:last-child td { border-bottom: none; }
.rp-table tr:hover td { background: #fafafa; }

.rp-badge {
    font-size: 11px; padding: 3px 10px;
    border-radius: 20px; font-weight: 600; white-space: nowrap;
}
.rp-action-btn {
    font-size: 12px; padding: 5px 12px; border-radius: 8px;
    border: none; cursor: pointer; font-family: inherit;
    font-weight: 600; transition: all .15s; margin: 2px 2px 2px 0;
}
.rp-action-btn.approve { background: #d1fae5; color: #065f46; }
.rp-action-btn.approve:hover { background: #065f46; color: #fff; }
.rp-action-btn.reject  { background: #fee2e2; color: #991b1b; }
.rp-action-btn.reject:hover  { background: #991b1b; color: #fff; }
.rp-action-btn.view    { background: #f3f4f6; color: #374151; }
.rp-action-btn.view:hover    { background: #374151; color: #fff; }

.rp-empty  { text-align: center; padding: 48px; color: #bbb; font-size: 14px; }
.rp-loader { display: flex; align-items: center; justify-content: center; padding: 48px; gap: 10px; color: #aaa; font-size: 13px; }
.rp-loader__ring { width: 24px; height: 24px; border: 2px solid #eee; border-top-color: #e53935; border-radius: 50%; animation: spin .8s linear infinite; }

.rp-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.45);
    z-index: 1000; display: flex; align-items: center;
    justify-content: center; padding: 16px;
}
.rp-modal {
    background: #fff; border-radius: 16px; width: 100%;
    max-width: 540px; max-height: 88vh; overflow-y: auto;
    padding: 24px; animation: modal-in .25s ease both; position: relative;
}
.rp-modal__close {
    position: absolute; top: 14px; right: 16px;
    background: none; border: none; font-size: 22px;
    color: #aaa; cursor: pointer; line-height: 1;
}
.rp-modal__title { font-size: 16px; font-weight: 700; color: #111; margin: 0 0 4px; }
.rp-modal__sub   { font-size: 12px; color: #888; margin: 0 0 18px; }
.rp-modal-section { margin-bottom: 16px; }
.rp-modal-section__label {
    font-size: 11px; font-weight: 600; color: #aaa;
    text-transform: uppercase; letter-spacing: .5px; margin: 0 0 8px;
}
.rp-item-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; background: #fafafa;
    border-radius: 10px; margin-bottom: 6px;
}
.rp-item-row img { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; background: #eee; flex-shrink: 0; }
.rp-item-row__name { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
.rp-item-row__meta { font-size: 11px; color: #aaa; margin: 0; }
.rp-reject-note {
    width: 100%; padding: 10px 12px; border: 1.5px solid #e5e5e5;
    border-radius: 10px; font-size: 13px; font-family: inherit;
    outline: none; box-sizing: border-box; resize: vertical; min-height: 70px;
}
.rp-reject-note:focus { border-color: #e53935; }
.rp-refund-input {
    width: 100%; padding: 9px 12px; border: 1.5px solid #e5e5e5;
    border-radius: 10px; font-size: 13px; font-family: inherit;
    outline: none; box-sizing: border-box;
}
.rp-refund-input:focus { border-color: #16a34a; }
.rp-modal-btns { display: flex; gap: 8px; margin-top: 16px; }
.rp-modal-btn {
    flex: 1; padding: 11px; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all .15s;
}
.rp-modal-btn.approve { background: #16a34a; color: #fff; }
.rp-modal-btn.approve:hover { background: #15803d; }
.rp-modal-btn.reject  { background: #dc2626; color: #fff; }
.rp-modal-btn.reject:hover  { background: #b91c1c; }
.rp-modal-btn.cancel  { background: #f3f4f6; color: #374151; }
.rp-modal-btn:disabled { opacity: .5; cursor: not-allowed; }
.rp-success { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 12px; text-align: center; }
.rp-error   { background: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; }

@media (max-width: 768px) {
    .rp-mobile-header { display: flex; }
    .rp-desktop-header { display: none; }
    .rp-wrap { padding: 16px; }
    .rp-mobile-header { margin: -16px -16px 16px -16px; }
    .rp-stats { grid-template-columns: 1fr 1fr; }
    .rp-table thead { display: none; }
    .rp-table, .rp-table tbody, .rp-table tr, .rp-table td { display: block; width: 100%; }
    .rp-table tr { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
    .rp-table tr:last-child { border-bottom: none; }
    .rp-table td { padding: 2px 0; border-bottom: none; font-size: 13px; }
    .rp-table td[data-label]::before {
        content: attr(data-label) ": ";
        font-size: 10px; font-weight: 600; color: #aaa;
        text-transform: uppercase; letter-spacing: .04em; margin-right: 4px;
    }
    .rp-table td.rp-td-id { font-size: 12px; font-weight: 700; color: #111; padding-bottom: 6px; }
    .rp-table td.rp-td-id::before { display: none; }
    .rp-table td.rp-td-actions { padding-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .rp-table td.rp-td-actions::before { display: none; }
    .rp-overlay { padding: 0; align-items: flex-end; }
    .rp-modal { border-radius: 20px 20px 0 0; max-height: 92vh; padding: 20px 16px; }
    .rp-modal-btns { flex-direction: column; }
}
@media (max-width: 480px) {
    .rp-stats { grid-template-columns: 1fr 1fr; }
}
`;

// ── Return Detail + Action Modal ──────────────────────────────────────────────
const ReturnDetailModal = ({ order, token, onClose, onResolved }) => {
    const [rejectNote, setRejectNote] = useState("");
    const [refundAmount, setRefundAmount] = useState(order.totalAmount || "");
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handle = async (action) => {
        setError("");
        if (action === "Rejected" && !rejectNote.trim()) {
            setError("Please provide a rejection reason.");
            return;
        }
        setLoading(true);
        try {
            await api.put(
                `/api/orders/${order._id}/handle-return`,
                {
                    action,
                    adminNote: rejectNote || "",
                    refundAmount: Number(refundAmount) || order.totalAmount,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(
                action === "Approved"
                    ? "✓ Return approved. Stock restocked."
                    : "✕ Return rejected. Customer notified."
            );
            setTimeout(() => { onResolved(); onClose(); }, 1600);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const userName = order.user?.name || "Customer";
    const userEmail = order.user?.email || "";

    return (
        <div className="rp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rp-modal">
                <button className="rp-modal__close" onClick={onClose}>×</button>
                <p className="rp-modal__title">↩ Return Request Details</p>
                <p className="rp-modal__sub">
                    Order #{order._id?.slice(-6).toUpperCase()} · {userName}
                    {userEmail && ` (${userEmail})`} ·&nbsp;
                    <span
                        className="rp-badge"
                        style={{
                            ...(STATUS_COLORS[order.returnStatus] || { bg: "#f3f4f6", color: "#374151" }),
                            padding: "2px 8px", borderRadius: 20,
                        }}
                    >
                        {order.returnStatus}
                    </span>
                </p>

                {success && <div className="rp-success">{success}</div>}
                {error && <div className="rp-error">⚠ {error}</div>}

                {/* Return reason */}
                {(order.returnReason || order.returnDescription) && (
                    <div className="rp-modal-section">
                        <p className="rp-modal-section__label">Reason</p>
                        <div style={{ background: "#fafafa", padding: "10px 12px", borderRadius: 10, fontSize: 13, color: "#444" }}>
                            {order.returnReason && <div><strong>{order.returnReason}</strong></div>}
                            {order.returnDescription && <div style={{ marginTop: 4, color: "#666" }}>{order.returnDescription}</div>}
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="rp-modal-section">
                    <p className="rp-modal-section__label">Items</p>
                    {order.items?.map((item, i) => (
                        <div key={i} className="rp-item-row">
                            {item.img && <img src={item.img} alt={item.name} onError={e => e.target.style.display = "none"} />}
                            <div>
                                <p className="rp-item-row__name">{item.name}</p>
                                <p className="rp-item-row__meta">
                                    Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}
                                    {item.color && ` · ${item.color}`}
                                    {item.size && ` · ${item.size}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Refund amount — only editable for Pending */}
                {order.returnStatus === "Pending" && (
                    <div className="rp-modal-section">
                        <p className="rp-modal-section__label">Refund Amount (₹)</p>
                        <input
                            type="number"
                            className="rp-refund-input"
                            value={refundAmount}
                            onChange={e => setRefundAmount(e.target.value)}
                            placeholder="Enter refund amount"
                        />
                    </div>
                )}

                {/* Approved — show refund info */}
                {order.returnStatus === "Approved" && order.refundAmount && (
                    <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                        ✓ Refund: ₹{order.refundAmount?.toLocaleString("en-IN")}
                    </div>
                )}

                {/* Rejected — show admin note */}
                {order.returnStatus === "Rejected" && order.returnAdminNote && (
                    <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                        Admin Note: {order.returnAdminNote}
                    </div>
                )}

                {/* Reject reason box */}
                {order.returnStatus === "Pending" && showRejectBox && (
                    <div className="rp-modal-section">
                        <p className="rp-modal-section__label">Rejection Reason <span style={{ color: "#ef4444" }}>*</span></p>
                        <textarea
                            className="rp-reject-note"
                            placeholder="Tell the customer why the return is rejected…"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                )}

                {/* Action buttons — only for Pending */}
                {order.returnStatus === "Pending" && !success && (
                    <div className="rp-modal-btns">
                        <button className="rp-modal-btn cancel" onClick={onClose}>Cancel</button>
                        {!showRejectBox ? (
                            <button className="rp-modal-btn reject" onClick={() => setShowRejectBox(true)}>
                                ✕ Reject
                            </button>
                        ) : (
                            <button className="rp-modal-btn reject" disabled={loading} onClick={() => handle("Rejected")}>
                                {loading ? "Rejecting…" : "Confirm Reject"}
                            </button>
                        )}
                        <button className="rp-modal-btn approve" disabled={loading} onClick={() => handle("Approved")}>
                            {loading ? "Processing…" : "✓ Approve"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Returns Page ─────────────────────────────────────────────────────────
const ReturnsPage = ({ token, toggleSidebar, sidebarOpen }) => {
    const [orders, setOrders] = useState([]);   // all orders with a return request
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selected, setSelected] = useState(null);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            // Re-use the existing orders endpoint — filter client-side for return orders
            const res = await api.get("/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const all = Array.isArray(res.data) ? res.data : [];
            // Only orders that have a return request (returnStatus !== "None" / undefined)
            const withReturn = all.filter(
                (o) => o.returnStatus && o.returnStatus !== "None"
            );
            setOrders(withReturn);
        } catch (err) {
            console.error("Fetch returns error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturns(); }, []);

    const filtered = filter === "All"
        ? orders
        : orders.filter((o) => o.returnStatus === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.returnStatus === "Pending").length,
        approved: orders.filter((o) => o.returnStatus === "Approved").length,
        rejected: orders.filter((o) => o.returnStatus === "Rejected").length,
    };

    return (
        <>
            <style>{STYLES}</style>
            <div className="rp-wrap">

                {/* Mobile header */}
                <div className="rp-mobile-header">
                    <button className="rp-hamburger" onClick={toggleSidebar} aria-label="Toggle menu">
                        <span /><span /><span />
                    </button>
                    <div>
                        <p className="rp-mobile-title">Return Requests</p>
                        <p className="rp-mobile-sub">Review and action customer returns</p>
                    </div>
                </div>

                {/* Desktop header */}
                <div className="rp-desktop-header">
                    <PageHeader
                        title="Return Requests"
                        subtitle="Review and action customer returns"
                        toggleSidebar={toggleSidebar}
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                {/* Filters */}
                <div className="rp-filters">
                    {["All", "Pending", "Approved", "Rejected"].map((f) => (
                        <button
                            key={f}
                            className={`rp-filter ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}{f !== "All" ? ` (${stats[f.toLowerCase()]})` : ` (${stats.total})`}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="rp-stats">
                    {[
                        { label: "Total Returns", value: stats.total },
                        { label: "Pending Review", value: stats.pending },
                        { label: "Approved", value: stats.approved },
                        { label: "Rejected", value: stats.rejected },
                    ].map((s, i) => (
                        <div key={s.label} className="rp-stat" style={{ animationDelay: `${i * 60}ms` }}>
                            <p className="rp-stat__label">{s.label}</p>
                            <p className="rp-stat__val" style={{ color: s.label === "Pending Review" && s.value > 0 ? "#db2777" : "#111" }}>
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="rp-loader">
                        <div className="rp-loader__ring" />
                        <span>Loading return requests…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rp-empty">
                        ↩ No {filter !== "All" ? filter.toLowerCase() + " " : ""}return requests found.
                    </div>
                ) : (
                    <div className="rp-section">
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Order Amount</th>
                                    <th>Reason</th>
                                    <th>Requested</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((o) => {
                                    const sc = STATUS_COLORS[o.returnStatus] || { bg: "#f3f4f6", color: "#374151" };
                                    const userName = o.user?.name || "Customer";
                                    const userEmail = o.user?.email || "";
                                    return (
                                        <tr key={o._id}>
                                            {/* Order ID */}
                                            <td className="rp-td-id" style={{ fontFamily: "monospace" }}>
                                                #{o._id?.slice(-6).toUpperCase()}
                                            </td>

                                            {/* Customer */}
                                            <td data-label="Customer">
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{userName}</p>
                                                {userEmail && <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{userEmail}</p>}
                                            </td>

                                            {/* Items */}
                                            <td data-label="Items">
                                                {o.items?.length} item{o.items?.length !== 1 ? "s" : ""}
                                            </td>

                                            {/* Amount */}
                                            <td data-label="Amount" style={{ fontWeight: 600 }}>
                                                ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                                                {o.refundAmount && o.returnStatus === "Approved" && (
                                                    <div style={{ fontSize: 11, color: "#16a34a" }}>
                                                        Refund: ₹{o.refundAmount.toLocaleString("en-IN")}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Reason */}
                                            <td data-label="Reason" style={{ fontSize: 12, color: "#666", maxWidth: 140 }}>
                                                {o.returnReason || "—"}
                                            </td>

                                            {/* Date */}
                                            <td data-label="Requested" style={{ fontSize: 12, color: "#888" }}>
                                                {o.returnRequestedAt
                                                    ? new Date(o.returnRequestedAt).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>

                                            {/* Status badge */}
                                            <td data-label="Status">
                                                <span className="rp-badge" style={{ background: sc.bg, color: sc.color }}>
                                                    {o.returnStatus}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="rp-td-actions">
                                                <button className="rp-action-btn view" onClick={() => setSelected(o)}>
                                                    View
                                                </button>
                                                {o.returnStatus === "Pending" && (
                                                    <>
                                                        <button className="rp-action-btn approve" onClick={() => setSelected(o)}>
                                                            Approve
                                                        </button>
                                                        <button className="rp-action-btn reject" onClick={() => setSelected(o)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <ReturnDetailModal
                    order={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onResolved={() => { fetchReturns(); setSelected(null); }}
                />
            )}
        </>
    );
};

export default ReturnsPage;