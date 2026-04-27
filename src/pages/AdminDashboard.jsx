// // ─────────────────────────────────────────────
// // Changes from original:
// //  1. ProductModal Step 0 now includes ImageUploader for multiple images
// //  2. form.images[] replaces single form.img for multi-image support
// //  3. form.img kept as the first image (main image) for backwards compat
// //  4. handleSubmit sends both img (first image) and images[] to backend
// // ─────────────────────────────────────────────

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
// import { useNavigate } from "react-router-dom";

// // ─── INLINE IMAGE UPLOADER (no extra file needed) ───────────────
// const UPLOADER_STYLES = `
//   @keyframes iu-pop { 0% { transform:scale(0.85); opacity:0 } 60% { transform:scale(1.05) } 100% { transform:scale(1); opacity:1 } }
//   @keyframes iu-spin { to { transform:rotate(360deg) } }
//   .iu-wrap { display:flex; flex-direction:column; gap:10px; }
//   .iu-drop {
//     position:relative; border:2px dashed #d8c5c9; border-radius:12px;
//     background:repeating-linear-gradient(135deg,#fdf8f9 0,#fdf8f9 10px,#fff 10px,#fff 20px);
//     padding:22px 16px; text-align:center; cursor:pointer;
//     transition:border-color .2s,background .2s;
//   }
//   .iu-drop:hover,.iu-drop.drag{border-color:#6b2737;background:rgba(107,39,55,.04);}
//   .iu-drop-icon{font-size:24px;margin-bottom:6px;line-height:1;}
//   .iu-drop-title{font-size:12px;font-weight:600;color:#444;margin:0 0 2px;}
//   .iu-drop-hint{font-size:10px;color:#bbb;margin:0;}
//   .iu-browse{display:inline-block;margin-top:8px;padding:5px 16px;background:#6b2737;color:#fff;border-radius:20px;font-size:11px;font-weight:600;border:none;cursor:pointer;font-family:inherit;}
//   .iu-browse:hover{background:#7d2f42;}
//   .iu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;}
//   .iu-thumb{position:relative;aspect-ratio:1;border-radius:9px;overflow:hidden;border:1.5px solid #f0f0f0;animation:iu-pop .22s ease both;background:#f7f7f7;}
//   .iu-thumb:first-child{border-color:#6b2737;box-shadow:0 0 0 2px rgba(107,39,55,.15);}
//   .iu-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
//   .iu-thumb-badge{position:absolute;top:3px;left:3px;background:#6b2737;color:#fff;font-size:8px;font-weight:700;padding:2px 5px;border-radius:8px;}
//   .iu-thumb-del{position:absolute;top:3px;right:3px;width:18px;height:18px;background:rgba(0,0,0,.55);color:#fff;border:none;border-radius:50%;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;font-family:inherit;}
//   .iu-thumb:hover .iu-thumb-del{opacity:1;}
//   .iu-thumb-uploading{position:absolute;inset:0;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;}
//   .iu-spinner{width:16px;height:16px;border:2px solid #ddd;border-top-color:#6b2737;border-radius:50%;animation:iu-spin .7s linear infinite;}
//   .iu-info{font-size:10px;color:#aaa;} .iu-info span{color:#6b2737;font-weight:600;}
//   .iu-error{font-size:11px;color:#e74c3c;background:#fde8e8;padding:5px 9px;border-radius:7px;}
//   .iu-reorder{font-size:10px;color:#ccc;text-align:center;}
// `;

// const ImageUploader = ({ images, setImages, uploadEndpoint, token, maxImages = 6 }) => {
//     const safeImages = Array.isArray(images) ? images : [];  // ← fixes the .map error
//     const inputRef = useRef(null);
//     const [dragging, setDragging] = useState(false);
//     const [uploading, setUploading] = useState([]);
//     const [error, setError] = useState("");

//     const uploadFile = async (file) => {
//         const formData = new FormData();
//         formData.append("image", file);
//         try {
//             const res = await fetch(uploadEndpoint || "http://localhost:3001/api/upload", {
//                 method: "POST",
//                 headers: token ? { Authorization: `Bearer ${token}` } : {},
//                 body: formData,
//             });

//             // console.log("Upload status:", res.status);  // ← add this

//             if (!res.ok) {
//                 const errText = await res.text();
//                 console.log("Upload error response:", errText);  // ← add this
//                 throw new Error();
//             }
//             const data = await res.json();
//             // console.log("Upload response data:", data);  // ← add this
//             return data.url || data.path || data.imageUrl || null;
//         } catch (err) {
//             console.log("Upload catch error:", err);  // ← add this
//             return null;
//         }
//     };

//     const processFiles = useCallback(async (files) => {
//         setError("");
//         const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));
//         if (!fileArr.length) return;

//         // ✅ Read current images fresh from state
//         setImages(prev => {
//             const current = Array.isArray(prev) ? prev : [];
//             const remaining = maxImages - current.length;
//             if (remaining <= 0) {
//                 setError(`Max ${maxImages} images allowed.`);
//                 return current;
//             }

//             const toUpload = fileArr.slice(0, remaining);
//             const tempUrls = toUpload.map(f => URL.createObjectURL(f));
//             const startIdx = current.length;

//             // Start uploads after setting temp previews
//             setUploading(toUpload.map((_, i) => startIdx + i));

//             Promise.all(toUpload.map(f => uploadFile(f))).then(uploadedUrls => {
//                 setUploading([]);
//                 setImages(prev2 => {
//                     const updated = [...prev2];
//                     toUpload.forEach((_, i) => {
//                         if (uploadedUrls[i]) {
//                             URL.revokeObjectURL(tempUrls[i]);
//                             updated[startIdx + i] = uploadedUrls[i];
//                         }
//                     });
//                     return updated;
//                 });
//                 const failed = uploadedUrls.filter(u => !u).length;
//                 if (failed > 0) setError(`${failed} upload(s) failed.`);
//             });

//             return [...current, ...tempUrls]; // ✅ always appends to latest state
//         });
//     }, [maxImages, token]); //  removed safeImages from deps

//     return (
//         <>
//             <style>{UPLOADER_STYLES}</style>
//             <div className="iu-wrap">
//                 {safeImages.length < maxImages && (
//                     <div
//                         className={`iu-drop ${dragging ? "drag" : ""}`}
//                         onDragOver={e => { e.preventDefault(); setDragging(true); }}
//                         onDragLeave={() => setDragging(false)}
//                         onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
//                         onClick={() => inputRef.current?.click()}
//                     >
//                         <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => { processFiles(e.target.files); e.target.value = ""; }} />
//                         <div className="iu-drop-icon">🖼️</div>
//                         <p className="iu-drop-title">{dragging ? "Drop images here" : "Drag & drop or upload images"}</p>
//                         <p className="iu-drop-hint">PNG, JPG, WEBP • max {maxImages} images</p>
//                         <button type="button" className="iu-browse" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>Browse Files</button>
//                     </div>
//                 )}
//                 {error && <div className="iu-error">⚠️ {error}</div>}
//                 {safeImages.length > 0 && (
//                     <>
//                         <div className="iu-grid">
//                             {safeImages.map((url, idx) => (
//                                 <div key={url + idx} className="iu-thumb" title={idx === 0 ? "Main image" : "Click to set as main"}>
//                                     <img src={url} alt="" onError={e => e.target.src = "/placeholder.png"}
//                                         onClick={() => {
//                                             if (idx === 0) return;
//                                             const u = [...safeImages];
//                                             u.splice(idx, 1);
//                                             u.unshift(url);
//                                             setImages(u);
//                                         }}
//                                         style={{ cursor: idx === 0 ? "default" : "pointer" }} />
//                                     {idx === 0 && <span className="iu-thumb-badge">MAIN</span>}
//                                     {uploading.includes(idx) && <div className="iu-thumb-uploading"><div className="iu-spinner" /></div>}
//                                     <button type="button" className="iu-thumb-del"
//                                         onClick={e => { e.stopPropagation(); setImages(safeImages.filter((_, i) => i !== idx)); }}>✕</button>
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="iu-reorder">Click any image to set it as the main photo</div>
//                         <div className="iu-info"><span>{safeImages.length}</span> / {maxImages} images</div>
//                     </>
//                 )}
//             </div>
//         </>
//     );
// };
// // ─────────────────────────────────────────────
// // PAGE HEADER
// // ─────────────────────────────────────────────
// const PageHeader = ({ title, subtitle, toggleSidebar, sidebarOpen, children }) => (
//     <div className="page__header">
//         <button className={`menu-btn ${sidebarOpen ? "menu-btn--hidden" : ""}`} onClick={toggleSidebar} aria-label="Open sidebar">☰</button>
//         <div className="header-text">
//             <h2>{title}</h2>
//             {subtitle && <p className="page__subtitle">{subtitle}</p>}
//         </div>
//         {children && <div className="header-actions">{children}</div>}
//     </div>
// );

// // ─────────────────────────────────────────────
// // DASHBOARD PAGE
// // ─────────────────────────────────────────────
// const DashboardPage = ({ toggleSidebar, sidebarOpen }) => {
//     const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 });
//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 const res = await api.get("http://localhost:3001/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
//                 setStats(res.data);
//             } catch (error) { console.error("Dashboard error:", error); }
//         };
//         fetchStats();
//     }, []);
//     return (
//         <div className="page">
//             <PageHeader title="Admin Dashboard" subtitle="Overview of your store performance" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//             <div className="stats-grid">
//                 {[["📦", "Total Products", stats.totalProducts], ["🛒", "Total Orders", stats.totalOrders], ["👥", "Total Users", stats.totalUsers], ["💰", "Revenue", `₹${stats.revenue}`]].map(([icon, label, val]) => (
//                     <div className="stat-card" key={label}>
//                         <span className="stat-icon">{icon}</span>
//                         <div><h3>{label}</h3><p className="stat-value">{val}</p></div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// const COLORS_MAP = {
//     Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c", Blue: "#5bb0e9",
//     Green: "#27ae60", Yellow: "#f1c40f", Pink: "#e91e8c", Beige: "#c9a96e",
//     Brown: "#795548", Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
// };
// const ALL_COLORS = Object.keys(COLORS_MAP);
// const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "1yr to 15yr"];

