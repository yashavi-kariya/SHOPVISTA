import React, { useEffect, useState } from "react";
import api from "../../api";
import PageHeader from "./PageHeader";

const EMPTY_FORM = {
    code: "",
    discountType: "percent",
    discountValue: "",
    minCartValue: "",
    maxCartValue: "",
    expiryDate: "",
    usageLimit: "",
};

const CouponsPage = ({ token, toggleSidebar, sidebarOpen }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/coupons/admin/all", authHeader);
            setCoupons(res.data);
        } catch (err) {
            console.error("Fetch coupons error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const openCreate = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (c) => {
        setEditId(c._id);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minCartValue: c.minCartValue,
            maxCartValue: c.maxCartValue ?? "",
            expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : "",
            usageLimit: c.usageLimit ?? "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.discountValue || !form.expiryDate) {
            alert("Code, discount value and expiry are required.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                minCartValue: Number(form.minCartValue) || 0,
                maxCartValue: form.maxCartValue !== "" ? Number(form.maxCartValue) : null,
                usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : null,
            };
            if (editId) {
                await api.put(`/api/coupons/admin/${editId}`, payload, authHeader);
            } else {
                await api.post("/api/coupons/admin", payload, authHeader);
            }
            setShowModal(false);
            fetchCoupons();
        } catch (err) {
            alert(err.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            await api.delete(`/api/coupons/admin/${id}`, authHeader);
            setCoupons(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleToggle = async (id, current) => {
        try {
            await api.put(`/api/coupons/admin/${id}`, { isActive: !current }, authHeader);
            setCoupons(prev => prev.map(c => c._id === id ? { ...c, isActive: !current } : c));
        } catch (err) {
            alert("Toggle failed");
        }
    };

    const filtered = coupons
        .filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()))
        .filter(c => filterType === "all" || c.discountType === filterType);

    const stats = [
        ["Total", coupons.length],
        ["Active", coupons.filter(c => c.isActive !== false).length],
        ["Percent", coupons.filter(c => c.discountType === "percent").length],
        ["Flat", coupons.filter(c => c.discountType === "flat").length],
    ];

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    const isExpired = (d) => d && new Date(d) < new Date();

    return (
        <div className="page">
            <style>{`
                .cp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;}
                .cp-stat{background:#f5f5f5;border-radius:8px;padding:14px 16px;}
                .cp-stat-label{font-size:12px;color:#888;margin-bottom:4px;}
                .cp-stat-val{font-size:22px;font-weight:500;}
                .cp-toolbar{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center;}
                .cp-toolbar input,.cp-toolbar select{padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;color:#111;outline:none;}
                .cp-toolbar input{flex:1;min-width:160px;}
                .cp-table{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;}
                .cp-th{display:grid;grid-template-columns:2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 1fr 1.2fr;padding:11px 16px;background:#f8f8f8;border-bottom:1px solid #f0f0f0;font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.06em;}
                .cp-td{display:grid;grid-template-columns:2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 1fr 1.2fr;padding:12px 16px;border-bottom:1px solid #f7f7f7;align-items:center;font-size:13px;}
                .cp-td:last-child{border-bottom:none;}
                .cp-td:hover{background:#fafafa;}
                .cp-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;}
                .cp-btn{padding:5px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer;margin-right:4px;}
                .cp-btn:hover{background:#f5f5f5;}
                .cp-btn.danger{border-color:#fca5a5;color:#dc2626;}
                .cp-btn.danger:hover{background:#fef2f2;}
                .cp-toggle{position:relative;display:inline-block;width:36px;height:20px;}
                .cp-toggle input{opacity:0;width:0;height:0;}
                .cp-slider{position:absolute;cursor:pointer;inset:0;background:#ddd;border-radius:20px;transition:.3s;}
                .cp-slider:before{content:"";position:absolute;width:14px;height:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;}
                input:checked+.cp-slider{background:#1a1a1a;}
                input:checked+.cp-slider:before{transform:translateX(16px);}
                .cp-mobile{display:none;}
                .cp-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:14px 16px;margin-bottom:10px;}
                .cp-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
                .cp-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;}
                .cp-card-field label{font-size:11px;color:#aaa;display:block;margin-bottom:2px;}
                .cp-card-field span{font-size:13px;font-weight:500;}
                .cp-card-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f5f5f5;padding-top:10px;}
                /* Modal */
                .cp-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
                .cp-modal{background:#fff;border-radius:14px;padding:28px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,0.18);}
                .cp-modal h3{margin:0 0 20px;font-size:17px;font-weight:600;}
                .cp-field{margin-bottom:14px;}
                .cp-field label{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em;}
                .cp-field input,.cp-field select{width:100%;padding:9px 12px;border:1.5px solid #e2ddd8;border-radius:8px;font-size:13px;outline:none;background:#fff;color:#111;}
                .cp-field input:focus{border-color:#1a1a1a;}
                .cp-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                .cp-save-btn{width:100%;padding:12px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-top:6px;}
                .cp-save-btn:disabled{opacity:.6;cursor:not-allowed;}
                .cp-cancel-btn{width:100%;padding:11px;background:transparent;color:#888;border:1.5px solid #e2ddd8;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;}
                @media(max-width:700px){.cp-table{display:none;}.cp-mobile{display:block;}.cp-toolbar input{min-width:100px;}}
            `}</style>

            <PageHeader title="Coupons" subtitle="Manage discount coupons" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

            {/* Stats */}
            <div className="cp-stats">
                {stats.map(([label, val]) => (
                    <div className="cp-stat" key={label}>
                        <div className="cp-stat-label">{label}</div>
                        <div className="cp-stat-val">{val}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="cp-toolbar">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon code..." />
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="percent">Percent</option>
                    <option value="flat">Flat</option>
                </select>
                <button
                    onClick={openCreate}
                    style={{ padding: "8px 16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                    + New Coupon
                </button>
            </div>

            {loading && <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading coupons...</p>}

            {/* Desktop Table */}
            {!loading && (
                <div className="cp-table">
                    <div className="cp-th">
                        <span>Code</span>
                        <span>Type</span>
                        <span>Value</span>
                        <span>Min Cart</span>
                        <span>Max Cart</span>
                        <span>Expiry</span>
                        <span>Active</span>
                        <span>Actions</span>
                    </div>
                    {filtered.length === 0 && (
                        <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No coupons found.</p>
                    )}
                    {filtered.map(c => {
                        const expired = isExpired(c.expiryDate);
                        return (
                            <div className="cp-td" key={c._id}>
                                {/* Code */}
                                <div>
                                    <span style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 13, letterSpacing: 1 }}>{c.code}</span>
                                    {c.isAutoGenerated && (
                                        <span style={{ fontSize: 10, color: "#888", marginLeft: 6, background: "#f3f4f6", padding: "1px 6px", borderRadius: 10 }}>auto</span>
                                    )}
                                    {c.usageLimit != null && (
                                        <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
                                            Used: {c.usedCount ?? 0}/{c.usageLimit}
                                        </div>
                                    )}
                                </div>
                                {/* Type */}
                                <span className="cp-badge" style={c.discountType === "percent"
                                    ? { background: "#dbeafe", color: "#1e40af" }
                                    : { background: "#fef9c3", color: "#854d0e" }}>
                                    {c.discountType === "percent" ? "%" : "₹"} {c.discountType}
                                </span>
                                {/* Value */}
                                <span style={{ fontWeight: 600 }}>
                                    {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                                </span>
                                {/* Min Cart */}
                                <span style={{ color: "#888" }}>₹{c.minCartValue || 0}</span>
                                {/* Max Cart */}
                                <span style={{ color: "#888" }}>{c.maxCartValue ? `₹${c.maxCartValue}` : "—"}</span>
                                {/* Expiry */}
                                <span style={{ color: expired ? "#dc2626" : "#555", fontSize: 12 }}>
                                    {fmtDate(c.expiryDate)}
                                    {expired && <span style={{ marginLeft: 4, fontSize: 10, background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 10 }}>Expired</span>}
                                </span>
                                {/* Toggle */}
                                <label className="cp-toggle">
                                    <input type="checkbox" checked={c.isActive !== false} onChange={() => handleToggle(c._id, c.isActive !== false)} />
                                    <span className="cp-slider" />
                                </label>
                                {/* Actions */}
                                <div>
                                    <button className="cp-btn" onClick={() => openEdit(c)}>Edit</button>
                                    <button className="cp-btn danger" onClick={() => handleDelete(c._id)}>Del</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mobile Cards */}
            {!loading && (
                <div className="cp-mobile">
                    {filtered.length === 0 && (
                        <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No coupons found.</p>
                    )}
                    {filtered.map(c => {
                        const expired = isExpired(c.expiryDate);
                        return (
                            <div className="cp-card" key={c._id}>
                                <div className="cp-card-top">
                                    <div>
                                        <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 14, letterSpacing: 1 }}>{c.code}</span>
                                        {c.isAutoGenerated && <span style={{ fontSize: 10, color: "#888", marginLeft: 6, background: "#f3f4f6", padding: "1px 6px", borderRadius: 10 }}>auto</span>}
                                    </div>
                                    <label className="cp-toggle">
                                        <input type="checkbox" checked={c.isActive !== false} onChange={() => handleToggle(c._id, c.isActive !== false)} />
                                        <span className="cp-slider" />
                                    </label>
                                </div>
                                <div className="cp-card-grid">
                                    <div className="cp-card-field">
                                        <label>Type</label>
                                        <span>{c.discountType === "percent" ? `${c.discountValue}% off` : `₹${c.discountValue} flat`}</span>
                                    </div>
                                    <div className="cp-card-field">
                                        <label>Min Cart</label>
                                        <span>₹{c.minCartValue || 0}</span>
                                    </div>
                                    <div className="cp-card-field">
                                        <label>Expiry</label>
                                        <span style={{ color: expired ? "#dc2626" : "#111" }}>{fmtDate(c.expiryDate)}</span>
                                    </div>
                                    {c.usageLimit != null && (
                                        <div className="cp-card-field">
                                            <label>Usage</label>
                                            <span>{c.usedCount ?? 0}/{c.usageLimit}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="cp-card-footer">
                                    {expired && <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 10 }}>Expired</span>}
                                    {!expired && <span />}
                                    <div>
                                        <button className="cp-btn" onClick={() => openEdit(c)}>Edit</button>
                                        <button className="cp-btn danger" onClick={() => handleDelete(c._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="cp-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="cp-modal">
                        <h3>{editId ? "Edit Coupon" : "Create Coupon"}</h3>

                        <div className="cp-field">
                            <label>Coupon Code *</label>
                            <input
                                value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                placeholder="e.g. SAVE20"
                            />
                        </div>

                        <div className="cp-field-row">
                            <div className="cp-field">
                                <label>Discount Type *</label>
                                <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                                    <option value="percent">Percent (%)</option>
                                    <option value="flat">Flat (₹)</option>
                                </select>
                            </div>
                            <div className="cp-field">
                                <label>Discount Value *</label>
                                <input
                                    type="number" min="0"
                                    value={form.discountValue}
                                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                                    placeholder={form.discountType === "percent" ? "e.g. 10" : "e.g. 200"}
                                />
                            </div>
                        </div>

                        <div className="cp-field-row">
                            <div className="cp-field">
                                <label>Min Cart Value (₹)</label>
                                <input
                                    type="number" min="0"
                                    value={form.minCartValue}
                                    onChange={e => setForm(f => ({ ...f, minCartValue: e.target.value }))}
                                    placeholder="e.g. 500"
                                />
                            </div>
                            <div className="cp-field">
                                <label>Max Cart Value (₹)</label>
                                <input
                                    type="number" min="0"
                                    value={form.maxCartValue}
                                    onChange={e => setForm(f => ({ ...f, maxCartValue: e.target.value }))}
                                    placeholder="Leave blank = no limit"
                                />
                            </div>
                        </div>
                        <div className="cp-field-row">
                            <div className="cp-field">
                                <label>Usage Limit</label>
                                <input
                                    type="number" min="1"
                                    value={form.usageLimit}
                                    onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                                    placeholder="Leave blank = unlimited"
                                />
                            </div>
                            <div className="cp-field">
                                <label>Expiry Date *</label>
                                <input
                                    type="date"
                                    value={form.expiryDate}
                                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <button className="cp-save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : editId ? "Update Coupon" : "Create Coupon"}
                        </button>
                        <button className="cp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponsPage;