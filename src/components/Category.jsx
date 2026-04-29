import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import saleImg from "../assets/img/shop-details/thumb-1.png";
import insta1 from "../assets/img/instagram/instagram-1.jpg";
import insta2 from "../assets/img/instagram/instagram-2.jpg";
import insta3 from "../assets/img/instagram/instagram-3.jpg";
import insta4 from "../assets/img/instagram/instagram-4.jpg";
import insta5 from "../assets/img/instagram/instagram-5.jpg";
import insta6 from "../assets/img/instagram/instagram-6.jpg";

const instaPics = [insta1, insta2, insta3, insta4, insta5, insta6];

function useInView(threshold = 0.1) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

const Category = () => {
    const targetDate = new Date("2026-12-31T23:59:59").getTime();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [blogs, setBlogs] = useState([]);
    const [dealRef, dealVisible] = useInView();
    const [instaRef, instaVisible] = useInView();

    useEffect(() => {
        api.get("/api/blogs")
            .then(res => setBlogs(res.data.slice(0, 3)))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const diff = targetDate - Date.now();
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff / 3600000) % 24),
                    minutes: Math.floor((diff / 60000) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            } else clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

                /* ── Reset any theme spad overrides ── */
                .deal-section,
                .insta-section,
                .blog-section {
                    box-sizing: border-box;
                }

                /* ════════════════════════════════
                   DEAL OF THE WEEK
                ════════════════════════════════ */
                .deal-section {
                    background: #f7f4f0;
                    padding: 60px 0;
                    overflow: hidden;
                    width: 100%;
                }

                .deal-container {
                    width: 100%;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 40px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    gap: 60px;
                    justify-content: center
                }

                /* Image side */
                .deal-img-side {
                    flex: 0 0 320px;
                    width: 320px;
                    position: relative;
                    opacity: 0;
                    transform: translateX(-40px);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                }
                .deal-img-side.visible {
                    opacity: 1;
                    transform: translateX(0);
                }
                .deal-img-side img {
                    width: 100%;
                    height: 420px;
                    object-fit: cover;
                    border-radius: 6px;
                    display: block;
                }
                .deal-sticker {
                    position: absolute;
                    top: 16px;
                    right: -16px;
                    width: 90px;
                    height: 90px;
                    background: #111;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    text-align: center;
                    opacity: 0;
                    transform: scale(0.4) rotate(-20deg);
                    transition: opacity 0.5s 0.5s ease, transform 0.5s 0.5s cubic-bezier(0.34,1.56,0.64,1);
                    z-index: 2;
                }
                .deal-img-side.visible .deal-sticker {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
                .deal-sticker span { font-size: 9px; letter-spacing: 1px; opacity: 0.65; line-height: 1.4; }
                .deal-sticker strong { font-family: 'Bebas Neue', sans-serif; font-size: 18px; line-height: 1; display: block; }

                /* Text side */
                .deal-text-side {
                    flex: 1;
                    opacity: 0;
                    max-width: 500px;
                    transform: translateX(40px);
                    transition: opacity 0.8s 0.15s ease, transform 0.8s 0.15s ease;
                }
                .deal-text-side.visible {
                    opacity: 1;
                    transform: translateX(0);
                }
                .deal-eyebrow {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    color: #c0392b;
                    font-weight: 600;
                    margin: 0 0 14px;
                }
                .deal-title {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(40px, 5vw, 64px);
                    color: #111;
                    line-height: 1;
                    letter-spacing: 1px;
                    margin: 0 0 32px;
                }
                .countdown {
                    display: flex;
                    align-items: flex-start;
                    gap: 0;
                    margin-bottom: 40px;
                }
                .cd-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 72px;
                }
                .cd-num {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(44px, 5.5vw, 64px);
                    line-height: 1;
                    color: #111;
                    letter-spacing: -1px;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
                    display: block;
                }
                .cd-num.tick { transform: scale(1.18); }
                .cd-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 9px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #bbb;
                    margin-top: 6px;
                }
                .cd-sep {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(40px, 5vw, 58px);
                    color: #ddd;
                    line-height: 1;
                    padding: 0 2px;
                    margin-top: 0;
                    align-self: flex-start;
                }
                .deal-btn {
                    display: inline-block;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #fff;
                    background: #111;
                    padding: 16px 40px;
                    text-decoration: none;
                    border-radius: 2px;
                    transition: background 0.3s, transform 0.2s;
                    border: none;
                    cursor: pointer;
                }
                .deal-btn:hover { background: #333; transform: translateY(-2px); color: #fff; }

                /* ════════════════════════════════
                   INSTAGRAM
                ════════════════════════════════ */
                .insta-section {
                    background: #fff;
                    padding: 60px 0;
                    overflow: hidden;
                    width: 100%;
                }
                .insta-container {
                    width: 100%;
                    // max-width: 1280px;
                    // margin: 0 auto;
                    padding: 0 24px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    gap: 56px;
                }
                .insta-grid-wrap {
                    flex: 1;
                    min-width: 0;
                }
                .insta-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: repeat(2, 200px);
                    gap: 6px;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .insta-tile {
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0;
                    transform: scale(0.9);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .insta-tile.visible { opacity: 1; transform: scale(1); }
                .insta-tile img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
                }
                .insta-tile:hover img { transform: scale(1.1); }
                .insta-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.36);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .insta-tile:hover .insta-overlay { opacity: 1; }
                .insta-overlay svg {
                    width: 28px; height: 28px;
                    fill: none; stroke: #fff; stroke-width: 1.5;
                }
                .insta-text-wrap {
                    flex: 0 0 300px;
                    opacity: 0;
                    transform: translateX(30px);
                    transition: opacity 0.8s 0.25s ease, transform 0.8s 0.25s ease;
                }
                .insta-text-wrap.visible { opacity: 1; transform: translateX(0); }
                .insta-hashtag {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(30px, 3.5vw, 46px);
                    color: #111;
                    letter-spacing: 1px;
                    line-height: 1;
                    margin: 0 0 16px;
                }
                .insta-desc {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    line-height: 1.75;
                    color: #666;
                    margin: 0 0 20px;
                }
                .insta-handle {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 20px;
                    font-weight: 500;
                    color: #a75f32;
                    display: block;
                    margin-bottom: 28px;
                }
                .insta-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #fff;
                    background: #111;
                    padding: 14px 24px;
                    text-decoration: none;
                    border-radius: 2px;
                    transition: background 0.3s, transform 0.2s;
                }
                .insta-btn:hover { background: #333; transform: translateY(-2px); color: #fff; }
                .insta-btn svg { width: 16px; height: 16px; fill: none; stroke: #fff; stroke-width: 1.5; }

                /* ════════════════════════════════
                   BLOG
                ════════════════════════════════ */
                .blog-section {
                    background: #f7f4f0;
                    padding: 60px 0 72px;
                    width: 100%;
                }
                .blog-container {
                    width: 100%;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 40px;
                    box-sizing: border-box;
                }
                .section-head { margin-bottom: 36px; }
                .section-head span {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    color: #aaa;
                    display: block;
                    margin-bottom: 8px;
                }
                .section-head h2 {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(30px, 4vw, 46px);
                    color: #111;
                    margin: 0;
                    letter-spacing: 1px;
                }
                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }
                .blog-card {
                    background: #fff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .blog-card:hover { transform: translateY(-6px); box-shadow: 0 10px 32px rgba(0,0,0,0.12); }
                .blog-card__pic {
                    width: 100%; height: 210px;
                    object-fit: cover; display: block;
                    transition: transform 0.5s ease;
                }
                .blog-card:hover .blog-card__pic { transform: scale(1.04); }
                .blog-card__body { padding: 20px 22px 24px; }
                .blog-card__date {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 12px; color: #999; margin-bottom: 10px;
                }
                .blog-card__title {
                    font-size: 16px; font-weight: 600; color: #1a1a1a;
                    line-height: 1.45; margin: 0 0 14px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                }
                .blog-card__link {
                    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
                    font-weight: 600; color: #6b2737; text-decoration: none;
                    display: inline-flex; align-items: center; gap: 6px;
                    border-bottom: 1px solid transparent; padding-bottom: 2px;
                    transition: gap 0.3s, border-color 0.3s;
                }
                .blog-card__link:hover { border-color: #6b2737; gap: 10px; }
                .blog-cta-wrap { text-align: center; margin-top: 40px; }

                /* Skeletons */
                .skeleton-pic { height: 210px; background: #ececec; animation: shimmer 1.4s infinite; }
                .skeleton-line { height: 13px; background: #ececec; border-radius: 4px; margin-bottom: 8px; animation: shimmer 1.4s infinite; }
                .skeleton-line--short { width: 40%; }
                .skeleton-line--medium { width: 65%; }
                .skeleton-line--xs { width: 28%; height: 11px; }
                @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }

                /* ════════════════════════════════
                   RESPONSIVE
                ════════════════════════════════ */

                /* 1100px */
                @media (max-width: 1100px) {
                    .deal-container,
                    .insta-container,
                    .blog-container { padding: 0 28px; }
                    .deal-img-side { width: 280px; }
                    .deal-img-side img { height: 360px; }
                    .insta-text-wrap { flex: 0 0 260px; }
                    .insta-grid { grid-template-rows: repeat(2, 175px); }
                }

                /* 900px — tablet */
                @media (max-width: 900px) {
                    // .deal-container {
                    //     flex-direction: column;
                    //     align-items: flex-start;
                    //     gap: 32px;
                    //     padding: 0 24px;
                    // }
                    // .deal-img-side {
                    //     width: 100%;
                    //     max-width: 400px;
                    //     align-self: center;
                    //     transform: translateY(40px) !important;
                    // }
                    // .deal-img-side.visible { transform: translateY(0) !important; }
                    // .deal-img-side img { height: 320px; }
                    // .deal-sticker { right: 0; }
                    // .deal-text-side {
                    //     width: 100%;
                    //     transform: translateX(0) !important;
                    //     opacity: 0;
                    //     transition: opacity 0.8s 0.15s ease;
                    // }
                    // .deal-text-side.visible { opacity: 1; }

                    .insta-container {
                        flex-direction: column;
                        gap: 32px;
                        padding: 0 24px;
                    }
                    .insta-grid-wrap { width: 100%; }
                    .insta-grid { grid-template-rows: repeat(2, 170px); }
                    .insta-text-wrap {
                        flex: none;
                        width: 100%;
                        transform: translateX(0) !important;
                        opacity: 0;
                        transition: opacity 0.8s 0.25s ease;
                    }
                    .insta-text-wrap.visible { opacity: 1; }

                    .blog-container { padding: 0 24px; }
                    .blog-grid { grid-template-columns: repeat(2, 1fr); }
                }

              /* Mobile — full bleed hero card */
@media (max-width: 640px) {
    .deal-section {
        padding: 24px 16px;
        background: #f7f4f0;
    }
    .deal-container {
        display: block;
        padding: 0;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        min-height: 420px;
    }

    /* Image becomes the full background */
    .deal-img-side {
        position: absolute !important;
        inset: 0;
        width: 100% !important;
        transform: none !important;
        opacity: 1 !important;
        transition: none !important;
    }
    .deal-img-side img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 0;
    }

    /* Dark gradient overlay */
    .deal-img-side::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%);
    }

    /* Sticker stays top-right */
    .deal-sticker {
        right: 12px !important;
        top: 12px !important;
        z-index: 3;
    }

    /* Text floats over the gradient at the bottom */
    .deal-text-side {
        position: relative;
        z-index: 2;
        padding: 300px 20px 24px;
        transform: none !important;
        opacity: 1 !important;
        transition: none !important;
        max-width: 100%;
    }
    .deal-eyebrow { color: #e07070; }
    .deal-title { color: #fff; font-size: 28px; margin-bottom: 16px; }

    .cd-num  { font-size: 34px; color: #fff; }
    .cd-label { color: rgba(255,255,255,0.5); }
    .cd-sep  { font-size: 28px; color: rgba(255,255,255,0.3); }
    .cd-unit { min-width: 50px; }

    .deal-btn {
        display: block;
        text-align: center;
        background: #fff;
        color: #111;
        margin-top: 4px;
    }
    .deal-btn:hover { background: #eee; color: #111; }
}

                /* 400px — very small */
                @media (max-width: 400px) {
                    .deal-container,
                    .insta-container,
                    .blog-container { padding: 0 12px; }
                    .insta-grid { grid-template-rows: repeat(2, 100px); }
                    .cd-unit { min-width: 46px; }
                    .cd-num  { font-size: 34px; }
                    .cd-sep  { font-size: 30px; }
                }
            `}</style>

            {/* ══════════ DEAL OF THE WEEK ══════════ */}
            <section className="deal-section">
                <div className="deal-container" ref={dealRef}>
                    <div className={`deal-img-side ${dealVisible ? "visible" : ""}`}>
                        <img src={saleImg} alt="Deal of the week" />
                        <div className="deal-sticker">
                            <span>Sale Of</span>
                            <strong>Rs.2900/-</strong>
                        </div>
                    </div>

                    <div className={`deal-text-side ${dealVisible ? "visible" : ""}`}>
                        <p className="deal-eyebrow">Deal Of The Week</p>
                        <h2 className="deal-title">Multi-pocket<br />Chest Bag Black</h2>

                        <div className="countdown">
                            <CountUnit num={timeLeft.days} label="Days" />
                            <span className="cd-sep">:</span>
                            <CountUnit num={timeLeft.hours} label="Hours" />
                            <span className="cd-sep">:</span>
                            <CountUnit num={timeLeft.minutes} label="Minutes" />
                            <span className="cd-sep">:</span>
                            <CountUnit num={timeLeft.seconds} label="Seconds" />
                        </div>

                        <a href="/shop" className="deal-btn">Shop Now</a>
                    </div>
                </div>
            </section>

            {/* ══════════ INSTAGRAM ══════════ */}
            <section className="insta-section">
                <div className="insta-container" ref={instaRef}>
                    <div className="insta-grid-wrap">
                        <div className="insta-grid">
                            {instaPics.map((img, i) => (
                                <div
                                    key={i}
                                    className={`insta-tile ${instaVisible ? "visible" : ""}`}
                                    style={{ transitionDelay: instaVisible ? `${i * 0.07}s` : "0s" }}
                                >
                                    <img src={img} alt={`Instagram ${i + 1}`} />
                                    <div className="insta-overlay">
                                        <svg viewBox="0 0 24 24">
                                            <rect x="2" y="2" width="20" height="20" rx="5" />
                                            <circle cx="12" cy="12" r="4" />
                                            <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`insta-text-wrap ${instaVisible ? "visible" : ""}`}>
                        <h2 className="insta-hashtag">#ShopOurStyle</h2>
                        <p className="insta-desc">
                            Tag us in your photos for a chance to be featured!
                            Join our community of over 50k fashion enthusiasts
                            sharing their daily outfits and seasonal inspirations.
                        </p>
                        <span className="insta-handle">@shopvista</span>
                        <a href="https://instagram.com" className="insta-btn" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <circle cx="12" cy="12" r="4" />
                                <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
                            </svg>
                            Follow Us
                        </a>
                    </div>
                </div>
            </section>

            {/* ══════════ BLOG ══════════ */}
            <section className="blog-section">
                <div className="blog-container">
                    <div className="section-head">
                        <span>Latest News</span>
                        <h2>Fashion New Trends</h2>
                    </div>

                    <div className="blog-grid">
                        {blogs.length === 0
                            ? [1, 2, 3].map(i => (
                                <div key={i} className="blog-card">
                                    <div className="skeleton-pic" />
                                    <div style={{ padding: "20px 22px 24px" }}>
                                        <div className="skeleton-line skeleton-line--short" />
                                        <div className="skeleton-line" />
                                        <div className="skeleton-line skeleton-line--medium" />
                                        <div className="skeleton-line skeleton-line--xs" />
                                    </div>
                                </div>
                            ))
                            : blogs.map(blog => (
                                <div key={blog._id} className="blog-card">
                                    <img className="blog-card__pic" src={blog.img} alt={blog.title} />
                                    <div className="blog-card__body">
                                        <div className="blog-card__date">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            {blog.date}
                                        </div>
                                        <h5 className="blog-card__title">{blog.title}</h5>
                                        <Link to={`/blog/${blog._id}`} className="blog-card__link">
                                            Read More <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {blogs.length > 0 && (
                        <div className="blog-cta-wrap">
                            <Link to="/blog" className="deal-btn">View All Posts</Link>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

/* Animated countdown digit */
const CountUnit = ({ num, label }) => {
    const [tick, setTick] = useState(false);
    const prev = useRef(num);
    useEffect(() => {
        if (prev.current !== num) {
            setTick(true);
            const t = setTimeout(() => setTick(false), 180);
            prev.current = num;
            return () => clearTimeout(t);
        }
    }, [num]);

    return (
        <div className="cd-unit">
            <span className={`cd-num${tick ? " tick" : ""}`}>
                {String(num).padStart(2, "0")}
            </span>
            <span className="cd-label">{label}</span>
        </div>
    );
};

export default Category;
// import React, { useState, useEffect } from "react";
// import api from "../api";
// import { Link } from "react-router-dom";
// import saleImg from "../assets/img/shop-details/thumb-1.png";
// import insta1 from "../assets/img/instagram/instagram-1.jpg";
// import insta2 from "../assets/img/instagram/instagram-2.jpg";
// import insta3 from "../assets/img/instagram/instagram-3.jpg";
// import insta4 from "../assets/img/instagram/instagram-4.jpg";
// import insta5 from "../assets/img/instagram/instagram-5.jpg";
// import insta6 from "../assets/img/instagram/instagram-6.jpg";
// import blog1 from "../assets/img/blog/blog-1.jpg";
// import blog2 from "../assets/img/blog/blog-2.jpg";
// import blog3 from "../assets/img/blog/blog-3.jpg";
// import calendar from "../assets/img/icon/calendar.png";

// const Category = () => {
//     const instaPics = [insta1, insta2, insta3, insta4, insta5, insta6];
//     const targetDate = new Date("2026-12-31T23:59:59").getTime();
//     const [timeLeft, setTimeLeft] = useState({
//         days: 0, hours: 0, minutes: 0, seconds: 0
//     });
//     const [blogs, setBlogs] = useState([]);

//     useEffect(() => {
//         api.get("/api/blogs")
//             .then(res => setBlogs(res.data.slice(0, 3)))
//             .catch(err => console.error(err));
//     }, []);

//     useEffect(() => {
//         const timer = setInterval(() => {
//             const now = new Date().getTime();
//             const difference = targetDate - now;

//             if (difference > 0) {
//                 setTimeLeft({
//                     days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//                     hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
//                     minutes: Math.floor((difference / 1000 / 60) % 60),
//                     seconds: Math.floor((difference / 1000) % 60),
//                 });
//             } else {
//                 clearInterval(timer);
//             }
//         }, 1000);

//         return () => clearInterval(timer);
//     }, [targetDate]);
//     return (
//         <>
//             {/* ================== CATEGORIES SECTION ================== */}
//             <section className="categories spad">
//                 <div className="container">
//                     <div className="row">
//                         {/* Left Content */}
//                         <div className="col-lg-3">
//                             <div className="categories__text">
//                             </div>
//                         </div>

//                         {/* Sale Image */}
//                         <div className="col-lg-4">
//                             <div className="categories__hot__deal">
//                                 <img src={saleImg} alt="Sale" />
//                                 <div className="hot__deal__sticker">
//                                     <span>Sale Of</span>
//                                     <h5>Rs.2900/-</h5>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Countdown */}
//                         <div className="col-lg-4 offset-lg-1">
//                             <div className="categories__deal__countdown">
//                                 <span>Deal Of The Week</span>
//                                 <h2>Multi-pocket Chest Bag Black</h2>

//                                 <div className="categories__deal__countdown__timer">
//                                     <div className="cd-item">
//                                         <span>{timeLeft.days}</span>
//                                         <p>Days</p>
//                                     </div>
//                                     <div className="cd-item">
//                                         <span>{timeLeft.hours}</span>
//                                         <p>Hours</p>
//                                     </div>
//                                     <div className="cd-item">
//                                         <span>{timeLeft.minutes}</span>
//                                         <p>Minutes</p>
//                                     </div>
//                                     <div className="cd-item">
//                                         <span>{timeLeft.seconds}</span>
//                                         <p>Seconds</p>
//                                     </div>
//                                 </div>

//                                 <a href="/shop" className="primary-btn">Shop now</a>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ================== INSTAGRAM SECTION ================== */}
//             <section className="instagram spad" style={{ paddingBottom: "0" }}>
//                 <div className="container">
//                     <div className="row">
//                         {/* Instagram Images */}
//                         <div className="col-lg-8">
//                             <div className="instagram__pic">
//                                 {instaPics.map((img, index) => (
//                                     <div
//                                         key={index}
//                                         className="instagram__pic__item"
//                                         style={{
//                                             backgroundImage: `url(${img})`,
//                                             cursor: 'pointer'
//                                         }}
//                                     >
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Updated Instagram Text */}
//                         <div className="col-lg-4">
//                             <div className="instagram__text">
//                                 <h2>#ShopOurStyle</h2>
//                                 <p>
//                                     Tag us in your photos for a chance to be featured!
//                                     Join our community of over 50k fashion enthusiasts
//                                     sharing their daily outfits and seasonal inspirations.
//                                 </p>
//                                 <h3 style={{
//                                     color: "#a75f32",
//                                     fontWeight: "600",
//                                     fontSize: "30px",
//                                     marginTop: "10px"
//                                 }}>
//                                     @shopvista
//                                 </h3>
//                                 <a
//                                     href="https://instagram.com"
//                                     className="primary-btn"
//                                     style={{ marginTop: "30px" }}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                 >
//                                     Follow Us on Instagram
//                                 </a>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>



//             {/* ================== LATEST BLOG SECTION ================== */}
//             <section className="latest spad">
//                 <div className="container">
//                     <div className="row">
//                         <div className="col-lg-12">
//                             <div className="section-title">
//                                 <span>Latest News</span>
//                                 <h2>Fashion New Trends</h2>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="row">
//                         {blogs.length === 0
//                             ? [1, 2, 3].map(i => (
//                                 <div key={i} className="col-lg-4 col-md-6 col-sm-6">
//                                     <div className="blog__item blog__item--skeleton">
//                                         <div className="blog__item__pic blog__item__pic--skeleton" />
//                                         <div className="blog__item__text">
//                                             <div className="skeleton-line skeleton-line--short" />
//                                             <div className="skeleton-line" />
//                                             <div className="skeleton-line skeleton-line--medium" />
//                                             <div className="skeleton-line skeleton-line--xs" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                             : blogs.map((blog) => (
//                                 <div key={blog._id} className="col-lg-4 col-md-6 col-sm-6">
//                                     <div className="blog__item">
//                                         <div
//                                             className="blog__item__pic"
//                                             style={{ backgroundImage: `url(${blog.img})` }}
//                                         />
//                                         <div className="blog__item__text">
//                                             <span>
//                                                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "5px", opacity: 0.5 }}>
//                                                     <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
//                                                 </svg>
//                                                 {blog.date}
//                                             </span>
//                                             <h5>{blog.title}</h5>
//                                             <Link to={`/blog/${blog._id}`} className="blog__read-more">
//                                                 Read More <span>→</span>
//                                             </Link>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         }
//                     </div>

//                     {blogs.length > 0 && (
//                         <div className="row">
//                             <div className="col-lg-12 text-center" style={{ marginTop: "30px" }}>
//                                 <Link to="/blog" className="primary-btn">View All Posts</Link>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </section>        </>
//     );
// };

// export default Category;

