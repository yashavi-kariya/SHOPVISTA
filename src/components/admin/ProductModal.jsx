import React, { useState, useRef } from "react";
import api from "../../api";
import ImageUploader from "./ImageUploader";

const COLORS_MAP = {
    Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c", Blue: "#5bb0e9",
    Green: "#27ae60", Yellow: "#f1c40f", Pink: "#e91e8c", Beige: "#c9a96e",
    Brown: "#795548", Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
};
const ALL_COLORS = Object.keys(COLORS_MAP);
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "1yr to 15yr"];

/* ─────────────────────────────────────────────────────────
   VARIANT MULTI-IMAGE PICKER
───────────────────────────────────────────────────────── */
const VariantMultiImagePicker = ({ images = [], onChange, token, color }) => {
    const inputRef = useRef();
    const [uploading, setUploading] = useState(false);

    const upload = async (files) => {
        setUploading(true);
        const uploaded = [];
        for (const file of files) {
            try {
                const fd = new FormData();
                fd.append("image", file);
                const res = await api.post("/api/upload", fd, {
                    headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
                });
                uploaded.push(res.data.url || res.data.imageUrl || res.data);
            } catch (e) { console.error("Upload failed", e); }
        }
        setUploading(false);
        if (uploaded.length) onChange([...images, ...uploaded]);
    };

    const removeImg = (idx) => onChange(images.filter((_, i) => i !== idx));
    const colorDot = COLORS_MAP[color];

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {colorDot && (
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: colorDot, border: "1px solid rgba(0,0,0,.15)", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    Photos for {color || "this color"}
                </span>
                <span style={{ fontSize: 10, color: "#bbb" }}>({images.length}/5)</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {images.map((url, idx) => (
                    <div key={idx} style={{ position: "relative", width: 52, height: 52, borderRadius: 8, overflow: "hidden", border: "1.5px solid #e8e8e8", flexShrink: 0 }}>
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button type="button" onClick={() => removeImg(idx)} style={{
                            position: "absolute", top: 2, right: 2, width: 15, height: 15, borderRadius: "50%",
                            background: "rgba(0,0,0,.65)", border: "none", color: "#fff", fontSize: 8,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                        {idx === 0 && (
                            <span style={{ position: "absolute", bottom: 2, left: 2, background: "#6b2737", color: "#fff", fontSize: 6, fontWeight: 700, padding: "1px 3px", borderRadius: 3 }}>MAIN</span>
                        )}
                    </div>
                ))}
                {images.length < 5 && (
                    <div onClick={() => !uploading && inputRef.current.click()} style={{
                        width: 52, height: 52, borderRadius: 8, border: "1.5px dashed #ddd",
                        background: "#fafafa", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
                    }}>
                        {uploading
                            ? <span style={{ fontSize: 10, color: "#aaa" }}>…</span>
                            : <><span style={{ fontSize: 16, color: "#ccc" }}>📷</span><span style={{ fontSize: 7, color: "#ccc", marginTop: 2 }}>Add</span></>
                        }
                        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                            onChange={e => e.target.files.length && upload(Array.from(e.target.files))} />
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   COLOR CARD
   colorEntry shape:
   {
     color,
     price,
     images: [],
     sizeStocks: { S: "10", M: "5", ... }   ← per-size stock
   }
───────────────────────────────────────────────────────── */
const ColorCard = ({ entry, onChange, onRemove, token }) => {
    const [noSizeStock, setNoSizeStock] = useState(entry.noSizeStock || "");
    const toggleSize = (size) => {
        const current = entry.sizeStocks || {};
        if (size in current) {
            // remove this size
            const { [size]: _, ...rest } = current;
            onChange({ ...entry, sizeStocks: rest });
        } else {
            // add this size with empty stock
            onChange({ ...entry, sizeStocks: { ...current, [size]: "" } });
        }
    };

    const setStock = (size, value) => {
        onChange({ ...entry, sizeStocks: { ...entry.sizeStocks, [size]: value } });
    };

    const selectedSizes = Object.keys(entry.sizeStocks || {});
    const dot = COLORS_MAP[entry.color];

    return (
        <div style={{
            border: "1.5px solid #f0f0f0", borderRadius: 12, overflow: "hidden",
            marginBottom: 10, animation: "pf-row-in .18s ease",
        }}>
            {/* Card header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "#fafafa",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: dot || "#ccc",
                        border: "2px solid rgba(0,0,0,.1)",
                        boxShadow: "0 0 0 2px #fff, 0 0 0 4px #6b2737",
                        flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{entry.color}</span>
                    {selectedSizes.length > 0 && (
                        <span style={{ fontSize: 11, color: "#888" }}>
                            — {selectedSizes.join(", ")}
                        </span>
                    )}
                </div>
                <button type="button" onClick={onRemove} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#e74c3c", fontSize: 12, padding: "2px 8px",
                    borderRadius: 6, fontFamily: "inherit", transition: "background .15s",
                }} onMouseEnter={e => e.target.style.background = "#fde8e8"}
                    onMouseLeave={e => e.target.style.background = "none"}>
                    Remove
                </button>
            </div>

            {/* Card body */}
            <div style={{ padding: "12px 14px" }}>

                {/* Size picker */}
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#bbb", marginBottom: 7 }}>
                        Sizes <span style={{ color: "#aaa", fontWeight: 400 }}>(click to add, then set stock per size)</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {ALL_SIZES.map(size => {
                            const on = size in (entry.sizeStocks || {});
                            return (
                                <div key={size} onClick={() => toggleSize(size)} style={{
                                    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                                    cursor: "pointer", userSelect: "none", transition: "all .14s",
                                    border: on ? "1.5px solid #6b2737" : "1.5px solid #e8e8e8",
                                    background: on ? "#6b2737" : "#fff",
                                    color: on ? "#fff" : "#666",
                                }}>
                                    {size}
                                </div>
                            );
                        })}
                    </div>

                    {selectedSizes.length === 0 && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#bbb", marginBottom: 8 }}>
                                Stock
                            </div>
                            <input
                                className="pf-mini-input"
                                type="number" min="0" placeholder="0"
                                value={noSizeStock}
                                onChange={e => {
                                    setNoSizeStock(e.target.value);
                                    onChange({ ...entry, noSizeStock: e.target.value });
                                }}
                                style={{ maxWidth: 120 }}
                            />
                        </div>
                    )}
                </div>

                {/* Per-size stock — shown only when sizes are selected */}
                {selectedSizes.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#bbb", marginBottom: 8 }}>
                            Stock per size
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                            {selectedSizes.map(size => (
                                <div key={size}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: "#6b2737", marginBottom: 3 }}>{size}</div>
                                    <input
                                        className="pf-mini-input"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={entry.sizeStocks[size]}
                                        onChange={e => setStock(size, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price — shared across sizes for this color */}
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "#bbb", marginBottom: 4 }}>Price ₹ <span style={{ color: "#ccc", fontWeight: 400 }}>(shared across sizes)</span></div>
                    <input
                        className="pf-mini-input"
                        type="number"
                        placeholder="e.g. 499"
                        value={entry.price}
                        onChange={e => onChange({ ...entry, price: e.target.value })}
                        style={{ maxWidth: 160 }}
                    />
                </div>

                {/* Images — uploaded once, shared across all sizes of this color */}
                <div style={{
                    padding: "10px 12px", background: "#f9fafb",
                    borderRadius: 8, border: "1px solid #f0f0f0",
                }}>
                    <VariantMultiImagePicker
                        images={entry.images}
                        token={token}
                        color={entry.color}
                        onChange={imgs => onChange({ ...entry, images: imgs })}
                    />
                    <div style={{ marginTop: 8, fontSize: 10, color: "#bbb" }}>
                        📌 These images apply to <strong style={{ color: "#888" }}>all selected sizes</strong> of {entry.color}.
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════
   PRODUCT MODAL
════════════════════════════════════════ */
const ProductModal = ({ editId, form, setForm, handleChange, handleVariantChange, removeVariant, handleSubmit, handleCancel, token }) => {
    const [pfStep, setPfStep] = useState(0);

    // Build initial colorEntries from flat form.variants
    // Groups by color; sizeStocks = { size: stock } per color
    const buildInitialEntries = () => {
        const map = {};
        (form.variants || []).forEach(v => {
            const color = v.attributes?.color || v.color || "";
            const size = v.attributes?.size || v.size || "";
            if (!color) return;
            if (!map[color]) {
                map[color] = {
                    color,
                    price: v.price || "",
                    images: v.images || [],
                    sizeStocks: {},
                    noSizeStock: "",  // ← initialize
                };
            }
            if (size) {
                map[color].sizeStocks[size] = v.stock !== undefined ? String(v.stock) : "";
            } else {
                // ← FIX: size-free variant — store stock in noSizeStock
                map[color].noSizeStock = v.stock !== undefined ? String(v.stock) : "";
            }
            if (!map[color].images.length && v.images?.length) map[color].images = v.images;
        });
        return Object.values(map);
    };
    const [colorEntries, setColorEntries] = useState(buildInitialEntries);
    const usedColors = colorEntries.map(e => e.color);
    const availableColors = ALL_COLORS.filter(c => !usedColors.includes(c));

    const addColor = (color) => {
        setColorEntries(prev => [...prev, { color, sizeStocks: {}, price: "", images: [] }]);
    };
    const updateEntry = (idx, updated) => {
        setColorEntries(prev => prev.map((e, i) => i === idx ? updated : e));
    };
    const removeEntry = (idx) => {
        setColorEntries(prev => prev.filter((_, i) => i !== idx));
    };

    // Explode colorEntries → flat variants the backend expects
    // Each (color × size) becomes its own variant with its own stock
    const handleFinalSubmit = () => {
        const flatVariants = [];
        colorEntries.forEach(entry => {
            const sizes = Object.keys(entry.sizeStocks || {});
            if (sizes.length === 0) {
                // size-free variant
                flatVariants.push({
                    attributes: { color: entry.color, size: "" },
                    price: Number(entry.price) || 0,
                    stock: Number(entry.noSizeStock) || 0,
                    images: entry.images,
                    image: entry.images?.[0] || "",
                });
            } else {
                sizes.forEach(size => {
                    flatVariants.push({
                        attributes: { color: entry.color, size },
                        price: Number(entry.price) || 0,
                        stock: Number(entry.sizeStocks[size]) || 0,
                        images: entry.images,
                        image: entry.images?.[0] || "",
                    });
                });
            }
        });
        // Pass flatVariants directly — avoids React state timing issues
        handleSubmit(flatVariants);
    };

    const onCancel = () => { setPfStep(0); handleCancel(); };

    return (
        <>
            <style>{`
        @keyframes pf-backdrop{from{opacity:0}to{opacity:1}}
        @keyframes pf-slide{from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pf-row-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .pf-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;animation:pf-backdrop .2s ease;}
        .pf-modal{width:100%;max-width:680px;max-height:90vh;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;animation:pf-slide .3s cubic-bezier(.22,1,.36,1);box-shadow:0 20px 60px rgba(0,0,0,0.18);}
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
        .pf-mini-input{padding:7px 10px;border:1.5px solid #e8e8e8;border-radius:8px;font-size:12px;font-family:inherit;background:#fff;color:#111;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s;}
        .pf-mini-input:focus{border-color:#6b2737;background:#fff;}
        .pf-footer{display:flex;gap:8px;padding:14px 24px;border-top:1px solid #f0f0f0;background:#fff;flex-shrink:0;}
        .pf-btn-primary{flex:1;padding:10px;border-radius:10px;border:none;background:#6b2737;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .16s;font-family:inherit;}
        .pf-btn-primary:hover{background:#7d2f42;transform:translateY(-1px);}
        .pf-btn-secondary{padding:10px 18px;border-radius:10px;border:1.5px solid #e8e8e8;background:#fff;color:#666;font-size:13px;font-weight:500;cursor:pointer;transition:all .16s;font-family:inherit;}
        .pf-btn-secondary:hover{border-color:#111;color:#111;}
        .pf-empty-hint{text-align:center;padding:32px;color:#bbb;font-size:13px;}
        .pf-img-note{font-size:11px;color:#aaa;padding:6px 10px;background:#f9f4f5;border-radius:8px;border-left:3px solid #6b2737;}
        .pf-variant-img-note{font-size:11px;color:#888;padding:8px 12px;background:#f0f7ff;border-radius:8px;border-left:3px solid #5bb0e9;margin-bottom:14px;}
        .pf-color-palette{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
        .pf-color-add-dot{width:26px;height:26px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:transform .14s,box-shadow .14s;position:relative;display:flex;align-items:center;justify-content:center;}
        .pf-color-add-dot:hover{transform:scale(1.2);box-shadow:0 2px 8px rgba(0,0,0,.2);}
        .pf-color-add-dot .plus{display:none;font-size:13px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5);line-height:1;}
        .pf-color-add-dot:hover .plus{display:block;}
      `}</style>

            <div className="pf-backdrop" onClick={e => e.target.classList.contains("pf-backdrop") && onCancel()}>
                <div className="pf-modal">

                    {/* ── Head ── */}
                    <div className="pf-modal-head">
                        <div>
                            <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
                            <p>{editId ? "Update product details below" : "Fill in details to list a new product"}</p>
                        </div>
                        <button className="pf-modal-close" onClick={onCancel}>✕</button>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="pf-tabs">
                        <div className={`pf-tab ${pfStep === 0 ? "active" : "done"}`} onClick={() => setPfStep(0)}>
                            <span className="pf-tab-num">{pfStep > 0 ? "✓" : "1"}</span> Product Info
                        </div>
                        <div className={`pf-tab ${pfStep === 1 ? "active" : ""}`} onClick={() => setPfStep(1)}>
                            <span className="pf-tab-num">2</span> Variants & Images
                        </div>
                    </div>

                    <div className="pf-body">

                        {/* ══ STEP 1: Product Info ══ */}
                        {pfStep === 0 && (
                            <div>
                                <div style={{ marginBottom: 18 }}>
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
                                        <div className="pf-field">
                                            <label>Return Window (days)</label>
                                            <input
                                                name="returnWindowDays"
                                                type="number"
                                                min="0"
                                                placeholder="Global default"
                                                value={form.returnWindowDays ?? ""}
                                                onChange={(e) => setForm(prev => ({
                                                    ...prev,
                                                    returnWindowDays: e.target.value ? Number(e.target.value) : null
                                                }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* <div style={{ marginBottom: 18 }}>
                                    <div className="pf-sec-label">Main Product Images</div>
                                    <div className="pf-img-note" style={{ marginBottom: 10 }}>
                                        These are <strong>fallback / catalogue images</strong>. For color-specific images, go to Step 2 → Variants.
                                    </div>
                                    <ImageUploader
                                        images={form.images || []}
                                        setImages={(imgs) => {
                                            if (typeof imgs === "function") {
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
                                    <details style={{ marginTop: 10 }}>
                                        <summary style={{ fontSize: 11, color: "#aaa", cursor: "pointer" }}>Or paste image URL manually</summary>
                                        <div className="pf-field" style={{ marginTop: 8 }}>
                                            <label>Image URL</label>
                                            <input name="img" placeholder="https://..." value={form.img}
                                                onChange={e => {
                                                    handleChange(e);
                                                    if (e.target.value && (!form.images || form.images.length === 0)) {
                                                        setForm(prev => ({ ...prev, img: e.target.value, images: [e.target.value] }));
                                                    }
                                                }} />
                                        </div>
                                    </details>
                                </div> */}

                                <div style={{ marginBottom: 18 }}>
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
                                            <label style={{ marginTop: 8 }}>Collection</label>
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

                        {/* ══ STEP 2: Variants ══ */}
                        {pfStep === 1 && (
                            <div>
                                <div className="pf-variant-img-note" style={{ marginBottom: 16 }}>
                                    🎨 <strong>Add a color</strong> → tick sizes → set <strong>stock per size</strong> → set price &amp; upload photos once for all sizes of that color.
                                </div>

                                <div className="pf-sec-label">Add a color</div>
                                {availableColors.length > 0 ? (
                                    <div className="pf-color-palette">
                                        {availableColors.map(color => (
                                            <div key={color} className="pf-color-add-dot"
                                                style={{ background: COLORS_MAP[color] }}
                                                title={`Add ${color}`}
                                                onClick={() => addColor(color)}>
                                                <span className="plus">+</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: "#bbb", marginBottom: 14 }}>All colors added ✓</div>
                                )}

                                {colorEntries.length === 0 && (
                                    <div className="pf-empty-hint">👆 Click a color dot above to start adding variants</div>
                                )}

                                {colorEntries.map((entry, idx) => (
                                    <ColorCard
                                        key={entry.color}
                                        entry={entry}
                                        token={token}
                                        onChange={updated => updateEntry(idx, updated)}
                                        onRemove={() => removeEntry(idx)}
                                    />
                                ))}

                                {/* Live summary */}
                                {colorEntries.length > 0 && (
                                    <div style={{
                                        marginTop: 4, padding: "10px 14px",
                                        background: "#f9f4f5", borderRadius: 10,
                                        border: "1px solid #f0e0e3",
                                    }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b2737", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".07em" }}>
                                            Will save as variants
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                            {colorEntries.flatMap(entry => {
                                                const sizes = Object.keys(entry.sizeStocks || {});
                                                return sizes.length > 0
                                                    ? sizes.map(size => (
                                                        <span key={`${entry.color}-${size}`} style={{
                                                            fontSize: 10, padding: "2px 8px", borderRadius: 20,
                                                            background: "#fff", border: "1px solid #e8d0d4",
                                                            color: "#6b2737", fontWeight: 500,
                                                        }}>
                                                            {entry.color} / {size}
                                                            {entry.sizeStocks[size] !== "" && (
                                                                <span style={{ color: "#aaa", fontWeight: 400 }}> · {entry.sizeStocks[size]} pcs</span>
                                                            )}
                                                        </span>
                                                    ))
                                                    : [<span key={entry.color} style={{
                                                        fontSize: 10, padding: "2px 8px", borderRadius: 20,
                                                        background: "#fff", border: "1px dashed #e8d0d4",
                                                        color: "#aaa", fontWeight: 500,
                                                    }}>{entry.color} (no size)</span>];
                                            })}
                                        </div>
                                        {colorEntries.some(e => Object.keys(e.sizeStocks || {}).length === 0) && (
                                            <div style={{ fontSize: 10, color: "#f59e42", marginTop: 6 }}>
                                                ⚠ Some colors have no size selected.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="pf-footer">
                        {pfStep === 1 && <button type="button" className="pf-btn-secondary" onClick={() => setPfStep(0)}>← Back</button>}
                        <button type="button" className="pf-btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="button" className="pf-btn-primary"
                            onClick={pfStep === 0 ? () => setPfStep(1) : handleFinalSubmit}>
                            {pfStep === 0 ? "Next: Variants →" : (editId ? "Update Product" : "Add Product")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ProductModal;