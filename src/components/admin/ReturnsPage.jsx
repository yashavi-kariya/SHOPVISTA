import React, { useEffect, useState } from "react";
import api from "../../api";
import PageHeader from "./PageHeader";

const STATUS_COLORS = {
    Pending: { bg: "#fef3c7", text: "#92400e" },
    Approved: { bg: "#d1fae5", text: "#065f46" },
    Rejected: { bg: "#fee2e2", text: "#991b1b" },
};

const STYLES = `
@keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes modal-in { from { opacity:0; transform:translateY(20px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

/* ── Page wrapper ── */
.rp-wrap { padding: 24px; font-family: 'Segoe UI', sans-serif; }

/* ── Mobile sticky header with hamburger ── */
.rp-mobile-header {
    display: none;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    margin: -24px -24px 20px -24px;
    position: sticky; top: 0; z-index: 100;
}
.rp-hamburger {
    background: none; border: none;
    cursor: pointer; padding: 4px;
    display: flex; flex-direction: column;
    gap: 5px; flex-shrink: 0;
}
.rp-hamburger span {
    display: block; width: 22px; height: 2px;
    background: #111; border-radius: 2px;
    transition: all .2s;
}
.rp-mobile-title { font-size: 16px; font-weight: 700; color: #111; margin: 0; }
.rp-mobile-sub   { font-size: 12px; color: #aaa; margin: 0; }

/* ── Filters ── */
.rp-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.rp-filter {
    font-size: 12px; padding: 6px 14px; border-radius: 20px;
    border: 1.5px solid #e5e5e5; background: #fff; color: #888;
    cursor: pointer; font-family: inherit; transition: all .15s;
}
.rp-filter.active { border-color: #e53935; color: #e53935; font-weight: 600; background: #fff5f5; }

/* ── Stats ── */
.rp-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px; margin-bottom: 20px;
}
.rp-stat {
    background: #fff; border: 0.5px solid #e5e5e5;
    border-radius: 12px; padding: 16px;
    animation: fadeUp .3s ease both;
}
.rp-stat__label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 4px; }
.rp-stat__val   { font-size: 22px; font-weight: 700; color: #111; margin: 0; }

/* ── Section card (wraps table) ── */
.rp-section {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    padding: 0;
    margin-bottom: 20px;
    overflow: hidden;
}

/* ── Table ── */
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

/* ── Badges ── */
.rp-badge {
    font-size: 11px; padding: 3px 10px;
    border-radius: 20px; font-weight: 600; white-space: nowrap;
}

/* ── Action buttons ── */
.rp-action-btn {
    font-size: 12px; padding: 5px 12px; border-radius: 8px;
    border: none; cursor: pointer; font-family: inherit;
    font-weight: 600; transition: all .15s; margin: 2px 2px 2px 0;
    white-space: nowrap;
}
.rp-action-btn.approve { background: #d1fae5; color: #065f46; }
.rp-action-btn.approve:hover { background: #065f46; color: #fff; }
.rp-action-btn.reject  { background: #fee2e2; color: #991b1b; }
.rp-action-btn.reject:hover  { background: #991b1b; color: #fff; }
.rp-action-btn.view    { background: #f3f4f6; color: #374151; }
.rp-action-btn.view:hover    { background: #374151; color: #fff; }

/* ── Empty / Loader ── */
.rp-empty  { text-align: center; padding: 48px; color: #bbb; font-size: 14px; }
.rp-loader { display: flex; align-items: center; justify-content: center; padding: 48px; gap: 10px; color: #aaa; font-size: 13px; }
.rp-loader__ring { width: 24px; height: 24px; border: 2px solid #eee; border-top-color: #e53935; border-radius: 50%; animation: spin .8s linear infinite; flex-shrink: 0; }

/* ── Detail modal ── */
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
.rp-modal-btns { display: flex; gap: 8px; margin-top: 16px; }
.rp-modal-btn {
    flex: 1; padding: 11px; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all .15s;
}
.rp-modal-btn.approve { background: #e53935; color: #fff; }
.rp-modal-btn.approve:hover { background: #c62828; }
.rp-modal-btn.reject  { background: #f3f4f6; color: #374151; }
.rp-modal-btn.reject:hover  { background: #374151; color: #fff; }
.rp-modal-btn:disabled { opacity: .5; cursor: not-allowed; }
.rp-success { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 12px; text-align: center; }
.rp-error   { background: #fee2e2; color: #991b1b; padding: 8px 12px;  border-radius: 8px; font-size: 12px; margin-bottom: 12px; }

/* ════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════ */
@media (max-width: 768px) {
    /* Show hamburger header, hide PageHeader */
    .rp-mobile-header  { display: flex; }
    .rp-desktop-header { display: none; }

    .rp-wrap { padding: 16px; }
    .rp-mobile-header { margin: -16px -16px 16px -16px; }

    /* Stats: 2 cols */
    .rp-stats { grid-template-columns: 1fr 1fr; }

    /* Table → card layout */
    .rp-table thead { display: none; }
    .rp-table, .rp-table tbody, .rp-table tr, .rp-table td { display: block; width: 100%; }
    .rp-table tr {
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        position: relative;
    }
    .rp-table tr:last-child { border-bottom: none; }
    .rp-table tr:hover td  { background: transparent; }
    .rp-table tr:hover     { background: #fafafa; }
    .rp-table td {
        padding: 2px 0;
        border-bottom: none;
        font-size: 13px;
    }
    /* Label each cell with a data-label pseudo */
    .rp-table td[data-label]::before {
        content: attr(data-label) ": ";
        font-size: 10px; font-weight: 600;
        color: #aaa; text-transform: uppercase;
        letter-spacing: .04em; margin-right: 4px;
    }
    /* First cell = ID + customer name, shown as card title */
    .rp-table td.rp-td-id {
        font-size: 12px; font-weight: 700;
        color: #111; padding-bottom: 6px;
    }
    .rp-table td.rp-td-id::before { display: none; }
    /* Action buttons row */
    .rp-table td.rp-td-actions {
        padding-top: 10px;
        display: flex; flex-wrap: wrap; gap: 6px;
    }
    .rp-table td.rp-td-actions::before { display: none; }
    .rp-action-btn { flex: 1; text-align: center; }

    /* Modal full-screen on mobile */
    .rp-overlay { padding: 0; align-items: flex-end; }
    .rp-modal {
        border-radius: 20px 20px 0 0;
        max-height: 92vh;
        padding: 20px 16px;
    }
    .rp-modal-btns { flex-direction: column; }
}

@media (max-width: 480px) {
    .rp-stats { grid-template-columns: 1fr; }
    .rp-filters { gap: 6px; }
    .rp-filter  { font-size: 11px; padding: 5px 10px; }
    .rp-mobile-header { margin: -16px -16px 12px -16px; }
}
`;

