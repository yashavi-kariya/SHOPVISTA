import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { toast, ToastProvider } from "../components/Toast";
const Checkout = () => {
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const buyNowItem = location.state?.buyNowItem || null;
    const [product, setProduct] = useState(null);
    const [placing, setPlacing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [savedOrderId, setSavedOrderId] = useState(null);
    const [savedDiscount] = useState(() => Number(localStorage.getItem("discount")) || 0);
    const [savedCoupon] = useState(() => localStorage.getItem("coupon") || "");
    // ── Shipping settings from DB ───────────────────────────
    const [shippingSettings, setShippingSettings] = useState({
        shippingCharge: 79,
        freeShippingThreshold: 999,
    });
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    useEffect(() => {
        api.get("/api/settings")
            .then(res => {
                if (res.data) {
                    setShippingSettings({
                        shippingCharge: res.data.shippingCharge ?? 79,
                        freeShippingThreshold: res.data.freeShippingThreshold ?? 999,
                    });
                }
            })
            .catch(() => {
                // fallback to defaults if settings fetch fails
            })
            .finally(() => setSettingsLoaded(true));
    }, []);

    const { shippingCharge: baseShippingCharge, freeShippingThreshold: freeLimit } = shippingSettings;

    // ── Auth + product fetch ───────────────────────────────────────────────
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

    // ── Display items ──────────────────────────────────────────────────────
    const displayItems = buyNowItem
        ? [buyNowItem]
        : id && product
            ? [{ productId: product._id, quantity: 1, product }]
            : cartItems;

    const hasItems = displayItems.length > 0;

    // ── Pricing (discount first, then shipping on discounted total) ────────
    const total = hasItems
        ? (buyNowItem
            ? buyNowItem.price * buyNowItem.quantity
            : id && product
                ? product.price
                : subtotal)
        : 0;

    const discount = hasItems ? Math.min(savedDiscount, total) : 0;
    const coupon = hasItems ? savedCoupon : "";

    const finalTotal = Math.max(0, total - discount);
    const shippingCharge = finalTotal >= freeLimit ? 0 : baseShippingCharge;
    const grandTotal = finalTotal + shippingCharge;

    // ── Place order ────────────────────────────────────────────────────────
    const placeOrder = async (e) => {
        e.preventDefault();
        if (displayItems.length === 0) { alert("Your cart is empty!"); return; }
        setPlacing(true);
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            };
            const cleanItems = displayItems.map(item => ({
                product: item.product?._id || item.productId,
                name: item.product?.name || item.name || "",
                price: Number(item.price) || Number(item.product?.price) || 0,
                quantity: Number(item.quantity) || 1,
                img: item.product?.img || item.img || "",
                color: item.selectedColor || item.color || null,
                size: item.selectedSize || item.size || null,
            }));

            const orderRes = await api.post("/api/orders", {
                billing: form,
                items: cleanItems,
                totalAmount: grandTotal,
                subtotal: total,
                coupon: coupon || null,
                discount: (buyNowItem || (id && product)) ? 0 : discount,
                shippingCharge: shippingCharge,
            }, config);

            setSavedOrderId(orderRes.data._id);
            setShowPaymentModal(true);
        } catch (error) {
            console.error("Order error:", error);
            toast({
                type: "error",
                title: "Order Failed",
                message: "Failed to place order. Please try again.",
                duration: 4000,
            });
        } finally {
            setPlacing(false);
        }
    };

    // ── Mock payment ───────────────────────────────────────────────────────
    const handleMockPayment = async () => {
        setPaymentProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2500));
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post("/api/payment/verify", { orderId: savedOrderId }, config);
            if (!buyNowItem && !id) clearCart();
            localStorage.removeItem("discount");
            localStorage.removeItem("coupon");
            localStorage.removeItem("shippingCharge");
            setShowPaymentModal(false);
            navigate("/order-success", { state: { orderId: savedOrderId } });
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed. Try again.");
        } finally {
            setPaymentProcessing(false);
        }
    };

    return (
        <section style={{ minHeight: "100vh", background: "#ffffff", paddingBottom: "60px" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
                .checkout-page * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .checkout-page h1, .checkout-page h2, .checkout-page h3 { font-family: 'Playfair Display', serif; }
                .checkout-input-group { margin-bottom: 18px; animation: fadeUp 0.4s ease both; }
                .checkout-input-group label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
                .checkout-input-group label span { color: #ef4444; margin-left: 2px; }
                .checkout-input-group input, .checkout-input-group textarea { width: 100%; padding: 11px 14px; border: 1.5px solid #e2ddd8; border-radius: 10px; font-size: 14px; background: #fff; color: #1a1a1a; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; outline: none; }
                .checkout-input-group input:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.07); }
                .order-card-sticky { background: #fff; border-radius: 16px; border: 1.5px solid #ede9e3; overflow: hidden; position: sticky; top: 20px; }
                .form-card { background: #fff; border-radius: 16px; border: 1.5px solid #ede9e3; padding: 32px; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .place-btn { width: 100%; padding: 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; }
                .place-btn:hover:not(:disabled) { background: #333; }
                .place-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .cancel-btn { width: 100%; padding: 12px; background: transparent; color: #888; border: 1.5px solid #e2ddd8; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; margin-top: 10px; }
                .cancel-btn:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
                .item-line { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #f0ece5; gap: 10px; font-size: 14px; }
                .item-line:last-child { border-bottom: none; }
                .summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #555; }
                .summary-row.total { font-size: 17px; font-weight: 700; color: #1a1a1a; border-top: 1.5px solid #ede9e3; padding-top: 14px; margin-top: 6px; }
                .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 0 0 18px; }
                .payment-method-option { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; border: 2px solid #e2ddd8; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
                .payment-method-option.selected { border-color: #1a1a1a; background: #f8f8f8; }
                @media (max-width: 768px) { .checkout-grid { flex-direction: column-reverse !important; } .order-card-sticky { position: static !important; } .form-card { padding: 20px; } }
            `}</style>

            <div className="checkout-page">
                {/* HEADER */}
                <div style={{ background: "#1a1a1a", padding: "36px 0 28px", marginBottom: "36px" }}>
                    <div className="container">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <h1 style={{ color: "#fff", margin: 0, fontSize: "clamp(22px, 4vw, 30px)" }}>Checkout</h1>
                                <p style={{ color: "#888", margin: "4px 0 0", fontSize: "14px" }}>
                                    {displayItems.length} item{displayItems.length !== 1 ? "s" : ""} in your order
                                </p>
                            </div>
                            <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#fff", border: "1.5px solid #444", padding: "9px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
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
                                    <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #f0ece5" }}>
                                        <p className="section-title" style={{ margin: 0 }}>Order Summary</p>
                                    </div>
                                    <div style={{ padding: "16px 24px", maxHeight: "260px", overflowY: "auto" }}>
                                        {displayItems.map((item, index) => (
                                            <div className="item-line" key={`${item.product?._id || item.productId || index}-${index}`}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <img
                                                        src={item.product?.img || "/placeholder.png"}
                                                        alt={item.product?.name}
                                                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ede9e3", flexShrink: 0 }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: "600", color: "#1a1a1a" }}>{item.product?.name}</div>
                                                        <div style={{ fontSize: "12px", color: "#828282" }}>Qty: {item.quantity}</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: "600", color: "#1a1a1a", flexShrink: 0 }}>
                                                    Rs.{((Number(item.price) || Number(item.product?.price) || 0) * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: "16px 24px", borderTop: "1.5px solid #f0ece5" }}>
                                        <div className="summary-row">
                                            <span>Subtotal</span><span>Rs.{total.toFixed(2)}</span>
                                        </div>
                                        {hasItems && coupon && discount > 0 && total > 0 && (
                                            <div className="summary-row" style={{ color: "#16a34a" }}>
                                                <span>🎟️ {coupon}</span><span>− Rs.{discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            <span style={{ color: shippingCharge === 0 ? "#16a34a" : "#1a1a1a" }}>
                                                {shippingCharge === 0 ? "Free 🎉" : `Rs.${shippingCharge}`}
                                            </span>
                                        </div>
                                        {shippingCharge > 0 && (
                                            <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>
                                                Calculated on discounted total
                                            </div>
                                        )}
                                        <div className="summary-row total">
                                            <span>Total</span><span>Rs.{grandTotal.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div style={{ background: "#ecfdf5", border: "1px dashed #6ee7b7", borderRadius: "8px", padding: "8px 12px", textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#065f46", fontWeight: "600" }}>
                                                🎉 You're saving Rs.{discount.toFixed(2)} on this order!
                                            </div>
                                        )}
                                        <button type="submit" className="place-btn" disabled={placing || !settingsLoaded}>
                                            {placing ? <><span className="spinner" /> Placing Order...</> : <>✓ Place Order</>}
                                        </button>
                                        <button type="button" className="cancel-btn" onClick={() => navigate("/cart")}>
                                            ✖ Cancel & Return to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {/* ── PAYMENT MODAL ── */}
            {showPaymentModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                            <div style={{ fontSize: "36px" }}>💳</div>
                            <h2 style={{ margin: "8px 0 4px", fontSize: "20px" }}>Complete Payment</h2>
                            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                                Amount: <strong style={{ color: "#1a1a1a" }}>Rs.{grandTotal.toFixed(2)}</strong>
                            </p>
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                            Select Payment Method
                        </p>
                        {[
                            { key: "card", icon: "💳", label: "Credit / Debit Card", sub: "Visa, Mastercard, Rupay" },
                            { key: "upi", icon: "📱", label: "UPI Payment", sub: "GPay, PhonePe, Paytm" },
                            { key: "netbanking", icon: "🏦", label: "Net Banking", sub: "All major banks" },
                            { key: "cod", icon: "💵", label: "Cash on Delivery", sub: "Pay when delivered" },
                        ].map((method) => (
                            <div
                                key={method.key}
                                className={`payment-method-option ${paymentMethod === method.key ? "selected" : ""}`}
                                onClick={() => setPaymentMethod(method.key)}
                            >
                                <span style={{ fontSize: "22px" }}>{method.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "600", fontSize: "14px" }}>{method.label}</div>
                                    <div style={{ fontSize: "12px", color: "#888" }}>{method.sub}</div>
                                </div>
                                {paymentMethod === method.key && <span style={{ color: "#1a1a1a", fontSize: "18px", fontWeight: "700" }}>✓</span>}
                            </div>
                        ))}
                        {paymentMethod === "card" && (
                            <div style={{ marginTop: "12px" }}>
                                <input defaultValue="4111 1111 1111 1111" placeholder="Card Number" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2ddd8", borderRadius: "8px", marginBottom: "10px", fontSize: "14px", boxSizing: "border-box" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <input defaultValue="12/26" placeholder="Expiry" style={{ padding: "10px 14px", border: "1.5px solid #e2ddd8", borderRadius: "8px", fontSize: "14px" }} />
                                    <input defaultValue="123" placeholder="CVV" style={{ padding: "10px 14px", border: "1.5px solid #e2ddd8", borderRadius: "8px", fontSize: "14px" }} />
                                </div>
                            </div>
                        )}
                        {paymentMethod === "upi" && (
                            <input defaultValue="success@razorpay" placeholder="UPI ID" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2ddd8", borderRadius: "8px", marginTop: "12px", fontSize: "14px", boxSizing: "border-box" }} />
                        )}
                        <button
                            onClick={handleMockPayment}
                            disabled={paymentProcessing}
                            style={{ width: "100%", padding: "14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: paymentProcessing ? "not-allowed" : "pointer", marginTop: "20px", opacity: paymentProcessing ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'DM Sans', sans-serif" }}
                        >
                            {paymentProcessing
                                ? <><span style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Processing...</>
                                : <>✓ Pay Rs.{grandTotal.toFixed(2)}</>
                            }
                        </button>
                        <button
                            onClick={() => !paymentProcessing && setShowPaymentModal(false)}
                            disabled={paymentProcessing}
                            style={{ width: "100%", padding: "11px", background: "transparent", color: "#888", border: "1.5px solid #e2ddd8", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "10px", fontFamily: "'DM Sans', sans-serif" }}
                        >
                            ✖ Cancel
                        </button>
                        <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginTop: "16px", margin: "16px 0 0" }}>
                            🔒 Secure Mock Payment for Testing
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};
export default Checkout;