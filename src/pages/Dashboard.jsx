import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {

    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState({});

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        // ✅ GET ORDERS
        axios.get("http://localhost:3001/api/orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => setOrders(res.data))
            .catch(err => {
                console.log(err);
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }
            });

        // ✅ GET USER PROFILE
        axios.get("http://localhost:3001/api/users/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => setUser(res.data))
            .catch(err => console.log(err));

    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="container mt-5">
            <h2>Welcome, {user.name} 👋</h2>

            <div className="row">

                {/* LEFT MENU */}
                <div className="col-md-3">
                    <div className="list-group">
                        <button className="list-group-item list-group-item-action active">
                            My Orders
                        </button>

                        <button
                            className="list-group-item list-group-item-action"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="col-md-9">
                    <h4>My Orders</h4>

                    {orders.length === 0 ? (
                        <p>No orders yet</p>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="card mb-3 p-3">

                                <p><strong>Order ID:</strong> {order._id}</p>
                                <p><strong>Status:</strong> {order.status}</p>

                                {/* Total Amount */}
                                <p>
                                    <strong>Total:</strong> ₹
                                    {order.totalAmount ||
                                        order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                                </p>

                                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

                                <hr />

                                {order.items.map((item, index) => (
                                    <div key={index} className="d-flex align-items-center gap-3 mb-2">

                                        {/* Product Image */}
                                        <img
                                            src={`http://localhost:3001${item.product?.img}`}
                                            alt={item.product?.name}
                                            width="60"
                                            height="60"
                                            style={{ objectFit: "cover", borderRadius: "8px" }}
                                        />

                                        {/* Product Details */}
                                        <div>
                                            <div><strong>{item.product?.name}</strong></div>
                                            <div>{item.quantity} × ₹{item.price}</div>
                                        </div>

                                    </div>
                                ))}

                            </div>
                        ))
                    )}

                </div>

            </div>
        </div>
    );
};

export default Dashboard;