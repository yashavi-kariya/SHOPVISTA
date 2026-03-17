import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
const Checkout = () => {
    const { cartItems, subtotal, clearCart, fetchCart } = useCart();
    const navigate = useNavigate();
    const { id } = useParams(); // optional: for single product checkout
    const [product, setProduct] = useState(null);
    useEffect(() => {
        if (id) {
            axios
                .get(`http://localhost:3001/api/products/${id}`)
                .then((res) => setProduct(res.data))
                .catch((err) => console.error("Product fetch error:", err));
        }
    }, [id]);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        country: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
        notes: "",
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const placeOrder = async (e) => {
        e.preventDefault();
        const displayItems = product
            ? [{ productId: product._id, quantity: 1, product }]
            : cartItems;
        if (displayItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login first to place order");
                return;
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };
            const orderData = {
                billing: form,
                items: displayItems,
                totalPrice: product
                    ? product.price
                    : subtotal, // total price for single product or full cart
            };
            await axios.post("http://localhost:3001/api/orders", orderData, config);
            alert("Order placed successfully!");
            if (!product) clearCart();
            navigate("/order-success");
        } catch (error) {
            console.error("Order error:", error);
            alert("Failed to place order. Make sure you are logged in.");
        }
    };
    const displayItems = product
        ? [{ productId: product._id, quantity: 1, product }]
        : cartItems;
    const total = product ? product.price : subtotal;
    return (
        <section className="checkout spad">
            <div className="container">
                <div className="checkout__form">
                    <form onSubmit={placeOrder}>
                        <div className="row">
                            {/* LEFT SIDE FORM */}
                            <div className="col-lg-8 col-md-6">
                                <h6 className="checkout__title">Billing Details</h6>

                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="checkout__input">
                                            <p>First Name<span>*</span></p>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-lg-6">
                                        <div className="checkout__input">
                                            <p>Last Name<span>*</span></p>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="checkout__input">
                                    <p>Country<span>*</span></p>
                                    <input
                                        type="text"
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="checkout__input">
                                    <p>Address<span>*</span></p>
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        required
                                        className="checkout__input__add"
                                    />
                                </div>

                                <div className="checkout__input">
                                    <p>Town/City<span>*</span></p>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="checkout__input">
                                    <p>State<span>*</span></p>
                                    <input
                                        type="text"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="checkout__input">
                                    <p>Postcode / ZIP<span>*</span></p>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={form.zip}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="checkout__input">
                                            <p>Phone<span>*</span></p>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-lg-6">
                                        <div className="checkout__input">
                                            <p>Email<span>*</span></p>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="checkout__input">
                                    <p>Order Notes</p>
                                    <input
                                        type="text"
                                        placeholder="Notes about your order..."
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            {/* RIGHT SIDE ORDER SUMMARY */}
                            <div className="col-lg-4 col-md-6">
                                <div className="checkout__order">
                                    <h4 className="order__title">Your Order</h4>

                                    <div className="checkout__order__products">
                                        Product <span>Total</span>
                                    </div>
                                    <ul className="checkout__total__products">
                                        {displayItems.map((item, index) => (
                                            <li key={`${item.productId}-${index}`}>
                                                {index + 1}. {item.product.name} × {item.quantity}
                                                <span>Rs.{(item.product.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <ul className="checkout__total__all">
                                        <li>Subtotal <span>Rs.{total.toFixed(2)}</span></li>
                                        <li>Total <span>Rs.{total.toFixed(2)}</span></li>
                                    </ul>

                                    <button type="submit" className="site-btn">
                                        PLACE ORDER
                                    </button>
                                </div>
                            </div>  </div>
                    </form>
                </div>
            </div>
        </section>
    );
};
export default Checkout;