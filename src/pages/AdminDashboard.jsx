import React, { useEffect, useState } from "react";
// import api from "api";
import api from "../api";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/admin/PageHeader";
import Sidebar from "../components/admin/Sidebar";
import DashboardPage from "../components/admin/DashboardPage";
import ProductsPage from "../components/admin/ProductsPage";
import UsersPage from "../components/admin/UsersPage";
import CollectionsPage from "../components/admin/CollectionsPage"
import OrdersPage from "../components/admin/OrdersPage";
import BlogPage from "../components/admin/BlogPage";
import AdminMessages from "../components/admin/AdminMessages";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        api.get("/api/messages")
            .then(res => setUnreadCount(res.data.filter(m => m.status === "unread").length))
            .catch(() => { });
    }, []);
    const token = localStorage.getItem("token");

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/api/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Fetch products error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const sharedProps = {
        toggleSidebar,
        sidebarOpen,
    };

    const renderPage = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardPage {...sharedProps} />;
            case "products": return <ProductsPage products={products} fetchProducts={fetchProducts} token={token} {...sharedProps} />;
            case "collections": return <CollectionsPage products={products} {...sharedProps} />
            case "orders": return <OrdersPage token={token} {...sharedProps} />
            case "users": return <UsersPage token={token} {...sharedProps} />
            case "blogs": return <BlogPage token={token} {...sharedProps} />
            case "messages": return <AdminMessages token={token} {...sharedProps} />;
            default: return <DashboardPage {...sharedProps} />;
        }
    };

    return (
        <div className={`admin ${sidebarOpen ? "sidebar-open" : ""}`}>
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
                unreadCount={unreadCount}
            />

            <div className="admin__content">{renderPage()}</div>
        </div>
    );
};

export default AdminDashboard;