// // ─────────────────────────────────────────────
// // PRODUCT MODAL — with multi-image upload
// // ─────────────────────────────────────────────
// const ProductModal = ({ editId, form, setForm, handleChange, handleVariantChange, removeVariant, handleSubmit, handleCancel, token }) => {
//     // console.log("form.images:", form.images);
//     const [pfStep, setPfStep] = useState(0);
//     const selectedSizes = [...new Set(form.variants.map(v => v.size).filter(Boolean))];

//     const toggleSize = (size) => {
//         if (selectedSizes.includes(size)) {
//             // remove all variants with this size
//             const updated = form.variants.filter(v => v.size !== size);
//             setForm({
//                 ...form,
//                 variants: updated.length ? updated : [{ color: "", size: "", price: "", stock: "", image: "" }]
//             });
//         } else {
//             // add a blank variant slot for this size
//             setForm({
//                 ...form,
//                 variants: [...form.variants.filter(v => v.size || v.color),
//                 { color: "", size, price: "", stock: "", image: "" }]
//             });
//         }
//     };

//     const toggleColor = (size, color) => {
//         const exists = form.variants.find(v => v.size === size && v.color === color);
//         if (exists) { removeVariant(form.variants.indexOf(exists)); }
//         else { setForm({ ...form, variants: [...form.variants, { color, size, price: "", stock: "", image: "" }] }); }
//     };

//     const onCancel = () => { setPfStep(0); handleCancel(); };

//     return (
//         <>
//             <style>{`
//         @keyframes pf-backdrop{from{opacity:0}to{opacity:1}}
//         @keyframes pf-slide{from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
//         @keyframes pf-row-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
//         .pf-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;animation:pf-backdrop .2s ease;}
//         .pf-modal{width:100%;max-width:660px;max-height:90vh;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;animation:pf-slide .3s cubic-bezier(.22,1,.36,1);box-shadow:0 20px 60px rgba(0,0,0,0.18);}
//         .pf-modal-head{padding:20px 24px 16px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
//         .pf-modal-head h3{margin:0;font-size:17px;font-weight:600;color:#111;}
//         .pf-modal-head p{margin:3px 0 0;font-size:12px;color:#999;}
//         .pf-modal-close{width:30px;height:30px;border-radius:50%;border:1.5px solid #e8e8e8;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:#666;transition:all .15s;}
//         .pf-modal-close:hover{background:#111;color:#fff;border-color:#111;}
//         .pf-tabs{display:flex;padding:0 24px;border-bottom:1px solid #f0f0f0;flex-shrink:0;}
//         .pf-tab{padding:11px 18px;font-size:13px;font-weight:500;color:#aaa;border-bottom:2px solid transparent;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:6px;}
//         .pf-tab.active{color:#6b2737;border-bottom-color:#6b2737;}
//         .pf-tab.done{color:#22c55e;}
//         .pf-tab-num{width:18px;height:18px;border-radius:50%;background:#f0f0f0;color:#999;font-size:10px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;}
//         .pf-tab.active .pf-tab-num{background:#6b2737;color:#fff;}
//         .pf-tab.done .pf-tab-num{background:#22c55e;color:#fff;}
//         .pf-body{flex:1;overflow-y:auto;padding:20px 24px;scrollbar-width:thin;}
//         .pf-body::-webkit-scrollbar{width:4px;}
//         .pf-body::-webkit-scrollbar-thumb{background:#e8e8e8;border-radius:4px;}
//         .pf-sec-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#bbb;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
//         .pf-sec-label::after{content:'';flex:1;height:1px;background:#f0f0f0;}
//         .pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
//         .pf-field{display:flex;flex-direction:column;gap:4px;}
//         .pf-field label{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em;}
//         .pf-field input,.pf-field select,.pf-field textarea{padding:9px 12px;border:1.5px solid #e8e8e8;border-radius:9px;font-size:13px;background:#fafafa;color:#111;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;box-sizing:border-box;font-family:inherit;}
//         .pf-field input:focus,.pf-field select:focus,.pf-field textarea:focus{border-color:#6b2737;box-shadow:0 0 0 3px rgba(107,39,55,.08);background:#fff;}
//         .pf-field textarea{resize:vertical;min-height:72px;}
//         .pf-full{grid-column:1/-1;}
//         @media(max-width:480px){.pf-grid{grid-template-columns:1fr;}}
//         .pf-sizes{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px;}
//         .pf-size-chip{padding:5px 12px;border-radius:20px;border:1.5px solid #e8e8e8;background:#fff;font-size:12px;font-weight:500;color:#666;cursor:pointer;transition:all .15s;user-select:none;}
//         .pf-size-chip:hover{border-color:#6b2737;color:#6b2737;}
//         .pf-size-chip.on{background:#6b2737;border-color:#6b2737;color:#fff;}
//         .pf-vcard{border:1.5px solid #f0f0f0;border-radius:12px;overflow:hidden;margin-bottom:10px;animation:pf-row-in .2s ease;}
//         .pf-vcard-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fafafa;}
//         .pf-vcard-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#111;}
//         .pf-size-badge{width:28px;height:28px;border-radius:7px;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}
//         .pf-vcard-remove{background:none;border:none;cursor:pointer;color:#e74c3c;font-size:12px;padding:3px 8px;border-radius:6px;transition:background .15s;font-family:inherit;}
//         .pf-vcard-remove:hover{background:#fde8e8;}
//         .pf-vcard-body{padding:12px 14px;}
//         .pf-color-row{display:grid;grid-template-columns:110px 1fr 1fr auto;gap:8px;align-items:center;padding:8px 10px;background:#fff;border:1px solid #f5f5f5;border-radius:8px;margin-bottom:6px;animation:pf-row-in .18s ease;}
//         @media(max-width:480px){.pf-color-row{grid-template-columns:1fr 1fr;gap:6px;}}
//         .pf-color-name{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;}
//         .pf-color-dot{width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,.1);flex-shrink:0;}
//         .pf-mini-input{padding:6px 8px;border:1.5px solid #e8e8e8;border-radius:7px;font-size:12px;font-family:inherit;background:#fafafa;color:#111;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s;}
//         .pf-mini-input:focus{border-color:#6b2737;background:#fff;}
//         .pf-rm-btn{background:none;border:none;cursor:pointer;color:#ccc;font-size:15px;padding:2px 4px;border-radius:5px;transition:color .15s;line-height:1;}
//         .pf-rm-btn:hover{color:#e74c3c;}
//         .pf-color-dots{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
//         .pf-cdot{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform .14s,box-shadow .14s;}
//         .pf-cdot:hover{transform:scale(1.2);}
//         .pf-cdot.on{box-shadow:0 0 0 2px #fff,0 0 0 4px #6b2737;}
//         .pf-add-color-btn{width:100%;padding:7px;border:1.5px dashed #ddd;border-radius:7px;background:none;color:#aaa;font-size:12px;cursor:pointer;transition:border-color .15s,color .15s;font-family:inherit;}
//         .pf-add-color-btn:hover{border-color:#6b2737;color:#6b2737;}
//         .pf-footer{display:flex;gap:8px;padding:14px 24px;border-top:1px solid #f0f0f0;background:#fff;flex-shrink:0;}
//         .pf-btn-primary{flex:1;padding:10px;border-radius:10px;border:none;background:#6b2737;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .16s;font-family:inherit;}
//         .pf-btn-primary:hover{background:#7d2f42;transform:translateY(-1px);}
//         .pf-btn-secondary{padding:10px 18px;border-radius:10px;border:1.5px solid #e8e8e8;background:#fff;color:#666;font-size:13px;font-weight:500;cursor:pointer;transition:all .16s;font-family:inherit;}
//         .pf-btn-secondary:hover{border-color:#111;color:#111;}
//         .pf-empty-hint{text-align:center;padding:24px;color:#bbb;font-size:13px;}
//         .pf-img-note{font-size:11px;color:#aaa;padding:6px 10px;background:#f9f4f5;border-radius:8px;border-left:3px solid #6b2737;}
//       `}</style>

//             <div className="pf-backdrop" onClick={(e) => e.target.classList.contains("pf-backdrop") && onCancel()}>
//                 <div className="pf-modal">

//                     <div className="pf-modal-head">
//                         <div>
//                             <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
//                             <p>{editId ? "Update product details below" : "Fill in details to list a new product"}</p>
//                         </div>
//                         <button className="pf-modal-close" onClick={onCancel}>✕</button>
//                     </div>

//                     <div className="pf-tabs">
//                         <div className={`pf-tab ${pfStep === 0 ? "active" : "done"}`} onClick={() => setPfStep(0)}>
//                             <span className="pf-tab-num">{pfStep > 0 ? "✓" : "1"}</span> Product Info
//                         </div>
//                         <div className={`pf-tab ${pfStep === 1 ? "active" : ""}`} onClick={() => setPfStep(1)}>
//                             <span className="pf-tab-num">2</span> Variants
//                         </div>
//                     </div>

//                     <div className="pf-body">

