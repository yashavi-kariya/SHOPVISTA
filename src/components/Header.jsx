import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

// Import images
import logo from "../assets/img/logo1.png";
import searchIcon from "../assets/img/icon/search.png";
import heartIcon from "../assets/img/icon/heart.png";
import cartIcon from "../assets/img/icon/cart.png";
import { CgPathBack } from "react-icons/cg";

const Header = ({ cartCount = 0, cartTotal = 0 }) => {
    const [currency, setCurrency] = useState("USD");

    const menuItems = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        {
            name: "Pages",
            dropdown: [
                { name: "About Us", path: "/about" },
                { name: "Shop Details", path: "/productDetails" },
                { name: "Shopping Cart", path: "/cart" },
                { name: "Check Out", path: "/checkout" },
                { name: "Blog Details", path: "/blog-details" },
            ],
        },
        { name: "Blog", path: "/blog" },
        { name: "Contacts", path: "/contact" },
        // { name: "Login", path: "./Login" },
        // { name: "Register", path: "./Register" },
    ];

    return (
        <header className="header">
            {/* Top Bar */}
            <div className="header__top">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-7">
                            <div className="header__top__left">
                                <p>Free shipping, 30-day return or refund guarantee.</p>
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-5">
                            <div className="header__top__right">
                                <div className="header__top__links">
                                    <Link to="/Login">Sign in</Link>
                                    <Link to="/dashboard">
                                        <i className="fa fa-user"></i>
                                    </Link>
                                </div>

                                <div className="header__top__hover">
                                    <span>
                                        {currency} <i className="arrow_carrot-down"></i>
                                    </span>

                                    <ul>
                                        {["Ruppe", "USD", "GBP"].map((cur) => (
                                            <li key={cur} onClick={() => setCurrency(cur)}>
                                                {cur}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Header */}
            <div className="container">
                <div className="row">

                    {/* Logo */}
                    <div className="col-lg-3 col-md-3">
                        <div className="header__logo">
                            <Link to="/">
                                <img src={logo} alt="logo" />
                            </Link>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="col-lg-6 col-md-6">
                        <nav className="header__menu mobile-menu">
                            <ul>
                                {menuItems.map((item, i) =>
                                    item.dropdown ? (
                                        <li key={i}>
                                            <a href="#">{item.name}</a>
                                            <ul className="dropdown">
                                                {item.dropdown.map((sub, j) => (
                                                    <li key={j}>
                                                        <NavLink to={sub.path}>{sub.name}</NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ) : (
                                        <li key={i}>
                                            <NavLink to={item.path}>{item.name}</NavLink>
                                        </li>
                                    )
                                )}
                            </ul>
                        </nav>
                    </div>

                    {/* Icons */}
                    <div className="col-lg-3 col-md-3">
                        <div className="header__nav__option">
                            {/* <a className="search-switch">
                                <img src={searchIcon} alt="search" />
                            </a> */}

                            <Link to="/wishlist">
                                <img src={heartIcon} alt="heart" />
                            </Link>

                            <Link to="/cart">
                                <img src={cartIcon} alt="cart" />
                                <span>{cartCount}</span>
                            </Link>

                            {/* <div className="price">{cartTotal.toFixed(2)}</div> */}
                        </div>
                    </div>
                </div>

                <div className="canvas__open">
                    <i className="fa fa-bars"></i>
                </div>
            </div>
        </header>
    );
};

export default Header;