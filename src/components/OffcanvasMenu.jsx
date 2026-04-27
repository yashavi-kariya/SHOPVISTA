import React from "react";
import { Link } from "react-router-dom";
import searchIcon from "../assets/img/icon/search.png";
import heartIcon from "../assets/img/icon/heart.png";
import cartIcon from "../assets/img/icon/cart.png";

const OffcanvasMenu = ({ isOpen, closeMenu }) => {
    return (
        <>
            <div
                className={`offcanvas-menu-overlay ${isOpen ? "active" : ""}`}
                onClick={closeMenu}
                style={{ display: isOpen ? "block" : "none" }}
            ></div>

            <div className={`offcanvas-menu-wrapper ${isOpen ? "active" : ""}`}>
                <div className="offcanvas__option">
                    <div className="offcanvas__links">
                        <Link onClick={closeMenu} to="/signin">Sign in</Link>
                        <Link onClick={closeMenu} to="/faqs">FAQs</Link>
                    </div>

                    {/* <div className="offcanvas__top__hover">
                        <span>Usd <i className="arrow_carrot-down"></i></span>
                        <ul>
                            <li>USD</li>
                            <li>EUR</li>
                        </ul>
                    </div> */}
                </div>

                <div className="offcanvas__nav__option">
                    <Link to="#" className="search-switch">
                        <img src={searchIcon} alt="search" />
                    </Link>
                    <Link to="/wishlist">
                        <img src={heartIcon} alt="heart" />
                    </Link>
                    <Link to="/cart">
                        <img src={cartIcon} alt="cart" /> <span>0</span>
                    </Link>
                    <div className="price">$0.00</div>
                </div>

                {/* Mobile Menu Placeholder */}
                {/* <div id="mobile-menu-wrap">
                   
                </div> */}

                <div className="offcanvas__text">
                    <p>Free shipping, 30-day return or refund guarantee.</p>
                </div>
            </div>
        </>
    );
};

export default OffcanvasMenu;
