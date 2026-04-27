// import React, { useEffect, useState } from "react";
// // import api from "api";
// import api from "../api";
// import { useNavigate } from "react-router-dom";

// const statusColors = {
//     delivered: { bg: "#d1fae5", text: "#065f46" },
//     processing: { bg: "#fef3c7", text: "#92400e" },
//     shipped: { bg: "#dbeafe", text: "#1e40af" },
//     cancelled: { bg: "#fee2e2", text: "#991b1b" },
//     pending: { bg: "#ede9fe", text: "#ac93d5" },
// };

// const statusIcons = {
//     delivered: "✓",
//     processing: "⏳",
//     shipped: "🚚",
//     cancelled: "✕",
//     pending: "◷",
// };

// const Dashboard = () => {
//     const [orders, setOrders] = useState([]);
//     const [user, setUser] = useState({});
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [expandedOrder, setExpandedOrder] = useState(null);
//     const [activeTab, setActiveTab] = useState("orders");
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (!token) { navigate("/login"); return; }

//         const headers = { Authorization: `Bearer ${token}` };

//         api.get("/api/users/profile", { headers })
//             .then((res) => {
//                 const userData = res.data;
//                 setUser(userData);

//                 if (userData.role === "admin") { navigate("/admin-dashboard"); return; }
//                 return api.get("/api/orders", { headers });
//             })
//             .then((res) => { if (res) setOrders(res.data); })
//             .catch(() => setError("Something went wrong. Please try again."))
//             .finally(() => setLoading(false));
//     }, [navigate]);

//     const logout = () => {
//         localStorage.removeItem("token");
//         navigate("/login");
//     };

//     const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
//     const deliveredCount = orders.filter((o) => o.status === "delivered").length;

//     if (loading) {
//         return (
//             <div className="db-loader">
//                 <div className="db-loader__ring" />
//                 <p>Loading your dashboard…</p>
//             </div>
//         );
//     }

//     return (
//         <div className="db">

//             {/* ── TOP NAV BAR ── */}
//             <nav className="db-nav">
//                 <div className="db-nav__inner">
//                     {/* User info */}
//                     <div className="db-nav__user">
//                         <div className="db-nav__avatar">
//                             {user.name ? user.name[0].toUpperCase() : "U"}
//                         </div>
//                         <div className="db-nav__user-text">
//                             <p className="db-nav__name">{user.name || "User"}</p>
//                             <p className="db-nav__email">{user.email || ""}</p>
//                         </div>
//                     </div>

//                     {/* Tabs */}
//                     <div className="db-nav__tabs">
//                         {[
//                             { id: "orders", label: "My Orders" },
//                             { id: "profile", label: "Profile" },
//                         ].map((t) => (
//                             <button
//                                 key={t.id}
//                                 className={`db-nav__tab ${activeTab === t.id ? "active" : ""}`}
//                                 onClick={() => setActiveTab(t.id)}
//                             >
//                                 {t.label}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Logout */}
//                     <button className="db-nav__logout" onClick={logout}>
//                         Logout
//                     </button>
//                 </div>
//             </nav>

//             {/* ── PAGE BODY ── */}
//             <div className="db-body">

//                 {error && <div className="db-error">⚠ {error}</div>}

//                 {/* Greeting */}
//                 <div className="db-greeting">
//                     <h1 className="db-greeting__title">
//                         Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋
//                     </h1>
//                     <p className="db-greeting__sub">Here's what's happening with your orders</p>
//                 </div>

//                 {/* Stats */}
//                 <div className="db-stats">
//                     {[
//                         { label: "Total Orders", value: orders.length },
//                         { label: "Delivered", value: deliveredCount },
//                         { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}` },
//                     ].map((s, i) => (
//                         <div key={s.label} className="db-stat" style={{ animationDelay: `${i * 80}ms` }}>
//                             <p className="db-stat__label">{s.label}</p>
//                             <p className="db-stat__value">{s.value}</p>
//                         </div>
//                     ))}
//                 </div>

//                 {/* ── ORDERS TAB ── */}
//                 {activeTab === "orders" && (
//                     <section className="db-section">
//                         <h2 className="db-section__title">My Orders</h2>

//                         {orders.length === 0 ? (
//                             <div className="db-empty">
//                                 <span>📭</span>
//                                 <p>No orders yet. Start shopping!</p>
//                             </div>
//                         ) : (
//                             orders.map((order, i) => {
//                                 const key = order.status?.toLowerCase();
//                                 const color = statusColors[key] || { bg: "#f3f4f6", text: "#374151" };
//                                 const icon = statusIcons[key] || "•";
//                                 const isOpen = expandedOrder === order._id;

//                                 return (
//                                     <div
//                                         key={order._id}
//                                         className="db-order"
//                                         style={{ animationDelay: `${i * 60}ms` }}
//                                     >
//                                         <div
//                                             className="db-order__row"
//                                             onClick={() => setExpandedOrder(isOpen ? null : order._id)}
//                                         >
//                                             <div className="db-order__left">
//                                                 <span
//                                                     className="db-order__badge"
//                                                     style={{ background: color.bg, color: color.text }}
//                                                 >
//                                                     {icon} {order.status}
//                                                 </span>
//                                                 <span className="db-order__id">
//                                                     #{order._id?.slice(-6).toUpperCase()}
//                                                 </span>
//                                             </div>
//                                             <div className="db-order__right">
//                                                 <span className="db-order__amount">
//                                                     ₹{order.totalAmount?.toLocaleString("en-IN")}
//                                                 </span>
//                                                 <span className={`db-order__arrow ${isOpen ? "open" : ""}`}>›</span>
//                                             </div>
//                                         </div>

//                                         {/* Accordion body */}
//                                         <div className={`db-order__body ${isOpen ? "db-order__body--open" : ""}`}>
//                                             {order.items?.length > 0 ? (
//                                                 <div className="db-items">
//                                                     {order.items.map((item, idx) => (
//                                                         <div key={idx} className="db-item">
//                                                             {item.image && (
//                                                                 <img src={item.image} alt={item.name} className="db-item__img" />
//                                                             )}
//                                                             <div className="db-item__info">
//                                                                 <p className="db-item__name">{item.name}</p>
//                                                                 <p className="db-item__meta">
//                                                                     Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each
//                                                                 </p>
//                                                             </div>
//                                                             <p className="db-item__total">
//                                                                 ₹{(item.quantity * item.price)?.toLocaleString("en-IN")}
//                                                             </p>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <p className="db-no-items">No item details available.</p>
//                                             )}

//                                             <div className="db-order__footer">
//                                                 {order.createdAt && (
//                                                     <span>
//                                                         📅 {new Date(order.createdAt).toLocaleDateString("en-IN", {
//                                                             day: "numeric", month: "short", year: "numeric",
//                                                         })}
//                                                     </span>
//                                                 )}
//                                                 {order.address && <span>📍 {order.address}</span>}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </section>
//                 )}

//                 {/* ── PROFILE TAB ── */}
//                 {activeTab === "profile" && (
//                     <section className="db-section">
//                         <h2 className="db-section__title">My Profile</h2>
//                         <div className="db-profile">
//                             <div className="db-profile__avatar">
//                                 {user.name ? user.name[0].toUpperCase() : "U"}
//                             </div>
//                             <div className="db-profile__grid">
//                                 {[
//                                     ["Full Name", user.name],
//                                     ["Email", user.email],
//                                     ["Phone", user.phone],
//                                     ["Member Since", user.createdAt
//                                         ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
//                                         : null],
//                                 ].map(([label, val]) => (
//                                     <div key={label} className="db-profile__field">
//                                         <label>{label}</label>
//                                         <p>{val || "—"}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </section>
//                 )}

//             </div>{/* /db-body */}
//         </div>
//     );
// };

// export default Dashboard;
// // import React, { useEffect, useState } from "react";
// // import api from "api";
// // import { useNavigate } from "react-router-dom";

// // const Dashboard = () => {
// //     const [orders, setOrders] = useState([]);
// //     const [user, setUser] = useState({});
// //     const [error, setError] = useState("");
// //     const navigate = useNavigate();

// //     useEffect(() => {
// //         const token = localStorage.getItem("token");

// //         if (!token) {
// //             navigate("/login");
// //             return;
// //         }
// //         const headers = { Authorization: `Bearer ${token}` };
// //         // GET ORDERS
// //         api.get("/api/orders", { headers })
// //             .then(res => setOrders(res.data))
// //             .catch(() => setError("Failed to load orders."));

// //         // GET USER PROFILE
// //         api.get("/api/users/profile", { headers })
// //             .then(res => setUser(res.data))
// //             .catch(() => setError("Failed to load profile."));

// //     }, [navigate]); //  added navigate to deps

