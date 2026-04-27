import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import api from "api";
import api from "../api";
import breadcrumbBg from "../assets/img/breadcrumb-bg.jpg";
import calendarIcon from "../assets/img/icon/calendar.png";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        api.get(`/api/blogs/${id}`)
            .then(res => setBlog(res.data))
            .catch(() => navigate("/blog"));
    }, [id]);
    if (!blog) return <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Loading...</div>;
    return (
        <>
            <section className="breadcrumb-blog set-bg"
                style={{ backgroundImage: `url(${breadcrumbBg})` }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12"><h2>{blog.title}</h2></div>
                    </div>
                </div>
            </section>

            <section className="blog spad">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">

                            {/* Back button */}
                            <button onClick={() => navigate("/blog")}
                                style={{ marginBottom: "24px", background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontSize: "13px" }}>
                                ← Back to Blogs
                            </button>

                            {/* Hero Image */}
                            <img src={blog.img} alt={blog.title}
                                style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "420px", marginBottom: "24px" }}
                                onError={e => e.target.src = "/placeholder.png"} />

                            {/* Date */}
                            <p style={{ color: "#888", fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <img src={calendarIcon} alt="" style={{ width: "14px" }} /> {blog.date}
                            </p>

                            {/* Title */}
                            <h2 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "16px", color: "#111" }}>
                                {blog.title}
                            </h2>

                            {/* Excerpt */}
                            {blog.excerpt && (
                                <p style={{ fontSize: "16px", color: "#555", fontStyle: "italic", borderLeft: "3px solid #6b2737", paddingLeft: "14px", marginBottom: "20px" }}>
                                    {blog.excerpt}
                                </p>
                            )}

                            {/* Full Content */}
                            <div style={{ fontSize: "15px", color: "#444", lineHeight: "1.9", whiteSpace: "pre-line" }}>
                                {blog.content || "No content available."}
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogDetail;