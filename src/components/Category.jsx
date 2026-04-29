import React, { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import saleImg from "../assets/img/shop-details/thumb-1.png";
import insta1 from "../assets/img/instagram/instagram-1.jpg";
import insta2 from "../assets/img/instagram/instagram-2.jpg";
import insta3 from "../assets/img/instagram/instagram-3.jpg";
import insta4 from "../assets/img/instagram/instagram-4.jpg";
import insta5 from "../assets/img/instagram/instagram-5.jpg";
import insta6 from "../assets/img/instagram/instagram-6.jpg";
import blog1 from "../assets/img/blog/blog-1.jpg";
import blog2 from "../assets/img/blog/blog-2.jpg";
import blog3 from "../assets/img/blog/blog-3.jpg";
import calendar from "../assets/img/icon/calendar.png";

const Category = () => {
    const instaPics = [insta1, insta2, insta3, insta4, insta5, insta6];
    const targetDate = new Date("2026-12-31T23:59:59").getTime();
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0
    });
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        api.get("/api/blogs")
            .then(res => setBlogs(res.data.slice(0, 3)))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);
    // const blogs = [
    //     {
    //         img: blog1,
    //         date: "16 February 2026",
    //         title: "What Curling Irons Are The Best Ones",
    //     },
    //     {
    //         img: blog2,
    //         date: "21 February 2026",
    //         title: "Eternity Bands Do Last Forever",
    //     },
    //     {
    //         img: blog3,
    //         date: "28 February 2026",
    //         title: "The Health Benefits Of Sunglasses",
    //     },
    // ];

    return (
        <>
            {/* ================== CATEGORIES SECTION ================== */}
            <section className="categories spad">
                <div className="container">
                    <div className="row">
                        {/* Left Content */}
                        <div className="col-lg-3">
                            <div className="categories__text">
                            </div>
                        </div>

                        {/* Sale Image */}
                        <div className="col-lg-4">
                            <div className="categories__hot__deal">
                                <img src={saleImg} alt="Sale" />
                                <div className="hot__deal__sticker">
                                    <span>Sale Of</span>
                                    <h5>Rs.2900/-</h5>
                                </div>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="col-lg-4 offset-lg-1">
                            <div className="categories__deal__countdown">
                                <span>Deal Of The Week</span>
                                <h2>Multi-pocket Chest Bag Black</h2>

                                <div className="categories__deal__countdown__timer">
                                    <div className="cd-item">
                                        <span>{timeLeft.days}</span>
                                        <p>Days</p>
                                    </div>
                                    <div className="cd-item">
                                        <span>{timeLeft.hours}</span>
                                        <p>Hours</p>
                                    </div>
                                    <div className="cd-item">
                                        <span>{timeLeft.minutes}</span>
                                        <p>Minutes</p>
                                    </div>
                                    <div className="cd-item">
                                        <span>{timeLeft.seconds}</span>
                                        <p>Seconds</p>
                                    </div>
                                </div>

                                <a href="/shop" className="primary-btn">Shop now</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================== INSTAGRAM SECTION ================== */}
            <section className="instagram spad">
                <div className="container">
                    <div className="row">
                        {/* Instagram Images */}
                        <div className="col-lg-8">
                            <div className="instagram__pic">
                                {instaPics.map((img, index) => (
                                    <div
                                        key={index}
                                        className="instagram__pic__item"
                                        style={{
                                            backgroundImage: `url(${img})`,
                                            cursor: 'pointer'
                                        }}
                                    >
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Updated Instagram Text */}
                        <div className="col-lg-4">
                            <div className="instagram__text">
                                <h2>#ShopOurStyle</h2>
                                <p>
                                    Tag us in your photos for a chance to be featured!
                                    Join our community of over 50k fashion enthusiasts
                                    sharing their daily outfits and seasonal inspirations.
                                </p>
                                <h3 style={{
                                    color: "#a75f32",
                                    fontWeight: "600",
                                    fontSize: "30px",
                                    marginTop: "10px"
                                }}>
                                    @shopvista
                                </h3>
                                <a
                                    href="https://instagram.com"
                                    className="primary-btn"
                                    style={{ marginTop: "30px" }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Follow Us on Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ================== LATEST BLOG SECTION ================== */}
            {/* ================== LATEST BLOG SECTION ================== */}
            <section className="latest spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>Latest News</span>
                                <h2>Fashion New Trends</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {blogs.length === 0
                            ? [1, 2, 3].map(i => (
                                <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="blog__item blog__item--skeleton">
                                        <div className="blog__item__pic blog__item__pic--skeleton" />
                                        <div className="blog__item__text">
                                            <div className="skeleton-line skeleton-line--short" />
                                            <div className="skeleton-line" />
                                            <div className="skeleton-line skeleton-line--medium" />
                                            <div className="skeleton-line skeleton-line--xs" />
                                        </div>
                                    </div>
                                </div>
                            ))
                            : blogs.map((blog) => (
                                <div key={blog._id} className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="blog__item">
                                        <div
                                            className="blog__item__pic"
                                            style={{ backgroundImage: `url(${blog.img})` }}
                                        />
                                        <div className="blog__item__text">
                                            <span>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "5px", opacity: 0.5 }}>
                                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                {blog.date}
                                            </span>
                                            <h5>{blog.title}</h5>
                                            <Link to={`/blog/${blog._id}`} className="blog__read-more">
                                                Read More <span>→</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {blogs.length > 0 && (
                        <div className="row">
                            <div className="col-lg-12 text-center" style={{ marginTop: "30px" }}>
                                <Link to="/blog" className="primary-btn">View All Posts</Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>        </>
    );
};

export default Category;

