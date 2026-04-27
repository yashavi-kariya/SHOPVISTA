import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";

const CollectionsPage = ({ products, toggleSidebar, sidebarOpen }) => {
    const [activeFilter, setActiveFilter] = useState("all");

    const filtered = activeFilter === "all"
        ? products
        : products.filter(p => (p.collection || "none") === activeFilter);
    const groups = {};
    filtered.forEach(p => {
        const col = p.collection || "none";
        if (!groups[col]) groups[col] = [];
        groups[col].push(p);
    });
    const stats = [
        ["Total Products", products.length],
        ["Summer ☀️", products.filter(p => p.collection === "summer").length],
        ["Winter ❄️", products.filter(p => p.collection === "winter").length],
        ["No Collection", products.filter(p => !p.collection || p.collection === "none").length],
    ];
    const LABELS = { summer: "☀️ Summer", winter: "❄️ Winter", none: "No Collection" };
    const BANNER_COLORS = { summer: "#fef3c7", winter: "#dbeafe", none: "#f3f4f6" };
    const BADGE_STYLES = {
        summer: { background: "#fde68a", color: "#92400e" },
        winter: { background: "#bfdbfe", color: "#1e40af" },
        none: { background: "#e5e7eb", color: "#6b7280" },
    };
    return (
        <div className="page">
            <style>{`
        .cc-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; margin-bottom:20px; }
        .cc-stat { background:#f5f5f5; border-radius:8px; padding:14px 16px; }
        .cc-stat-label { font-size:12px; color:#888; margin-bottom:4px; }
        .cc-stat-val { font-size:22px; font-weight:500; }
        .cc-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .cc-tab { padding:7px 18px; border-radius:20px; border:1px solid #ddd; background:#fff; font-size:13px; cursor:pointer; color:#888; }
        .cc-tab.active { background:#6b2737; color:#fff; border-color:#6b2737; }
        .cc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .cc-card { background:#fff; border:1px solid #e8e8e8; border-radius:12px; overflow:hidden; }
        .cc-banner { height:68px; display:flex; align-items:center; justify-content:space-between; padding:0 18px; }
        .cc-badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
        .cc-body { padding:16px 18px; }
        .cc-card-title { font-size:15px; font-weight:500; margin-bottom:3px; }
        .cc-card-meta { font-size:12px; color:#aaa; margin-bottom:14px; }
        .cc-product-row { display:flex; align-items:center; gap:10px; padding:8px 10px; background:#f8f8f8; border-radius:8px; margin-bottom:7px; }
        .cc-product-img { width:40px; height:40px; border-radius:6px; object-fit:cover; background:#eee; flex-shrink:0; }
        .cc-product-name { font-size:12px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cc-product-variants { font-size:11px; color:#bbb; }
        .cc-product-price { font-size:12px; font-weight:500; color:#6b2737; flex-shrink:0; }
        .cc-more { text-align:center; font-size:12px; color:#ccc; padding:6px 0 2px; }
        @media(max-width:600px){ .cc-grid{grid-template-columns:1fr;} }
      `}</style>

            <PageHeader title="Collections" subtitle="Products grouped by season" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

            {/* Stats */}
            <div className="cc-stats">
                {stats.map(([label, val]) => (
                    <div className="cc-stat" key={label}>
                        <div className="cc-stat-label">{label}</div>
                        <div className="cc-stat-val">{val}</div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="cc-tabs">
                {[["all", "All"], ["summer", "☀️ Summer"], ["winter", "❄️ Winter"], ["none", "No Collection"]].map(([key, label]) => (
                    <div key={key} className={`cc-tab ${activeFilter === key ? "active" : ""}`} onClick={() => setActiveFilter(key)}>
                        {label}
                    </div>
                ))}
            </div>

            {/* Collection Cards */}
            <div className="cc-grid">
                {Object.keys(groups).length === 0 && (
                    <p style={{ color: "#aaa", fontSize: "14px", padding: "40px 0" }}>No products found.</p>
                )}
                {Object.entries(groups).map(([col, items]) => {
                    const totalVariants = items.reduce((s, p) => s + (p.variants?.length || 0), 0);
                    const totalStock = items.reduce((s, p) => s + (p.variants?.reduce((a, v) => a + (v.stock || 0), 0) || 0), 0);
                    const shown = items.slice(0, 3);
                    const more = items.length - shown.length;
                    const badge = BADGE_STYLES[col] || BADGE_STYLES.none;

                    return (
                        <div className="cc-card" key={col}>
                            <div className="cc-banner" style={{ background: BANNER_COLORS[col] || "#f3f4f6" }}>
                                <span className="cc-badge" style={badge}>{LABELS[col] || col}</span>
                                <span style={{ fontSize: "28px" }}>{col === "summer" ? "☀️" : col === "winter" ? "❄️" : "🛍️"}</span>
                            </div>
                            <div className="cc-body">
                                <div className="cc-card-title">{LABELS[col] || col} Collection</div>
                                <div className="cc-card-meta">
                                    {items.length} product{items.length !== 1 ? "s" : ""} &bull; {totalVariants} variant{totalVariants !== 1 ? "s" : ""} &bull; {totalStock} in stock
                                </div>
                                {shown.map(p => {
                                    const imgs = p.images?.length > 0 ? p.images : (p.img ? [p.img] : []);
                                    const minPrice = Math.min(...(p.variants || []).map(v => v.price || 0));
                                    const variantDesc = (p.variants || []).slice(0, 2)
                                        .map(v => `${v.attributes?.color || ""}${v.attributes?.size ? " / " + v.attributes.size : ""}`)
                                        .join(", ") + (p.variants?.length > 2 ? " +more" : "");
                                    return (
                                        <div className="cc-product-row" key={p._id}>
                                            {imgs[0]
                                                ? <img className="cc-product-img" src={imgs[0]} alt={p.name} onError={e => e.target.src = "/placeholder.png"} />
                                                : <div className="cc-product-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#ccc" }}>IMG</div>
                                            }
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="cc-product-name">{p.name}</div>
                                                <div className="cc-product-variants">{variantDesc}</div>
                                            </div>
                                            <div className="cc-product-price">₹{minPrice.toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                                {more > 0 && <div className="cc-more">+{more} more product{more !== 1 ? "s" : ""}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CollectionsPage;