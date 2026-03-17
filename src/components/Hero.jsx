// import React from "react";

// // Swiper Core + Modules
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";

// // Swiper Styles
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// // Images
// import hero1 from "../assets/img/hero/hero-1.jpg";
// import hero2 from "../assets/img/hero/hero-2.jpg";

// const Hero = () => {
//     const slides = [
//         {
//             id: 1,
//             image: hero1,
//             subtitle: "Summer Collection",
//             title: "Fall - Winter Collections 2026",
//             text: "A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.",
//         },
//         {
//             id: 2,
//             image: hero2,
//             subtitle: "Summer Collection",
//             title: "Fall - Winter Collections 2030",
//             text: "A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.",
//         },
//     ];
//     if (!slides || slides.length === 0) return null;
//     return (
//         <section className="hero">
//             <Swiper
//                 modules={[Navigation, Pagination, Autoplay]}
//                 autoplay={{ delay: 3000 }}
//                 loop={true}
//                 navigation
//                 pagination={{ clickable: true }}
//                 observer={true}
//                 observeParents={true}
//                 className="hero__slider"
//             >
//                 {slides.map((slide) => (
//                     <SwiperSlide key={slide.id}>
//                         <div
//                             className="hero__items set-bg"
//                             style={{
//                                 backgroundImage: `url(${slide.image})`,
//                                 height: "100vh", // 3. Explicit height for background visibility
//                                 display: "flex",
//                                 alignItems: "center"
//                             }}
//                         >
//                             <div className="container">
//                                 <div className="row">
//                                     <div className="col-xl-5 col-lg-7 col-md-8">
//                                         <div className="hero__text">
//                                             <h6>{slide.subtitle}</h6>
//                                             <h2>{slide.title}</h2>
//                                             <p>{slide.text}</p>
//                                             <a href="#" className="primary-btn">
//                                                 Shop now <span className="arrow_right"></span>
//                                             </a>

//                                             <div className="hero__social">
//                                                 <a href="#"><i className="fa fa-facebook"></i></a>
//                                                 <a href="#"><i className="fa fa-twitter"></i></a>
//                                                 <a href="#"><i className="fa fa-pinterest"></i></a>
//                                                 <a href="#"><i className="fa fa-instagram"></i></a>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </SwiperSlide>
//                 ))}
//             </Swiper>
//         </section>
//     );
// };

// export default Hero;
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Images
import hero1 from "../assets/img/hero/hero-1.jpg";
import hero2 from "../assets/img/hero/hero-2.jpg";

const Hero = () => {
    const slides = [
        {
            id: 1,
            image: hero1,
            subtitle: "Summer Collection",
            title: "Fall - Winter Collections 2026",
            text: "A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.",
        },
        {
            id: 2,
            image: hero2,
            subtitle: "Summer Collection",
            title: "Fall - Winter Collections 2026",
            text: "A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.",
        },
    ];

    return (
        <section className="hero">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                autoplay={{ delay: 5000 }}
                loop={true}
                navigation={true}
                pagination={{ clickable: true }}
                className="hero__slider"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        {({ isActive }) => (
                            <div
                                className="hero__items set-bg"
                                style={{
                                    backgroundImage: `url(${slide.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="container">
                                    <div className="row">
                                        <div className="col-xl-5 col-lg-7 col-md-8">
                                            {/* We add 'active-text' only when the slide is active */}
                                            <div className={`hero__text ${isActive ? 'active-text' : ''}`}>
                                                <h6>{slide.subtitle}</h6>
                                                <h2>{slide.title}</h2>
                                                <p>{slide.text}</p>
                                                <a href="#" className="primary-btn">
                                                    Shop now <span className="arrow_right"></span>
                                                </a>
                                                <div className="hero__social">
                                                    <a href="#"><i className="fa fa-facebook"></i></a>
                                                    <a href="#"><i className="fa fa-twitter"></i></a>
                                                    <a href="#"><i className="fa fa-pinterest"></i></a>
                                                    <a href="#"><i className="fa fa-instagram"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;
