import React from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "products", icon: "📦", label: "Products" },
    { key: "collections", icon: "📚", label: "Collections" },
    { key: "orders", icon: "🛒", label: "Orders" },
    { key: "users", icon: "👥", label: "Users" },
    { key: "blogs", icon: "✍️", label: "Blogs" }
];

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, handleLogout }) => {
    const navigate = useNavigate();

    return (
        <aside className={`admin__sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar__top">
                <div
                    className="brand"
                    onClick={() => navigate("/")}
                    style={{ cursor: "pointer" }}
                    title="Go to home"
                >
                    <div className="logo-box">👑</div>
                    <div>
                        <h3>ShopVista</h3>
                        <p>Admin Panel</p>
                    </div>
                </div>

                <button
                    className="sidebar-close-btn"
                    onClick={() => setSidebarOpen(false)}
                >
                    ✕
                </button>
            </div>

            <ul className="sidebar__menu">
                {NAV_ITEMS.map((item) => (
                    <li
                        key={item.key}
                        className={activeTab === item.key ? "active" : ""}
                        onClick={() => {
                            setActiveTab(item.key);
                            setSidebarOpen(false);
                        }}
                    >
                        {item.icon} {item.label}
                    </li>
                ))}
            </ul>

            <button className="logout-btn" onClick={handleLogout}>
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;
