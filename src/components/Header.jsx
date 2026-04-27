import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

import logo from "../assets/img/logo1.png";
import searchIcon from "../assets/img/icon/search.png";
import heartIcon from "../assets/img/icon/heart.png";
import cartIcon from "../assets/img/icon/cart.png";

const Header = ({ cartCount = 0 }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [tabletDropdownOpen, setTabletDropdownOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMenuOpen(false);
        setDropdownOpen(false);
        setTabletDropdownOpen(false);
    }, [location]);

    const navItems = [
        { path: "/about", label: "About Us" },
        { path: "/cart", label: "Shopping Cart" },
        { path: "/checkout", label: "Check Out" },
        { path: "/wishlist", label: "Favourites" },
    ];

    return (
        <>
            <style>{`
                @keyframes glassIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.97); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
                .glass-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 14px;
                    border-radius: 10px;
                    text-decoration: none;
                    color: #1a1a1a;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.15s, color 0.15s;
                    position: relative;
                }
                .glass-item:hover {
                    background: rgba(255, 255, 255, 0.55);
                    color: #e53935;
                }
                .glass-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 14px; right: 14px;
                    height: 0.5px;
                    background: rgba(0, 0, 0, 0.07);
                }
                .glass-dot {
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.2);
                    flex-shrink: 0;
                    transition: background 0.15s;
                }
                .glass-item:hover .glass-dot {
                    background: #e53935;
                }
            `}</style>

            {/* ===== MOBILE OVERLAY ===== */}
            <div
                className={`offcanvas-menu-overlay ${menuOpen ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
            ></div>

            {/* ===== MOBILE MENU ===== */}
            <div className={`offcanvas-menu-wrapper ${menuOpen ? "active" : ""}`}>
                <div
                    className="offcanvas__close"
                    onClick={() => setMenuOpen(false)}
                    style={{
                        fontSize: "30px", color: "#111", cursor: "pointer",
                        textAlign: "right", marginBottom: "20px", lineHeight: "0"
                    }}
                >×</div>
                <ul className="mobile-menu">
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/shop">Shop</NavLink></li>
                    <li><NavLink to="/collection">Collections</NavLink></li>
                    <li style={{ textAlign: "left" }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                            style={{
                                padding: "10px 0", color: "#000", cursor: "pointer",
                                fontWeight: "600", display: "flex", alignItems: "center", gap: "8px"
                            }}
                        >
                            Pages
                            <span style={{
                                fontSize: "10px", transition: "transform 0.3s",
                                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                            }}>▼</span>
                        </div>
                        <ul
                            className="dropdown"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                listStyle: "none", margin: 0, padding: 0,
                                maxHeight: dropdownOpen ? "300px" : "0",
                                opacity: dropdownOpen ? "1" : "0",
                                transform: dropdownOpen ? "translateX(0)" : "translateX(100%)",
                                transition: "all 0.3s ease-in-out",
                                display: "block"
                            }}
                        >
                            {navItems.map((item, index) => (
                                <li key={index} style={{ marginBottom: 0 }}>
                                    <Link
                                        to={item.path}
                                        style={{ display: "block", padding: "10px 15px", color: "#333", textDecoration: "none" }}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li><Link to="/blog">Blog</Link></li>
                    <li><Link to="/contact">Contacts</Link></li>
                </ul>
            </div>

            {/* ===== HEADER ===== */}
            <header className="header">

                {/* TOP BAR */}
                <div className="header__top">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="header__top__left">
                                    <p>Free shipping, 30-day return or refund guarantee.</p>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-12 text-end">
                                <div className="header__top__right">
                                    <div className="header__top__links">
                                        <Link to="/login">Sign in</Link>
                                        <Link to="/faq">FAQs</Link>
                                        <div
                                            className="canvas__open d-lg-none"
                                            onClick={() => setMenuOpen(true)}
                                            style={{ cursor: "pointer", fontSize: "20px", background: "#f5f5f5", padding: "2px 4px", borderRadius: "2px" }}
                                        >☰</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN HEADER */}
                <div className="container">
                    <div className="row align-items-center">

                        {/* LOGO */}
                        <div className="col-lg-3 col-md-3 col-6">
                            <div className="header__logo">
                                <Link to="/"><img src={logo} alt="ShopVista" /></Link>
                            </div>
                        </div>

                        {/* NAV MENU — desktop only */}
                        <div className="col-lg-6 col-md-6 d-none d-lg-block">
                            <nav className="header__menu">
                                <ul>
                                    <li><NavLink to="/">Home</NavLink></li>
                                    <li><NavLink to="/shop">Shop</NavLink></li>
                                    <li><NavLink to="/collection">Collections</NavLink></li>

                                    {/* Pages dropdown */}
                                    <li style={{ position: "relative" }}>
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTabletDropdownOpen((prev) => !prev);
                                            }}
                                            style={{
                                                cursor: "pointer", display: "flex",
                                                alignItems: "center", gap: "6px",
                                            }}
                                        >
                                            <span>Pages</span>
                                            <span style={{
                                                fontSize: "12px",
                                                transition: "transform 0.3s ease",
                                                transform: tabletDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                display: "inline-block",
                                            }}>▼</span>
                                        </span>

                                        {tabletDropdownOpen && (
                                            <div style={{
                                                position: "absolute",
                                                top: "calc(100% + 16px)",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                width: "185px",
                                                background: "rgba(255, 255, 255, 0.28)",
                                                backdropFilter: "blur(18px) saturate(200%)",
                                                WebkitBackdropFilter: "blur(18px) saturate(200%)",
                                                border: "1px solid rgba(255, 255, 255, 0.55)",
                                                borderRadius: "16px",
                                                padding: "8px",
                                                zIndex: 999,
                                                boxShadow: "0 8px 32px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.65)",
                                                animation: "glassIn 0.22s cubic-bezier(.22,.68,0,1.15) both",
                                            }}>
                                                {/* tip arrow */}
                                                <span style={{
                                                    position: "absolute", top: "-6px", left: "50%",
                                                    transform: "translateX(-50%) rotate(45deg)",
                                                    width: "11px", height: "11px",
                                                    background: "rgba(255,255,255,0.45)",
                                                    borderTop: "1px solid rgba(255,255,255,0.6)",
                                                    borderLeft: "1px solid rgba(255,255,255,0.6)",
                                                }} />

                                                {navItems.map((item, index) => (
                                                    <Link
                                                        key={index}
                                                        to={item.path}
                                                        className="glass-item"
                                                        onClick={() => setTabletDropdownOpen(false)}
                                                    >
                                                        <span className="glass-dot" />
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </li>

                                    <li><NavLink to="/blog">Blog</NavLink></li>
                                    <li><NavLink to="/contact">Contacts</NavLink></li>
                                </ul>
                            </nav>
                        </div>

                        {/* RIGHT ICONS */}
                        <div className="col-lg-3 col-md-9 col-6 d-flex justify-content-end align-items-center">
                            <div className="header__nav__option">
                                {localStorage.getItem("token") && (
                                    <Link to="/dashboard" className="dashboard__icon">
                                        <i className="fa fa-user"></i>
                                    </Link>
                                )}
                                <img src={searchIcon} alt="" />
                                <Link to="/wishlist">
                                    <img src={heartIcon} alt="" />
                                </Link>
                                <Link to="/cart">
                                    <img src={cartIcon} alt="" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

            </header>
        </>
    );
};

export default Header;
// import React, { useState, useEffect } from "react";
// import { Link, NavLink } from "react-router-dom";
// import { useLocation } from "react-router-dom";

// import logo from "../assets/img/logo1.png";
// import searchIcon from "../assets/img/icon/search.png";
// import heartIcon from "../assets/img/icon/heart.png";
// import cartIcon from "../assets/img/icon/cart.png";

// const Header = ({ cartCount = 0 }) => {
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const [tabletDropdownOpen, setTabletDropdownOpen] = useState(false);
//     const location = useLocation();

//     useEffect(() => {
//         setMenuOpen(false);
//         setDropdownOpen(false);
//         setTabletDropdownOpen(false);
//     }, [location]);

//     return (
//         <>
//             {/* ===== MOBILE OVERLAY ===== */}
//             <div
//                 className={`offcanvas-menu-overlay ${menuOpen ? "active" : ""}`}
//                 onClick={() => setMenuOpen(false)}
//             ></div>

//             {/* ===== MOBILE MENU ===== */}
//             <div className={`offcanvas-menu-wrapper ${menuOpen ? "active" : ""}`}>
//                 <div
//                     className="offcanvas__close"
//                     onClick={() => setMenuOpen(false)}
//                     style={{
//                         fontSize: "30px",
//                         color: "#111",
//                         cursor: "pointer",
//                         textAlign: "right",
//                         marginBottom: "20px",
//                         lineHeight: "0"
//                     }}
//                 >
//                     ×
//                 </div>
//                 <ul className="mobile-menu">
//                     <li><NavLink to="/">Home</NavLink></li>
//                     <li><NavLink to="/shop">Shop</NavLink></li>
//                     <li><NavLink to="/collection">Collections</NavLink></li>
//                     <li style={{ textAlign: "left" }}>
//                         <div
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 setDropdownOpen(!dropdownOpen);
//                             }}
//                             style={{
//                                 padding: "10px 0",
//                                 color: "#000",
//                                 cursor: "pointer",
//                                 fontWeight: "600",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: "8px"
//                             }}
//                         >
//                             Pages
//                             <span style={{
//                                 fontSize: "10px",
//                                 transition: "transform 0.3s",
//                                 transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
//                             }}>▼</span>
//                         </div>
//                         <ul
//                             className="dropdown"
//                             onClick={(e) => e.stopPropagation()}
//                             style={{
//                                 listStyle: "none",
//                                 margin: 0,
//                                 padding: 0,
//                                 maxHeight: dropdownOpen ? "300px" : "0",
//                                 opacity: dropdownOpen ? "1" : "0",
//                                 transform: dropdownOpen ? "translateX(0)" : "translateX(100%)",
//                                 transition: "all 0.3s ease-in-out",
//                                 display: "block"
//                             }}
//                         >
//                             {[
//                                 { path: "/about", label: "About Us" },
//                                 { path: "/cart", label: "Shopping Cart" },
//                                 { path: "/checkout", label: "Check Out" },
//                                 { path: "/blog-details", label: "Blog Details" },
//                             ].map((item, index) => (
//                                 <li key={index} style={{ marginBottom: 0 }}>
//                                     <Link
//                                         to={item.path}
//                                         style={{
//                                             display: "block",
//                                             padding: "10px 15px",
//                                             color: "#333",
//                                             textDecoration: "none"
//                                         }}
//                                     >
//                                         {item.label}
//                                     </Link>
//                                 </li>
//                             ))}
//                         </ul>
//                     </li>
//                     <li><Link to="/blog">Blog</Link></li>
//                     <li><Link to="/contact">Contacts</Link></li>
//                 </ul>
//             </div>

//             {/* ===== HEADER ===== */}
//             <header className="header">

//                 {/* TOP BAR */}
//                 <div className="header__top">
//                     <div className="container">
//                         <div className="row align-items-center">
//                             <div className="col-lg-6 col-md-6 col-12">
//                                 <div className="header__top__left">
//                                     <p>Free shipping, 30-day return or refund guarantee.</p>
//                                 </div>
//                             </div>
//                             <div className="col-lg-6 col-md-6 col-12 text-end">
//                                 <div className="header__top__right">
//                                     <div className="header__top__links">
//                                         <Link to="/login">Sign in</Link>
//                                         <Link to="/faq">FAQs</Link>
//                                         <div
//                                             className="canvas__open d-lg-none"
//                                             onClick={() => setMenuOpen(true)}
//                                             style={{ cursor: "pointer", fontSize: "20px", background: "#f5f5f5", padding: "2px 4px", borderRadius: "2px" }}
//                                         >
//                                             ☰
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* MAIN HEADER */}
//                 <div className="container">
//                     <div className="row align-items-center">

//                         {/* LOGO */}
//                         <div className="col-lg-3 col-md-3 col-6">
//                             <div className="header__logo">
//                                 <Link to="/">
//                                     <img src={logo} alt="ShopVista" />
//                                 </Link>
//                             </div>
//                         </div>

//                         {/* NAV MENU — desktop only */}
//                         <div className="col-lg-6 col-md-6 d-none d-lg-block">
//                             <nav className="header__menu">
//                                 <ul>
//                                     <li><NavLink to="/">Home</NavLink></li>
//                                     <li><NavLink to="/shop">Shop</NavLink></li>
//                                     <li><NavLink to="/collection">Collections</NavLink></li>

//                                     {/* Pages dropdown */}
//                                     <li
//                                         className={`has-dropdown ${tabletDropdownOpen ? "open" : ""}`}
//                                         style={{ position: "relative" }}
//                                     >
//                                         <span
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setTabletDropdownOpen((prev) => !prev);
//                                             }}
//                                             style={{
//                                                 cursor: "pointer",
//                                                 display: "flex",
//                                                 alignItems: "center",
//                                                 gap: "6px",
//                                             }}
//                                         >
//                                             <span>Pages</span>
//                                             <span
//                                                 style={{
//                                                     fontSize: "12px",
//                                                     transition: "transform 0.3s ease",
//                                                     transform: tabletDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
//                                                     display: "inline-block",
//                                                 }}
//                                             >▼</span>
//                                         </span>

//                                         {tabletDropdownOpen && (
//                                             <ul
//                                                 style={{
//                                                     position: "absolute",
//                                                     top: "calc(100% + 10px)",
//                                                     left: "50%",
//                                                     transform: "translateX(-50%)",
//                                                     zIndex: 999,
//                                                     display: "flex",
//                                                     flexDirection: "column",
//                                                     width: "160px",
//                                                     backgroundColor: "#fff",
//                                                     boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
//                                                     borderRadius: "10px",
//                                                     padding: "8px 0",
//                                                     listStyle: "none",
//                                                     margin: 0,
//                                                     border: "1px solid #f0f0f0",
//                                                     animation: "dropdownFade 0.22s ease",
//                                                 }}
//                                             >
//                                                 {/* Arrow pointer */}
//                                                 <span style={{
//                                                     position: "absolute",
//                                                     top: "-6px",
//                                                     left: "50%",
//                                                     transform: "translateX(-50%)",
//                                                     width: "12px",
//                                                     height: "12px",
//                                                     background: "#fff",
//                                                     border: "1px solid #f0f0f0",
//                                                     borderRight: "none",
//                                                     borderBottom: "none",
//                                                     rotate: "45deg",
//                                                 }} />

//                                                 {[
//                                                     { path: "/about", label: "About Us" },
//                                                     { path: "/cart", label: "Shopping Cart" },
//                                                     { path: "/checkout", label: "Check Out" },
//                                                     { path: "/blog-details", label: "Blog Details" },
//                                                 ].map((item, index) => (
//                                                     <li key={index} style={{ margin: "0 8px" }}>
//                                                         <Link
//                                                             to={item.path}
//                                                             onClick={() => setTabletDropdownOpen(false)}
//                                                             style={{
//                                                                 display: "block",
//                                                                 padding: "10px 14px",
//                                                                 color: "#333",
//                                                                 textDecoration: "none",
//                                                                 whiteSpace: "nowrap",
//                                                                 borderRadius: "7px",
//                                                                 fontSize: "14px",
//                                                                 fontWeight: "500",
//                                                                 transition: "background 0.18s, color 0.18s, padding-left 0.18s",
//                                                             }}
//                                                             onMouseEnter={e => {
//                                                                 e.currentTarget.style.background = "#f7f7f7";
//                                                                 e.currentTarget.style.color = "#e53935";
//                                                                 e.currentTarget.style.paddingLeft = "20px";
//                                                             }}
//                                                             onMouseLeave={e => {
//                                                                 e.currentTarget.style.background = "transparent";
//                                                                 e.currentTarget.style.color = "#333";
//                                                                 e.currentTarget.style.paddingLeft = "14px";
//                                                             }}
//                                                         >
//                                                             {item.label}
//                                                         </Link>
//                                                     </li>
//                                                 ))}

//                                                 <style>{`
//                                                     @keyframes dropdownFade {
//                                                         from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
//                                                         to   { opacity: 1; transform: translateX(-50%) translateY(0); }
//                                                     }
//                                                 `}</style>
//                                             </ul>
//                                         )}
//                                     </li>

//                                     <li><NavLink to="/blog">Blog</NavLink></li>
//                                     <li><NavLink to="/contact">Contacts</NavLink></li>
//                                 </ul>
//                             </nav>
//                         </div>

//                         {/* RIGHT ICONS */}
//                         <div className="col-lg-3 col-md-9 col-6 d-flex justify-content-end align-items-center">
//                             <div className="header__nav__option">
//                                 {localStorage.getItem("token") && (
//                                     <Link to="/dashboard" className="dashboard__icon">
//                                         <i className="fa fa-user"></i>
//                                     </Link>
//                                 )}
//                                 <img src={searchIcon} alt="" />
//                                 <Link to="/wishlist">
//                                     <img src={heartIcon} alt="" />
//                                 </Link>
//                                 <Link to="/cart">
//                                     <img src={cartIcon} alt="" />
//                                 </Link>
//                             </div>
//                         </div>

//                     </div>
//                 </div>

//             </header>
//         </>
//     );
// };

// export default Header;