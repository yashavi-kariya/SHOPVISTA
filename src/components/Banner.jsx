// import React from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";

// import banner1 from "../assets/img/banner/banner-1.jpg";
// import banner2 from "../assets/img/banner/banner-2.jpg";
// import banner3 from "../assets/img/banner/banner-3.jpg";

// const Banner = () => {
//     const banners = [
//         {
//             id: 1,
//             img: banner1,
//             title: "Clothing Collections 2026",
//             link: "#",
//             className: ""
//         },
//         {
//             id: 2,
//             img: banner2,
//             title: "Accessories",
//             link: "#",
//             className: "banner__item--middle"
//         },
//         {
//             id: 3,
//             img: banner3,
//             title: "Shoes Spring 2030",
//             link: "#",
//             className: "banner__item--last"
//         }
//     ];

//     return (
//         <section className="banner spad">
//             <div className="container">
//                 <Swiper
//                     spaceBetween={30}
//                     slidesPerView={1}
//                     loop={true}
//                 >
//                     {banners.map((item) => (
//                         <SwiperSlide key={item.id}>
//                             <div className={`banner__item ${item.className}`}>
//                                 <div className="banner__item__pic">
//                                     <img src={item.img} alt="banner" />
//                                 </div>
//                                 <div className="banner__item__text">
//                                     <h2>{item.title}</h2>
//                                     <a href={item.link}>Shop now</a>
//                                 </div>
//                             </div>
//                         </SwiperSlide>
//                     ))}
//                 </Swiper>
//             </div>
//         </section>
//     );
// };

// export default Banner;


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
        <section className="banner spad">
            <div className="container">
                <div className="row">
                    {bannerData.map((item) => (
                        <div className={item.classes} key={item.id}>
                            <div
                                className={`banner__item ${item.extraClass ? item.extraClass : ""
                                    }`}
                            >
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
    );
};

export default Banner;