//                         {pfStep === 0 && (
//                             <div>
//                                 <div style={{ marginBottom: "18px" }}>
//                                     <div className="pf-sec-label">Basic Details</div>
//                                     <div className="pf-grid">
//                                         <div className="pf-field pf-full">
//                                             <label>Product Name *</label>
//                                             <input name="name" placeholder="e.g. Classic Linen Shirt" value={form.name} onChange={handleChange} required />
//                                         </div>
//                                         <div className="pf-field">
//                                             <label>Brand</label>
//                                             <input name="brand" placeholder="Brand name" value={form.brand} onChange={handleChange} />
//                                         </div>
//                                         <div className="pf-field">
//                                             <label>Discount %</label>
//                                             <input name="discount" type="number" placeholder="0" value={form.discount} onChange={handleChange} />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* ─── MULTI-IMAGE UPLOAD SECTION ─── */}
//                                 <div style={{ marginBottom: "18px" }}>
//                                     <div className="pf-sec-label">Product Images</div>
//                                     <div className="pf-img-note" style={{ marginBottom: "10px" }}>
//                                         📌 First image becomes the <strong>main product photo</strong>. Click any thumbnail to reorder.
//                                     </div>
//                                     <ImageUploader
//                                         images={form.images || []}
//                                         setImages={(imgs) => {
//                                             //  handle both function and array
//                                             if (typeof imgs === 'function') {
//                                                 setForm(prev => {
//                                                     const newImages = imgs(prev.images || []);
//                                                     return { ...prev, images: newImages, img: newImages[0] || prev.img };
//                                                 });
//                                             } else {
//                                                 setForm(prev => ({ ...prev, images: imgs, img: imgs[0] || prev.img }));
//                                             }
//                                         }}
//                                         token={token}
//                                         maxImages={6}
//                                     />
//                                     {/* Fallback: manual URL input (optional, for URL-based images) */}
//                                     <details style={{ marginTop: "10px" }}>
//                                         <summary style={{ fontSize: "11px", color: "#aaa", cursor: "pointer" }}>Or paste image URL manually</summary>
//                                         <div className="pf-field" style={{ marginTop: "8px" }}>
//                                             <label>Image URL</label>
//                                             <input
//                                                 name="img"
//                                                 placeholder="https://..."
//                                                 value={form.img}
//                                                 onChange={(e) => {
//                                                     handleChange(e);
//                                                     // If URL provided and no uploaded images, use it
//                                                     if (e.target.value && (!form.images || form.images.length === 0)) {
//                                                         setForm(prev => ({ ...prev, img: e.target.value, images: [e.target.value] }));
//                                                     }
//                                                 }}
//                                             />
//                                         </div>
//                                     </details>
//                                 </div>

