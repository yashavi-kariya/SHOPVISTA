import React, { useState, useEffect } from "react";
// import api from "api";
import api from "../api";
import breadcrumbBg from "../assets/img/breadcrumb-bg.jpg";
import calendarIcon from "../assets/img/icon/calendar.png";
import { Link } from "react-router-dom";

const Blog = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        api.get("/api/blogs")
            .then(res => setBlogs(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <section className="breadcrumb-blog set-bg" style={{ backgroundImage: `url(${breadcrumbBg})` }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12"><h2>Our Blog</h2></div>
                    </div>
                </div>
            </section>

            <section className="blog spad">
                <div className="container">
                    <div className="row">
                        {blogs.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#aaa" }}>No blogs yet.</p>
                        ) : blogs.map((item) => (
                            <div className="col-lg-4 col-md-6 col-sm-6" key={item._id}>
                                <div className="blog__item">
                                    <div className="blog__item__pic set-bg"
                                        style={{ backgroundImage: `url(${item.img})` }} />
                                    <div className="blog__item__text">
                                        <span><img src={calendarIcon} alt="calendar" /> {item.date}</span>
                                        <h5>{item.title}</h5>
                                        <Link to={`/blog/${item._id}`}>Read More</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};
export default Blog;
