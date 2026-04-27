import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const PageHeader = ({ title, subtitle, toggleSidebar, sidebarOpen, children }) => (
    <div className="page__header">
        <button className={`menu-btn ${sidebarOpen ? "menu-btn--hidden" : ""}`} onClick={toggleSidebar} aria-label="Open sidebar">☰</button>
        <div className="header-text">
            <h2>{title}</h2>
            {subtitle && <p className="page__subtitle">{subtitle}</p>}
        </div>
        {children && <div className="header-actions">{children}</div>}
    </div>
);

export default PageHeader;