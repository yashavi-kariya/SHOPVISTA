import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
const BlogPage = ({ token, toggleSidebar, sidebarOpen }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ title: "", img: "", date: "", excerpt: "", content: "" });

    useEffect(() => { fetchBlogs(); }, []);

    const fetchBlogs = async () => {
        try {
            const res = await api.get("/api/blogs");
            setBlogs(res.data);
        } catch (err) {
            console.error("Blogs fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditId(null);
        setForm({ title: "", img: "", date: "", excerpt: "", content: "" });
        setShowModal(true);
    };

    const openEdit = (b) => {
        setEditId(b._id);
        setForm({
            title: b.title || "",
            img: b.img || "",
            date: b.date || "",
            excerpt: b.excerpt || "",
            content: b.content || "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.img.trim()) {
            alert("Title and image are required");
            return;
        }
        try {
            if (editId) {
                await api.put(`/api/blogs/${editId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post("/api/blogs", form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchBlogs();
        } catch (err) {
            alert(err.response?.data?.message || "Error saving blog");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this blog?")) return;
        try {
            await api.delete(`/api/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(prev => prev.filter(b => b._id !== id));
        } catch (err) {
            alert("Failed to delete blog");
        }
    };

    const fmtDate = (d) => {
        if (!d) return "—";
        try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
        catch { return d; }
    };

    const filtered = blogs.filter(b =>
        !search || b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = [
        ["Total blogs", blogs.length],
        ["This month", blogs.filter(b => {
            const d = new Date(b.createdAt || b.date);
            const n = new Date();
            return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
        }).length],
    ];

    return (
        <div className="page">
            <style>{`
                .bp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;}
                .bp-stat{background:#f5f5f5;border-radius:8px;padding:14px 16px;}
                .bp-stat-lbl{font-size:12px;color:#888;margin-bottom:4px;}
                .bp-stat-val{font-size:22px;font-weight:500;}
                .bp-toolbar{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
                .bp-toolbar input{flex:1;min-width:150px;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;outline:none;}
                .bp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
                .bp-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;}
                .bp-card-img{width:100%;height:140px;object-fit:cover;background:#f5f0f1;display:block;}
                .bp-card-body{padding:14px 16px;}
                .bp-card-title{font-size:14px;font-weight:500;margin-bottom:5px;line-height:1.4;}
                .bp-card-date{font-size:11px;color:#aaa;margin-bottom:6px;}
                .bp-card-excerpt{font-size:12px;color:#888;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
                .bp-card-footer{display:flex;gap:8px;padding:10px 16px;border-top:1px solid #f5f5f5;}
                .bp-btn{flex:1;padding:6px;border-radius:7px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer;}
                .bp-btn:hover{background:#f5f5f5;}
                .bp-btn-del{border-color:#fca5a5;color:#dc2626;}
                .bp-btn-del:hover{background:#fee2e2;}
                .bp-modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;}
                .bp-modal{width:100%;max-width:580px;max-height:90vh;background:#fff;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;}
                .bp-modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f0f0f0;flex-shrink:0;}
                .bp-modal-head h3{font-size:16px;font-weight:500;margin:0;}
                .bp-modal-close{width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:13px;}
                .bp-modal-body{flex:1;overflow-y:auto;padding:20px;}
                .bp-field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
                .bp-field label{font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:.06em;}
                .bp-field input,.bp-field textarea{padding:9px 12px;border:1px solid #e8e8e8;border-radius:8px;font-size:13px;background:#fafafa;color:#111;outline:none;font-family:inherit;width:100%;box-sizing:border-box;}
                .bp-field textarea{resize:vertical;min-height:80px;}
                .bp-field input:focus,.bp-field textarea:focus{border-color:#6b2737;background:#fff;}
                .bp-img-preview{width:100%;height:100px;object-fit:cover;border-radius:7px;margin-top:6px;border:1px solid #eee;}
                .bp-modal-footer{display:flex;gap:8px;padding:14px 20px;border-top:1px solid #f0f0f0;flex-shrink:0;}
                .bp-save-btn{flex:1;padding:9px;border-radius:8px;border:none;background:#6b2737;color:#fff;font-size:13px;font-weight:500;cursor:pointer;}
                .bp-save-btn:hover{background:#7d2f42;}
                .bp-cancel-btn{padding:9px 16px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:13px;cursor:pointer;}
                .bp-empty{text-align:center;padding:48px;color:#aaa;font-size:14px;}
                @media(max-width:480px){.bp-grid{grid-template-columns:1fr;}}
            `}</style>

            {/* Modal */}
            {showModal && (
                <div className="bp-modal-overlay" onClick={e => e.target.classList.contains("bp-modal-overlay") && setShowModal(false)}>
                    <div className="bp-modal">
                        <div className="bp-modal-head">
                            <h3>{editId ? "Edit blog" : "Add new blog"}</h3>
                            <button className="bp-modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="bp-modal-body">
                            <div className="bp-field">
                                <label>Title *</label>
                                <input placeholder="e.g. Top 5 Summer Fashion Tips" value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="bp-field">
                                <label>Image URL *</label>
                                <input placeholder="https://..." value={form.img}
                                    onChange={e => setForm({ ...form, img: e.target.value })} />
                                {form.img && (
                                    <img className="bp-img-preview" src={form.img} alt="preview"
                                        onError={e => e.target.style.display = "none"} />
                                )}
                            </div>
                            <div className="bp-field">
                                <label>Date</label>
                                <input type="date" value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="bp-field">
                                <label>Excerpt</label>
                                <textarea placeholder="Short summary shown in cards..."
                                    value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
                            </div>
                            <div className="bp-field">
                                <label>Content</label>
                                <textarea placeholder="Full blog content..." style={{ minHeight: 120 }}
                                    value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                            </div>
                        </div>
                        <div className="bp-modal-footer">
                            <button className="bp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="bp-save-btn" onClick={handleSave}>
                                {editId ? "Update blog" : "Save blog"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PageHeader title="Blogs" subtitle="Manage your store blog posts" toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
                <button className="add-btn" onClick={openAdd}>+ Add blog</button>
            </PageHeader>

            {/* Stats */}
            <div className="bp-stats">
                {stats.map(([label, val]) => (
                    <div className="bp-stat" key={label}>
                        <div className="bp-stat-lbl">{label}</div>
                        <div className="bp-stat-val">{val}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bp-toolbar">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blogs..." />
            </div>

            {loading && <p style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>Loading blogs...</p>}

            {/* Blog Grid */}
            {!loading && (
                <div className="bp-grid">
                    {filtered.length === 0 && <div className="bp-empty">No blogs found.</div>}
                    {filtered.map(b => (
                        <div className="bp-card" key={b._id}>
                            {b.img
                                ? <img className="bp-card-img" src={b.img} alt={b.title} onError={e => e.target.style.display = "none"} />
                                : <div style={{ width: "100%", height: 140, background: "#f5f0f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#bbb" }}>No image</div>
                            }
                            <div className="bp-card-body">
                                <div className="bp-card-title">{b.title}</div>
                                <div className="bp-card-date">{fmtDate(b.date || b.createdAt)}</div>
                                {b.excerpt && <div className="bp-card-excerpt">{b.excerpt}</div>}
                            </div>
                            <div className="bp-card-footer">
                                <button className="bp-btn" onClick={() => openEdit(b)}>Edit</button>
                                <button className="bp-btn bp-btn-del" onClick={() => handleDelete(b._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default BlogPage;