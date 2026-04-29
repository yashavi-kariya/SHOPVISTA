import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CompareContext } from "../context/CompareContext";

const Compare = () => {
    const { compare, toggleCompare, clearCompare } = useContext(CompareContext);

    const getImgUrl = (path) => {
        if (!path) return "/no-image.png";
        if (path.startsWith("http")) return path;
        return `${import.meta.env.VITE_API_URL || ""}${path}`;
    };

    const fields = [
        {
            label: "Price",
            key: "price",
            format: (v) => `Rs. ${v?.toLocaleString() || "—"}`,
        },
        {
            label: "Category",
            key: "category",
            format: (v) => v || "—",
        },
        {
            label: "Discount",
            key: "discount",
            format: (v) =>
                v > 0 ? (
                    <span style={{ color: "#e53935", fontWeight: 600 }}>{v}% OFF</span>
                ) : (
                    <span style={{ color: "#aaa" }}>No discount</span>
                ),
        },
        {
            label: "Colors",
            key: "colors",
            format: (v) =>
                v?.length ? (
                    <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                        {v.map((c, i) => (
                            <span
                                key={i}
                                title={c}
                                style={{
                                    display: "inline-block",
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: c,
                                    border: "2px solid #eee",
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <span style={{ color: "#aaa" }}>—</span>
                ),
        },
        {
            label: "Rating",
            key: "rating",
            format: (v) =>
                v ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <span style={{ color: "#f5a623", fontSize: 16 }}>★</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                        <span style={{ color: "#bbb", fontSize: 12 }}>/5</span>
                    </div>
                ) : (
                    <span style={{ color: "#aaa" }}>No rating</span>
                ),
        },
        {
            label: "Availability",
            key: "stock",
            format: (v) =>
                v > 0 ? (
                    <span style={{
                        background: "#e8f5e9", color: "#2e7d32",
                        padding: "3px 10px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600
                    }}>In Stock</span>
                ) : (
                    <span style={{
                        background: "#ffebee", color: "#c62828",
                        padding: "3px 10px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600
                    }}>Out of Stock</span>
                ),
        },
    ];

    // Empty state
    if (compare.length === 0) return (
        <>
            <style>{emptyStyles}</style>
            <div className="cmp-empty">
                <div className="cmp-empty__icon">⚖️</div>
                <h2>Nothing to compare yet</h2>
                <p>Browse products and click the compare icon to add them here.</p>
                <Link to="/" className="cmp-back-btn">← Continue Shopping</Link>
            </div>
        </>
    );

    return (
        <>
            <style>{styles}</style>

            <section className="cmp-page">
                <div className="cmp-inner">

                    {/* Header */}
                    <div className="cmp-header">
                        <div>
                            <p className="cmp-header__eyebrow">Product Comparison</p>
                            <h1 className="cmp-header__title">Compare Items</h1>
                        </div>
                        <div className="cmp-header__actions">
                            <Link to="/" className="cmp-ghost-btn">← Add More</Link>
                            <button className="cmp-danger-btn" onClick={clearCompare}>
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Table wrapper — scrollable on mobile */}
                    <div className="cmp-scroll-wrap">
                        <table className="cmp-table">
                            {/* Product cards row */}
                            <thead>
                                <tr>
                                    <th className="cmp-table__label-col">
                                        <span className="cmp-items-count">
                                            {compare.length} / 3 items
                                        </span>
                                    </th>
                                    {compare.map((p) => (
                                        <td key={p.id} className="cmp-table__product-col">
                                            <div className="cmp-card">
                                                <div className="cmp-card__img-wrap">
                                                    <img
                                                        src={getImgUrl(p.image || p.img)}
                                                        alt={p.name}
                                                        className="cmp-card__img"
                                                        onError={(e) => e.target.src = "/no-image.png"}
                                                    />
                                                    {p.discount > 0 && (
                                                        <span className="cmp-card__badge">
                                                            -{p.discount}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="cmp-card__name">{p.name}</p>
                                                <p className="cmp-card__price">Rs. {p.price?.toLocaleString()}</p>
                                                <div className="cmp-card__btns">
                                                    <Link
                                                        to={`/product/${p._id || p.id}`}
                                                        className="cmp-view-btn"
                                                    >
                                                        View Product
                                                    </Link>
                                                    <button
                                                        className="cmp-remove-btn"
                                                        onClick={() => toggleCompare(p)}
                                                        title="Remove from compare"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    ))}

                                    {/* Empty slot placeholders */}
                                    {Array.from({ length: 3 - compare.length }).map((_, i) => (
                                        <td key={`empty-${i}`} className="cmp-table__product-col">
                                            <div className="cmp-card cmp-card--empty">
                                                <div className="cmp-card__empty-icon">+</div>
                                                <p className="cmp-card__empty-text">Add a product</p>
                                                <Link to="/" className="cmp-add-btn">Browse</Link>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </thead>

                            {/* Comparison rows */}
                            <tbody>
                                {fields.map(({ label, key, format }, idx) => (
                                    <tr key={key} className={idx % 2 === 0 ? "cmp-row--alt" : ""}>
                                        <th className="cmp-table__label-col cmp-row__label">
                                            {label}
                                        </th>
                                        {compare.map((p) => (
                                            <td key={p.id} className="cmp-row__value">
                                                {format(p[key])}
                                            </td>
                                        ))}
                                        {/* Empty slot values */}
                                        {Array.from({ length: 3 - compare.length }).map((_, i) => (
                                            <td key={`ev-${i}`} className="cmp-row__value cmp-row__value--empty">
                                                —
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>
        </>
    );
};

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

    .cmp-page {
        min-height: 80vh;
        background: #f9f8f6;
        padding: 48px 0 80px;
        font-family: 'DM Sans', sans-serif;
    }
    .cmp-inner {
        max-width: 1140px;
        margin: 0 auto;
        padding: 0 20px;
    }

    /* Header */
    .cmp-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 36px;
        flex-wrap: wrap;
        gap: 16px;
    }
    .cmp-header__eyebrow {
        font-size: 11px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #b0a090;
        margin-bottom: 6px;
    }
    .cmp-header__title {
        font-family: 'Playfair Display', serif;
        font-size: 32px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
    }
    .cmp-header__actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    .cmp-ghost-btn {
        padding: 9px 18px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: #555;
        text-decoration: none;
        letter-spacing: 0.5px;
        transition: all 0.2s;
    }
    .cmp-ghost-btn:hover { border-color: #333; color: #333; }
    .cmp-danger-btn {
        padding: 9px 18px;
        border: 1px solid #e53935;
        border-radius: 4px;
        background: transparent;
        font-size: 12px;
        font-weight: 500;
        color: #e53935;
        cursor: pointer;
        letter-spacing: 0.5px;
        transition: all 0.2s;
    }
    .cmp-danger-btn:hover { background: #e53935; color: #fff; }

    /* Scroll wrapper */
    .cmp-scroll-wrap {
        overflow-x: auto;
        border-radius: 12px;
        box-shadow: 0 2px 24px rgba(0,0,0,0.07);
        background: #fff;
    }

    /* Table */
    .cmp-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 600px;
    }
    .cmp-table__label-col {
        width: 150px;
        min-width: 120px;
        background: #faf9f7;
        border-right: 1px solid #f0ede8;
    }
    .cmp-table__product-col {
        vertical-align: top;
        padding: 24px 20px;
        border-right: 1px solid #f5f3f0;
    }
    .cmp-table__product-col:last-child { border-right: none; }

    /* Items count badge */
    .cmp-items-count {
        display: block;
        font-size: 11px;
        color: #b0a090;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 24px 20px;
    }

    /* Product card */
    .cmp-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    .cmp-card__img-wrap {
        position: relative;
        width: 100%;
    }
    .cmp-card__img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
    }
    .cmp-card__badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: #e53935;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 3px;
        letter-spacing: 0.5px;
    }
    .cmp-card__name {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
        text-align: center;
        line-height: 1.4;
        margin: 0;
    }
    .cmp-card__price {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0;
    }
    .cmp-card__btns {
        display: flex;
        gap: 8px;
        align-items: center;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }
    .cmp-view-btn {
        flex: 1;
        text-align: center;
        padding: 9px 14px;
        background: #1a1a1a;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        border-radius: 4px;
        text-decoration: none;
        transition: background 0.2s;
        white-space: nowrap;
    }
    .cmp-view-btn:hover { background: #333; color: #fff; }
    .cmp-remove-btn {
        width: 36px;
        height: 36px;
        border-radius: 4px;
        border: 1px solid #eee;
        background: #fff;
        color: #bbb;
        font-size: 14px;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s;
    }
    .cmp-remove-btn:hover { border-color: #e53935; color: #e53935; }

    /* Empty slot card */
    .cmp-card--empty {
        border: 2px dashed #e8e4de;
        border-radius: 8px;
        padding: 32px 16px;
        background: #faf9f7;
        min-height: 320px;
        justify-content: center;
    }
    .cmp-card__empty-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #ccc;
        margin-bottom: 8px;
    }
    .cmp-card__empty-text {
        font-size: 13px;
        color: #bbb;
        margin: 0 0 12px;
    }
    .cmp-add-btn {
        padding: 8px 20px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #888;
        text-decoration: none;
        letter-spacing: 1px;
        text-transform: uppercase;
        transition: all 0.2s;
    }
    .cmp-add-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }

    /* Comparison rows */
    .cmp-row--alt { background: #faf9f7; }
    .cmp-row__label {
        font-size: 12px;
        font-weight: 600;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 18px 20px;
        text-align: left;
        border-top: 1px solid #f0ede8;
    }
    .cmp-row__value {
        padding: 18px 20px;
        text-align: center;
        font-size: 14px;
        color: #333;
        border-top: 1px solid #f0ede8;
        border-right: 1px solid #f5f3f0;
        vertical-align: middle;
    }
    .cmp-row__value:last-child { border-right: none; }
    .cmp-row__value--empty { color: #ddd; }

    /* Empty state */
    .cmp-empty {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'DM Sans', sans-serif;
        text-align: center;
        padding: 40px 20px;
    }
    .cmp-empty__icon { font-size: 64px; margin-bottom: 20px; }
    .cmp-empty h2 {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
        color: #1a1a1a;
        margin-bottom: 10px;
    }
    .cmp-empty p { color: #999; font-size: 15px; margin-bottom: 28px; }
    .cmp-back-btn {
        padding: 12px 32px;
        background: #1a1a1a;
        color: #fff;
        border-radius: 4px;
        text-decoration: none;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        transition: background 0.2s;
    }
    .cmp-back-btn:hover { background: #333; color: #fff; }

    /* Responsive */
    @media (max-width: 768px) {
        .cmp-header__title { font-size: 24px; }
        .cmp-card__img { height: 150px; }
        .cmp-card--empty { min-height: 240px; }
        .cmp-table__label-col { width: 100px; min-width: 90px; }
    }
    @media (max-width: 480px) {
        .cmp-page { padding: 28px 0 60px; }
        .cmp-header { flex-direction: column; align-items: flex-start; }
        .cmp-header__title { font-size: 22px; }
        .cmp-items-count { padding: 16px 12px; }
        .cmp-table__product-col { padding: 16px 12px; }
        .cmp-row__label, .cmp-row__value { padding: 14px 12px; }
    }
`;

const emptyStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500&display=swap');
    .cmp-empty { font-family: 'DM Sans', sans-serif; }
`;

export default Compare;