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
    { id: 1, img: banner1, num: "01", tag: "New Arrivals · 2026", title: "Clothing Collections", link: "/shop" },
    { id: 2, img: banner2, num: "02", tag: "Essentials · 2026", title: "Accessories", link: "/shop" },
    { id: 3, img: banner3, num: "03", tag: "Season Drop · 2026", title: "Shoes Spring", link: "/shop" },
];

const Banner = () => (
    <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

            .banner-section {
                padding: 40px 20px;
                background: #ffffff;
                font-family: 'DM Sans', sans-serif;
            }

            .banner-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 3px;
                max-width: 100%;
                margin: 0 ;
            }

            .banner-col {
                position: relative;
                overflow: hidden;
                height: 540px;
                cursor: pointer;
                background: #1a1a1a;
                animation: colFadeIn 0.6s ease both;
            }

            .banner-col:nth-child(1) { animation-delay: 0s; }
            .banner-col:nth-child(2) { animation-delay: 0.12s; }
            .banner-col:nth-child(3) { animation-delay: 0.24s; }

            @keyframes colFadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .banner-col img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                filter: brightness(0.7);
                transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            filter 0.5s ease;
            }

            .banner-col:hover img {
                transform: scale(1.08);
                filter: brightness(0.45);
            }

            .banner-col__num {
                position: absolute;
                top: 20px;
                left: 20px;
                font-family: 'Bebas Neue', sans-serif;
                font-size: 72px;
                color: rgba(255,255,255,0.08);
                line-height: 1;
                transition: opacity 0.4s;
                pointer-events: none;
            }

            .banner-col:hover .banner-col__num {
                opacity: 0;
            }

            .banner-col__bar {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 28px 24px 32px;
                background: linear-gradient(to top, rgba(250, 250, 250, 0.85) 0%, transparent 100%);
            }
            .banner-col__tag {
                font-size: 9px;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: rgba(255,255,255,0.5);
                margin-bottom: 10px;
                font-weight: 500;
            }
            .banner-col__title {
                font-family: 'Bebas Neue', sans-serif;
                font-size: 38px;
                color: #fff;
                line-height: 0.95;
                margin-bottom: 18px;
                letter-spacing: 1px;
                transition: letter-spacing 0.4s ease;
            }

            .banner-col:hover .banner-col__title {
                letter-spacing: 2px;
            }
            .banner-col__link {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-size: 10px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #fff;
                text-decoration: none;
                font-weight: 500;
                opacity: 0;
                transform: translateY(8px);
                transition: opacity 0.4s 0.1s ease, transform 0.4s 0.1s ease;
            }
            .banner-col:hover .banner-col__link {
                opacity: 1;
                transform: translateY(0);
            }
            .banner-col__link-line {
                width: 28px;
                height: 1px;
                background: #fff;
                display: inline-block;
                transition: width 0.3s ease;
            }

            .banner-col:hover .banner-col__link-line {
                width: 40px;
            }

            /* Responsive */
            @media (max-width: 900px) and (min-width: 641px) {
                .banner-col { height: 400px; }
                .banner-col__title { font-size: 30px; }
            }

            @media (max-width: 640px) {
                .banner-grid { grid-template-columns: 1fr; }
                .banner-col { height: 320px; }
                .banner-col__title { font-size: 48px; }
            }
        `}</style>

        <section className="banner-section">
            <div className="banner-grid">
                {bannerData.map((item) => (
                    <div className="banner-col" key={item.id}>
                        <img src={item.img} alt={item.title} />
                        <div className="banner-col__num">{item.num}</div>
                        <div className="banner-col__bar">
                            <p className="banner-col__tag">{item.tag}</p>
                            <h2 className="banner-col__title">{item.title}</h2>
                            <Link to={item.link} className="banner-col__link">
                                <span className="banner-col__link-line" />
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