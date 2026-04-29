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

/* ── tiny hook: fires callback once when element enters viewport ── */
function useInView(threshold = 0.15) {
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

                /* ═══════════════════════════════════════
                   DEAL OF THE WEEK
                ═══════════════════════════════════════ */
                .deal-section {
                    background: #f7f4f0;
                    padding: 72px 0 64px;
                    overflow: hidden;
                }

                .deal-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: grid;
                    grid-template-columns: 1fr 420px 1fr;
                    align-items: center;
                    gap: 40px;
                }

                /* ── image column ── */
                .deal-img-wrap {
                    position: relative;
                    display: flex;
                    justify-content: center;
                }

                .deal-img-wrap img {
                    width: 100%;
                    max-width: 340px;
                    height: auto;
                    object-fit: cover;
                    border-radius: 4px;
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                }
                .deal-img-wrap.visible img {
                    opacity: 1;
                    transform: translateY(0);
                }

                .deal-sticker {
                    position: absolute;
                    top: 18px;
                    right: 10px;
                    width: 88px;
                    height: 88px;
                    background: #111;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    text-align: center;
                    opacity: 0;
                    transform: scale(0.5) rotate(-20deg);
                    transition: opacity 0.6s 0.4s ease, transform 0.6s 0.4s cubic-bezier(0.34,1.56,0.64,1);
                }
                .deal-img-wrap.visible .deal-sticker {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
                .deal-sticker span { font-size: 10px; letter-spacing: 1px; opacity: 0.7; }
                .deal-sticker h5   { font-family: 'Bebas Neue', sans-serif; font-size: 20px; margin: 2px 0 0; line-height: 1; }

                /* ── text column ── */
                .deal-text {
                    opacity: 0;
                    transform: translateX(32px);
                    transition: opacity 0.8s 0.2s ease, transform 0.8s 0.2s ease;
                }
                .deal-text.visible {
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
                    margin: 0 0 12px;
                }

                .deal-title {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(36px, 4.5vw, 56px);
                    color: #111;
                    line-height: 1.0;
                    letter-spacing: 1px;
                    margin: 0 0 28px;
                }

                /* ── countdown ── */
                .countdown {
                    display: flex;
                    gap: 0;
                    margin-bottom: 36px;
                    align-items: flex-start;
                }

                .cd-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 64px;
                }

                .cd-num {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(40px, 5vw, 60px);
                    line-height: 1;
                    color: #111;
                    letter-spacing: -1px;
                    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
                }
                .cd-num.tick { transform: scale(1.15); }

                .cd-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 9px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #aaa;
                    margin-top: 4px;
                }

                .cd-sep {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(36px, 4vw, 52px);
                    color: #ccc;
                    line-height: 1;
                    padding: 0 4px;
                    margin-top: 2px;
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
                    padding: 14px 36px;
                    text-decoration: none;
                    border-radius: 2px;
                    transition: background 0.3s, transform 0.2s;
                }
                .deal-btn:hover { background: #333; transform: translateY(-2px); color: #fff; }

                /* ═══════════════════════════════════════
                   INSTAGRAM SECTION
                ═══════════════════════════════════════ */
                .insta-section {
                    background: #fff;
                    padding: 72px 0 64px;
                    overflow: hidden;
                }

                .insta-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 56px;
                    align-items: center;
                }

                /* ── grid ── */
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
                    transform: scale(0.92);
                    transition: opacity 0.55s ease, transform 0.55s ease;
                }
                .insta-tile.visible {
                    opacity: 1;
                    transform: scale(1);
                }

                .insta-tile img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
                }
                .insta-tile:hover img { transform: scale(1.1); }

                .insta-tile__overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.38);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.35s;
                }
                .insta-tile:hover .insta-tile__overlay { opacity: 1; }

                .insta-tile__icon {
                    width: 32px;
                    height: 32px;
                    fill: none;
                    stroke: #fff;
                    stroke-width: 1.5;
                }

                /* ── text ── */
                .insta-text {
                    opacity: 0;
                    transform: translateX(28px);
                    transition: opacity 0.8s 0.3s ease, transform 0.8s 0.3s ease;
                }
                .insta-text.visible {
                    opacity: 1;
                    transform: translateX(0);
                }

                .insta-hashtag {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(32px, 4vw, 48px);
                    color: #111;
                    letter-spacing: 1px;
                    line-height: 1;
                    margin: 0 0 18px;
                }

                .insta-desc {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    line-height: 1.75;
                    color: #666;
                    margin: 0 0 28px;
                }

                .insta-handle {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 20px;
                    font-weight: 500;
                    color: #a75f32;
                    margin: 0 0 32px;
                    display: block;
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
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 2px;
                    transition: background 0.3s, transform 0.2s;
                }
                .insta-btn:hover { background: #333; transform: translateY(-2px); color: #fff; }

                .insta-btn svg {
                    width: 16px;
                    height: 16px;
                    fill: none;
                    stroke: #fff;
                    stroke-width: 1.5;
                }

                /* ═══════════════════════════════════════
                   BLOG SECTION (unchanged but responsive)
                ═══════════════════════════════════════ */
                .blog-section {
                    background: #f7f4f0;
                    padding: 72px 0 80px;
                }

                .blog-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .section-head {
                    margin-bottom: 40px;
                }
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
                    font-size: clamp(32px, 4vw, 48px);
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
                .blog-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 10px 32px rgba(0,0,0,0.12);
                }

                .blog-card__pic {
                    width: 100%;
                    height: 210px;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.5s ease;
                }
                .blog-card:hover .blog-card__pic { transform: scale(1.04); }

                .blog-card__body { padding: 20px 22px 24px; }
                .blog-card__date {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: #999;
                    margin-bottom: 10px;
                }
                .blog-card__title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1a1a;
                    line-height: 1.45;
                    margin: 0 0 14px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .blog-card__link {
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #6b2737;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    border-bottom: 1px solid transparent;
                    padding-bottom: 2px;
                    transition: gap 0.3s, border-color 0.3s;
                }
                .blog-card__link:hover { border-color: #6b2737; gap: 10px; }

                .blog-cta-wrap { text-align: center; margin-top: 40px; }

                /* Skeleton */
                .skeleton-pic { height: 210px; background: #ececec; animation: shimmer 1.4s infinite; }
                .skeleton-line { height: 13px; background: #ececec; border-radius: 4px; margin-bottom: 8px; animation: shimmer 1.4s infinite; }
                .skeleton-line--short { width: 40%; }
                .skeleton-line--medium { width: 65%; }
                .skeleton-line--xs { width: 28%; height: 11px; }

                @keyframes shimmer {
                    0%,100% { opacity: 1; } 50% { opacity: 0.4; }
                }

                /* ═══════════════════════════════════════
                   RESPONSIVE
                ═══════════════════════════════════════ */

                /* Tablet landscape 900–1100 */
                @media (max-width: 1100px) {
                    .deal-inner { grid-template-columns: 1fr 360px 1fr; gap: 28px; }
                    .insta-inner { grid-template-columns: 1fr 280px; gap: 36px; }
                    .insta-grid  { grid-template-rows: repeat(2, 170px); }
                }

                /* Tablet portrait 640–900 */
                @media (max-width: 900px) {
                    .deal-inner {
                        grid-template-columns: 1fr;
                        grid-template-areas:
                            "img"
                            "text";
                        max-width: 520px;
                        gap: 32px;
                    }
                    .deal-img-wrap { grid-area: img; }
                    .deal-text     { grid-area: text; }

                    .insta-inner {
                        grid-template-columns: 1fr;
                        gap: 36px;
                    }
                    .insta-grid { grid-template-rows: repeat(2, 160px); }

                    .blog-grid { grid-template-columns: repeat(2, 1fr); }
                }

                /* Mobile 640 */
                @media (max-width: 640px) {
                    .deal-section, .insta-section, .blog-section { padding: 48px 0 44px; }

                    .deal-inner { padding: 0 16px; }
                    .deal-title { font-size: 36px; }
                    .cd-unit { min-width: 52px; }
                    .cd-num  { font-size: 38px; }

                    .insta-inner { padding: 0 16px; gap: 28px; }
                    .insta-grid  {
                        grid-template-columns: repeat(3, 1fr);
                        grid-template-rows: repeat(2, 110px);
                        gap: 4px;
                    }
                    .insta-hashtag { font-size: 30px; }
                    .insta-desc    { font-size: 13px; }

                    .blog-inner  { padding: 0 16px; }
                    .blog-grid   { grid-template-columns: 1fr; gap: 18px; }
                    .blog-card__pic { height: 175px; }
                }

                /* Very small 400 */
                @media (max-width: 400px) {
                    .insta-grid { grid-template-rows: repeat(2, 90px); }
                    .countdown  { gap: 0; }
                    .cd-unit    { min-width: 44px; }
                    .cd-num     { font-size: 32px; }
                    .cd-sep     { font-size: 28px; }
                }
            `}</style>

            {/* ══════════════════════ DEAL OF THE WEEK ══════════════════════ */}
            <section className="deal-section">
                <div className="deal-inner" ref={dealRef}>

                    {/* empty left col on desktop, hidden on mobile via grid-area */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div className={`deal-img-wrap ${dealVisible ? "visible" : ""}`}>
                            <img src={saleImg} alt="Deal of the week" />
                            <div className="deal-sticker">
                                <span>Sale Of</span>
                                <h5>Rs.2900/-</h5>
                            </div>
                        </div>
                    </div>

                    <div className={`deal-text ${dealVisible ? "visible" : ""}`}>
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

                    {/* spacer col — hidden on mobile */}
                    <div />
                </div>
            </section>

            {/* ══════════════════════ INSTAGRAM ══════════════════════ */}
            <section className="insta-section">
                <div className="insta-inner" ref={instaRef}>

                    {/* Grid */}
                    <div className="insta-grid">
                        {instaPics.map((img, i) => (
                            <div
                                key={i}
                                className={`insta-tile ${instaVisible ? "visible" : ""}`}
                                style={{ transitionDelay: instaVisible ? `${i * 0.07}s` : "0s" }}
                            >
                                <img src={img} alt={`Instagram ${i + 1}`} />
                                <div className="insta-tile__overlay">
                                    <svg className="insta-tile__icon" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" />
                                        <circle cx="12" cy="12" r="4" />
                                        <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Text */}
                    <div className={`insta-text ${instaVisible ? "visible" : ""}`}>
                        <h2 className="insta-hashtag">#ShopOurStyle</h2>
                        <p className="insta-desc">
                            Tag us in your photos for a chance to be featured!
                            Join our community of over 50k fashion enthusiasts
                            sharing their daily outfits and seasonal inspirations.
                        </p>
                        <span className="insta-handle">@shopvista</span>
                        <a
                            href="https://instagram.com"
                            className="insta-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
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

            {/* ══════════════════════ BLOG ══════════════════════ */}
            <section className="blog-section">
                <div className="blog-inner">
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

/* ── Animated countdown unit ── */
const CountUnit = ({ num, label }) => {
    const [tick, setTick] = useState(false);
    const prev = useRef(num);
    useEffect(() => {
        if (prev.current !== num) {
            setTick(true);
            const t = setTimeout(() => setTick(false), 200);
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

