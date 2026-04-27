import React from "react";
import { Link } from "react-router-dom";

// Import images
import banner1 from "../assets/img/banner/banner-1.jpg";
import banner2 from "../assets/img/banner/banner-2.jpg";
import banner3 from "../assets/img/banner/banner-3.jpg";


const Banner = () => {
    const bannerData = [
        {
            id: 1,
            img: banner1,
            title: "Clothing Collections 2026",
            link: "/shop",
            classes: "col-lg-7 offset-lg-4",
        },
        {
            id: 2,
            img: banner2,
            title: "Accessories",
            link: "/shop",
            classes: "col-lg-5",
            extraClass: "banner__item--middle",
        },
        {
            id: 3,
            img: banner3,
            title: "Shoes Spring 2026",
            link: "/shop",
            classes: "col-lg-7",
            extraClass: "banner__item--last",
        },
    ];

    return (
        <>
            <style>{`
                @media (max-width: 576px) {
                    .banner__item {
                        position: relative !important;
                        display: block !important;
                        overflow: hidden !important;
                    }
                    .banner__item__pic {
                        width: 100% !important;
                        display: block !important;
                    }
                    .banner__item__pic img {
                        // margin-top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        display: block !important;
                        object-fit: cover !important;
                    }
                    .banner__item__text {
                        position: absolute !important;
                        bottom: 20px !important;
                        left: 20px !important;
                        right: 20px !important;
                        top: auto !important;
                        z-index: 2 !important;
                        background: transparent !important;
                    }
                    .banner__item__text h2 {
                        font-size: 18px !important;
                        color: #1f1e1e !important;
                    }
                    .banner__item__text a {
                        color: #131212 !important;
                    }
                         /* ✅ Fix only first banner item text — push to bottom */
                  .col-lg-7.offset-lg-4 .banner__item__text {
                    bottom: 5px !important;
                    top: auto !important;
                }
            `}</style>

            <section className="banner spad">
                <div className="container">
                    <div className="row">
                        {bannerData.map((item) => (
                            <div className={item.classes} key={item.id}>
                                <div className={`banner__item ${item.extraClass || ""}`}>
                                    <div className="banner__item__pic">
                                        <img src={item.img} alt={item.title} />
                                    </div>
                                    <div className="banner__item__text">
                                        <h2>{item.title}</h2>
                                        <Link to={item.link}>Shop now</Link>
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


export default Banner;
