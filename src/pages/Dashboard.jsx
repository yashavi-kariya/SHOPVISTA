import React, { useEffect, useState } from "react";
// import api from "api";
import api from "../api";
import { useNavigate } from "react-router-dom";

const statusColors = {
    delivered: { bg: "#d1fae5", text: "#065f46" },
    processing: { bg: "#fef3c7", text: "#92400e" },
    shipped: { bg: "#dbeafe", text: "#1e40af" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
    pending: { bg: "#ede9fe", text: "#5b21b6" },
};

const statusIcons = {
    delivered: "✓",
    processing: "⏳",
    shipped: "🚚",
    cancelled: "✕",
    pending: "◷",
};

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("orders");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const headers = { Authorization: `Bearer ${token}` };

        api.get("/api/users/profile", { headers })
            .then((res) => {
                const userData = res.data;
                setUser(userData);
                // ✅ Admin → redirect immediately
                if (userData.role === "admin") { navigate("/admin-dashboard"); return; }
                return api.get("/api/orders", { headers });
            })
            .then((res) => { if (res) setOrders(res.data); })
            .catch(() => setError("Something went wrong. Please try again."))
            .finally(() => setLoading(false));
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;

    if (loading) {
        return (
            <div className="db-loader">
                <div className="db-loader__ring" />
                <p>Loading your dashboard…</p>
            </div>
        );
    }

    return (
        <div className="db">

            {/* ── TOP NAV BAR ── */}
            <nav className="db-nav">
                <div className="db-nav__inner">
                    {/* User info */}
                    <div className="db-nav__user">
                        <div className="db-nav__avatar">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="db-nav__user-text">
                            <p className="db-nav__name">{user.name || "User"}</p>
                            <p className="db-nav__email">{user.email || ""}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="db-nav__tabs">
                        {[
                            { id: "orders", label: "My Orders" },
                            { id: "profile", label: "Profile" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                className={`db-nav__tab ${activeTab === t.id ? "active" : ""}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <button className="db-nav__logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── PAGE BODY ── */}
            <div className="db-body">

                {error && <div className="db-error">⚠ {error}</div>}

                {/* Greeting */}
                <div className="db-greeting">
                    <h1 className="db-greeting__title">
                        Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋
                    </h1>
                    <p className="db-greeting__sub">Here's what's happening with your orders</p>
                </div>

                {/* Stats */}
                <div className="db-stats">
                    {[
                        { label: "Total Orders", value: orders.length },
                        { label: "Delivered", value: deliveredCount },
                        { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}` },
                    ].map((s, i) => (
                        <div key={s.label} className="db-stat" style={{ animationDelay: `${i * 80}ms` }}>
                            <p className="db-stat__label">{s.label}</p>
                            <p className="db-stat__value">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── ORDERS TAB ── */}
                {activeTab === "orders" && (
                    <section className="db-section">
                        <h2 className="db-section__title">My Orders</h2>

                        {orders.length === 0 ? (
                            <div className="db-empty">
                                <span>📭</span>
                                <p>No orders yet. Start shopping!</p>
                            </div>
                        ) : (
                            orders.map((order, i) => {
                                const key = order.status?.toLowerCase();
                                const color = statusColors[key] || { bg: "#f3f4f6", text: "#374151" };
                                const icon = statusIcons[key] || "•";
                                const isOpen = expandedOrder === order._id;

                                return (
                                    <div
                                        key={order._id}
                                        className="db-order"
                                        style={{ animationDelay: `${i * 60}ms` }}
                                    >
                                        <div
                                            className="db-order__row"
                                            onClick={() => setExpandedOrder(isOpen ? null : order._id)}
                                        >
                                            <div className="db-order__left">
                                                <span
                                                    className="db-order__badge"
                                                    style={{ background: color.bg, color: color.text }}
                                                >
                                                    {icon} {order.status}
                                                </span>
                                                <span className="db-order__id">
                                                    #{order._id?.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="db-order__right">
                                                <span className="db-order__amount">
                                                    ₹{order.totalAmount?.toLocaleString("en-IN")}
                                                </span>
                                                <span className={`db-order__arrow ${isOpen ? "open" : ""}`}>›</span>
                                            </div>
                                        </div>

                                        {/* Accordion body */}
                                        <div className={`db-order__body ${isOpen ? "db-order__body--open" : ""}`}>
                                            {order.items?.length > 0 ? (
                                                <div className="db-items">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="db-item">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="db-item__img" />
                                                            )}
                                                            <div className="db-item__info">
                                                                <p className="db-item__name">{item.name}</p>
                                                                <p className="db-item__meta">
                                                                    Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each
                                                                </p>
                                                            </div>
                                                            <p className="db-item__total">
                                                                ₹{(item.quantity * item.price)?.toLocaleString("en-IN")}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="db-no-items">No item details available.</p>
                                            )}

                                            <div className="db-order__footer">
                                                {order.createdAt && (
                                                    <span>
                                                        📅 {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                            day: "numeric", month: "short", year: "numeric",
                                                        })}
                                                    </span>
                                                )}
                                                {order.address && <span>📍 {order.address}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                    <section className="db-section">
                        <h2 className="db-section__title">My Profile</h2>
                        <div className="db-profile">
                            <div className="db-profile__avatar">
                                {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <div className="db-profile__grid">
                                {[
                                    ["Full Name", user.name],
                                    ["Email", user.email],
                                    ["Phone", user.phone],
                                    ["Member Since", user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                                        : null],
                                ].map(([label, val]) => (
                                    <div key={label} className="db-profile__field">
                                        <label>{label}</label>
                                        <p>{val || "—"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </div>{/* /db-body */}
        </div>
    );
};

export default Dashboard;
// import React, { useEffect, useState } from "react";
// import api from "api";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//     const [orders, setOrders] = useState([]);
//     const [user, setUser] = useState({});
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem("token");

//         if (!token) {
//             navigate("/login");
//             return;
//         }
//         const headers = { Authorization: `Bearer ${token}` };
//         // GET ORDERS
//         api.get("/api/orders", { headers })
//             .then(res => setOrders(res.data))
//             .catch(() => setError("Failed to load orders."));

//         // GET USER PROFILE
//         api.get("/api/users/profile", { headers })
//             .then(res => setUser(res.data))
//             .catch(() => setError("Failed to load profile."));

//     }, [navigate]); //  added navigate to deps

//     const logout = () => {
//         localStorage.removeItem("token");
//         navigate("/login"); //  use navigate instead of window.location
//     };

//     return (
//         <div className="dashboard container">
//             <h2 className="dashboard__title">
//                 Welcome, {user.name} 👋
//             </h2>

//             {error && <p className="text-danger">{error}</p>} {/*  show errors */}

//             {/* SHOW ONLY WHEN ADMIN IS LOGGED IN */}
//             {user.role === "admin" && (
//                 <button
//                     className="btn btn-primary mb-3"
//                     onClick={() => navigate("/admin")} //  consistent route
//                 >
//                     Go to Admin Dashboard
//                 </button>
//             )}

//             <div className="row dashboard__wrapper">

//                 {/* LEFT MENU */}
//                 <div className="col-lg-3 col-md-4 dashboard__sidebar">
//                     <div className="list-group">

//                         <button className="list-group-item active">
//                             {user.role === "admin" ? "All Orders" : "My Orders"} {/* ✅ fixed label */}
//                         </button>

//                         <button
//                             className="list-group-item"
//                             onClick={logout}
//                         >
//                             Logout
//                         </button>

//                     </div>
//                 </div>

//                 {/* RIGHT CONTENT */}
//                 <div className="col-lg-9 col-md-8 dashboard__content">
//                     <h4>{user.role === "admin" ? "All Orders" : "My Orders"}</h4> {/* ✅ dynamic heading */}

//                     {orders.length === 0 ? (
//                         <p>No orders yet</p>
//                     ) : (
//                         orders.map(order => (
//                             <div key={order._id} className="dashboard__card">
//                                 <p><strong>Order ID:</strong> {order._id}</p>
//                                 <p><strong>Status:</strong> {order.status}</p>
//                                 <p><strong>Total:</strong> ₹{order.totalAmount}</p>
//                             </div>
//                         ))
//                     )}
//                 </div>

//             </div>
//         </div>
//     );
// };
// export default Dashboard;

// import React, { useEffect, useState } from "react";
// import api from "api";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//     const [orders, setOrders] = useState([]);
//     const [user, setUser] = useState({});
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem("token");

//         if (!token) {
//             navigate("/login");
//             return;
//         }

//         // GET ORDERS
//         api.get("/api/orders", {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         })
//             .then(res => setOrders(res.data))
//             .catch(err => console.log(err));

//         // GET USER PROFILE
//         api.get("/api/users/profile", {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         })
//             .then(res => setUser(res.data))
//             .catch(err => console.log(err));

//     }, []);

//     const logout = () => {
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//     };

//     const openAdminDashboard = () => {
//         window.location.href = "/admin";
//     };

//     return (
//         <div className="dashboard container">
//             <h2 className="dashboard__title">
//                 Welcome, {user.name} 👋
//             </h2>

//             {/* SHOW ONLY WHEN ADMIN LOGIN */}
//             {user.role === "admin" && (
//                 <button
//                     className="btn btn-primary mb-3"
//                     onClick={() => navigate("/admin-dashboard")}
//                 >
//                     Admin Dashboard
//                 </button>
//             )}

//             <div className="row dashboard__wrapper">

//                 {/* LEFT MENU */}
//                 <div className="col-lg-3 col-md-4 dashboard__sidebar">
//                     <div className="list-group">

//                         <button className="list-group-item active">
//                             {user.role === "admin" ? "orders" : "My Orders"}
//                         </button>

//                         <button
//                             className="list-group-item"
//                             onClick={logout}
//                         >
//                             Logout
//                         </button>

//                     </div>
//                 </div>

//                 {/* RIGHT CONTENT */}
//                 <div className="col-lg-9 col-md-8 dashboard__content">
//                     <h4>My Orders</h4>

//                     {orders.length === 0 ? (
//                         <p>No orders yet</p>
//                     ) : (
//                         orders.map(order => (
//                             <div
//                                 key={order._id}
//                                 className="dashboard__card"
//                             >
//                                 <p>
//                                     <strong>Order ID:</strong> {order._id}
//                                 </p>

//                                 <p>
//                                     <strong>Status:</strong> {order.status}
//                                 </p>

//                                 <p>
//                                     <strong>Total:</strong> ₹
//                                     {order.totalAmount}
//                                 </p>
//                             </div>
//                         ))
//                     )}
//                 </div>

//             </div>
//         </div>
//     );
// };
// export default Dashboard;
