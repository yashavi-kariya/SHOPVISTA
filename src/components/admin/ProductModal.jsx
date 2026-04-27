import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import ImageUploader from "./ImageUploader";
const COLORS_MAP = {
    Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c", Blue: "#5bb0e9",
    Green: "#27ae60", Yellow: "#f1c40f", Pink: "#e91e8c", Beige: "#c9a96e",
    Brown: "#795548", Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
};
const ALL_COLORS = Object.keys(COLORS_MAP);
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "1yr to 15yr"];

// ─────────────────────────────────────────────
// PRODUCT MODAL — with multi-image upload
// ─────────────────────────────────────────────
const ProductModal = ({ editId, form, setForm, handleChange, handleVariantChange, removeVariant, handleSubmit, handleCancel, token }) => {
    // console.log("form.images:", form.images);
    const [pfStep, setPfStep] = useState(0);
    const selectedSizes = [...new Set(form.variants.map(v => v.size).filter(Boolean))];

    const toggleSize = (size) => {
        if (selectedSizes.includes(size)) {
            // remove all variants with this size
            const updated = form.variants.filter(v => v.size !== size);
            setForm({
                ...form,
                variants: updated.length ? updated : [{ color: "", size: "", price: "", stock: "", image: "" }]
            });
        } else {
            // add a blank variant slot for this size
            setForm({
                ...form,
                variants: [...form.variants.filter(v => v.size || v.color),
                { color: "", size, price: "", stock: "", image: "" }]
            });
        }
    };

    const toggleColor = (size, color) => {
        const exists = form.variants.find(v => v.size === size && v.color === color);
        if (exists) { removeVariant(form.variants.indexOf(exists)); }
        else { setForm({ ...form, variants: [...form.variants, { color, size, price: "", stock: "", image: "" }] }); }
    };

    const onCancel = () => { setPfStep(0); handleCancel(); };

    return (
        <>
            <style>{`
        @keyframes pf-backdrop{from{opacity:0}to{opacity:1}}
        @keyframes pf-slide{from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pf-row-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .pf-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;animation:pf-backdrop .2s ease;}
        .pf-modal{width:100%;max-width:660px;max-height:90vh;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;animation:pf-slide .3s cubic-bezier(.22,1,.36,1);box-shadow:0 20px 60px rgba(0,0,0,0.18);}
        .pf-modal-head{padding:20px 24px 16px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .pf-modal-head h3{margin:0;font-size:17px;font-weight:600;color:#111;}
        .pf-modal-head p{margin:3px 0 0;font-size:12px;color:#999;}
        .pf-modal-close{width:30px;height:30px;border-radius:50%;border:1.5px solid #e8e8e8;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:#666;transition:all .15s;}
        .pf-modal-close:hover{background:#111;color:#fff;border-color:#111;}
        .pf-tabs{display:flex;padding:0 24px;border-bottom:1px solid #f0f0f0;flex-shrink:0;}
        .pf-tab{padding:11px 18px;font-size:13px;font-weight:500;color:#aaa;border-bottom:2px solid transparent;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:6px;}
        .pf-tab.active{color:#6b2737;border-bottom-color:#6b2737;}
        .pf-tab.done{color:#22c55e;}
        .pf-tab-num{width:18px;height:18px;border-radius:50%;background:#f0f0f0;color:#999;font-size:10px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;}
        .pf-tab.active .pf-tab-num{background:#6b2737;color:#fff;}
        .pf-tab.done .pf-tab-num{background:#22c55e;color:#fff;}
        .pf-body{flex:1;overflow-y:auto;padding:20px 24px;scrollbar-width:thin;}
        .pf-body::-webkit-scrollbar{width:4px;}
        .pf-body::-webkit-scrollbar-thumb{background:#e8e8e8;border-radius:4px;}
        .pf-sec-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#bbb;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
        .pf-sec-label::after{content:'';flex:1;height:1px;background:#f0f0f0;}
        .pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .pf-field{display:flex;flex-direction:column;gap:4px;}
        .pf-field label{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em;}
        .pf-field input,.pf-field select,.pf-field textarea{padding:9px 12px;border:1.5px solid #e8e8e8;border-radius:9px;font-size:13px;background:#fafafa;color:#111;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;box-sizing:border-box;font-family:inherit;}
        .pf-field input:focus,.pf-field select:focus,.pf-field textarea:focus{border-color:#6b2737;box-shadow:0 0 0 3px rgba(107,39,55,.08);background:#fff;}
        .pf-field textarea{resize:vertical;min-height:72px;}
        .pf-full{grid-column:1/-1;}
        @media(max-width:480px){.pf-grid{grid-template-columns:1fr;}}
        .pf-sizes{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px;}
        .pf-size-chip{padding:5px 12px;border-radius:20px;border:1.5px solid #e8e8e8;background:#fff;font-size:12px;font-weight:500;color:#666;cursor:pointer;transition:all .15s;user-select:none;}
        .pf-size-chip:hover{border-color:#6b2737;color:#6b2737;}
        .pf-size-chip.on{background:#6b2737;border-color:#6b2737;color:#fff;}
        .pf-vcard{border:1.5px solid #f0f0f0;border-radius:12px;overflow:hidden;margin-bottom:10px;animation:pf-row-in .2s ease;}
        .pf-vcard-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fafafa;}
        .pf-vcard-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#111;}
        .pf-size-badge{width:28px;height:28px;border-radius:7px;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}
        .pf-vcard-remove{background:none;border:none;cursor:pointer;color:#e74c3c;font-size:12px;padding:3px 8px;border-radius:6px;transition:background .15s;font-family:inherit;}
        .pf-vcard-remove:hover{background:#fde8e8;}
        .pf-vcard-body{padding:12px 14px;}
        .pf-color-row{display:grid;grid-template-columns:110px 1fr 1fr auto;gap:8px;align-items:center;padding:8px 10px;background:#fff;border:1px solid #f5f5f5;border-radius:8px;margin-bottom:6px;animation:pf-row-in .18s ease;}
        @media(max-width:480px){.pf-color-row{grid-template-columns:1fr 1fr;gap:6px;}}
        .pf-color-name{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;}
        .pf-color-dot{width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,.1);flex-shrink:0;}
        .pf-mini-input{padding:6px 8px;border:1.5px solid #e8e8e8;border-radius:7px;font-size:12px;font-family:inherit;background:#fafafa;color:#111;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s;}
        .pf-mini-input:focus{border-color:#6b2737;background:#fff;}
        .pf-rm-btn{background:none;border:none;cursor:pointer;color:#ccc;font-size:15px;padding:2px 4px;border-radius:5px;transition:color .15s;line-height:1;}
        .pf-rm-btn:hover{color:#e74c3c;}
        .pf-color-dots{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
        .pf-cdot{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform .14s,box-shadow .14s;}
        .pf-cdot:hover{transform:scale(1.2);}
        .pf-cdot.on{box-shadow:0 0 0 2px #fff,0 0 0 4px #6b2737;}
        .pf-add-color-btn{width:100%;padding:7px;border:1.5px dashed #ddd;border-radius:7px;background:none;color:#aaa;font-size:12px;cursor:pointer;transition:border-color .15s,color .15s;font-family:inherit;}
        .pf-add-color-btn:hover{border-color:#6b2737;color:#6b2737;}
        .pf-footer{display:flex;gap:8px;padding:14px 24px;border-top:1px solid #f0f0f0;background:#fff;flex-shrink:0;}
        .pf-btn-primary{flex:1;padding:10px;border-radius:10px;border:none;background:#6b2737;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .16s;font-family:inherit;}
        .pf-btn-primary:hover{background:#7d2f42;transform:translateY(-1px);}
        .pf-btn-secondary{padding:10px 18px;border-radius:10px;border:1.5px solid #e8e8e8;background:#fff;color:#666;font-size:13px;font-weight:500;cursor:pointer;transition:all .16s;font-family:inherit;}
        .pf-btn-secondary:hover{border-color:#111;color:#111;}
        .pf-empty-hint{text-align:center;padding:24px;color:#bbb;font-size:13px;}
        .pf-img-note{font-size:11px;color:#aaa;padding:6px 10px;background:#f9f4f5;border-radius:8px;border-left:3px solid #6b2737;}
      `}</style>

            <div className="pf-backdrop" onClick={(e) => e.target.classList.contains("pf-backdrop") && onCancel()}>
                <div className="pf-modal">

                    <div className="pf-modal-head">
                        <div>
                            <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
                            <p>{editId ? "Update product details below" : "Fill in details to list a new product"}</p>
                        </div>
                        <button className="pf-modal-close" onClick={onCancel}>✕</button>
                    </div>

                    <div className="pf-tabs">
                        <div className={`pf-tab ${pfStep === 0 ? "active" : "done"}`} onClick={() => setPfStep(0)}>
                            <span className="pf-tab-num">{pfStep > 0 ? "✓" : "1"}</span> Product Info
                        </div>
                        <div className={`pf-tab ${pfStep === 1 ? "active" : ""}`} onClick={() => setPfStep(1)}>
                            <span className="pf-tab-num">2</span> Variants
                        </div>
                    </div>

                    <div className="pf-body">

                        {pfStep === 0 && (
                            <div>
                                <div style={{ marginBottom: "18px" }}>
                                    <div className="pf-sec-label">Basic Details</div>
                                    <div className="pf-grid">
                                        <div className="pf-field pf-full">
                                            <label>Product Name *</label>
                                            <input name="name" placeholder="e.g. Classic Linen Shirt" value={form.name} onChange={handleChange} required />
                                        </div>
                                        <div className="pf-field">
                                            <label>Brand</label>
                                            <input name="brand" placeholder="Brand name" value={form.brand} onChange={handleChange} />
                                        </div>
                                        <div className="pf-field">
                                            <label>Discount %</label>
                                            <input name="discount" type="number" placeholder="0" value={form.discount} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                {/* ─── MULTI-IMAGE UPLOAD SECTION ─── */}
                                <div style={{ marginBottom: "18px" }}>
                                    <div className="pf-sec-label">Product Images</div>
                                    <div className="pf-img-note" style={{ marginBottom: "10px" }}>
                                        📌 First image becomes the <strong>main product photo</strong>. Click any thumbnail to reorder.
                                    </div>
                                    <ImageUploader
                                        images={form.images || []}
                                        setImages={(imgs) => {
                                            // ✅ handle both function and array
                                            if (typeof imgs === 'function') {
                                                setForm(prev => {
                                                    const newImages = imgs(prev.images || []);
                                                    return { ...prev, images: newImages, img: newImages[0] || prev.img };
                                                });
                                            } else {
                                                setForm(prev => ({ ...prev, images: imgs, img: imgs[0] || prev.img }));
                                            }
                                        }}
                                        token={token}
                                        maxImages={6}
                                    />
                                    {/* Fallback: manual URL input (optional, for URL-based images) */}
                                    <details style={{ marginTop: "10px" }}>
                                        <summary style={{ fontSize: "11px", color: "#aaa", cursor: "pointer" }}>Or paste image URL manually</summary>
                                        <div className="pf-field" style={{ marginTop: "8px" }}>
                                            <label>Image URL</label>
                                            <input
                                                name="img"
                                                placeholder="https://..."
                                                value={form.img}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    // If URL provided and no uploaded images, use it
                                                    if (e.target.value && (!form.images || form.images.length === 0)) {
                                                        setForm(prev => ({ ...prev, img: e.target.value, images: [e.target.value] }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </details>
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <div className="pf-sec-label">Category</div>
                                    <div className="pf-grid">
                                        <div className="pf-field">
                                            <label>Category</label>
                                            <select name="category" value={form.category} onChange={handleChange}>
                                                <option value="">Select category</option>
                                                <option value="men">Men</option>
                                                <option value="women">Women</option>
                                                <option value="kids">Kids</option>
                                                <option value="bags">Bags</option>
                                                <option value="Footware">Footware</option>
                                                <option value="accessories">Accessories</option>
                                                <option value="Electronics">Electronics</option>
                                            </select>
                                            <label style={{ marginTop: "8px" }}>Collection</label>
                                            <select name="collection" value={form.collection} onChange={handleChange}>
                                                <option value="none">No Collection</option>
                                                <option value="summer">☀️ Summer</option>
                                                <option value="winter">❄️ Winter</option>
                                            </select>
                                        </div>
                                        {["men", "women", "kids"].includes(form.category) && (
                                            <div className="pf-field">
                                                <label>Sub Category</label>
                                                <select name="subCategory" value={form.subCategory} onChange={handleChange}>
                                                    <option value="">Select sub category</option>
                                                    <option value="Top Wear">Top Wear</option>
                                                    <option value="Bottom Wear">Bottom Wear</option>
                                                    <option value="Casual Wear">Casual Wear</option>
                                                    <option value="Formal Wear">Formal Wear</option>
                                                    <option value="Ethnic Wear">Ethnic Wear</option>
                                                    <option value="Western Wear">Western Wear</option>
                                                    <option value="School Wear">School Wear</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="pf-field pf-full">
                                            <label>Description</label>
                                            <textarea name="description" placeholder="Describe the product..." value={form.description} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button type="button" className="pf-btn-primary" style={{ flex: "none", padding: "10px 24px" }} onClick={() => setPfStep(1)}>
                                        Next: Variants →
                                    </button>
                                </div>
                            </div>
                        )}

                        {pfStep === 1 && (
                            <div>
                                <div style={{ marginBottom: "18px" }}>
                                    <div className="pf-sec-label">Select Sizes</div>
                                    <div className="pf-sizes">
                                        {ALL_SIZES.map(s => (
                                            <div key={s} className={`pf-size-chip ${selectedSizes.includes(s) ? "on" : ""}`}
                                                onClick={() => toggleSize(s)}>{s}</div>
                                        ))}
                                    </div>
                                </div>

                                {/*  Show colors directly without needing size */}
                                <div style={{ marginBottom: "18px" }}>
                                    <div className="pf-sec-label">Select Colors (No Size)</div>
                                    <div className="pf-color-dots">
                                        {ALL_COLORS.map(color => {
                                            const exists = form.variants.find(v => v.color === color && !v.size);
                                            return (
                                                <div key={color}
                                                    className={`pf-cdot ${exists ? "on" : ""}`}
                                                    style={{ background: COLORS_MAP[color] }}
                                                    title={color}
                                                    onClick={() => {
                                                        if (exists) {
                                                            removeVariant(form.variants.indexOf(exists));
                                                        } else {
                                                            setForm({
                                                                ...form,
                                                                variants: [...form.variants,
                                                                { color, size: "", price: "", stock: "", image: "" }
                                                                ]
                                                            });
                                                        }
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Show price/stock inputs for no-size color variants */}
                                    {form.variants.filter(v => v.color && !v.size).map((v, i) => {
                                        const realIdx = form.variants.indexOf(v);
                                        return (
                                            <div key={realIdx} className="pf-color-row">
                                                <div className="pf-color-name">
                                                    <div className="pf-color-dot" style={{ background: COLORS_MAP[v.color] || "#ccc" }} />
                                                    {v.color}
                                                </div>
                                                <input className="pf-mini-input" type="number" placeholder="Price ₹"
                                                    value={v.price} onChange={(e) => handleVariantChange(realIdx, "price", e.target.value)} />
                                                <input className="pf-mini-input" type="number" placeholder="Stock"
                                                    value={v.stock} onChange={(e) => handleVariantChange(realIdx, "stock", e.target.value)} />
                                                <button type="button" className="pf-rm-btn" onClick={() => removeVariant(realIdx)}>✕</button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="pf-sec-label">Variant Details (With Size)</div>
                                {selectedSizes.length === 0 && form.variants.filter(v => v.color && !v.size).length === 0 && (
                                    <div className="pf-empty-hint">👆 Select sizes above or pick colors directly for no-size products</div>
                                )}
                                {selectedSizes.map(size => {
                                    const sizeVariants = form.variants.filter(v => v.size === size);
                                    const activeColors = sizeVariants.map(v => v.color).filter(Boolean);
                                    return (
                                        <div key={size} className="pf-vcard">
                                            <div className="pf-vcard-head">
                                                <div className="pf-vcard-title">
                                                    <span className="pf-size-badge">{size}</span>
                                                    <span style={{ fontWeight: 400, color: "#888", fontSize: "12px" }}>
                                                        {sizeVariants.length} color{sizeVariants.length !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <button type="button" className="pf-vcard-remove" onClick={() => toggleSize(size)}>Remove size</button>
                                            </div>
                                            <div className="pf-vcard-body">
                                                <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "7px", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase" }}>Pick Colors</div>
                                                <div className="pf-color-dots">
                                                    {ALL_COLORS.map(color => (
                                                        <div key={color} className={`pf-cdot ${activeColors.includes(color) ? "on" : ""}`}
                                                            style={{ background: COLORS_MAP[color] }} title={color}
                                                            onClick={() => toggleColor(size, color)} />
                                                    ))}
                                                </div>
                                                {sizeVariants.map(v => {
                                                    if (!v.color) return null;
                                                    const realIdx = form.variants.indexOf(v);
                                                    return (
                                                        <div key={realIdx} className="pf-color-row">
                                                            <div className="pf-color-name">
                                                                <div className="pf-color-dot" style={{ background: COLORS_MAP[v.color] || "#ccc" }} />
                                                                {v.color}
                                                            </div>
                                                            <input className="pf-mini-input" type="number" placeholder="Price ₹"
                                                                value={v.price} onChange={(e) => handleVariantChange(realIdx, "price", e.target.value)} />
                                                            <input className="pf-mini-input" type="number" placeholder="Stock"
                                                                value={v.stock} onChange={(e) => handleVariantChange(realIdx, "stock", e.target.value)} />
                                                            <button type="button" className="pf-rm-btn" onClick={() => removeVariant(realIdx)}>✕</button>
                                                        </div>
                                                    );
                                                })}
                                                <button type="button" className="pf-add-color-btn"
                                                    onClick={() => setForm({ ...form, variants: [...form.variants, { color: "", size, price: "", stock: "", image: "" }] })}>
                                                    + Add custom color for {size}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="pf-footer">
                        {pfStep === 1 && <button type="button" className="pf-btn-secondary" onClick={() => setPfStep(0)}>← Back</button>}
                        <button type="button" className="pf-btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="button" className="pf-btn-primary"
                            onClick={pfStep === 0 ? () => setPfStep(1) : handleSubmit}>
                            {pfStep === 0 ? "Next: Variants →" : (editId ? "Update Product" : "Add Product")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ProductModal;

// const Sidebar = ({ activeTab, setActiveTab }) => {
//     return (
//         <aside>
//             <button onClick={() => setActiveTab("dashboard")}>
//                 Dashboard
//             </button>

//             <button onClick={() => setActiveTab("products")}>
//                 Products
//             </button>

//             <button onClick={() => setActiveTab("orders")}>
//                 Orders
//             </button>
//         </aside>
//     );
// };

