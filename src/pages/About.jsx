import React from "react";
import { Link } from "react-router-dom";

// Import all images used on About page
import aboutPic from "../assets/img/about/about-us.jpg";
import testimonialAuthor from "../assets/img/about/testimonial-author.jpg";
import testimonialBg from "../assets/img/about/testimonial-pic.jpg";
import team1 from "../assets/img/about/team-1.jpg";
import team2 from "../assets/img/about/team-2.jpg";
import team3 from "../assets/img/about/team-3.jpg";
import team4 from "../assets/img/about/team-4.jpg";

import client1 from "../assets/img/clients/client-1.png";
import client2 from "../assets/img/clients/client-2.png";
import client3 from "../assets/img/clients/client-3.png";
import client4 from "../assets/img/clients/client-4.png";
import client5 from "../assets/img/clients/client-5.png";
import client6 from "../assets/img/clients/client-6.png";
import client7 from "../assets/img/clients/client-7.png";
import client8 from "../assets/img/clients/client-8.png";

const About = () => {
    return (
        <>
            {/* Breadcrumb Section */}
            <section className="breadcrumb-option">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="breadcrumb__text">
                                <h4>About Us</h4>
                                <div className="breadcrumb__links">
                                    <Link to="/">Home</Link>
                                    <span>About Us</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="about__pic">
                                <img src={aboutPic} alt="about us" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Item 1 */}
                        <div className="col-lg-4 col-md-4 col-sm-6">
                            <div className="about__item">
                                <h4>Who We Are ?</h4>
                                <p>
                                    Contextual advertising programs sometimes have strict policies.
                                    Let’s take Google as an example.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="col-lg-4 col-md-4 col-sm-6">
                            <div className="about__item">
                                <h4>What We Do ?</h4>
                                <p>
                                    In this digital generation where information is instant,
                                    business cards still matter a lot.
                                </p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="col-lg-4 col-md-4 col-sm-6">
                            <div className="about__item">
                                <h4>Why Choose Us</h4>
                                <p>
                                    A two or three storey home is ideal to maximize land space,
                                    especially for older or infirm people.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="testimonial">
                <div className="container-fluid">
                    <div className="row">
                        {/* Text */}
                        <div className="col-lg-6 p-0">
                            <div className="testimonial__text">
                                <span className="icon_quotations"></span>
                                <p>
                                    Going out after work? Take your butane curling iron with you
                                    to the office, style your hair before leaving and skip going
                                    home.
                                </p>

                                <div className="testimonial__author">
                                    <div className="testimonial__author__pic">
                                        <img src={testimonialAuthor} alt="author" />
                                    </div>
                                    <div className="testimonial__author__text">
                                        <h5>Augusta Schultz</h5>
                                        <p>Fashion Designer</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="col-lg-6 p-0">
                            <div
                                className="testimonial__pic set-bg"
                                style={{ backgroundImage: `url(${testimonialBg})` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Counter Section */}
            <section className="counter spad">
                <div className="container">
                    <div className="row">
                        {/* Clients */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="counter__item">
                                <div className="counter__item__number">
                                    <h2 className="cn_num">102</h2>
                                </div>
                                <span>
                                    Our <br /> Clients
                                </span>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="counter__item">
                                <div className="counter__item__number">
                                    <h2 className="cn_num">30</h2>
                                </div>
                                <span>
                                    Total <br /> Categories
                                </span>
                            </div>
                        </div>

                        {/* Countries */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="counter__item">
                                <div className="counter__item__number">
                                    <h2 className="cn_num">102</h2>
                                </div>
                                <span>
                                    In <br /> Country
                                </span>
                            </div>
                        </div>

                        {/* Happy Customers */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="counter__item">
                                <div className="counter__item__number">
                                    <h2 className="cn_num">98</h2>
                                    <strong>%</strong>
                                </div>
                                <span>
                                    Happy <br /> Customers
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>Our Team</span>
                                <h2>Meet Our Team</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Team Cards */}
                        {[team1, team2, team3, team4].map((img, i) => (
                            <div className="col-lg-3 col-md-6 col-sm-6" key={i}>
                                <div className="team__item">
                                    <img src={img} alt="team" />
                                    <h4>{["John Smith", "Christine Wise", "Sean Robbins", "Lucy Myers"][i]}</h4>
                                    <span>{["Fashion Design", "C.E.O", "Manager", "Delivery"][i]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Client Section */}
            <section className="clients spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>Partner</span>
                                <h2>Happy Clients</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {[client1, client2, client3, client4, client5, client6, client7, client8].map(
                            (client, idx) => (
                                <div className="col-lg-3 col-md-4 col-sm-4 col-6" key={idx}>
                                    <a href="#" className="client__item">
                                        <img src={client} alt="client" />
                                    </a>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;