//                                 <div style={{ marginBottom: "18px" }}>
//                                     <div className="pf-sec-label">Category</div>
//                                     <div className="pf-grid">
//                                         <div className="pf-field">
//                                             <label>Category</label>
//                                             <select name="category" value={form.category} onChange={handleChange}>
//                                                 <option value="">Select category</option>
//                                                 <option value="men">Men</option>
//                                                 <option value="women">Women</option>
//                                                 <option value="kids">Kids</option>
//                                                 <option value="bags">Bags</option>
//                                                 <option value="Footware">Footware</option>
//                                                 <option value="accessories">Accessories</option>
//                                                 <option value="Electronics">Electronics</option>
//                                             </select>
//                                             <label style={{ marginTop: "8px" }}>Collection</label>
//                                             <select name="collection" value={form.collection} onChange={handleChange}>
//                                                 <option value="none">No Collection</option>
//                                                 <option value="summer">☀️ Summer</option>
//                                                 <option value="winter">❄️ Winter</option>
//                                             </select>
//                                         </div>
//                                         {["men", "women", "kids"].includes(form.category) && (
//                                             <div className="pf-field">
//                                                 <label>Sub Category</label>
//                                                 <select name="subCategory" value={form.subCategory} onChange={handleChange}>
//                                                     <option value="">Select sub category</option>
//                                                     <option value="Top Wear">Top Wear</option>
//                                                     <option value="Bottom Wear">Bottom Wear</option>
//                                                     <option value="Casual Wear">Casual Wear</option>
//                                                     <option value="Formal Wear">Formal Wear</option>
//                                                     <option value="Ethnic Wear">Ethnic Wear</option>
//                                                     <option value="Western Wear">Western Wear</option>
//                                                     <option value="School Wear">School Wear</option>
//                                                 </select>
//                                             </div>
//                                         )}
//                                         <div className="pf-field pf-full">
//                                             <label>Description</label>
//                                             <textarea name="description" placeholder="Describe the product..." value={form.description} onChange={handleChange} />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div style={{ display: "flex", justifyContent: "flex-end" }}>
//                                     <button type="button" className="pf-btn-primary" style={{ flex: "none", padding: "10px 24px" }} onClick={() => setPfStep(1)}>
//                                         Next: Variants →
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {pfStep === 1 && (
//                             <div>
//                                 <div style={{ marginBottom: "18px" }}>
//                                     <div className="pf-sec-label">Select Sizes</div>
//                                     <div className="pf-sizes">
//                                         {ALL_SIZES.map(s => (
//                                             <div key={s} className={`pf-size-chip ${selectedSizes.includes(s) ? "on" : ""}`}
//                                                 onClick={() => toggleSize(s)}>{s}</div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/*  Show colors directly without needing size */}
//                                 <div style={{ marginBottom: "18px" }}>
//                                     <div className="pf-sec-label">Select Colors (No Size)</div>
//                                     <div className="pf-color-dots">
//                                         {ALL_COLORS.map(color => {
//                                             const exists = form.variants.find(v => v.color === color && !v.size);
//                                             return (
//                                                 <div key={color}
//                                                     className={`pf-cdot ${exists ? "on" : ""}`}
//                                                     style={{ background: COLORS_MAP[color] }}
//                                                     title={color}
//                                                     onClick={() => {
//                                                         if (exists) {
//                                                             removeVariant(form.variants.indexOf(exists));
//                                                         } else {
//                                                             setForm({
//                                                                 ...form,
//                                                                 variants: [...form.variants,
//                                                                 { color, size: "", price: "", stock: "", image: "" }
//                                                                 ]
//                                                             });
//                                                         }
//                                                     }}
//                                                 />
//                                             );
//                                         })}
//                                     </div>

//                                     {/* Show price/stock inputs for no-size color variants */}
//                                     {form.variants.filter(v => v.color && !v.size).map((v, i) => {
//                                         const realIdx = form.variants.indexOf(v);
//                                         return (
//                                             <div key={realIdx} className="pf-color-row">
//                                                 <div className="pf-color-name">
//                                                     <div className="pf-color-dot" style={{ background: COLORS_MAP[v.color] || "#ccc" }} />
//                                                     {v.color}
//                                                 </div>
//                                                 <input className="pf-mini-input" type="number" placeholder="Price ₹"
//                                                     value={v.price} onChange={(e) => handleVariantChange(realIdx, "price", e.target.value)} />
//                                                 <input className="pf-mini-input" type="number" placeholder="Stock"
//                                                     value={v.stock} onChange={(e) => handleVariantChange(realIdx, "stock", e.target.value)} />
//                                                 <button type="button" className="pf-rm-btn" onClick={() => removeVariant(realIdx)}>✕</button>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                                 <div className="pf-sec-label">Variant Details (With Size)</div>
//                                 {selectedSizes.length === 0 && form.variants.filter(v => v.color && !v.size).length === 0 && (
//                                     <div className="pf-empty-hint">👆 Select sizes above or pick colors directly for no-size products</div>
//                                 )}
//                                 {selectedSizes.map(size => {
//                                     const sizeVariants = form.variants.filter(v => v.size === size);
//                                     const activeColors = sizeVariants.map(v => v.color).filter(Boolean);
//                                     return (
//                                         <div key={size} className="pf-vcard">
//                                             <div className="pf-vcard-head">
//                                                 <div className="pf-vcard-title">
//                                                     <span className="pf-size-badge">{size}</span>
//                                                     <span style={{ fontWeight: 400, color: "#888", fontSize: "12px" }}>
//                                                         {sizeVariants.length} color{sizeVariants.length !== 1 ? "s" : ""}
//                                                     </span>
//                                                 </div>
//                                                 <button type="button" className="pf-vcard-remove" onClick={() => toggleSize(size)}>Remove size</button>
//                                             </div>
//                                             <div className="pf-vcard-body">
//                                                 <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "7px", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase" }}>Pick Colors</div>
//                                                 <div className="pf-color-dots">
//                                                     {ALL_COLORS.map(color => (
//                                                         <div key={color} className={`pf-cdot ${activeColors.includes(color) ? "on" : ""}`}
//                                                             style={{ background: COLORS_MAP[color] }} title={color}
//                                                             onClick={() => toggleColor(size, color)} />
//                                                     ))}
//                                                 </div>
//                                                 {sizeVariants.map(v => {
//                                                     if (!v.color) return null;
//                                                     const realIdx = form.variants.indexOf(v);
//                                                     return (
//                                                         <div key={realIdx} className="pf-color-row">
//                                                             <div className="pf-color-name">
//                                                                 <div className="pf-color-dot" style={{ background: COLORS_MAP[v.color] || "#ccc" }} />
//                                                                 {v.color}
//                                                             </div>
//                                                             <input className="pf-mini-input" type="number" placeholder="Price ₹"
//                                                                 value={v.price} onChange={(e) => handleVariantChange(realIdx, "price", e.target.value)} />
//                                                             <input className="pf-mini-input" type="number" placeholder="Stock"
//                                                                 value={v.stock} onChange={(e) => handleVariantChange(realIdx, "stock", e.target.value)} />
//                                                             <button type="button" className="pf-rm-btn" onClick={() => removeVariant(realIdx)}>✕</button>
//                                                         </div>
//                                                     );
//                                                 })}
//                                                 <button type="button" className="pf-add-color-btn"
//                                                     onClick={() => setForm({ ...form, variants: [...form.variants, { color: "", size, price: "", stock: "", image: "" }] })}>
//                                                     + Add custom color for {size}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                     <div className="pf-footer">
//                         {pfStep === 1 && <button type="button" className="pf-btn-secondary" onClick={() => setPfStep(0)}>← Back</button>}
//                         <button type="button" className="pf-btn-secondary" onClick={onCancel}>Cancel</button>
//                         <button type="button" className="pf-btn-primary"
//                             onClick={pfStep === 0 ? () => setPfStep(1) : handleSubmit}>
//                             {pfStep === 0 ? "Next: Variants →" : (editId ? "Update Product" : "Add Product")}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };
// // ─────────────────────────────────────────────
// // PRODUCTS PAGE
// // ─────────────────────────────────────────────
// const ProductsPage = ({ products, fetchProducts, token, toggleSidebar, sidebarOpen }) => {
//     const [editId, setEditId] = useState(null);
//     const [showForm, setShowForm] = useState(false);
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [lightboxIdx, setLightboxIdx] = useState(null); // for product detail lightbox
//     const formRef = useRef(null);

//     const emptyForm = {
//         name: "", description: "", category: "", subCategory: "", brand: "",
//         img: "", images: [], discount: "", collection: "none",
//         variants: [{ color: "", size: "", price: "", stock: "", image: "" }]
//     };

//     const [form, setForm] = useState(emptyForm);
//     const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
//     const handleVariantChange = (index, field, value) => {
//         const updated = [...form.variants];
//         updated[index] = { ...updated[index], [field]: value };
//         setForm({ ...form, variants: updated });
//     };

//     const removeVariant = (index) => {
//         const updated = form.variants.filter((_, i) => i !== index);
//         setForm({ ...form, variants: updated.length ? updated : [{ color: "", size: "", price: "", stock: "", image: "" }] });
//     };

//     const handleSubmit = async () => {
//         //  Fix — handle both with-size and without-size variants correctly
//         const variants = form.variants
//             .filter(v => v.color)  // must have color
//             .map(v => ({
//                 attributes: {
//                     color: v.color,
//                     size: v.size || ""  // size is optional
//                 },
//                 price: Number(v.price),
//                 stock: Number(v.stock),
//                 image: v.image
//             }));

//         if (variants.length === 0) { alert("Please add at least one variant with a color."); return; }


//         // images[] — uploaded URLs; img — first image for backwards compat
//         const payload = {
//             ...form,
//             img: form.images?.[0] || form.img || "",
//             images: form.images || [],
//             variants
//         };

//         try {
//             if (editId) {
//                 await api.put(`http://localhost:3001/api/products/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
//                 alert("Product updated!");
//             } else {
//                 await api.post("http://localhost:3001/api/products", payload, { headers: { Authorization: `Bearer ${token}` } });
//                 alert("Product added!");
//             }
//             fetchProducts();
//             setForm(emptyForm);
//             setEditId(null);
//             setShowForm(false);
//         } catch (error) { alert(error.response?.data?.message || "Error"); }
//     };

//     const handleEdit = (p) => {
//         setEditId(p._id);
//         setForm({
//             name: p.name || "",
//             description: p.description || "",
//             category: p.category || "",
//             subCategory: p.subCategory || "",
//             brand: p.brand || "",
//             img: p.img || "",
//             images: p.images?.length > 0 ? p.images : (p.img ? [p.img] : []), // ← this should already be there
//             discount: p.discount || "",
//             collection: p.collection || "none",
//             variants: p.variants?.length > 0
//                 ? p.variants.map(v => ({
//                     color: v.attributes?.color || "",
//                     size: v.attributes?.size || "",
//                     price: v.price || "",
//                     stock: v.stock || "",
//                     image: v.image || ""
//                 }))
//                 : [{ color: "", size: "", price: "", stock: "", image: "" }]
//         });
//         setShowForm(true);
//     };

//     const handleCancel = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };
//     const deleteProduct = async (id) => {
//         if (!window.confirm("Are you sure?")) return;
//         await api.delete(`http://localhost:3001/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//         fetchProducts();
//     };

//     // Product detail view with image gallery
//     if (selectedProduct) {
//         const allImages = selectedProduct.images?.length > 0
//             ? selectedProduct.images
//             : (selectedProduct.img ? [selectedProduct.img] : []);

//         return (
//             <div className="page">
//                 <style>{`
//           .pd-gallery { display:flex; flex-direction:column; gap:10px; }
//           .pd-main-img { width:100%; border-radius:12px; overflow:hidden; aspect-ratio:4/3; background:#f7f7f7; }
//           .pd-main-img img { width:100%; height:100%; object-fit:cover; }
//           .pd-thumbs { display:flex; gap:8px; flex-wrap:wrap; }
//           .pd-thumb { width:64px; height:64px; border-radius:8px; overflow:hidden; cursor:pointer;
//             border:2px solid transparent; transition:border-color .15s; flex-shrink:0; }
//           .pd-thumb.active { border-color:#6b2737; }
//           .pd-thumb img { width:100%; height:100%; object-fit:cover; }
//           .pd-lightbox { position:fixed; inset:0; z-index:2000; background:rgba(0,0,0,.9);
//             display:flex; align-items:center; justify-content:center; padding:20px; }
//           .pd-lightbox img { max-width:90vw; max-height:85vh; border-radius:8px; object-fit:contain; }
//           .pd-lb-close { position:absolute; top:16px; right:20px; color:#fff; font-size:28px;
//             cursor:pointer; background:none; border:none; line-height:1; }
//           .pd-lb-nav { position:absolute; top:50%; transform:translateY(-50%);
//             color:#fff; font-size:32px; cursor:pointer; background:rgba(255,255,255,.1);
//             border:none; padding:8px 14px; border-radius:8px; transition:background .15s; }
//           .pd-lb-nav:hover { background:rgba(255,255,255,.2); }
//           .pd-lb-prev { left:12px; } .pd-lb-next { right:12px; }
//           .pd-lb-counter { position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
//             color:rgba(255,255,255,.7); font-size:12px; }
//         `}</style>

//                 {lightboxIdx !== null && (
//                     <div className="pd-lightbox" onClick={() => setLightboxIdx(null)}>
//                         <button className="pd-lb-close" onClick={() => setLightboxIdx(null)}>✕</button>
//                         <button className="pd-lb-nav pd-lb-prev" onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + allImages.length) % allImages.length); }}>‹</button>
//                         <img src={allImages[lightboxIdx]} alt="" onClick={e => e.stopPropagation()} onError={e => e.target.src = "/placeholder.png"} />
//                         <button className="pd-lb-nav pd-lb-next" onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % allImages.length); }}>›</button>
//                         <div className="pd-lb-counter">{lightboxIdx + 1} / {allImages.length}</div>
//                     </div>
//                 )}

//                 <PageHeader title="Product Details" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//                 <button onClick={() => setSelectedProduct(null)}
//                     style={{ marginBottom: "16px", background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" }}>
//                     ← Back to Products
//                 </button>

//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "24px" }}>
//                     {/* Left — Image Gallery */}
//                     <div className="pd-gallery">
//                         <div className="pd-main-img" style={{ cursor: allImages.length ? "zoom-in" : "default" }}
//                             onClick={() => allImages.length && setLightboxIdx(0)}>
//                             <img src={allImages[0] || "/placeholder.png"} alt={selectedProduct.name} onError={e => e.target.src = "/placeholder.png"} />
//                         </div>
//                         {allImages.length > 1 && (
//                             <div className="pd-thumbs">
//                                 {allImages.map((img, idx) => (
//                                     <div key={idx} className={`pd-thumb ${idx === 0 ? "active" : ""}`}
//                                         onClick={() => { setLightboxIdx(idx); }}>
//                                         <img src={img} alt="" onError={e => e.target.src = "/placeholder.png"} />
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                         {allImages.length > 1 && (
//                             <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
//                                 🖼️ {allImages.length} images — click to view full screen
//                             </p>
//                         )}
//                     </div>

//                     {/* Right — Details */}
//                     <div>
//                         <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>{selectedProduct.name}</h2>
//                         <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>{selectedProduct.description}</p>
//                         <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
//                             <tbody>
//                                 {[
//                                     ["Category", selectedProduct.category],
//                                     ["Sub Category", selectedProduct.subCategory || "—"],
//                                     ["Brand", selectedProduct.brand || "—"],
//                                     ["Discount", selectedProduct.discount ? `${selectedProduct.discount}%` : "—"],
//                                     ["Price", `₹${selectedProduct.variants?.[0]?.price || selectedProduct.price || 0}`],
//                                     ["Total Stock", selectedProduct.variants?.reduce((s, v) => s + v.stock, 0) || selectedProduct.stock || 0],
//                                     ["Images", `${allImages.length} photo${allImages.length !== 1 ? "s" : ""}`],
//                                 ].map(([label, value]) => (
//                                     <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
//                                         <td style={{ padding: "8px 0", color: "#888", width: "40%" }}>{label}</td>
//                                         <td style={{ padding: "8px 0", fontWeight: 500 }}>{value}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         {selectedProduct.variants?.length > 0 && (
//                             <div style={{ marginTop: "16px" }}>
//                                 <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>Variants</p>
//                                 <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//                                     {selectedProduct.variants.map((v, i) => (
//                                         <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f9f9f9", borderRadius: "8px", fontSize: "13px" }}>
//                                             <span>{v.attributes?.color} / {v.attributes?.size}</span>
//                                             <span>₹{v.price}</span>
//                                             <span style={{ color: v.stock > 0 ? "#43a348" : "#c62828" }}>{v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                         <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
//                             <button onClick={() => { setSelectedProduct(null); handleEdit(selectedProduct); }}
//                                 style={{ padding: "9px 20px", background: "#6b2737", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
//                                 Edit Product
//                             </button>
//                             <button onClick={() => setSelectedProduct(null)}
//                                 style={{ padding: "9px 20px", background: "#fff", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="page">
//             <PageHeader title="Products" subtitle="Manage your product catalog" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
//                 <button className="add-btn" onClick={() => { handleCancel(); setShowForm(true); }}>+ Add Product</button>
//             </PageHeader>

//             {showForm && (
//                 <ProductModal
//                     editId={editId} form={form} setForm={setForm}
//                     handleChange={handleChange} handleVariantChange={handleVariantChange}
//                     removeVariant={removeVariant} handleSubmit={handleSubmit}
//                     handleCancel={handleCancel} token={token}
//                 />
//             )}

//             {/* Desktop Table */}
//             <div className="admin__table desktop-table">
//                 <div className="table__row table__head">
//                     <span>Product</span><span>Category</span><span>Sub Category</span>
//                     <span>Brand</span><span>Price</span><span>Stock</span><span>Actions</span>
//                 </div>
//                 {products.map((p) => {
//                     const allImgs = p.images?.length > 0 ? p.images : (p.img ? [p.img] : []);
//                     return (
//                         <div className="table__row" key={p._id}>
//                             <div className="product-info" onClick={() => setSelectedProduct(p)} style={{ cursor: "pointer" }}>
//                                 <div style={{ position: "relative", display: "inline-block" }}>
//                                     <img src={allImgs[0] || p.img} alt={p.name} width="50" onError={e => e.target.src = "/placeholder.png"} />
//                                     {allImgs.length > 1 && (
//                                         <span style={{ position: "absolute", bottom: "-2px", right: "-2px", background: "#6b2737", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "6px" }}>
//                                             +{allImgs.length - 1}
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p>{p.name}</p>
//                             </div>
//                             <span>{p.category}</span>
//                             <span>{p.subCategory || "—"}</span>
//                             <span>{p.brand}</span>
//                             <span>₹{p.variants?.[0]?.price || p.price || 0}</span>
//                             <span>{p.variants?.reduce((sum, v) => sum + v.stock, 0) || p.stock || 0}</span>
//                             <div className="actions">
//                                 <button onClick={() => handleEdit(p)}>Edit</button>
//                                 <button onClick={() => deleteProduct(p._id)} style={{ background: "#e74c3c" }}>Delete</button>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Mobile Cards */}
//             <div className="product-cards mobile-cards">
//                 {products.map((p) => {
//                     const allImgs = p.images?.length > 0 ? p.images : (p.img ? [p.img] : []);
//                     return (
//                         <div className="product-mobile-card" key={p._id}>
//                             <div className="product-mobile-card__top" onClick={() => setSelectedProduct(p)} style={{ cursor: "pointer" }}>
//                                 <div style={{ position: "relative", display: "inline-block" }}>
//                                     <img src={allImgs[0] || p.img} alt={p.name} className="product-mobile-card__img" onError={e => e.target.src = "/placeholder.png"} />
//                                     {allImgs.length > 1 && (
//                                         <span style={{ position: "absolute", bottom: "2px", right: "2px", background: "#6b2737", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 5px", borderRadius: "8px" }}>
//                                             {allImgs.length} 🖼️
//                                         </span>
//                                     )}
//                                 </div>
//                                 <div className="product-mobile-card__info">
//                                     <p className="product-mobile-card__name">{p.name}</p>
//                                     <p className="product-mobile-card__meta">{p.category}{p.subCategory ? ` · ${p.subCategory}` : ""}</p>
//                                     <p className="product-mobile-card__meta">{p.brand}</p>
//                                 </div>
//                             </div>
//                             <div className="product-mobile-card__bottom">
//                                 <span className="product-mobile-card__price">₹{p.variants?.[0]?.price || p.price || 0}</span>
//                                 <span className="product-mobile-card__stock">Stock: {p.variants?.reduce((sum, v) => sum + v.stock, 0) || p.stock || 0}</span>
//                                 <div className="actions">
//                                     <button onClick={() => handleEdit(p)} style={{ background: "#2778e1" }}>Edit</button>
//                                     <button onClick={() => deleteProduct(p._id)} style={{ background: "#e74c3c" }}>Delete</button>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// const NAV_ITEMS = [
//     { key: "dashboard", icon: "📊", label: "Dashboard" },
//     { key: "products", icon: "📦", label: "Products" },
//     { key: "collections", icon: "📚", label: "Collections" },
//     { key: "orders", icon: "🛒", label: "Orders" },
//     { key: "users", icon: "👥", label: "Users" },
//     { key: "blogs", icon: "✍️", label: "Blogs" }
// ];

// const AdminDashboard = () => {
//     const [products, setProducts] = useState([]);
//     const [activeTab, setActiveTab] = useState("dashboard");
//     const navigate = useNavigate();
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const token = localStorage.getItem("token");
//     const toggleSidebar = () => setSidebarOpen(prev => !prev);

//     useEffect(() => { fetchProducts(); }, []);

//     const fetchProducts = async () => {
//         try {
//             const res = await api.get("http://localhost:3001/api/products");
//             setProducts(res.data);
//         } catch (error) { console.error("Fetch error:", error); }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         navigate("/");
//     };

//     const sharedProps = { toggleSidebar, sidebarOpen };

//     const renderPage = () => {
//         switch (activeTab) {
//             case "dashboard": return <DashboardPage {...sharedProps} />;
//             case "products": return <ProductsPage products={products} fetchProducts={fetchProducts} token={token} {...sharedProps} />;
//             case "collections": return <CollectionsPage products={products} {...sharedProps} />
//             case "orders": return <OrdersPage token={token} {...sharedProps} />
//             case "users": return <UsersPage token={token} {...sharedProps} />
//             case "blogs": return <BlogPage token={token} {...sharedProps} />
//             default: return <DashboardPage {...sharedProps} />;
//         }
//     };

//     return (
//         <div className={`admin ${sidebarOpen ? "sidebar-open" : ""}`}>
//             {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
//             <aside className={`admin__sidebar ${sidebarOpen ? "open" : ""}`}>
//                 <div className="sidebar__top">
//                     <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
//                         <div className="logo-box">👑</div>
//                         <div><h3>ShopVista</h3><p>Admin Panel</p></div>
//                     </div>
//                     <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
//                 </div>
//                 <ul className="sidebar__menu">
//                     {NAV_ITEMS.map(({ key, icon, label }) => (
//                         <li key={key} className={activeTab === key ? "active" : ""}
//                             onClick={() => { setActiveTab(key); setSidebarOpen(false); }}>
//                             {icon} {label}
//                         </li>
//                     ))}
//                 </ul>
//                 <button className="logout-btn" onClick={handleLogout}>Logout</button>
//             </aside>
//             <div className="admin__content">{renderPage()}</div>
//         </div>
//     );
// };

// //collection page
// const CollectionsPage = ({ products, toggleSidebar, sidebarOpen }) => {
//     const [activeFilter, setActiveFilter] = useState("all");

//     const filtered = activeFilter === "all"
//         ? products
//         : products.filter(p => (p.collection || "none") === activeFilter);

//     // Group by collection
//     const groups = {};
//     filtered.forEach(p => {
//         const col = p.collection || "none";
//         if (!groups[col]) groups[col] = [];
//         groups[col].push(p);
//     });

//     const stats = [
//         ["Total Products", products.length],
//         ["Summer ☀️", products.filter(p => p.collection === "summer").length],
//         ["Winter ❄️", products.filter(p => p.collection === "winter").length],
//         ["No Collection", products.filter(p => !p.collection || p.collection === "none").length],
//     ];

//     const LABELS = { summer: "☀️ Summer", winter: "❄️ Winter", none: "No Collection" };
//     const BANNER_COLORS = { summer: "#fef3c7", winter: "#dbeafe", none: "#f3f4f6" };
//     const BADGE_STYLES = {
//         summer: { background: "#fde68a", color: "#92400e" },
//         winter: { background: "#bfdbfe", color: "#1e40af" },
//         none: { background: "#e5e7eb", color: "#6b7280" },
//     };

//     return (
//         <div className="page">
//             <style>{`
//         .cc-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; margin-bottom:20px; }
//         .cc-stat { background:#f5f5f5; border-radius:8px; padding:14px 16px; }
//         .cc-stat-label { font-size:12px; color:#888; margin-bottom:4px; }
//         .cc-stat-val { font-size:22px; font-weight:500; }
//         .cc-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
//         .cc-tab { padding:7px 18px; border-radius:20px; border:1px solid #ddd; background:#fff; font-size:13px; cursor:pointer; color:#888; }
//         .cc-tab.active { background:#6b2737; color:#fff; border-color:#6b2737; }
//         .cc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
//         .cc-card { background:#fff; border:1px solid #e8e8e8; border-radius:12px; overflow:hidden; }
//         .cc-banner { height:68px; display:flex; align-items:center; justify-content:space-between; padding:0 18px; }
//         .cc-badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
//         .cc-body { padding:16px 18px; }
//         .cc-card-title { font-size:15px; font-weight:500; margin-bottom:3px; }
//         .cc-card-meta { font-size:12px; color:#aaa; margin-bottom:14px; }
//         .cc-product-row { display:flex; align-items:center; gap:10px; padding:8px 10px; background:#f8f8f8; border-radius:8px; margin-bottom:7px; }
//         .cc-product-img { width:40px; height:40px; border-radius:6px; object-fit:cover; background:#eee; flex-shrink:0; }
//         .cc-product-name { font-size:12px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
//         .cc-product-variants { font-size:11px; color:#bbb; }
//         .cc-product-price { font-size:12px; font-weight:500; color:#6b2737; flex-shrink:0; }
//         .cc-more { text-align:center; font-size:12px; color:#ccc; padding:6px 0 2px; }
//         @media(max-width:600px){ .cc-grid{grid-template-columns:1fr;} }
//       `}</style>

//             <PageHeader title="Collections" subtitle="Products grouped by season" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

//             {/* Stats */}
//             <div className="cc-stats">
//                 {stats.map(([label, val]) => (
//                     <div className="cc-stat" key={label}>
//                         <div className="cc-stat-label">{label}</div>
//                         <div className="cc-stat-val">{val}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Filter Tabs */}
//             <div className="cc-tabs">
//                 {[["all", "All"], ["summer", "☀️ Summer"], ["winter", "❄️ Winter"], ["none", "No Collection"]].map(([key, label]) => (
//                     <div key={key} className={`cc-tab ${activeFilter === key ? "active" : ""}`} onClick={() => setActiveFilter(key)}>
//                         {label}
//                     </div>
//                 ))}
//             </div>

//             {/* Collection Cards */}
//             <div className="cc-grid">
//                 {Object.keys(groups).length === 0 && (
//                     <p style={{ color: "#aaa", fontSize: "14px", padding: "40px 0" }}>No products found.</p>
//                 )}
//                 {Object.entries(groups).map(([col, items]) => {
//                     const totalVariants = items.reduce((s, p) => s + (p.variants?.length || 0), 0);
//                     const totalStock = items.reduce((s, p) => s + (p.variants?.reduce((a, v) => a + (v.stock || 0), 0) || 0), 0);
//                     const shown = items.slice(0, 3);
//                     const more = items.length - shown.length;
//                     const badge = BADGE_STYLES[col] || BADGE_STYLES.none;

//                     return (
//                         <div className="cc-card" key={col}>
//                             <div className="cc-banner" style={{ background: BANNER_COLORS[col] || "#f3f4f6" }}>
//                                 <span className="cc-badge" style={badge}>{LABELS[col] || col}</span>
//                                 <span style={{ fontSize: "28px" }}>{col === "summer" ? "☀️" : col === "winter" ? "❄️" : "🛍️"}</span>
//                             </div>
//                             <div className="cc-body">
//                                 <div className="cc-card-title">{LABELS[col] || col} Collection</div>
//                                 <div className="cc-card-meta">
//                                     {items.length} product{items.length !== 1 ? "s" : ""} &bull; {totalVariants} variant{totalVariants !== 1 ? "s" : ""} &bull; {totalStock} in stock
//                                 </div>
//                                 {shown.map(p => {
//                                     const imgs = p.images?.length > 0 ? p.images : (p.img ? [p.img] : []);
//                                     const minPrice = Math.min(...(p.variants || []).map(v => v.price || 0));
//                                     const variantDesc = (p.variants || []).slice(0, 2)
//                                         .map(v => `${v.attributes?.color || ""}${v.attributes?.size ? " / " + v.attributes.size : ""}`)
//                                         .join(", ") + (p.variants?.length > 2 ? " +more" : "");
//                                     return (
//                                         <div className="cc-product-row" key={p._id}>
//                                             {imgs[0]
//                                                 ? <img className="cc-product-img" src={imgs[0]} alt={p.name} onError={e => e.target.src = "/placeholder.png"} />
//                                                 : <div className="cc-product-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#ccc" }}>IMG</div>
//                                             }
//                                             <div style={{ flex: 1, minWidth: 0 }}>
//                                                 <div className="cc-product-name">{p.name}</div>
//                                                 <div className="cc-product-variants">{variantDesc}</div>
//                                             </div>
//                                             <div className="cc-product-price">₹{minPrice.toLocaleString()}</div>
//                                         </div>
//                                     );
//                                 })}
//                                 {more > 0 && <div className="cc-more">+{more} more product{more !== 1 ? "s" : ""}</div>}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// //orderpage
// const OrdersPage = ({ token, toggleSidebar, sidebarOpen }) => {
//     const [orders, setOrders] = useState([]);
//     const [search, setSearch] = useState("");
//     const [statusFilter, setStatusFilter] = useState("all");
//     const [sort, setSort] = useState("newest");
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchOrders = async () => {
//             try {
//                 const res = await api.get("http://localhost:3001/api/orders", {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 setOrders(res.data);
//             } catch (err) {
//                 console.error("Orders fetch error:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOrders();
//     }, []);

//     const updateStatus = async (orderId, newStatus) => {
//         try {
//             await api.put(`http://localhost:3001/api/orders/${orderId}`,
//                 { status: newStatus },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
//         } catch (err) {
//             alert("Failed to update status");
//         }
//     };

//     const filtered = orders
//         .filter(o => {
//             const q = search.toLowerCase();
//             const userId = o.userId?._id || o.userId || "";
//             const userName = o.userId?.name || o.userName || "";
//             return !q || userId.toLowerCase().includes(q) || userName.toLowerCase().includes(q) || o._id.toLowerCase().includes(q);
//         })
//         .filter(o => statusFilter === "all" || o.status === statusFilter)
//         .sort((a, b) => {
//             if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
//             if (sort === "highest") return b.amount - a.amount;
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//     const stats = [
//         ["Total orders", orders.length],
//         ["Delivered", orders.filter(o => o.status === "delivered").length],
//         ["Processing", orders.filter(o => o.status === "processing").length],
//         ["Revenue", `₹${orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.amount || 0), 0).toLocaleString("en-IN")}`],
//     ];

//     const STATUS_MAP = {
//         delivered: { bg: "#dcfce7", color: "#166534", dot: "#16a34a", label: "Delivered" },
//         processing: { bg: "#fef9c3", color: "#854d0e", dot: "#ca8a04", label: "Processing" },
//         shipped: { bg: "#dbeafe", color: "#1e40af", dot: "#2563eb", label: "Shipped" },
//         cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#dc2626", label: "Cancelled" },
//     };

//     const Badge = ({ status }) => {
//         const s = STATUS_MAP[status] || STATUS_MAP.processing;
//         return (
//             <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color }}>
//                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
//                 {s.label}
//             </span>
//         );
//     };

//     const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

//     const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

//     const STATUSES = ["processing", "shipped", "delivered", "cancelled"];

//     return (
//         <div className="page">
//             <style>{`
//                 .op-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;}
//                 .op-stat{background:#f5f5f5;border-radius:8px;padding:14px 16px;}
//                 .op-stat-label{font-size:12px;color:#888;margin-bottom:4px;}
//                 .op-stat-val{font-size:22px;font-weight:500;}
//                 .op-toolbar{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center;}
//                 .op-toolbar input,.op-toolbar select{padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;color:#111;outline:none;}
//                 .op-toolbar input{flex:1;min-width:160px;}
//                 .op-desktop{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;}
//                 .op-th{display:grid;grid-template-columns:2fr 2.5fr 1.5fr 1.2fr 1.5fr 1.4fr;padding:11px 16px;background:#f8f8f8;border-bottom:1px solid #f0f0f0;font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.06em;}
//                 .op-td{display:grid;grid-template-columns:2fr 2.5fr 1.5fr 1.2fr 1.5fr 1.4fr;padding:12px 16px;border-bottom:1px solid #f7f7f7;align-items:center;font-size:13px;}
//                 .op-td:last-child{border-bottom:none;}
//                 .op-td:hover{background:#fafafa;}
//                 .op-avatar{width:32px;height:32px;border-radius:50%;background:#f0e8ea;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:#6b2737;flex-shrink:0;}
//                 .op-prod-img{width:36px;height:36px;border-radius:6px;object-fit:cover;background:#f0f0f0;border:1px solid #eee;flex-shrink:0;}
//                 .op-btn{padding:5px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer;margin-right:4px;}
//                 .op-btn:hover{background:#f5f5f5;}
//                 .op-select{padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:11px;background:#fff;cursor:pointer;}
//                 .op-mobile{display:none;}
//                 .op-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:14px 16px;margin-bottom:10px;}
//                 .op-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
//                 .op-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;}
//                 .op-card-field label{font-size:11px;color:#aaa;display:block;margin-bottom:2px;}
//                 .op-card-field span{font-size:13px;font-weight:500;}
//                 .op-card-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f5f5f5;padding-top:10px;}
//                 @media(max-width:640px){.op-desktop{display:none;}.op-mobile{display:block;}.op-toolbar input{min-width:100px;}}
//             `}</style>

//             <PageHeader title="Orders" subtitle="All customer orders" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

//             {/* Stats */}
//             <div className="op-stats">
//                 {stats.map(([label, val]) => (
//                     <div className="op-stat" key={label}>
//                         <div className="op-stat-label">{label}</div>
//                         <div className="op-stat-val">{val}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Toolbar */}
//             <div className="op-toolbar">
//                 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user ID or name..." />
//                 <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
//                     <option value="all">All statuses</option>
//                     <option value="delivered">Delivered</option>
//                     <option value="processing">Processing</option>
//                     <option value="shipped">Shipped</option>
//                     <option value="cancelled">Cancelled</option>
//                 </select>
//                 <select value={sort} onChange={e => setSort(e.target.value)}>
//                     <option value="newest">Newest first</option>
//                     <option value="oldest">Oldest first</option>
//                     <option value="highest">Highest amount</option>
//                 </select>
//             </div>

//             {loading && <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading orders...</p>}

//             {/* Desktop Table */}
//             {!loading && (
//                 <div className="op-desktop">
//                     <div className="op-th">
//                         <span>User</span><span>Product</span><span>Date</span>
//                         <span>Amount</span><span>Status</span><span>Actions</span>
//                     </div>
//                     {filtered.length === 0 && (
//                         <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No orders found.</p>
//                     )}
//                     {filtered.map(o => {
//                         const userId = o.userId?._id || o.userId || "—";
//                         const userName = o.userId?.name || o.userName || "User";
//                         const items = o.items || o.products || [];
//                         const firstItem = items[0] || {};
//                         const productName = firstItem.productId?.name || firstItem.name || "Product";
//                         const productImg = firstItem.productId?.images?.[0] || firstItem.productId?.img || firstItem.img || "";
//                         const qty = firstItem.quantity || firstItem.qty || 1;

//                         return (
//                             <div className="op-td" key={o._id}>
//                                 <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//                                     <div className="op-avatar">{initials(userName)}</div>
//                                     <div>
//                                         <div style={{ fontWeight: 500, fontSize: 13 }}>{userName}</div>
//                                         <div style={{ fontSize: 11, color: "#aaa" }}>{typeof userId === "string" ? userId.slice(-6) : userId}</div>
//                                     </div>
//                                 </div>
//                                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                                     {productImg
//                                         ? <img className="op-prod-img" src={productImg} alt="" onError={e => e.target.src = "/placeholder.png"} />
//                                         : <div className="op-prod-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ccc" }}>IMG</div>
//                                     }
//                                     <div>
//                                         <div style={{ fontSize: 12, fontWeight: 500, maxWidth: 130, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{productName}</div>
//                                         <div style={{ fontSize: 11, color: "#aaa" }}>Qty: {qty}{items.length > 1 ? ` +${items.length - 1} more` : ""}</div>
//                                     </div>
//                                 </div>
//                                 <span style={{ fontSize: 13, color: "#888" }}>{fmtDate(o.createdAt || o.date)}</span>
//                                 <span style={{ fontWeight: 500, color: "#6b2737" }}>₹{(o.amount || o.totalAmount || 0).toLocaleString("en-IN")}</span>
//                                 <Badge status={o.status} />
//                                 <div>
//                                     <select className="op-select" value={o.status}
//                                         onChange={e => updateStatus(o._id, e.target.value)}>
//                                         {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
//                                     </select>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             {/* Mobile Cards */}
//             {!loading && (
//                 <div className="op-mobile">
//                     {filtered.length === 0 && (
//                         <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No orders found.</p>
//                     )}
//                     {filtered.map(o => {
//                         const userId = o.userId?._id || o.userId || "—";
//                         const userName = o.userId?.name || o.userName || "User";
//                         const items = o.items || o.products || [];
//                         const firstItem = items[0] || {};
//                         const productName = firstItem.productId?.name || firstItem.name || "Product";
//                         const productImg = firstItem.productId?.images?.[0] || firstItem.productId?.img || firstItem.img || "";
//                         const qty = firstItem.quantity || firstItem.qty || 1;

//                         return (
//                             <div className="op-card" key={o._id}>
//                                 <div className="op-card-top">
//                                     <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//                                         <div className="op-avatar">{initials(userName)}</div>
//                                         <div>
//                                             <div style={{ fontWeight: 500, fontSize: 13 }}>{userName}</div>
//                                             <div style={{ fontSize: 11, color: "#aaa" }}>{typeof userId === "string" ? userId.slice(-6) : userId} · {o._id.slice(-6)}</div>
//                                         </div>
//                                     </div>
//                                     <Badge status={o.status} />
//                                 </div>
//                                 <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
//                                     {productImg
//                                         ? <img src={productImg} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #eee" }} alt="" onError={e => e.target.src = "/placeholder.png"} />
//                                         : <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ccc" }}>IMG</div>
//                                     }
//                                     <div>
//                                         <div style={{ fontSize: 13, fontWeight: 500 }}>{productName}</div>
//                                         <div style={{ fontSize: 12, color: "#aaa" }}>Qty: {qty}{items.length > 1 ? ` +${items.length - 1} more` : ""}</div>
//                                     </div>
//                                 </div>
//                                 <div className="op-card-grid">
//                                     <div className="op-card-field"><label>Order date</label><span>{fmtDate(o.createdAt || o.date)}</span></div>
//                                     <div className="op-card-field"><label>Amount</label><span style={{ color: "#6b2737" }}>₹{(o.amount || o.totalAmount || 0).toLocaleString("en-IN")}</span></div>
//                                 </div>
//                                 <div className="op-card-footer">
//                                     <span style={{ fontSize: 12, color: "#bbb" }}>#{o._id.slice(-8)}</span>
//                                     <select className="op-select" value={o.status}
//                                         onChange={e => updateStatus(o._id, e.target.value)}>
//                                         {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
//                                     </select>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// };

// const UsersPage = ({ token, toggleSidebar, sidebarOpen }) => {
//     const [users, setUsers] = useState([]);
//     const [search, setSearch] = useState("");
//     const [roleFilter, setRoleFilter] = useState("all");
//     const [sortBy, setSortBy] = useState("newest");
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const res = await api.get("http://localhost:3001/api/admin/users", {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 setUsers(res.data);
//             } catch (err) {
//                 console.error("Users fetch error:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchUsers();
//     }, []);

//     const deleteUser = async (id) => {
//         if (!window.confirm("Remove this user?")) return;
//         try {
//             await api.delete(`http://localhost:3001/api/admin/users/${id}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUsers(prev => prev.filter(u => u._id !== id));
//         } catch (err) {
//             alert("Failed to remove user");
//         }
//     };

//     const PALETTE = ['#f0e8ea', '#e8f0fa', '#e8f5e9', '#fef3c7', '#f3e8fa', '#e8faf5'];
//     const TEXT_PAL = ['#6b2737', '#185fa5', '#2e7d32', '#854d0e', '#6b21a8', '#0f6e56'];

//     const colorIdx = (name = "") => {
//         let h = 0;
//         for (let c of name) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
//         return h;
//     };

//     const initials = (name = "") =>
//         name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

//     const fmtDate = (d) =>
//         d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

//     const filtered = users
//         .filter(u => {
//             const q = search.toLowerCase();
//             return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u._id?.includes(q);
//         })
//         .filter(u => roleFilter === "all" || u.role === roleFilter)
//         .sort((a, b) => {
//             if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
//             if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//     const stats = [
//         ["Total users", users.length],
//         ["Admins", users.filter(u => u.role === "admin").length],
//         ["Regular users", users.filter(u => u.role !== "admin").length],
//         ["This month", users.filter(u => {
//             const d = new Date(u.createdAt);
//             const now = new Date();
//             return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//         }).length],
//     ];

//     const RoleBadge = ({ role }) => (
//         <span style={{
//             display: "inline-block", padding: "3px 10px", borderRadius: 20,
//             fontSize: 11, fontWeight: 500,
//             background: role === "admin" ? "#f0e8ea" : "#e8f5e9",
//             color: role === "admin" ? "#6b2737" : "#2e7d32"
//         }}>
//             {role}
//         </span>
//     );

//     return (
//         <div className="page">
//             <style>{`
//                 .up-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;}
//                 .up-stat{background:#f5f5f5;border-radius:8px;padding:14px 16px;}
//                 .up-stat-lbl{font-size:12px;color:#888;margin-bottom:4px;}
//                 .up-stat-val{font-size:22px;font-weight:500;}
//                 .up-toolbar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;}
//                 .up-toolbar input,.up-toolbar select{padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;color:#111;outline:none;}
//                 .up-toolbar input{flex:1;min-width:150px;}
//                 .up-table{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;}
//                 .up-th{display:grid;grid-template-columns:2.5fr 2.5fr 1.8fr 1.2fr 1fr;padding:11px 16px;background:#f8f8f8;border-bottom:1px solid #f0f0f0;font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.06em;}
//                 .up-tr{display:grid;grid-template-columns:2.5fr 2.5fr 1.8fr 1.2fr 1fr;padding:12px 16px;border-bottom:1px solid #f7f7f7;align-items:center;font-size:13px;}
//                 .up-tr:last-child{border-bottom:none;}
//                 .up-tr:hover{background:#fafafa;}
//                 .up-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0;}
//                 .up-mobile{display:none;}
//                 .up-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:14px 16px;margin-bottom:10px;}
//                 .up-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
//                 .up-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
//                 .up-card-field label{font-size:11px;color:#aaa;display:block;margin-bottom:2px;}
//                 .up-card-field span{font-size:12px;font-weight:500;word-break:break-all;}
//                 .up-card-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f5f5f5;padding-top:10px;}
//                 .up-btn{padding:5px 11px;border-radius:6px;border:1px solid #fca5a5;background:#fff;font-size:11px;cursor:pointer;color:#dc2626;}
//                 .up-btn:hover{background:#fee2e2;}
//                 @media(max-width:640px){.up-table{display:none;}.up-mobile{display:block;}.up-toolbar input{min-width:100px;}}
//             `}</style>

//             <PageHeader title="Users" subtitle="Registered accounts on your store" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

//             {/* Stats */}
//             <div className="up-stats">
//                 {stats.map(([label, val]) => (
//                     <div className="up-stat" key={label}>
//                         <div className="up-stat-lbl">{label}</div>
//                         <div className="up-stat-val">{val}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Toolbar */}
//             <div className="up-toolbar">
//                 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." />
//                 <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
//                     <option value="all">All roles</option>
//                     <option value="user">User</option>
//                     <option value="admin">Admin</option>
//                 </select>
//                 <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
//                     <option value="newest">Newest first</option>
//                     <option value="oldest">Oldest first</option>
//                     <option value="name">Name A–Z</option>
//                 </select>
//             </div>

//             {loading && <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading users...</p>}

//             {/* Desktop Table */}
//             {!loading && (
//                 <div className="up-table">
//                     <div className="up-th">
//                         <span>User</span>
//                         <span>Email</span>
//                         <span>Joined / Last login</span>
//                         <span>Role</span>
//                         <span>Actions</span>
//                     </div>
//                     {filtered.length === 0 && (
//                         <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No users found.</p>
//                     )}
//                     {filtered.map(u => {
//                         const ci = colorIdx(u.name);
//                         return (
//                             <div className="up-tr" key={u._id}>
//                                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                                     <div className="up-avatar" style={{ background: PALETTE[ci], color: TEXT_PAL[ci] }}>
//                                         {initials(u.name)}
//                                     </div>
//                                     <div>
//                                         <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
//                                         <div style={{ fontSize: 11, color: "#aaa" }}>#{u._id.slice(-6)}</div>
//                                     </div>
//                                 </div>
//                                 <div style={{ fontSize: 13, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                     {u.email}
//                                 </div>
//                                 <div style={{ fontSize: 12, color: "#888" }}>
//                                     <div>Joined: {fmtDate(u.createdAt)}</div>
//                                     <div style={{ marginTop: 2, color: "#bbb" }}>Last: {fmtDate(u.lastLogin || u.updatedAt)}</div>
//                                 </div>
//                                 <RoleBadge role={u.role} />
//                                 <div>
//                                     <button className="up-btn" onClick={() => deleteUser(u._id)}>Remove</button>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             {/* Mobile Cards */}
//             {!loading && (
//                 <div className="up-mobile">
//                     {filtered.length === 0 && (
//                         <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: 14 }}>No users found.</p>
//                     )}
//                     {filtered.map(u => {
//                         const ci = colorIdx(u.name);
//                         return (
//                             <div className="up-card" key={u._id}>
//                                 <div className="up-card-top">
//                                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                                         <div className="up-avatar" style={{ width: 40, height: 40, background: PALETTE[ci], color: TEXT_PAL[ci] }}>
//                                             {initials(u.name)}
//                                         </div>
//                                         <div>
//                                             <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
//                                             <div style={{ fontSize: 11, color: "#aaa" }}>#{u._id.slice(-6)}</div>
//                                         </div>
//                                     </div>
//                                     <RoleBadge role={u.role} />
//                                 </div>
//                                 <div className="up-card-grid">
//                                     <div className="up-card-field" style={{ gridColumn: "1/-1" }}>
//                                         <label>Email</label>
//                                         <span>{u.email}</span>
//                                     </div>
//                                     <div className="up-card-field">
//                                         <label>Joined</label>
//                                         <span>{fmtDate(u.createdAt)}</span>
//                                     </div>
//                                     <div className="up-card-field">
//                                         <label>Last login</label>
//                                         <span>{fmtDate(u.lastLogin || u.updatedAt)}</span>
//                                     </div>
//                                 </div>
//                                 <div className="up-card-footer">
//                                     <span style={{ fontSize: 11, color: "#bbb" }}>{u._id}</span>
//                                     <button className="up-btn" onClick={() => deleteUser(u._id)}>Remove</button>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// };

// const BlogPage = ({ token, toggleSidebar, sidebarOpen }) => {
//     const [blogs, setBlogs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [showModal, setShowModal] = useState(false);
//     const [editId, setEditId] = useState(null);
//     const [form, setForm] = useState({ title: "", img: "", date: "", excerpt: "", content: "" });

//     useEffect(() => { fetchBlogs(); }, []);

//     const fetchBlogs = async () => {
//         try {
//             const res = await api.get("http://localhost:3001/api/blogs");
//             setBlogs(res.data);
//         } catch (err) {
//             console.error("Blogs fetch error:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openAdd = () => {
//         setEditId(null);
//         setForm({ title: "", img: "", date: "", excerpt: "", content: "" });
//         setShowModal(true);
//     };

//     const openEdit = (b) => {
//         setEditId(b._id);
//         setForm({
//             title: b.title || "",
//             img: b.img || "",
//             date: b.date || "",
//             excerpt: b.excerpt || "",
//             content: b.content || "",
//         });
//         setShowModal(true);
//     };

//     const handleSave = async () => {
//         if (!form.title.trim() || !form.img.trim()) {
//             alert("Title and image are required");
//             return;
//         }
//         try {
//             if (editId) {
//                 await api.put(`http://localhost:3001/api/blogs/${editId}`, form, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//             } else {
//                 await api.post("http://localhost:3001/api/blogs", form, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//             }
//             setShowModal(false);
//             fetchBlogs();
//         } catch (err) {
//             alert(err.response?.data?.message || "Error saving blog");
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm("Delete this blog?")) return;
//         try {
//             await api.delete(`http://localhost:3001/api/blogs/${id}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setBlogs(prev => prev.filter(b => b._id !== id));
//         } catch (err) {
//             alert("Failed to delete blog");
//         }
//     };

//     const fmtDate = (d) => {
//         if (!d) return "—";
//         try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
//         catch { return d; }
//     };

//     const filtered = blogs.filter(b =>
//         !search || b.title?.toLowerCase().includes(search.toLowerCase()) ||
//         b.excerpt?.toLowerCase().includes(search.toLowerCase())
//     );

//     const stats = [
//         ["Total blogs", blogs.length],
//         ["This month", blogs.filter(b => {
//             const d = new Date(b.createdAt || b.date);
//             const n = new Date();
//             return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
//         }).length],
//     ];

//     return (
//         <div className="page">
//             <style>{`
//                 .bp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;}
//                 .bp-stat{background:#f5f5f5;border-radius:8px;padding:14px 16px;}
//                 .bp-stat-lbl{font-size:12px;color:#888;margin-bottom:4px;}
//                 .bp-stat-val{font-size:22px;font-weight:500;}
//                 .bp-toolbar{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
//                 .bp-toolbar input{flex:1;min-width:150px;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;outline:none;}
//                 .bp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
//                 .bp-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;}
//                 .bp-card-img{width:100%;height:140px;object-fit:cover;background:#f5f0f1;display:block;}
//                 .bp-card-body{padding:14px 16px;}
//                 .bp-card-title{font-size:14px;font-weight:500;margin-bottom:5px;line-height:1.4;}
//                 .bp-card-date{font-size:11px;color:#aaa;margin-bottom:6px;}
//                 .bp-card-excerpt{font-size:12px;color:#888;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
//                 .bp-card-footer{display:flex;gap:8px;padding:10px 16px;border-top:1px solid #f5f5f5;}
//                 .bp-btn{flex:1;padding:6px;border-radius:7px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer;}
//                 .bp-btn:hover{background:#f5f5f5;}
//                 .bp-btn-del{border-color:#fca5a5;color:#dc2626;}
//                 .bp-btn-del:hover{background:#fee2e2;}
//                 .bp-modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;}
//                 .bp-modal{width:100%;max-width:580px;max-height:90vh;background:#fff;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;}
//                 .bp-modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f0f0f0;flex-shrink:0;}
//                 .bp-modal-head h3{font-size:16px;font-weight:500;margin:0;}
//                 .bp-modal-close{width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:13px;}
//                 .bp-modal-body{flex:1;overflow-y:auto;padding:20px;}
//                 .bp-field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
//                 .bp-field label{font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.06em;}
//                 .bp-field input,.bp-field textarea{padding:9px 12px;border:1px solid #e8e8e8;border-radius:8px;font-size:13px;background:#fafafa;color:#111;outline:none;font-family:inherit;width:100%;box-sizing:border-box;}
//                 .bp-field textarea{resize:vertical;min-height:80px;}
//                 .bp-field input:focus,.bp-field textarea:focus{border-color:#6b2737;background:#fff;}
//                 .bp-img-preview{width:100%;height:100px;object-fit:cover;border-radius:7px;margin-top:6px;border:1px solid #eee;}
//                 .bp-modal-footer{display:flex;gap:8px;padding:14px 20px;border-top:1px solid #f0f0f0;flex-shrink:0;}
//                 .bp-save-btn{flex:1;padding:9px;border-radius:8px;border:none;background:#6b2737;color:#fff;font-size:13px;font-weight:500;cursor:pointer;}
//                 .bp-save-btn:hover{background:#7d2f42;}
//                 .bp-cancel-btn{padding:9px 16px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:13px;cursor:pointer;}
//                 .bp-empty{text-align:center;padding:48px;color:#aaa;font-size:14px;}
//                 @media(max-width:480px){.bp-grid{grid-template-columns:1fr;}}
//             `}</style>

//             {/* Modal */}
//             {showModal && (
//                 <div className="bp-modal-overlay" onClick={e => e.target.classList.contains("bp-modal-overlay") && setShowModal(false)}>
//                     <div className="bp-modal">
//                         <div className="bp-modal-head">
//                             <h3>{editId ? "Edit blog" : "Add new blog"}</h3>
//                             <button className="bp-modal-close" onClick={() => setShowModal(false)}>✕</button>
//                         </div>
//                         <div className="bp-modal-body">
//                             <div className="bp-field">
//                                 <label>Title *</label>
//                                 <input placeholder="e.g. Top 5 Summer Fashion Tips" value={form.title}
//                                     onChange={e => setForm({ ...form, title: e.target.value })} />
//                             </div>
//                             <div className="bp-field">
//                                 <label>Image URL *</label>
//                                 <input placeholder="https://..." value={form.img}
//                                     onChange={e => setForm({ ...form, img: e.target.value })} />
//                                 {form.img && (
//                                     <img className="bp-img-preview" src={form.img} alt="preview"
//                                         onError={e => e.target.style.display = "none"} />
//                                 )}
//                             </div>
//                             <div className="bp-field">
//                                 <label>Date</label>
//                                 <input type="date" value={form.date}
//                                     onChange={e => setForm({ ...form, date: e.target.value })} />
//                             </div>
//                             <div className="bp-field">
//                                 <label>Excerpt</label>
//                                 <textarea placeholder="Short summary shown in cards..."
//                                     value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
//                             </div>
//                             <div className="bp-field">
//                                 <label>Content</label>
//                                 <textarea placeholder="Full blog content..." style={{ minHeight: 120 }}
//                                     value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
//                             </div>
//                         </div>
//                         <div className="bp-modal-footer">
//                             <button className="bp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
//                             <button className="bp-save-btn" onClick={handleSave}>
//                                 {editId ? "Update blog" : "Save blog"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <PageHeader title="Blogs" subtitle="Manage your store blog posts" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
//                 <button className="add-btn" onClick={openAdd}>+ Add blog</button>
//             </PageHeader>

//             {/* Stats */}
//             <div className="bp-stats">
//                 {stats.map(([label, val]) => (
//                     <div className="bp-stat" key={label}>
//                         <div className="bp-stat-lbl">{label}</div>
//                         <div className="bp-stat-val">{val}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Search */}
//             <div className="bp-toolbar">
//                 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blogs..." />
//             </div>

//             {loading && <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading blogs...</p>}

//             {/* Blog Grid */}
//             {!loading && (
//                 <div className="bp-grid">
//                     {filtered.length === 0 && <div className="bp-empty">No blogs found.</div>}
//                     {filtered.map(b => (
//                         <div className="bp-card" key={b._id}>
//                             {b.img
//                                 ? <img className="bp-card-img" src={b.img} alt={b.title} onError={e => e.target.style.display = "none"} />
//                                 : <div style={{ width: "100%", height: 140, background: "#f5f0f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#bbb" }}>No image</div>
//                             }
//                             <div className="bp-card-body">
//                                 <div className="bp-card-title">{b.title}</div>
//                                 <div className="bp-card-date">{fmtDate(b.date || b.createdAt)}</div>
//                                 {b.excerpt && <div className="bp-card-excerpt">{b.excerpt}</div>}
//                             </div>
//                             <div className="bp-card-footer">
//                                 <button className="bp-btn" onClick={() => openEdit(b)}>Edit</button>
//                                 <button className="bp-btn bp-btn-del" onClick={() => handleDelete(b._id)}>Delete</button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };
// export default AdminDashboard;

import React, { useEffect, useState } from "react";
// import api from "api";
import api from "../api";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/admin/PageHeader";
import Sidebar from "../components/admin/Sidebar";
import DashboardPage from "../components/admin/DashboardPage";
import ProductsPage from "../components/admin/ProductsPage";
import UsersPage from "../components/admin/UsersPage";
import CollectionsPage from "../components/admin/CollectionsPage"
import OrdersPage from "../components/admin/OrdersPage";
import BlogPage from "../components/admin/BlogPage";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem("token");

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("http://localhost:3001/api/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Fetch products error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const sharedProps = {
        toggleSidebar,
        sidebarOpen,
    };

    const renderPage = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardPage {...sharedProps} />;
            case "products": return <ProductsPage products={products} fetchProducts={fetchProducts} token={token} {...sharedProps} />;
            case "collections": return <CollectionsPage products={products} {...sharedProps} />
            case "orders": return <OrdersPage token={token} {...sharedProps} />
            case "users": return <UsersPage token={token} {...sharedProps} />
            case "blogs": return <BlogPage token={token} {...sharedProps} />
            default: return <DashboardPage {...sharedProps} />;
        }
    };

    return (
        <div className={`admin ${sidebarOpen ? "sidebar-open" : ""}`}>
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />

            <div className="admin__content">{renderPage()}</div>
        </div>
    );
};

export default AdminDashboard;