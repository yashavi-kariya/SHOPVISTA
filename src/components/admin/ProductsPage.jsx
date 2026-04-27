import React, { useState, useEffect, useRef } from "react";
// import api from "api";
import api from "../../api";
import PageHeader from "./PageHeader";
import ProductModal from "./ProductModal";
const ProductsPage = ({ products, fetchProducts, token, toggleSidebar, sidebarOpen }) => {
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [lightboxIdx, setLightboxIdx] = useState(null); // for product detail lightbox
    const formRef = useRef(null);

    const emptyForm = {
        name: "", description: "", category: "", subCategory: "", brand: "",
        img: "", images: [], discount: "", collection: "none",
        variants: [{ color: "", size: "", price: "", stock: "", image: "" }]
    };

    const [form, setForm] = useState(emptyForm);
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleVariantChange = (index, field, value) => {
        const updated = [...form.variants];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, variants: updated });
    };

    const removeVariant = (index) => {
        const updated = form.variants.filter((_, i) => i !== index);
        setForm({ ...form, variants: updated.length ? updated : [{ color: "", size: "", price: "", stock: "", image: "" }] });
    };

    const handleSubmit = async () => {
        const variants = form.variants
            .filter(v => v.color)  // must have color
            .map(v => ({
                attributes: {
                    color: v.color,
                    size: v.size || ""  // size is optional
                },
                price: Number(v.price),
                stock: Number(v.stock),
                image: v.image
            }));

        if (variants.length === 0) { alert("Please add at least one variant with a color."); return; }


        // images[] — uploaded URLs; img — first image for backwards compat
        const payload = {
            ...form,
            img: form.images?.[0] || form.img || "",
            images: form.images || [],
            variants
        };

        try {
            if (editId) {
                await api.put(`http://localhost:3001/api/products/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Product updated!");
            } else {
                await api.post("http://localhost:3001/api/products", payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Product added!");
            }
            fetchProducts();
            setForm(emptyForm);
            setEditId(null);
            setShowForm(false);
        } catch (error) { alert(error.response?.data?.message || "Error"); }
    };

    const handleEdit = (p) => {
        setEditId(p._id);
        setForm({
            name: p.name || "",
            description: p.description || "",
            category: p.category || "",
            subCategory: p.subCategory || "",
            brand: p.brand || "",
            img: p.img || "",
            images: p.images?.length > 0 ? p.images : (p.img ? [p.img] : []), // ← this should already be there
            discount: p.discount || "",
            collection: p.collection || "none",
            variants: p.variants?.length > 0
                ? p.variants.map(v => ({
                    color: v.attributes?.color || "",
                    size: v.attributes?.size || "",
                    price: v.price || "",
                    stock: v.stock || "",
                    image: v.image || ""
                }))
                : [{ color: "", size: "", price: "", stock: "", image: "" }]
        });
        setShowForm(true);
    };

    const handleCancel = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };
    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await api.delete(`http://localhost:3001/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchProducts();
    };

    // Product detail view with image gallery
    if (selectedProduct) {
        const allImages = selectedProduct.images?.length > 0
            ? selectedProduct.images
            : (selectedProduct.img ? [selectedProduct.img] : []);

        return (
            <div className="page">
                <style>{`
          .pd-gallery { display:flex; flex-direction:column; gap:10px; }
          .pd-main-img { width:100%; border-radius:12px; overflow:hidden; aspect-ratio:4/3; background:#f7f7f7; }
          .pd-main-img img { width:100%; height:100%; object-fit:cover; }
          .pd-thumbs { display:flex; gap:8px; flex-wrap:wrap; }
          .pd-thumb { width:64px; height:64px; border-radius:8px; overflow:hidden; cursor:pointer;
            border:2px solid transparent; transition:border-color .15s; flex-shrink:0; }
          .pd-thumb.active { border-color:#6b2737; }
          .pd-thumb img { width:100%; height:100%; object-fit:cover; }
          .pd-lightbox { position:fixed; inset:0; z-index:2000; background:rgba(0,0,0,.9);
            display:flex; align-items:center; justify-content:center; padding:20px; }
          .pd-lightbox img { max-width:90vw; max-height:85vh; border-radius:8px; object-fit:contain; }
          .pd-lb-close { position:absolute; top:16px; right:20px; color:#fff; font-size:28px;
            cursor:pointer; background:none; border:none; line-height:1; }
          .pd-lb-nav { position:absolute; top:50%; transform:translateY(-50%);
            color:#fff; font-size:32px; cursor:pointer; background:rgba(255,255,255,.1);
            border:none; padding:8px 14px; border-radius:8px; transition:background .15s; }
          .pd-lb-nav:hover { background:rgba(255,255,255,.2); }
          .pd-lb-prev { left:12px; } .pd-lb-next { right:12px; }
          .pd-lb-counter { position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
            color:rgba(255,255,255,.7); font-size:12px; }
        `}</style>

                {lightboxIdx !== null && (
                    <div className="pd-lightbox" onClick={() => setLightboxIdx(null)}>
                        <button className="pd-lb-close" onClick={() => setLightboxIdx(null)}>✕</button>
                        <button className="pd-lb-nav pd-lb-prev" onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + allImages.length) % allImages.length); }}>‹</button>
                        <img src={allImages[lightboxIdx]} alt="" onClick={e => e.stopPropagation()} onError={e => e.target.src = "/placeholder.png"} />
                        <button className="pd-lb-nav pd-lb-next" onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % allImages.length); }}>›</button>
                        <div className="pd-lb-counter">{lightboxIdx + 1} / {allImages.length}</div>
                    </div>
                )}

                <PageHeader title="Product Details" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                <button onClick={() => setSelectedProduct(null)}
                    style={{ marginBottom: "16px", background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" }}>
                    ← Back to Products
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "24px" }}>
                    {/* Left — Image Gallery */}
                    <div className="pd-gallery">
                        <div className="pd-main-img" style={{ cursor: allImages.length ? "zoom-in" : "default" }}
                            onClick={() => allImages.length && setLightboxIdx(0)}>
                            <img src={allImages[0] || "/placeholder.png"} alt={selectedProduct.name} onError={e => e.target.src = "/placeholder.png"} />
                        </div>
                        {allImages.length > 1 && (
                            <div className="pd-thumbs">
                                {allImages.map((img, idx) => (
                                    <div key={idx} className={`pd-thumb ${idx === 0 ? "active" : ""}`}
                                        onClick={() => { setLightboxIdx(idx); }}>
                                        <img src={img} alt="" onError={e => e.target.src = "/placeholder.png"} />
                                    </div>
                                ))}
                            </div>
                        )}
                        {allImages.length > 1 && (
                            <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
                                🖼️ {allImages.length} images — click to view full screen
                            </p>
                        )}
                    </div>

                    {/* Right — Details */}
                    <div>
                        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>{selectedProduct.name}</h2>
                        <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>{selectedProduct.description}</p>
                        <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                            <tbody>
                                {[
                                    ["Category", selectedProduct.category],
                                    ["Sub Category", selectedProduct.subCategory || "—"],
                                    ["Brand", selectedProduct.brand || "—"],
                                    ["Discount", selectedProduct.discount ? `${selectedProduct.discount}%` : "—"],
                                    ["Price", `₹${selectedProduct.variants?.[0]?.price || selectedProduct.price || 0}`],
                                    ["Total Stock", selectedProduct.variants?.reduce((s, v) => s + v.stock, 0) || selectedProduct.stock || 0],
                                    ["Images", `${allImages.length} photo${allImages.length !== 1 ? "s" : ""}`],
                                ].map(([label, value]) => (
                                    <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: "8px 0", color: "#888", width: "40%" }}>{label}</td>
                                        <td style={{ padding: "8px 0", fontWeight: 500 }}>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {selectedProduct.variants?.length > 0 && (
                            <div style={{ marginTop: "16px" }}>
                                <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>Variants</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {selectedProduct.variants.map((v, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f9f9f9", borderRadius: "8px", fontSize: "13px" }}>
                                            <span>{v.attributes?.color} / {v.attributes?.size}</span>
                                            <span>₹{v.price}</span>
                                            <span style={{ color: v.stock > 0 ? "#43a348" : "#c62828" }}>{v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                            <button onClick={() => { setSelectedProduct(null); handleEdit(selectedProduct); }}
                                style={{ padding: "9px 20px", background: "#6b2737", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                                Edit Product
                            </button>
                            <button onClick={() => setSelectedProduct(null)}
                                style={{ padding: "9px 20px", background: "#fff", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <PageHeader title="Products" subtitle="Manage your product catalog" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
                <button className="add-btn" onClick={() => { handleCancel(); setShowForm(true); }}>+ Add Product</button>
            </PageHeader>

            {showForm && (
                <ProductModal
                    editId={editId} form={form} setForm={setForm}
                    handleChange={handleChange} handleVariantChange={handleVariantChange}
                    removeVariant={removeVariant} handleSubmit={handleSubmit}
                    handleCancel={handleCancel} token={token}
                />
            )}

            {/* Desktop Table */}
            <div className="admin__table desktop-table">
                <div className="table__row table__head">
                    <span>Product</span><span>Category</span><span>Sub Category</span>
                    <span>Brand</span><span>Price</span><span>Stock</span><span>Actions</span>
                </div>
                {products.map((p) => {
                    const allImgs = p.images?.length > 0 ? p.images : (p.img ? [p.img] : []);
                    return (
                        <div className="table__row" key={p._id}>
                            <div className="product-info" onClick={() => setSelectedProduct(p)} style={{ cursor: "pointer" }}>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <img src={allImgs[0] || p.img} alt={p.name} width="50" onError={e => e.target.src = "/placeholder.png"} />
                                    {allImgs.length > 1 && (
                                        <span style={{ position: "absolute", bottom: "-2px", right: "-2px", background: "#6b2737", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "6px" }}>
                                            +{allImgs.length - 1}
                                        </span>
                                    )}
                                </div>
                                <p>{p.name}</p>
                            </div>
                            <span>{p.category}</span>
                            <span>{p.subCategory || "—"}</span>
                            <span>{p.brand}</span>
                            <span>₹{p.variants?.[0]?.price || p.price || 0}</span>
                            <span>{p.variants?.reduce((sum, v) => sum + v.stock, 0) || p.stock || 0}</span>
                            <div className="actions">
                                <button onClick={() => handleEdit(p)}>Edit</button>
                                <button onClick={() => deleteProduct(p._id)} style={{ background: "#e74c3c" }}>Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Cards */}
            <div className="product-cards mobile-cards">
                {products.map((p) => {
                    const allImgs = p.images?.length > 0 ? p.images : (p.img ? [p.img] : []);
                    return (
                        <div className="product-mobile-card" key={p._id}>
                            <div className="product-mobile-card__top" onClick={() => setSelectedProduct(p)} style={{ cursor: "pointer" }}>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <img src={allImgs[0] || p.img} alt={p.name} className="product-mobile-card__img" onError={e => e.target.src = "/placeholder.png"} />
                                    {allImgs.length > 1 && (
                                        <span style={{ position: "absolute", bottom: "2px", right: "2px", background: "#6b2737", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 5px", borderRadius: "8px" }}>
                                            {allImgs.length} 🖼️
                                        </span>
                                    )}
                                </div>
                                <div className="product-mobile-card__info">
                                    <p className="product-mobile-card__name">{p.name}</p>
                                    <p className="product-mobile-card__meta">{p.category}{p.subCategory ? ` · ${p.subCategory}` : ""}</p>
                                    <p className="product-mobile-card__meta">{p.brand}</p>
                                </div>
                            </div>
                            <div className="product-mobile-card__bottom">
                                <span className="product-mobile-card__price">₹{p.variants?.[0]?.price || p.price || 0}</span>
                                <span className="product-mobile-card__stock">Stock: {p.variants?.reduce((sum, v) => sum + v.stock, 0) || p.stock || 0}</span>
                                <div className="actions">
                                    <button onClick={() => handleEdit(p)} style={{ background: "#2778e1" }}>Edit</button>
                                    <button onClick={() => deleteProduct(p._id)} style={{ background: "#e74c3c" }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default ProductsPage;