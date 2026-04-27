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
            subtitle: " New Season Arrivals",
            title: " The 2026 Summer Edit",
            text: "A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.",
        },
        {
            id: 2,
            image: hero2,
            subtitle: "Exclusive Access",
            title: "Luxury in Every Detail",
            text: " From ethically sourced wool to hand-finished seams—experience craftsmanship without compromise",
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
                                        <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 col-12">
                                            {/* We add 'active-text' only when the slide is active */}
                                            <div className={`hero__text ${isActive ? 'active-text' : ''}`}>
                                                <h6>{slide.subtitle}</h6>
                                                <h2>{slide.title}</h2>
                                                <p>{slide.text}</p>

                                                <div className="hero__social">
                                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                                                    <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-pinterest-p"></i></a>
                                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
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
