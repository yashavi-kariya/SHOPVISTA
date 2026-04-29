// import React from "react";
// import { Link } from "react-router-dom";

// // Import images
// import banner1 from "../assets/img/banner/banner-1.jpg";
// import banner2 from "../assets/img/banner/banner-2.jpg";
// import banner3 from "../assets/img/banner/banner-3.jpg";

// const Banner = () => {
//     const bannerData = [
//         {
//             id: 1,
//             img: banner1,
//             title: "Clothing Collections 2026",
//             link: "/shop",
//             classes: "col-lg-7 offset-lg-4",
//         },
//         {
//             id: 2,
//             img: banner2,
//             title: "Accessories",
//             link: "/shop",
//             classes: "col-lg-5",
//             extraClass: "banner__item--middle",
//         },
//         {
//             id: 3,
//             img: banner3,
//             title: "Shoes Spring 2026",
//             link: "/shop",
//             classes: "col-lg-7",
//             extraClass: "banner__item--last",
//         },
//     ];

//     return (
//         <>
//             <style>{`
//                 @media (max-width: 576px) {
//                     .banner__item {
//                         position: relative !important;
//                         display: block !important;
//                         overflow: hidden !important;
//                     }
//                     .banner__item__pic {
//                         width: 100% !important;
//                         display: block !important;
//                     }
//                     .banner__item__pic img {
//                         // margin-top: 0 !important;
//                         width: 100% !important;
//                         height: 100% !important;
//                         display: block !important;
//                         object-fit: cover !important;
//                     }
//                     .banner__item__text {
//                         position: absolute !important;
//                         bottom: 20px !important;
//                         left: 20px !important;
//                         right: 20px !important;
//                         top: auto !important;
//                         z-index: 2 !important;
//                         background: transparent !important;
//                     }
//                     .banner__item__text h2 {
//                         font-size: 18px !important;
//                         color: #1f1e1e !important;
//                     }
//                     .banner__item__text a {
//                         color: #131212 !important;
//                     }
//                          /* ✅ Fix only first banner item text — push to bottom */
//                   .col-lg-7.offset-lg-4 .banner__item__text {
//                     bottom: 5px !important;
//                     top: auto !important;
//                 }
//             `}</style>

//             <section className="banner spad">
//                 <div className="container">
//                     <div className="row">
//                         {bannerData.map((item) => (
//                             <div className={item.classes} key={item.id}>
//                                 <div className={`banner__item ${item.extraClass || ""}`}>
//                                     <div className="banner__item__pic">
//                                         <img src={item.img} alt={item.title} />
//                                     </div>
//                                     <div className="banner__item__text">
//                                         <h2>{item.title}</h2>
//                                         <Link to={item.link}>Shop now</Link>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>
//         </>
//     );
// };


// export default Banner;

import React from "react";
import { Link } from "react-router-dom";
import banner1 from "../assets/img/banner/banner-1.jpg";
import banner2 from "../assets/img/banner/banner-2.jpg";
import banner3 from "../assets/img/banner/banner-3.jpg";

const bannerData = [
    { id: 1, img: banner1, label: "New Arrivals", title: "Clothing Collections 2026", link: "/shop", cardClass: "banner__card--main" },
    { id: 2, img: banner2, label: "Essentials", title: "Accessories", link: "/shop", cardClass: "banner__card--top" },
    { id: 3, img: banner3, label: "Season Drop", title: "Shoes Spring 2026", link: "/shop", cardClass: "banner__card--bottom" },
];

const Banner = () => (
    <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

            .banner-section {
                padding: 48px 24px;
                background: #f8f6f2;
                font-family: 'DM Sans', sans-serif;
            }

            .banner-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto auto;
                gap: 16px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .banner__card {
                position: relative;
                overflow: hidden;
                border-radius: 4px;
                cursor: pointer;
                background: #e8e4de;
            }

            .banner__card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .banner__card:hover img {
                transform: scale(1.06);
            }

            .banner__card--main {
                grid-column: 1 / 2;
                grid-row: 1 / 3;
                min-height: 520px;
            }

            .banner__card--top {
                grid-column: 2 / 3;
                grid-row: 1 / 2;
                min-height: 250px;
            }

            .banner__card--bottom {
                grid-column: 2 / 3;
                grid-row: 2 / 3;
                min-height: 250px;
            }

            .banner__overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%);
                transition: opacity 0.4s ease;
            }

            .banner__card:hover .banner__overlay {
                opacity: 0.85;
            }

            .banner__text {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 28px 24px;
                color: #fff;
                transform: translateY(6px);
                transition: transform 0.4s ease;
            }

            .banner__card:hover .banner__text {
                transform: translateY(0);
            }

            .banner__label {
                font-size: 10px;
                letter-spacing: 3px;
                text-transform: uppercase;
                opacity: 0.75;
                margin-bottom: 8px;
                font-weight: 500;
            }

            .banner__title {
                font-family: 'Playfair Display', serif;
                font-size: 22px;
                font-weight: 600;
                line-height: 1.2;
                margin-bottom: 14px;
                color: #fff;
            }

            .banner__card--top .banner__title,
            .banner__card--bottom .banner__title {
                font-size: 18px;
            }

            .banner__link {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
                letter-spacing: 2.5px;
                text-transform: uppercase;
                font-weight: 500;
                color: #fff;
                text-decoration: none;
                border-bottom: 1px solid rgba(255,255,255,0.5);
                padding-bottom: 2px;
                transition: border-color 0.3s, gap 0.3s;
            }

            .banner__link:hover {
                border-color: #fff;
                gap: 12px;
            }

            .banner__link-arrow {
                display: inline-block;
                transition: transform 0.3s;
            }

            .banner__card:hover .banner__link-arrow {
                transform: translateX(4px);
            }

            /* Entrance animations */
            .banner__card {
                animation: bannerFadeUp 0.7s ease both;
            }
            .banner__card--main   { animation-delay: 0s; }
            .banner__card--top    { animation-delay: 0.15s; }
            .banner__card--bottom { animation-delay: 0.30s; }

            @keyframes bannerFadeUp {
                from { opacity: 0; transform: translateY(24px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            /* Responsive */
            @media (max-width: 768px) {
                .banner__card--main {
                    min-height: 380px;
                }
                .banner__title { font-size: 20px; }
            }

            @media (max-width: 576px) {
                .banner-grid {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto;
                }
                .banner__card--main,
                .banner__card--top,
                .banner__card--bottom {
                    grid-column: 1;
                    grid-row: auto;
                    min-height: 240px;
                }
                .banner__card--main { min-height: 320px; }
            }
        `}</style>

        <section className="banner-section">
            <div className="banner-grid">
                {bannerData.map((item) => (
                    <div className={`banner__card ${item.cardClass}`} key={item.id}>
                        <img src={item.img} alt={item.title} />
                        <div className="banner__overlay" />
                        <div className="banner__text">
                            <p className="banner__label">{item.label}</p>
                            <h2 className="banner__title">{item.title}</h2>
                            <Link to={item.link} className="banner__link">
                                Shop now <span className="banner__link-arrow">→</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </>
);

export default Banner;