import React from "react";
import { Link } from "react-router-dom";
import banner1 from "../assets/img/banner/banner-1.jpg";
import banner2 from "../assets/img/banner/banner-2.jpg";
import banner3 from "../assets/img/banner/banner-3.jpg";

const bannerData = [
    { id: 1, img: banner1, num: "01", tag: "New Arrivals · 2026", title: ["Clothing", "Collections"], link: "/shop" },
    { id: 2, img: banner2, num: "02", tag: "Essentials · 2026", title: ["Accessories"], link: "/shop" },
    { id: 3, img: banner3, num: "03", tag: "Season Drop · 2026", title: ["Shoes Spring"], link: "/shop" },
];

const Banner = () => (
    <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

            .bn-wrap {
                width: 100%;
                background: #ffffff;
                padding: 40px 20px 48px;
                box-sizing: border-box;
            }

            /* ── Section heading ── */
            .bn-header {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                margin-bottom: 24px;
            }

            .bn-header__eyebrow {
                font-family: 'DM Sans', sans-serif;
                font-size: 10px;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: #aaa;
                font-weight: 500;
                margin: 0 0 6px 0;
            }

            .bn-header__title {
                font-family: 'Bebas Neue', sans-serif;
                font-size: clamp(36px, 5vw, 56px);
                color: #111;
                line-height: 1;
                letter-spacing: 1px;
                margin: 0;
            }

            .bn-header__link {
                font-family: 'DM Sans', sans-serif;
                font-size: 11px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #555;
                text-decoration: none;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #ccc;
                transition: color 0.3s, border-color 0.3s;
            }

            .bn-header__link:hover {
                color: #111;
                border-color: #111;
            }

            /* ── Grid ── */
            .bn-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
            }

            /* ── Card ── */
            .bn-card {
                position: relative;
                overflow: hidden;
                cursor: pointer;
                background: #f5f0eb;
                aspect-ratio: 4 / 4.5;
                border-radius: 6px;
                animation: cardIn 0.7s ease both;
            }

            .bn-card:nth-child(1) { animation-delay: 0s; }
            .bn-card:nth-child(2) { animation-delay: 0.13s; }
            .bn-card:nth-child(3) { animation-delay: 0.26s; }

            @keyframes cardIn {
                from { opacity: 0; transform: translateY(24px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .bn-card::before {
                content: '';
                position: absolute;
                inset: 0;
                z-index: 1;
                background: linear-gradient(to bottom, transparent 35%, rgba(15, 13, 10, 0.75) 100%);
                transition: opacity 0.5s ease;
            }

            .bn-card:hover::before {
                opacity: 0.95;
            }

            .bn-card img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                will-change: transform;
            }

            .bn-card:hover img {
                transform: scale(1.08);
            }

            .bn-num {
                position: absolute;
                top: 14px;
                right: 16px;
                z-index: 2;
                font-family: 'Bebas Neue', sans-serif;
                font-size: 52px;
                line-height: 1;
                color: rgba(255, 255, 255, 0.12);
                pointer-events: none;
                transition: opacity 0.4s ease, transform 0.4s ease;
            }

            .bn-card:hover .bn-num {
                opacity: 0;
                transform: translateY(-10px);
            }

            .bn-body {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2;
                padding: 20px 18px 24px;
            }

            .bn-tag {
                display: block;
                font-family: 'DM Sans', sans-serif;
                font-size: 10px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.55);
                margin-bottom: 8px;
                font-weight: 500;
            }

            .bn-title {
                font-family: 'Bebas Neue', sans-serif;
                font-size: clamp(30px, 3.2vw, 40px);
                color: #fff;
                line-height: 0.95;
                letter-spacing: 1px;
                margin: 0 0 14px 0;
                transition: letter-spacing 0.4s ease;
            }

            .bn-card:hover .bn-title {
                letter-spacing: 2px;
            }

            .bn-cta {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-family: 'DM Sans', sans-serif;
                font-size: 10px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                font-weight: 500;
                opacity: 0;
                transform: translateY(8px);
                transition: opacity 0.4s 0.08s ease, transform 0.4s 0.08s ease;
            }

            .bn-card:hover .bn-cta {
                opacity: 1;
                transform: translateY(0);
            }

            .bn-line {
                display: inline-block;
                width: 24px;
                height: 1px;
                background: rgba(255, 255, 255, 0.6);
                transition: width 0.35s ease;
            }

            .bn-card:hover .bn-line {
                width: 36px;
            }

            /* ── Responsive ── */
            @media (max-width: 900px) and (min-width: 601px) {
                .bn-card { aspect-ratio: 3 / 3.8; }
                .bn-title { font-size: 26px; }
            }

            @media (max-width: 600px) {
                .bn-wrap { padding: 24px 14px 36px; }
                .bn-grid { grid-template-columns: 1fr; gap: 6px; }
                .bn-card { aspect-ratio: 16 / 10; }
                .bn-title { font-size: 40px; }
                .bn-header { flex-direction: column; align-items: flex-start; gap: 12px; }
            }
        `}</style>

        <section className="bn-wrap">

            {/* Section heading */}
            <div className="bn-header">
                <div>
                    <p className="bn-header__eyebrow">Curated for you</p>
                    <h2 className="bn-header__title">Shop by Category</h2>
                </div>
                <Link to="/shop" className="bn-header__link">
                    View all collections →
                </Link>
            </div>

            {/* Cards */}
            <div className="bn-grid">
                {bannerData.map((item) => (
                    <div className="bn-card" key={item.id}>
                        <img src={item.img} alt={item.title.join(" ")} />
                        <div className="bn-num">{item.num}</div>
                        <div className="bn-body">
                            <span className="bn-tag">{item.tag}</span>
                            <h2 className="bn-title">
                                {item.title.map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i < item.title.length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </h2>
                            <Link to={item.link} className="bn-cta">
                                <span className="bn-line" />
                                Shop now
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    </>
);

export default Banner;
// import React from "react";
// import { Link } from "react-router-dom";
// import banner1 from "../assets/img/banner/banner-1.jpg";
// import banner2 from "../assets/img/banner/banner-2.jpg";
// import banner3 from "../assets/img/banner/banner-3.jpg";

// const bannerData = [
//     { id: 1, img: banner1, num: "01", tag: "New Arrivals · 2026", title: "Clothing Collections", link: "/shop" },
//     { id: 2, img: banner2, num: "02", tag: "Essentials · 2026", title: "Accessories", link: "/shop" },
//     { id: 3, img: banner3, num: "03", tag: "Season Drop · 2026", title: "Shoes Spring", link: "/shop" },
// ];

// const Banner = () => (
//     <>
//         <style>{`
//             @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

//             .banner-section {
//                 padding: 40px 20px;
//                 background: #ffffff;
//                 font-family: 'DM Sans', sans-serif;
//             }

//             .banner-grid {
//                 display: grid;
//                 grid-template-columns: repeat(3, 1fr);
//                 gap: 3px;
//                 max-width: 100%;
//                 margin: 0 ;
//             }

//             .banner-col {
//                 position: relative;
//                 overflow: hidden;
//                 height: 540px;
//                 cursor: pointer;
//                 background: #1a1a1a;
//                 animation: colFadeIn 0.6s ease both;
//             }

//             .banner-col:nth-child(1) { animation-delay: 0s; }
//             .banner-col:nth-child(2) { animation-delay: 0.12s; }
//             .banner-col:nth-child(3) { animation-delay: 0.24s; }

//             @keyframes colFadeIn {
//                 from { opacity: 0; transform: translateY(20px); }
//                 to   { opacity: 1; transform: translateY(0); }
//             }

//             .banner-col img {
//                 width: 100%;
//                 height: 100%;
//                 object-fit: cover;
//                 display: block;
//                 filter: brightness(0.7);
//                 transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
//                             filter 0.5s ease;
//             }

//             .banner-col:hover img {
//                 transform: scale(1.08);
//                 filter: brightness(0.45);
//             }

//             .banner-col__num {
//                 position: absolute;
//                 top: 20px;
//                 left: 20px;
//                 font-family: 'Bebas Neue', sans-serif;
//                 font-size: 72px;
//                 color: rgba(255,255,255,0.08);
//                 line-height: 1;
//                 transition: opacity 0.4s;
//                 pointer-events: none;
//             }

//             .banner-col:hover .banner-col__num {
//                 opacity: 0;
//             }

//             .banner-col__bar {
//                 position: absolute;
//                 bottom: 0;
//                 left: 0;
//                 right: 0;
//                 padding: 28px 24px 32px;
//                 background: linear-gradient(to top, rgba(105, 101, 101, 0.85) 0%, transparent 100%);
//             }
//             .banner-col__tag {
//                 font-size: 9px;
//                 letter-spacing: 4px;
//                 text-transform: uppercase;
//                 color: rgba(255,255,255,0.5);
//                 margin-bottom: 10px;
//                 font-weight: 500;
//             }
//             .banner-col__title {
//                 font-family: 'Bebas Neue', sans-serif;
//                 font-size: 38px;
//                 color: #fff;
//                 line-height: 0.95;
//                 margin-bottom: 18px;
//                 letter-spacing: 1px;
//                 transition: letter-spacing 0.4s ease;
//             }

//             .banner-col:hover .banner-col__title {
//                 letter-spacing: 2px;
//             }
//             .banner-col__link {
//                 display: inline-flex;
//                 align-items: center;
//                 gap: 10px;
//                 font-size: 10px;
//                 letter-spacing: 3px;
//                 text-transform: uppercase;
//                 color: #797575;
//                 text-decoration: none;
//                 font-weight: 500;
//                 opacity: 0;
//                 transform: translateY(8px);
//                 transition: opacity 0.4s 0.1s ease, transform 0.4s 0.1s ease;
//             }
//             .banner-col:hover .banner-col__link {
//                 opacity: 1;
//                 transform: translateY(0);
//             }
//             .banner-col__link-line {
//                 width: 28px;
//                 height: 1px;
//                 background: #817d7d;
//                 display: inline-block;
//                 transition: width 0.3s ease;
//             }

//             .banner-col:hover .banner-col__link-line {
//                 width: 40px;
//             }

//             /* Responsive */
//             @media (max-width: 900px) and (min-width: 641px) {
//                 .banner-col { height: 400px; }
//                 .banner-col__title { font-size: 30px; }
//             }

//             @media (max-width: 640px) {
//                 .banner-grid { grid-template-columns: 1fr; }
//                 .banner-col { height: 320px; }
//                 .banner-col__title { font-size: 48px; }
//             }
//         `}</style>

//         <section className="banner-section">
//             <div className="banner-grid">
//                 {bannerData.map((item) => (
//                     <div className="banner-col" key={item.id}>
//                         <img src={item.img} alt={item.title} />
//                         <div className="banner-col__num">{item.num}</div>
//                         <div className="banner-col__bar">
//                             <p className="banner-col__tag">{item.tag}</p>
//                             <h2 className="banner-col__title">{item.title}</h2>
//                             <Link to={item.link} className="banner-col__link">
//                                 <span className="banner-col__link-line" />
//                                 Shop now
//                             </Link>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </section>
//     </>
// );

// export default Banner;