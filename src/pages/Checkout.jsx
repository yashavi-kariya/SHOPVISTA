import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

const Checkout = () => {
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const buyNowItem = location.state?.buyNowItem || null;
    const [product, setProduct] = useState(null);
    const [placing, setPlacing] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        if (id) {
            api.get(`/api/products/${id}`)
                .then(res => setProduct(res.data))
                .catch(err => console.error("Product fetch error:", err));
        }
    }, [id]);

    const [form, setForm] = useState({
        firstName: "", lastName: "", country: "",
        address: "", city: "", state: "",
        zip: "", phone: "", email: "", notes: "",
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const displayItems = buyNowItem
        ? [buyNowItem]
        : id && product
            ? [{ productId: product._id, quantity: 1, product }]
            : cartItems;

    const total = buyNowItem
        ? buyNowItem.price * buyNowItem.quantity
        : id && product ? product.price : subtotal;

    const discount = Number(localStorage.getItem("discount")) || 0;
    const coupon = localStorage.getItem("coupon") || "";
    const finalTotal = total - discount;
    const freeLimit = 1000;
    const shippingCharge = finalTotal >= freeLimit ? 0 : 79;
    const grandTotal = finalTotal + shippingCharge;

    const placeOrder = async (e) => {
        e.preventDefault();
        if (displayItems.length === 0) { alert("Your cart is empty!"); return; }
        setPlacing(true);
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            };
            const orderData = {
                billing: form,
                items: displayItems,
                totalAmount: grandTotal,
                coupon: coupon || null,
                discount: buyNowItem || (id && product) ? 0 : discount || 0,
            };
            await api.post("/api/orders", orderData, config);
            if (!buyNowItem && !id) clearCart();
            localStorage.removeItem("discount");
            localStorage.removeItem("coupon");
            navigate("/order-success");
        } catch (error) {
            console.error("Order error:", error);
            alert("Failed to place order. Make sure you are logged in.");
        } finally {
            setPlacing(false);
        }
    };

    //     const placeOrder = async (e) => {
    //     e.preventDefault();
    //     if (displayItems.length === 0) { alert("Your cart is empty!"); return; }
    //     setPlacing(true);

    //     try {
    //         const token = localStorage.getItem("token");
    //         const config = {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 "Content-Type": "application/json"
    //             },
    //         };

    //         // ── Step 1: Create order in DB ──────────────────────
    //         const orderData = {
    //             billing: form,
    //             items: displayItems,
    //             totalAmount: grandTotal,
    //             coupon: coupon || null,
    //             discount: buyNowItem || (id && product) ? 0 : discount || 0,
    //         };

    //         const orderRes = await api.post("/api/orders", orderData, config);
    //         const savedOrder = orderRes.data;

    //         // ── Step 2: Create Razorpay order ───────────────────
    //         const paymentRes = await api.post("/api/payment/create-order",
    //             { totalAmount: grandTotal },
    //             config
    //         );
    //         const { razorpayOrderId, amount } = paymentRes.data;

    //         // ── Step 3: Open Razorpay popup ─────────────────────
    //         const options = {
    //             key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    //             amount: amount,
    //             currency: "INR",
    //             name: "ShopVista",
    //             description: `Order #${savedOrder._id}`,
    //             order_id: razorpayOrderId,

    //             // ── Step 4: On payment success ──────────────────
    //             handler: async function (response) {
    //                 try {
    //                     const verifyRes = await api.post("/api/payment/verify", {
    //                         orderId: savedOrder._id,
    //                         razorpay_payment_id: response.razorpay_payment_id,
    //                         razorpay_order_id: response.razorpay_order_id,
    //                         razorpay_signature: response.razorpay_signature,
    //                     }, config);

    //                     if (verifyRes.data.success) {
    //                         //  Payment successful!
    //                         if (!buyNowItem && !id) clearCart();
    //                         localStorage.removeItem("discount");
    //                         localStorage.removeItem("coupon");
    //                         navigate("/order-success", {
    //                             state: { orderId: savedOrder._id }
    //                         });
    //                     }
    //                 } catch (err) {
    //                     console.error("Verify error:", err);
    //                     alert("Payment verification failed!");
    //                 }
    //             },

    //             // ── Step 5: On payment failure ──────────────────
    //             modal: {
    //                 ondismiss: async function () {
    //                     await api.post("/api/payment/failed",
    //                         { orderId: savedOrder._id },
    //                         config
    //                     );
    //                     alert("Payment cancelled. Your order is saved as Pending.");
    //                     setPlacing(false);
    //                 }
    //             },

    //             prefill: {
    //                 name:    `${form.firstName} ${form.lastName}`,
    //                 email:   form.email,
    //                 contact: form.phone,
    //             },

    //             theme: { color: "#1a1a1a" },  // matches your black UI
    //         };

    //         const rzp = new window.Razorpay(options);
    //         rzp.open();

    //     } catch (error) {
    //         console.error("Order error:", error);
    //         alert("Failed to place order. Please try again.");
    //     } finally {
    //         setPlacing(false);
    //     }
    // };

    return (
        <section style={{ minHeight: "100vh", background: "#f8f7f4", paddingBottom: "60px" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

                .checkout-page * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .checkout-page h1, .checkout-page h2, .checkout-page h3 { font-family: 'Playfair Display', serif; }

                .checkout-input-group {
                    margin-bottom: 18px;
                    animation: fadeUp 0.4s ease both;
                }
                .checkout-input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #555;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .checkout-input-group label span { color: #ef4444; margin-left: 2px; }
                .checkout-input-group input, .checkout-input-group textarea {
                    width: 100%;
                    padding: 11px 14px;
                    border: 1.5px solid #e2ddd8;
                    border-radius: 10px;
                    font-size: 14px;
                    background: #fff;
                    color: #1a1a1a;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: 'DM Sans', sans-serif;
                    outline: none;
                }
                .checkout-input-group input:focus, .checkout-input-group textarea:focus {
                    border-color: #1a1a1a;
                    box-shadow: 0 0 0 3px rgba(26,26,26,0.07);
                }

                .order-card-sticky {
                    background: #fff;
                    border-radius: 16px;
                    border: 1.5px solid #ede9e3;
                    overflow: hidden;
                    position: sticky;
                    top: 20px;
                    animation: slideIn 0.45s ease both;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .form-card {
                    background: #fff;
                    border-radius: 16px;
                    border: 1.5px solid #ede9e3;
                    padding: 32px;
                    animation: fadeUp 0.4s ease both;
                }
                @keyframes fadeUp { 
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .place-btn {
                    width: 100%;
                    padding: 14px;
                    background: #1a1a1a;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    letter-spacing: 0.05em;
                    font-family: 'DM Sans', sans-serif;
                    transition: background 0.2s, transform 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                }
                .place-btn:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
                .place-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .cancel-btn {
                    width: 100%;
                    padding: 12px;
                    background: transparent;
                    color: #888;
                    border: 1.5px solid #e2ddd8;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    transition: all 0.2s;
                    margin-top: 10px;
                }
                .cancel-btn:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

                .item-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px dashed #f0ece5;
                    gap: 10px;
                    font-size: 14px;
                }
                .item-line:last-child { border-bottom: none; }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    padding: 6px 0;
                    color: #555;
                }
                .summary-row.total {
                    font-size: 17px;
                    font-weight: 700;
                    color: #1a1a1a;
                    border-top: 1.5px solid #ede9e3;
                    padding-top: 14px;
                    margin-top: 6px;
                }

                .spinner {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    display: inline-block;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .page-header {
                    background: #1a1a1a;
                    padding: 36px 0 28px;
                    margin-bottom: 36px;
                }

                .section-title {
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #888;
                    margin: 0 0 18px;
                }

                @media (max-width: 768px) {
                    .checkout-grid {
                        flex-direction: column-reverse !important;
                    }
                    .order-card-sticky {
                        position: static !important;
                    }
                    .form-card { padding: 20px; }
                }
            `}</style>

            <div className="checkout-page">
                {/* HEADER */}
                <div className="page-header">
                    <div className="container">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <h1 style={{ color: "#fff", margin: 0, fontSize: "clamp(22px, 4vw, 30px)" }}>Checkout</h1>
                                <p style={{ color: "#888", margin: "4px 0 0", fontSize: "14px" }}>
                                    {displayItems.length} item{displayItems.length !== 1 ? "s" : ""} in your order
                                </p>
                            </div>
                            <Link to="/cart" style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                background: "transparent", color: "#fff",
                                border: "1.5px solid #444",
                                padding: "9px 18px", borderRadius: "8px",
                                fontWeight: "600", fontSize: "14px",
                                textDecoration: "none", transition: "border-color 0.2s"
                            }}>
                                ← Back to Cart
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <form onSubmit={placeOrder}>
                        <div className="checkout-grid" style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>

                            {/* LEFT — BILLING FORM */}
                            <div style={{ flex: "1 1 0", minWidth: 0 }}>
                                <div className="form-card">
                                    <p className="section-title">Billing Details</p>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                        <div className="checkout-input-group">
                                            <label>First Name <span>*</span></label>
                                            <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
                                        </div>
                                        <div className="checkout-input-group">
                                            <label>Last Name <span>*</span></label>
                                            <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div className="checkout-input-group">
                                        <label>Country <span>*</span></label>
                                        <input name="country" value={form.country} onChange={handleChange} required placeholder="India" />
                                    </div>

                                    <div className="checkout-input-group">
                                        <label>Address <span>*</span></label>
                                        <input name="address" value={form.address} onChange={handleChange} required placeholder="123, Street Name, Area" />
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                        <div className="checkout-input-group">
                                            <label>City <span>*</span></label>
                                            <input name="city" value={form.city} onChange={handleChange} required placeholder="Ahmedabad" />
                                        </div>
                                        <div className="checkout-input-group">
                                            <label>State <span>*</span></label>
                                            <input name="state" value={form.state} onChange={handleChange} required placeholder="Gujarat" />
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                        <div className="checkout-input-group">
                                            <label>ZIP / Postcode <span>*</span></label>
                                            <input name="zip" value={form.zip} onChange={handleChange} required placeholder="380001" />
                                        </div>
                                        <div className="checkout-input-group">
                                            <label>Phone <span>*</span></label>
                                            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                                        </div>
                                    </div>

                                    <div className="checkout-input-group">
                                        <label>Email <span>*</span></label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
                                    </div>

                                    <div className="checkout-input-group">
                                        <label>Order Notes</label>
                                        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions..." />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT — ORDER SUMMARY */}
                            <div style={{ width: "340px", flexShrink: 0 }}>
                                <div className="order-card-sticky">
                                    {/* Header */}
                                    <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #f0ece5" }}>
                                        <p className="section-title" style={{ margin: 0 }}>Order Summary</p>
                                    </div>

                                    {/* Items */}
                                    <div style={{ padding: "16px 24px", maxHeight: "260px", overflowY: "auto" }}>
                                        {displayItems.map((item, index) => (
                                            <div className="item-line" key={`${item.productId || item.product?._id}-${index}`}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <img
                                                        src={item.product?.img || "/placeholder.png"}
                                                        alt={item.product?.name}
                                                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ede9e3", flexShrink: 0 }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: "600", color: "#1a1a1a", lineHeight: 1.3 }}>
                                                            {item.product?.name}
                                                        </div>
                                                        <div style={{ fontSize: "12px", color: "#888" }}>Qty: {item.quantity}</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: "600", color: "#1a1a1a", flexShrink: 0 }}>
                                                    Rs.{((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div style={{ padding: "16px 24px", borderTop: "1.5px solid #f0ece5" }}>
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>Rs.{total.toFixed(2)}</span>
                                        </div>
                                        {coupon && discount > 0 && (
                                            <div className="summary-row" style={{ color: "#16a34a" }}>
                                                <span>🎟️ {coupon}</span>
                                                <span>− Rs.{discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            <span style={{ color: shippingCharge === 0 ? "#16a34a" : "#1a1a1a" }}>
                                                {shippingCharge === 0 ? "Free 🎉" : `Rs.${shippingCharge}`}
                                            </span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total</span>
                                            <span>Rs.{grandTotal.toFixed(2)}</span>
                                        </div>

                                        {discount > 0 && (
                                            <div style={{
                                                background: "#ecfdf5", border: "1px dashed #6ee7b7",
                                                borderRadius: "8px", padding: "8px 12px",
                                                textAlign: "center", marginTop: "12px",
                                                fontSize: "13px", color: "#065f46", fontWeight: "600"
                                            }}>
                                                🎉 You're saving Rs.{discount.toFixed(2)} on this order!
                                            </div>
                                        )}

                                        {/* PLACE ORDER */}
                                        <button type="submit" className="place-btn" disabled={placing}>
                                            {placing ? (
                                                <><span className="spinner" /> Placing Order...</>
                                            ) : (
                                                <>✓ Place Order</>
                                            )}
                                        </button>

                                        {/* CANCEL */}
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => navigate("/cart")}
                                        >
                                            ✖ Cancel & Return to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Checkout;

// import React, { useEffect, useState } from "react";
// import { useCart } from "../context/CartContext";
// import api from "api";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// const Checkout = () => {
//     const { cartItems, subtotal, clearCart, fetchCart } = useCart();
//     const navigate = useNavigate();
//     const { id } = useParams(); // optional: for single product checkout
//     const location = useLocation();
//     const buyNowItem = location.state?.buyNowItem || null; // get product from state if coming from Buy Now
//     const [product, setProduct] = useState(null);

//     useEffect(() => {
//         if (id) {
//             api
//                 .get(`/api/products/${id}`)
//                 .then((res) => setProduct(res.data))
//                 .catch((err) => console.error("Product fetch error:", err));
//         }
//     }, [id]);
//     const [form, setForm] = useState({
//         firstName: "",
//         lastName: "",
//         country: "",
//         address: "",
//         city: "",
//         state: "",
//         zip: "",
//         phone: "",
//         email: "",
//         notes: "",
//     });
//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };
//     const placeOrder = async (e) => {
//         e.preventDefault();
//         const displayItems = buyNowItem
//             ? [buyNowItem]
//             : id && product
//                 ? [{ productId: product._id, quantity: 1, product }]
//                 : cartItems;
//         if (displayItems.length === 0) {
//             alert("Your cart is empty!");
//             return;
//         }
//         try {
//             const token = localStorage.getItem("token");
//             if (!token) {
//                 alert("Please login first to place order");
//                 return;
//             }
//             const config = {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             };
//             const orderData = {
//                 billing: form,
//                 items: displayItems,
//                 totalPrice: buyNowItem
//                     ? buyNowItem.price * buyNowItem.quantity
//                     : id && product
//                         ? product.price
//                         : grandTotal,
//                 coupon: coupon || null,
//                 discount: buyNowItem || (id && product) ? 0 : discount || 0, // ✅ no discount for buyNow/single product
//             };
//             await api.post("/api/orders", orderData, config);
//             alert("Order placed successfully!");
//             if (!buyNowItem && !id) clearCart();
//             localStorage.removeItem("discount");
//             localStorage.removeItem("coupon");
//             navigate("/order-success");
//         } catch (error) {
//             console.error("Order error:", error);
//             alert("Failed to place order. Make sure you are logged in.");
//         }
//     };
//     const displayItems = buyNowItem
//         ? [buyNowItem]
//         : id && product
//             ? [{ productId: product._id, quantity: 1, product }]
//             : cartItems;

//     const total = buyNowItem
//         ? buyNowItem.price * buyNowItem.quantity
//         : id && product
//             ? product.price
//             : subtotal;

//     const discount = Number(localStorage.getItem("discount")) || 0;
//     const coupon = localStorage.getItem("coupon") || "";
//     const finalTotal = total - discount;
//     const freeLimit = 1000;
//     const shippingCharge = finalTotal >= freeLimit ? 0 : 79;
//     const grandTotal = finalTotal + shippingCharge;
//     return (
//         <section className="checkout spad">
//             <style>{`
//                 @media (max-width: 768px) {
//                     .checkout__form .row {
//                         display: flex !important;
//                         flex-direction: column !important;
//                     }
//                     .checkout__form .col-lg-4 {
//                         order: -1 !important;
//                     }
//                     .checkout__form .col-lg-8 {
//                         order: 1 !important;    }
//                 }
//             `}</style>
//             <div className="container">
//                 <div className="checkout__form">
//                     <form onSubmit={placeOrder}>
//                         <div className="row">
//                             {/* LEFT SIDE FORM */}
//                             <div className="col-lg-8 col-md-6">
//                                 <h6 className="checkout__title">Billing Details</h6>

//                                 <div className="row">
//                                     <div className="col-lg-6">
//                                         <div className="checkout__input">
//                                             <p>First Name<span>*</span></p>
//                                             <input
//                                                 type="text"
//                                                 name="firstName"
//                                                 value={form.firstName}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="col-lg-6">
//                                         <div className="checkout__input">
//                                             <p>Last Name<span>*</span></p>
//                                             <input
//                                                 type="text"
//                                                 name="lastName"
//                                                 value={form.lastName}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="checkout__input">
//                                     <p>Country<span>*</span></p>
//                                     <input
//                                         type="text"
//                                         name="country"
//                                         value={form.country}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="checkout__input">
//                                     <p>Address<span>*</span></p>
//                                     <input
//                                         type="text"
//                                         placeholder="Street Address"
//                                         name="address"
//                                         value={form.address}
//                                         onChange={handleChange}
//                                         required
//                                         className="checkout__input__add"
//                                     />
//                                 </div>

//                                 <div className="checkout__input">
//                                     <p>Town/City<span>*</span></p>
//                                     <input
//                                         type="text"
//                                         name="city"
//                                         value={form.city}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="checkout__input">
//                                     <p>State<span>*</span></p>
//                                     <input
//                                         type="text"
//                                         name="state"
//                                         value={form.state}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="checkout__input">
//                                     <p>Postcode / ZIP<span>*</span></p>
//                                     <input
//                                         type="text"
//                                         name="zip"
//                                         value={form.zip}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="row">
//                                     <div className="col-lg-6">
//                                         <div className="checkout__input">
//                                             <p>Phone<span>*</span></p>
//                                             <input
//                                                 type="text"
//                                                 name="phone"
//                                                 value={form.phone}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="col-lg-6">
//                                         <div className="checkout__input">
//                                             <p>Email<span>*</span></p>
//                                             <input
//                                                 type="email"
//                                                 name="email"
//                                                 value={form.email}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="checkout__input">
//                                     <p>Order Notes</p>
//                                     <input
//                                         type="text"
//                                         placeholder="Notes about your order..."
//                                         name="notes"
//                                         value={form.notes}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>
//                             {/* RIGHT SIDE ORDER SUMMARY */}
//                             <div className="col-lg-4 col-md-6">
//                                 <div className="checkout__order">
//                                     <h4 className="order__title">Your Order</h4>

//                                     <div className="checkout__order__products">
//                                         Product <span>Total</span>
//                                     </div>
//                                     <ul className="checkout__total__products">
//                                         {displayItems.map((item, index) => (
//                                             <li key={`${item.productId}-${index}`}>
//                                                 {index + 1}. {item.product.name} × {item.quantity}
//                                                 <span>Rs.{((item.price || item.product.price) * item.quantity).toFixed(2)}</span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                     <ul className="checkout__total__all">
//                                         <li>
//                                             Subtotal
//                                             <span>Rs.{total.toFixed(2)}</span>
//                                         </li>

//                                         {/* ✅ Show coupon code */}
//                                         {coupon && discount > 0 && (
//                                             <li>
//                                                 Coupon
//                                                 <span className="text-success fw-bold">{coupon}</span>
//                                             </li>
//                                         )}

//                                         {discount > 0 && (
//                                             <li>
//                                                 Discount
//                                                 <span className="text-success">
//                                                     - Rs.{discount.toFixed(2)}
//                                                 </span>
//                                             </li>
//                                         )}

//                                         <li>
//                                             Shipping
//                                             <span>
//                                                 {shippingCharge === 0 ? "Free" : `Rs.${shippingCharge}`}
//                                             </span>
//                                         </li>

//                                         <li>
//                                             Total
//                                             <span>Rs.{grandTotal.toFixed(2)}</span>
//                                         </li>
//                                     </ul>

//                                     {/* ✅ Savings badge */}
//                                     {discount > 0 && (
//                                         <div style={{
//                                             background: "#e8f5e9",
//                                             border: "1px dashed green",
//                                             borderRadius: "8px",
//                                             padding: "8px 12px",
//                                             textAlign: "center",
//                                             marginBottom: "12px",
//                                             fontSize: "14px",
//                                             color: "green",
//                                             fontWeight: "600"
//                                         }}>
//                                             🎉 You saved Rs.{discount.toFixed(2)} on this order!
//                                         </div>
//                                     )}

//                                     <button type="submit" className="site-btn">
//                                         PLACE ORDER
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </section>
//     );
// };
// export default Checkout;