// ─── Detail / Action Modal ─────────────────────────────────────────────────────
const ReturnDetailModal = ({ request, onClose, onResolved }) => {
    const [rejectNote, setRejectNote] = useState("");
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handle = async (action) => {
        setError("");
        setLoading(true);
        try {
            if (action === "approve") {
                await api.put(`/api/returns/${request._id}/approve`);
                setSuccess("✓ Return approved. Stock restocked & refund initiated.");
            } else {
                if (!rejectNote.trim()) {
                    setError("Please provide a rejection reason.");
                    setLoading(false);
                    return;
                }
                await api.put(`/api/returns/${request._id}/reject`, { adminNote: rejectNote });
                setSuccess("✕ Return rejected. Customer notified.");
            }
            setTimeout(() => { onResolved(); onClose(); }, 1600);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rp-modal">
                <button className="rp-modal__close" onClick={onClose}>×</button>
                <p className="rp-modal__title">Return Request Details</p>
                <p className="rp-modal__sub">
                    #{request._id?.slice(-6).toUpperCase()} ·&nbsp;
                    {request.user?.name} ({request.user?.email}) ·&nbsp;
                    <span
                        className="rp-badge"
                        style={{ ...(STATUS_COLORS[request.status] || {}), padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}
                    >
                        {request.status}
                    </span>
                </p>

                {success && <div className="rp-success">{success}</div>}
                {error && <div className="rp-error">⚠ {error}</div>}

                {/* Items */}
                <div className="rp-modal-section">
                    <p className="rp-modal-section__label">Items to Return</p>
                    {request.items?.map((item, i) => (
                        <div key={i} className="rp-item-row">
                            {item.img && <img src={item.img} alt={item.name} />}
                            <div>
                                <p className="rp-item-row__name">{item.name}</p>
                                <p className="rp-item-row__meta">
                                    Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}
                                    {item.color && ` · ${item.color}`}
                                    {item.size && ` · ${item.size}`}
                                    {item.reason && ` · Reason: ${item.reason}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {request.description && (
                    <div className="rp-modal-section">
                        <p className="rp-modal-section__label">Customer Note</p>
                        <p style={{ fontSize: 13, color: "#444", margin: 0, background: "#fafafa", padding: "10px 12px", borderRadius: 10 }}>
                            {request.description}
                        </p>
                    </div>
                )}

                {/* Order info */}
                <div className="rp-modal-section">
                    <p className="rp-modal-section__label">Order Info</p>
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                        Order #{request.order?._id?.slice(-6).toUpperCase()} ·&nbsp;
                        Refund: ₹{request.refundAmount?.toLocaleString("en-IN")} ·&nbsp;
                        {request.order?.razorpayPaymentId
                            ? `Payment ID: ${request.order.razorpayPaymentId}`
                            : "No payment ID"}
                    </p>
                </div>

                {/* Reject note field */}
                {request.status === "Pending" && showRejectBox && (
                    <div className="rp-modal-section">
                        <p className="rp-modal-section__label">Rejection Reason</p>
                        <textarea
                            className="rp-reject-note"
                            placeholder="Tell customer why request is rejected…"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                )}

                {/* Action buttons */}
                {request.status === "Pending" && !success && (
                    <div className="rp-modal-btns">
                        <button className="rp-modal-btn approve" disabled={loading} onClick={() => handle("approve")}>
                            {loading ? "Processing…" : "✓ Approve & Refund"}
                        </button>
                        {!showRejectBox ? (
                            <button className="rp-modal-btn reject" onClick={() => setShowRejectBox(true)}>✕ Reject</button>
                        ) : (
                            <button className="rp-modal-btn reject" disabled={loading} onClick={() => handle("reject")}>
                                {loading ? "Rejecting…" : "Confirm Reject"}
                            </button>
                        )}
                    </div>
                )}

                {request.status !== "Pending" && request.adminNote && (
                    <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: 8, fontSize: 13 }}>
                        Admin Note: {request.adminNote}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Returns Page ─────────────────────────────────────────────────────────
const ReturnsPage = ({ toggleSidebar, sidebarOpen }) => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selected, setSelected] = useState(null);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const statusParam = filter !== "All" ? `?status=${filter}` : "";
            const res = await api.get(`/api/returns${statusParam}`);
            setReturns(res.data);
        } catch (err) {
            console.error("Fetch returns error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturns(); }, [filter]);

    const stats = {
        total: returns.length,
        pending: returns.filter((r) => r.status === "Pending").length,
        approved: returns.filter((r) => r.status === "Approved").length,
        rejected: returns.filter((r) => r.status === "Rejected").length,
    };

    return (
        <>
            <style>{STYLES}</style>
            <div className="rp-wrap">

                {/* ── Mobile sticky header with hamburger ── */}
                <div className="rp-mobile-header">
                    <button className="rp-hamburger" onClick={toggleSidebar} aria-label="Toggle menu">
                        <span /><span /><span />
                    </button>
                    <div>
                        <p className="rp-mobile-title">Return Requests</p>
                        <p className="rp-mobile-sub">Review and action customer returns</p>
                    </div>
                </div>

                {/* ── Desktop header ── */}
                <div className="rp-desktop-header">
                    <PageHeader
                        title="Return Requests"
                        subtitle="Review and action customer returns"
                        toggleSidebar={toggleSidebar}
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                {/* ── Filters ── */}
                <div className="rp-filters">
                    {["All", "Pending", "Approved", "Rejected"].map((f) => (
                        <button
                            key={f}
                            className={`rp-filter ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f} {f !== "All" && `(${stats[f.toLowerCase()]})`}
                        </button>
                    ))}
                </div>

                {/* ── Stats ── */}
                <div className="rp-stats">
                    {[
                        { label: "Total", value: stats.total },
                        { label: "Pending Review", value: stats.pending },
                        { label: "Approved", value: stats.approved },
                    ].map((s, i) => (
                        <div key={s.label} className="rp-stat" style={{ animationDelay: `${i * 60}ms` }}>
                            <p className="rp-stat__label">{s.label}</p>
                            <p className="rp-stat__val">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Table ── */}
                {loading ? (
                    <div className="rp-loader">
                        <div className="rp-loader__ring" />
                        <span>Loading return requests…</span>
                    </div>
                ) : returns.length === 0 ? (
                    <div className="rp-empty">
                        ↩ No {filter !== "All" ? filter.toLowerCase() : ""} return requests
                    </div>
                ) : (
                    <div className="rp-section">
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Customer</th>
                                    <th>Order</th>
                                    <th>Amount</th>
                                    <th>Items</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.map((rr) => {
                                    const sc = STATUS_COLORS[rr.status] || { bg: "#f3f4f6", text: "#374151" };
                                    return (
                                        <tr key={rr._id}>
                                            <td className="rp-td-id">
                                                <span style={{ fontFamily: "monospace" }}>
                                                    #{rr._id?.slice(-6).toUpperCase()}
                                                </span>

                                                <span style={{ fontFamily: "inherit", marginLeft: 8, fontWeight: 400, color: "#555" }}>
                                                    {rr.user?.name}
                                                </span>
                                            </td>
                                            <td data-label="Customer">
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{rr.user?.name}</p>
                                                <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{rr.user?.email}</p>
                                            </td>
                                            <td data-label="Order" style={{ fontFamily: "monospace", fontSize: 12 }}>
                                                #{rr.order?._id?.slice(-6).toUpperCase()}
                                            </td>
                                            <td data-label="Amount" style={{ fontWeight: 600 }}>
                                                ₹{rr.refundAmount?.toLocaleString("en-IN")}
                                            </td>
                                            <td data-label="Items">
                                                {rr.items?.length} item{rr.items?.length !== 1 ? "s" : ""}
                                            </td>
                                            <td data-label="Date" style={{ fontSize: 12, color: "#888" }}>
                                                {new Date(rr.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric",
                                                })}
                                            </td>
                                            <td data-label="Status">
                                                <span className="rp-badge" style={{ background: sc.bg, color: sc.text }}>
                                                    {rr.status}
                                                </span>
                                            </td>
                                            <td className="rp-td-actions">
                                                <button className="rp-action-btn view" onClick={() => setSelected(rr)}>View</button>
                                                {rr.status === "Pending" && (
                                                    <>
                                                        <button className="rp-action-btn approve" onClick={() => setSelected(rr)}>Approve</button>
                                                        <button className="rp-action-btn reject" onClick={() => setSelected(rr)}>Reject</button>
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
                    request={selected}
                    onClose={() => setSelected(null)}
                    onResolved={fetchReturns}
                />
            )}
        </>
    );
};
export default ReturnsPage;