import React, { useEffect, useState } from "react";
import api from "../../api";
import PageHeader from "./PageHeader";

const EMPTY_TIER = { minCartValue: "", discountValue: "", prefix: "" };

const SettingsPage = ({ token, toggleSidebar, sidebarOpen }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [shippingCharge, setShippingCharge] = useState(79);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
    const [defaultReturnWindowDays, setDefaultReturnWindowDays] = useState(7);
    const [tiers, setTiers] = useState([
        { minCartValue: 3000, discountValue: 10, prefix: "SAVE10-" },
        { minCartValue: 5000, discountValue: 20, prefix: "SAVE20-" },
        { minCartValue: 7000, discountValue: 30, prefix: "MEGA30-" },
    ]);

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    useEffect(() => {
        api.get("/api/settings")
            .then(res => {
                if (res.data) {
                    setShippingCharge(res.data.shippingCharge ?? 79);
                    setFreeShippingThreshold(res.data.freeShippingThreshold ?? 999);
                    setLowStockThreshold(res.data.lowStockThreshold ?? 5);
                    setDefaultReturnWindowDays(res.data.defaultReturnWindowDays ?? 7);
                    if (res.data.couponTiers?.length) setTiers(res.data.couponTiers);
                }
            })
            .catch(err => console.error("Settings fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await api.put("/api/settings", {
                shippingCharge: Number(shippingCharge),
                freeShippingThreshold: Number(freeShippingThreshold),
                lowStockThreshold: Number(lowStockThreshold),
                defaultReturnWindowDays: Number(defaultReturnWindowDays),
                couponTiers: tiers.map(t => ({
                    minCartValue: Number(t.minCartValue),
                    discountValue: Number(t.discountValue),
                    prefix: t.prefix || "",
                })),
            }, authHeader);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const addTier = () => setTiers(prev => [...prev, { ...EMPTY_TIER }]);
    const updateTier = (i, field, val) => {
        setTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
    };
    const removeTier = (i) => {
        setTiers(prev => prev.filter((_, idx) => idx !== i));
    };
    const sortedTiers = [...tiers].sort((a, b) => Number(a.minCartValue) - Number(b.minCartValue));
    return (
        <div className="page">
            <style>{`
                .sp-section{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:24px;margin-bottom:20px;}
                .sp-section-title{font-size:14px;font-weight:700;color:#111;margin:0 0 4px;}
                .sp-section-sub{font-size:12px;color:#aaa;margin:0 0 20px;}
                .sp-field{margin-bottom:16px;}
                .sp-field label{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em;}
                .sp-field input{width:100%;padding:10px 12px;border:1.5px solid #e2ddd8;border-radius:8px;font-size:14px;outline:none;color:#111;background:#fff;max-width:280px;}
                .sp-field input:focus{border-color:#1a1a1a;}
                .sp-field-hint{font-size:11px;color:#aaa;margin-top:4px;}
                .sp-field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:560px;}
                .sp-tier-row{display:grid;grid-template-columns:1.5fr 1.5fr 2fr auto;gap:10px;align-items:center;padding:12px;background:#f9f9f9;border-radius:8px;margin-bottom:8px;border:1px solid #f0f0f0;}
                .sp-tier-input{width:100%;padding:8px 10px;border:1.5px solid #e2ddd8;border-radius:7px;font-size:13px;outline:none;color:#111;background:#fff;}
                .sp-tier-input:focus{border-color:#1a1a1a;}
                .sp-tier-header{display:grid;grid-template-columns:1.5fr 1.5fr 2fr auto;gap:10px;padding:6px 12px;font-size:11px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;}
                .sp-del-btn{padding:6px 10px;background:#fff;border:1px solid #fca5a5;border-radius:6px;color:#dc2626;cursor:pointer;font-size:13px;}
                .sp-del-btn:hover{background:#fef2f2;}
                .sp-add-btn{padding:8px 14px;background:#f5f5f5;border:1.5px dashed #ccc;border-radius:8px;color:#555;font-size:13px;font-weight:600;cursor:pointer;width:100%;margin-top:4px;}
                .sp-add-btn:hover{background:#eee;}
                .sp-save-btn{padding:12px 32px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;}
                .sp-save-btn:disabled{opacity:.6;cursor:not-allowed;}
                .sp-saved{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#dcfce7;color:#166534;border-radius:8px;font-size:13px;font-weight:600;margin-left:12px;}
                .sp-preview{background:#f9f9f9;border:1px solid #f0f0f0;border-radius:8px;padding:14px 16px;margin-top:14px;}
                .sp-preview-title{font-size:11px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}
                .sp-preview-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #f0f0f0;}
                .sp-preview-row:last-child{border-bottom:none;}
                @media(max-width:600px){
                    .sp-field-row{grid-template-columns:1fr;}
                    .sp-tier-row{grid-template-columns:1fr 1fr;gap:8px;}
                    .sp-tier-row .sp-tier-input:nth-child(3){grid-column:1/-1;}
                    .sp-tier-header{display:none;}
                }
            `}</style>

            <PageHeader title="Settings" subtitle="Shipping charges and discount tiers" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

            {loading ? (
                <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading settings...</p>
            ) : (
                <>
                    {/* ── Shipping Settings ── */}
                    <div className="sp-section">
                        <p className="sp-section-title">Shipping Settings</p>
                        <p className="sp-section-sub">Set shipping charge and free shipping threshold. Applied on discounted cart total.</p>

                        <div className="sp-field-row">
                            <div className="sp-field">
                                <label>Shipping Charge (₹)</label>
                                <input
                                    type="number" min="0"
                                    value={shippingCharge}
                                    onChange={e => setShippingCharge(e.target.value)}
                                />
                                <p className="sp-field-hint">Charged when cart is below free threshold</p>
                            </div>
                            <div className="sp-field">
                                <label>Free Shipping Threshold (₹)</label>
                                <input
                                    type="number" min="0"
                                    value={freeShippingThreshold}
                                    onChange={e => setFreeShippingThreshold(e.target.value)}
                                />
                                <p className="sp-field-hint">Orders above this get free shipping</p>
                            </div>
                            <div className="sp-field">
                                <label>Low Stock Alert (units)</label>
                                <input
                                    type="number" min="1"
                                    value={lowStockThreshold}
                                    onChange={e => setLowStockThreshold(e.target.value)}
                                />
                                <p className="sp-field-hint">Alert when variant stock falls below this number</p>
                            </div>
                            <div className="sp-field">
                                <label>Default Return Window (days)</label>
                                <input
                                    type="number"
                                    value={defaultReturnWindowDays}
                                    onChange={(e) => setDefaultReturnWindowDays(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="sp-preview">
                            <p className="sp-preview-title">Live Preview</p>
                            <div className="sp-preview-row">
                                <span>Cart total ≥ ₹{Number(freeShippingThreshold).toLocaleString("en-IN")}</span>
                                <span style={{ color: "#16a34a", fontWeight: 600 }}>Free Shipping 🎉</span>
                            </div>
                            <div className="sp-preview-row">
                                <span>Cart total &lt; ₹{Number(freeShippingThreshold).toLocaleString("en-IN")}</span>
                                <span style={{ fontWeight: 600 }}>₹{Number(shippingCharge).toLocaleString("en-IN")} shipping</span>
                            </div>
                        </div>
                    </div>


                    {/* ── Save Button ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button className="sp-save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                        {saved && (
                            <span className="sp-saved">✓ Settings saved</span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
export default SettingsPage;