// //     const logout = () => {
// //         localStorage.removeItem("token");
// //         navigate("/login"); //  use navigate instead of window.location
// //     };

// //     return (
// //         <div className="dashboard container">
// //             <h2 className="dashboard__title">
// //                 Welcome, {user.name} 👋
// //             </h2>

// //             {error && <p className="text-danger">{error}</p>} {/*  show errors */}

// //             {/* SHOW ONLY WHEN ADMIN IS LOGGED IN */}
// //             {user.role === "admin" && (
// //                 <button
// //                     className="btn btn-primary mb-3"
// //                     onClick={() => navigate("/admin")} //  consistent route
// //                 >
// //                     Go to Admin Dashboard
// //                 </button>
// //             )}

// //             <div className="row dashboard__wrapper">

// //                 {/* LEFT MENU */}
// //                 <div className="col-lg-3 col-md-4 dashboard__sidebar">
// //                     <div className="list-group">

// //                         <button className="list-group-item active">
// //                             {user.role === "admin" ? "All Orders" : "My Orders"} {/* ✅ fixed label */}
// //                         </button>

// //                         <button
// //                             className="list-group-item"
// //                             onClick={logout}
// //                         >
// //                             Logout
// //                         </button>

// //                     </div>
// //                 </div>

// //                 {/* RIGHT CONTENT */}
// //                 <div className="col-lg-9 col-md-8 dashboard__content">
// //                     <h4>{user.role === "admin" ? "All Orders" : "My Orders"}</h4> {/* ✅ dynamic heading */}

// //                     {orders.length === 0 ? (
// //                         <p>No orders yet</p>
// //                     ) : (
// //                         orders.map(order => (
// //                             <div key={order._id} className="dashboard__card">
// //                                 <p><strong>Order ID:</strong> {order._id}</p>
// //                                 <p><strong>Status:</strong> {order.status}</p>
// //                                 <p><strong>Total:</strong> ₹{order.totalAmount}</p>
// //                             </div>
// //                         ))
// //                     )}
// //                 </div>

// //             </div>
// //         </div>
// //     );
// // };
// // export default Dashboard;

// // import React, { useEffect, useState } from "react";
// // import api from "api";
// // import { useNavigate } from "react-router-dom";

// // const Dashboard = () => {
// //     const [orders, setOrders] = useState([]);
// //     const [user, setUser] = useState({});
// //     const navigate = useNavigate();

// //     useEffect(() => {
// //         const token = localStorage.getItem("token");

// //         if (!token) {
// //             navigate("/login");
// //             return;
// //         }

// //         // GET ORDERS
// //         api.get("/api/orders", {
// //             headers: {
// //                 Authorization: `Bearer ${token}`
// //             }
// //         })
// //             .then(res => setOrders(res.data))
// //             .catch(err => console.log(err));

// //         // GET USER PROFILE
// //         api.get("/api/users/profile", {
// //             headers: {
// //                 Authorization: `Bearer ${token}`
// //             }
// //         })
// //             .then(res => setUser(res.data))
// //             .catch(err => console.log(err));

// //     }, []);

// //     const logout = () => {
// //         localStorage.removeItem("token");
// //         window.location.href = "/login";
// //     };

// //     const openAdminDashboard = () => {
// //         window.location.href = "/admin";
// //     };

// //     return (
// //         <div className="dashboard container">
// //             <h2 className="dashboard__title">
// //                 Welcome, {user.name} 👋
// //             </h2>

// //             {/* SHOW ONLY WHEN ADMIN LOGIN */}
// //             {user.role === "admin" && (
// //                 <button
// //                     className="btn btn-primary mb-3"
// //                     onClick={() => navigate("/admin-dashboard")}
// //                 >
// //                     Admin Dashboard
// //                 </button>
// //             )}

// //             <div className="row dashboard__wrapper">

// //                 {/* LEFT MENU */}
// //                 <div className="col-lg-3 col-md-4 dashboard__sidebar">
// //                     <div className="list-group">

// //                         <button className="list-group-item active">
// //                             {user.role === "admin" ? "orders" : "My Orders"}
// //                         </button>

// //                         <button
// //                             className="list-group-item"
// //                             onClick={logout}
// //                         >
// //                             Logout
// //                         </button>

// //                     </div>
// //                 </div>

// //                 {/* RIGHT CONTENT */}
// //                 <div className="col-lg-9 col-md-8 dashboard__content">
// //                     <h4>My Orders</h4>

