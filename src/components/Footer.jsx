import React from "react";

// Import images from assets folder
import footerLogo from "../assets/img/logo1.png";
import paymentImg from "../assets/img/payment.png";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="footer">
                <div className="container">
                    <div className="row">

                        {/* Logo + About */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="footer__about">
                                <div className="footer__logo">
                                    <a href="#">
                                        <img src={footerLogo} alt="Footer Logo" />
                                    </a>
                                </div>
                                <p>
                                    The customer is at the heart of our unique business model,
                                    which includes design.
                                </p>
                                <a href="#">
                                    <img src={paymentImg} alt="Payment Methods" />
                                </a>
                            </div>
                        </div>

                        {/* Column 1 */}
                        <div className="col-lg-2 offset-lg-1 col-md-3 col-sm-6">
                            <div className="footer__widget">
                                <h6>Shopping</h6>
                                <ul>
                                    <li><a href="#">Clothing Store</a></li>
                                    <li><a href="#">Trending Shoes</a></li>
                                    <li><a href="#">Accessories</a></li>
                                    <li><a href="#">Sale</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="col-lg-2 col-md-3 col-sm-6">
                            <div className="footer__widget">
                                <h6>Customer Support</h6>
                                <ul>
                                    <li><a href="#">Contact Us</a></li>
                                    <li><a href="#">Payment Methods</a></li>
                                    <li><a href="#">Delivery</a></li>
                                    <li><a href="#">Return & Exchanges</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="col-lg-3 offset-lg-1 col-md-6 col-sm-6">
                            <div className="footer__widget">
                                <h6>Newsletter</h6>
                                <div className="footer__newslatter">
                                    <p>
                                        Be the first to know about new arrivals, look books, sales & promos!
                                    </p>
                                    <form action="#">
                                        <input type="text" placeholder="Your email" />
                                        <button type="submit">
                                            <span className="icon_mail_alt"></span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Bottom */}
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <div className="footer__copyright__text">
                                <p>
                                    Copyright © {currentYear} All rights reserved

                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </footer>

            {/* Search Modal */}
            <div className="search-model">
                <div className="h-100 d-flex align-items-center justify-content-center">
                    <div className="search-close-switch">+</div>
                    <form className="search-model-form">
                        <input type="text" id="search-input" placeholder="Search here..." />
                    </form>
                </div>
            </div>
        </>
    );
};

export default Footer;
