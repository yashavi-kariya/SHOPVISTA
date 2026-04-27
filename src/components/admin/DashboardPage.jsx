import React, { useEffect, useState } from "react";
// import api from "api";
import api from "../../api";
import PageHeader from "./PageHeader";

const DashboardPage = ({ toggleSidebar, sidebarOpen }) => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await api.get(
                    "/api/admin/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setStats(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="page">
            <PageHeader
                title="Admin Dashboard"
                subtitle="Overview of your store performance"
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            <div className="stats-grid">
                <div className="stat-card">Total Products: {stats.totalProducts}</div>
                <div className="stat-card">Total Orders: {stats.totalOrders}</div>
                <div className="stat-card">Total Users: {stats.totalUsers}</div>
                <div className="stat-card">Revenue: ₹{stats.revenue}</div>
            </div>
        </div>
    );
};

export default DashboardPage;