// //                     {orders.length === 0 ? (
// //                         <p>No orders yet</p>
// //                     ) : (
// //                         orders.map(order => (
// //                             <div
// //                                 key={order._id}
// //                                 className="dashboard__card"
// //                             >
// //                                 <p>
// //                                     <strong>Order ID:</strong> {order._id}
// //                                 </p>

// //                                 <p>
// //                                     <strong>Status:</strong> {order.status}
// //                                 </p>

// //                                 <p>
// //                                     <strong>Total:</strong> ₹
// //                                     {order.totalAmount}
// //                                 </p>
// //                             </div>
// //                         ))
// //                     )}
// //                 </div>

// //             </div>
// //         </div>
// //     );
// // };
// // export default Dashboard;

import React, { useEffect, useState } from "react";
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

const STYLES = `
@keyframes db-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
.db2-page { min-height: 100vh; background: #f7f7f7; padding: 32px 16px; font-family: 'Segoe UI', sans-serif; }
.db2-wrap { max-width: 760px; margin: 0 auto; }
.db2-greeting { animation: db-fadeUp .4s ease both; margin-bottom: 24px; }
.db2-greeting h1 { font-size: 22px; font-weight: 600; color: #111; margin: 0 0 4px; }
.db2-greeting h1 span { color: #e53935; }
.db2-greeting p { font-size: 14px; color: #888; margin: 0; }
.db2-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.db2-stat { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 16px; animation: db-fadeUp .4s ease both; }
.db2-stat__label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 6px; }
.db2-stat__val { font-size: 24px; font-weight: 600; color: #111; margin: 0; }
.db2-stat__val.red { color: #e53935; }
.db2-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1.5px solid #e5e5e5; }
.db2-tab { font-size: 13px; padding: 10px 18px; border: none; background: transparent; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1.5px; font-family: inherit; transition: color .2s; }
.db2-tab.active { color: #e53935; border-bottom-color: #e53935; font-weight: 600; }
.db2-tab:hover:not(.active) { color: #555; }
.db2-section-title { font-size: 12px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin: 0 0 14px; }
.db2-order { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; margin-bottom: 10px; overflow: hidden; animation: db-fadeUp .4s ease both; transition: box-shadow .2s; }
.db2-order:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.db2-order__row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
.db2-order__left { display: flex; align-items: center; gap: 10px; }
.db2-badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
.db2-order__id { font-size: 12px; color: #aaa; }
.db2-order__right { display: flex; align-items: center; gap: 8px; }
.db2-order__amount { font-size: 14px; font-weight: 600; color: #111; }
.db2-order__arrow { font-size: 18px; color: #ccc; display: inline-block; transition: transform .2s; }
.db2-order__arrow.open { transform: rotate(90deg); color: #e53935; }
.db2-order__body { background: #fafafa; border-top: 0.5px solid #f0f0f0; max-height: 0; overflow: hidden; transition: max-height .3s ease; }
.db2-order__body.open { max-height: 400px; }
.db2-items { padding: 12px 16px; }
.db2-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid #f0f0f0; }
.db2-item:last-child { border-bottom: none; }
.db2-item__img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #eee; flex-shrink: 0; }
.db2-item__name { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
.db2-item__meta { font-size: 11px; color: #aaa; margin: 0; }
.db2-item__total { margin-left: auto; font-size: 13px; font-weight: 600; color: #111; }
.db2-order__footer { padding: 10px 16px; display: flex; gap: 16px; font-size: 12px; color: #aaa; border-top: 0.5px solid #f0f0f0; }
.db2-empty { text-align: center; padding: 40px; color: #aaa; }
.db2-empty p { font-size: 14px; margin: 8px 0 0; }
.db2-profile { background: #fff; border: 0.5px solid #e5e5e5; border-radius: 12px; padding: 20px; animation: db-fadeUp .4s ease both; }
.db2-profile__top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 0.5px solid #f0f0f0; }
.db2-profile__avatar { width: 52px; height: 52px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600; flex-shrink: 0; }
.db2-profile__name { font-size: 16px; font-weight: 600; color: #111; margin: 0 0 3px; }
.db2-profile__email { font-size: 13px; color: #aaa; margin: 0; }
.db2-profile__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.db2-profile__field label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 4px; }
.db2-profile__field p { font-size: 14px; font-weight: 500; color: #111; margin: 0; }
.db2-error { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.db2-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; color: #aaa; font-size: 14px; }
.db2-loader__ring { width: 32px; height: 32px; border: 2px solid #eee; border-top-color: #e53935; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 480px) {
    .db2-stats { grid-template-columns: 1fr; }
    .db2-profile__grid { grid-template-columns: 1fr; }
}
`;

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
            <>
                <style>{STYLES}</style>
                <div className="db2-loader">
                    <div className="db2-loader__ring" />
                    <p>Loading your dashboard…</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{STYLES}</style>
            <div className="db2-page">
                <div className="db2-wrap">

                    {error && <div className="db2-error">⚠ {error}</div>}

                    {/* Greeting */}
                    <div className="db2-greeting">
                        <h1>Hey, <span>{user.name?.split(" ")[0] || "there"}</span> 👋</h1>
                        <p>Here's what's happening with your orders</p>
                    </div>

                    {/* Stats */}
                    <div className="db2-stats">
                        {[
                            { label: "Total Orders", value: orders.length },
                            { label: "Delivered", value: deliveredCount },
                            { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, red: true },
                        ].map((s, i) => (
                            <div key={s.label} className="db2-stat" style={{ animationDelay: `${i * 80}ms` }}>
                                <p className="db2-stat__label">{s.label}</p>
                                <p className={`db2-stat__val${s.red ? " red" : ""}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="db2-tabs">
                        {[{ id: "orders", label: "My Orders" }, { id: "profile", label: "Profile" }].map((t) => (
                            <button key={t.id} className={`db2-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                                {t.label}
                            </button>
                        ))}
                        <button className="db2-tab" style={{ marginLeft: "auto", color: "#e53935" }} onClick={logout}>
                            Logout
                        </button>
                    </div>

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <section>
                            <p className="db2-section-title">My Orders</p>
                            {orders.length === 0 ? (
                                <div className="db2-empty">
                                    <div style={{ fontSize: 36 }}>📭</div>
                                    <p>No orders yet. Start shopping!</p>
                                </div>
                            ) : (
                                orders.map((order, i) => {
                                    const key = order.status?.toLowerCase();
                                    const color = statusColors[key] || { bg: "#f3f4f6", text: "#374151" };
                                    const icon = statusIcons[key] || "•";
                                    const isOpen = expandedOrder === order._id;
                                    return (
                                        <div key={order._id} className="db2-order" style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="db2-order__row" onClick={() => setExpandedOrder(isOpen ? null : order._id)}>
                                                <div className="db2-order__left">
                                                    <span className="db2-badge" style={{ background: color.bg, color: color.text }}>
                                                        {icon} {order.status}
                                                    </span>
                                                    <span className="db2-order__id">#{order._id?.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="db2-order__right">
                                                    <span className="db2-order__amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                                                    <span className={`db2-order__arrow ${isOpen ? "open" : ""}`}>›</span>
                                                </div>
                                            </div>
                                            <div className={`db2-order__body ${isOpen ? "open" : ""}`}>
                                                {order.items?.length > 0 ? (
                                                    <div className="db2-items">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="db2-item">
                                                                {item.image && <img src={item.image} alt={item.name} className="db2-item__img" />}
                                                                <div>
                                                                    <p className="db2-item__name">{item.name}</p>
                                                                    <p className="db2-item__meta">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each</p>
                                                                </div>
                                                                <p className="db2-item__total">₹{(item.quantity * item.price)?.toLocaleString("en-IN")}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="db2-items"><p style={{ color: "#aaa", fontSize: 13 }}>No item details available.</p></div>
                                                )}
                                                <div className="db2-order__footer">
                                                    {order.createdAt && <span>📅 {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                                                    {order.address && <span>📍 {order.address}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </section>
                    )}

                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <section>
                            <p className="db2-section-title">My Profile</p>
                            <div className="db2-profile">
                                <div className="db2-profile__top">
                                    <div className="db2-profile__avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                                    <div>
                                        <p className="db2-profile__name">{user.name || "—"}</p>
                                        <p className="db2-profile__email">{user.email || "—"}</p>
                                    </div>
                                </div>
                                <div className="db2-profile__grid">
                                    {[
                                        ["Phone", user.phone],
                                        ["Member Since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : null],
                                    ].map(([label, val]) => (
                                        <div key={label} className="db2-profile__field">
                                            <label>{label}</label>
                                            <p>{val || "—"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </>
    );
};

export default Dashboard;
