import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api";

/*
  Cart item shape from backend (after populate):
  {
    _id:       "cart-subdoc-id",
    product:   { _id, name, img, price, ... },   ← populated
    variantId: "..." | null,
    name:      "T-Shirt",                         ← stored on cart item
    price:     899,                               ← stored on cart item
    img:       "...",                             ← stored on cart item
    color:     "Black",
    size:      "XL",
    quantity:  2,
  }
*/

const COLOR_MAP = {
    Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c",
    Blue: "#5bb0e9", Green: "#27ae60", Yellow: "#f1c40f",
    Pink: "#e91e8c", Beige: "#c9a96e", Brown: "#795548",
    Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323",
};

const Cart = () => {
    const { cartItems, updateQty, removeItem, subtotal } = useCart();
    const navigate = useNavigate();

    // ── Shipping settings ──────────────────────────────────────────────
    const [shippingSettings, setShippingSettings] = useState({
        shippingCharge: 79,
        freeShippingThreshold: 999,
    });
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
            .catch(() => { });
    }, []);

    const { shippingCharge: baseShipping, freeShippingThreshold: freeLimit } = shippingSettings;

    // ── Coupon ─────────────────────────────────────────────────────────
    const [discount, setDiscount] = useState(0);
    const [message, setMessage] = useState("");
    const [dynamicCoupon, setDynamicCoupon] = useState(null);
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    // internal tracking to avoid clearing the coupon field on re-render
    const [couponSeed, setCouponSeed] = useState("");

    const finalTotal = subtotal - discount;
    const shippingCharge = finalTotal >= freeLimit ? 0 : baseShipping;
    const grandTotal = finalTotal + shippingCharge;
    const remaining = freeLimit - subtotal;
    const progress = Math.min((subtotal / freeLimit) * 100, 100);

    useEffect(() => {
        const fetchBestCoupon = async () => {
            try {
                if (subtotal <= 0) return;
                const userId = localStorage.getItem("userId");
                const res = await api.get(`/api/coupons/best?subtotal=${subtotal}&userId=${userId}`);
                const best = res.data?.coupon;

                const saved = localStorage.getItem("coupon");
                if (!best || (saved && best.code !== saved)) {
                    localStorage.removeItem("coupon");
                    localStorage.removeItem("discount");
                    setDiscount(0);
                    setCouponInput("");
                    setAppliedCoupon(null);
                    setMessage("");
                }
                setDynamicCoupon(best?.code ? best : null);
            } catch {
                // silently ignore
            }
        };
        fetchBestCoupon();
    }, [subtotal]);

    useEffect(() => {
        if (dynamicCoupon && !couponSeed) {
            setCouponSeed(dynamicCoupon.code);
        }
    }, [dynamicCoupon]);

    const applyBestOffer = (useManualInput = false) => {
        if (!dynamicCoupon) { setMessage("No valid coupons available"); return; }
        if (useManualInput && couponInput !== dynamicCoupon.code) {
            setMessage("Invalid coupon code"); return;
        }
        const discountAmt = dynamicCoupon.discountType === "percent"
            ? (subtotal * dynamicCoupon.discountValue) / 100
            : dynamicCoupon.discountValue;
        setDiscount(discountAmt);
        setCouponInput(dynamicCoupon.code);
        setAppliedCoupon(dynamicCoupon.code);
        setMessage(`✅ ${dynamicCoupon.code} applied`);
        localStorage.setItem("discount", discountAmt);
        localStorage.setItem("coupon", dynamicCoupon.code);
    };

    // ── Auth guard ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!localStorage.getItem("token")) navigate("/login");
    }, [navigate]);

    // ── Image resolver ─────────────────────────────────────────────────
    // Cart item stores img at top level; fall back to populated product.img
    const resolveImg = (item) => {
        const src = item.img || item.product?.img || "";
        if (!src || src.trim() === "") return "/placeholder.png";
        if (src.startsWith("http") || src.startsWith("/")) return src;
        return `${import.meta.env.VITE_API_URL || ""}/${src}`;
    };

    // ── Name / price helpers — cart item stores these directly ──────────
    const itemName = (item) => item.name || item.product?.name || "Product";
    const itemPrice = (item) => Number(item.price ?? item.product?.price ?? 0);

    return (
        <section className="shopping-cart py-5">
            <div className="container">
                <div className="row g-4">

                    {/* ── CART ITEMS ───────────────────────────────────── */}
                    <div className="col-12 col-lg-8">
                        {cartItems.length === 0 ? (
                            <div className="text-center shadow-sm p-5 rounded-4 bg-white">
                                <div style={{ fontSize: 64, marginBottom: 12 }}>🛒</div>
                                <h4 className="fw-bold mb-2">Your cart is empty</h4>
                                <p className="text-muted mb-4">Looks like you haven't added anything yet.</p>
                                <Link to="/shop" className="btn btn-dark px-4">Start Shopping</Link>
                            </div>
                        ) : (
                            <>
                                {cartItems.map((item) => {
                                    const price = itemPrice(item);
                                    const name = itemName(item);
                                    // Use cart subdoc _id for precise remove
                                    const cartItemId = item._id?.toString();
                                    const productId = item.product?._id || item.productId;
                                    const variantId = item.variantId?.toString() || null;

                                    return (
                                        <div
                                            key={cartItemId || `${productId}-${variantId}`}
                                            className="card border-0 shadow-sm mb-3 rounded-4 cart-card"
                                        >
                                            <div className="card-body">
                                                <div className="d-flex flex-column flex-md-row align-items-center gap-3">

                                                    {/* IMAGE */}
                                                    <div style={{ flexShrink: 0 }}>
                                                        <img
                                                            src={resolveImg(item)}
                                                            alt={name}
                                                            className="rounded-3"
                                                            style={{ width: 95, height: 95, objectFit: "cover" }}
                                                            onError={e => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
                                                        />
                                                    </div>

                                                    {/* INFO */}
                                                    <div className="flex-grow-1 text-center text-md-start">
                                                        <h6 className="mb-1 fw-bold">{name}</h6>

                                                        {/* Color + Size badges */}
                                                        {(item.color || item.size) && (
                                                            <div className="d-flex gap-2 justify-content-center justify-content-md-start mb-2 flex-wrap">
                                                                {item.color && (
                                                                    <span className="badge-variant">
                                                                        <span
                                                                            className="color-dot"
                                                                            style={{ background: COLOR_MAP[item.color] || item.color.toLowerCase() }}
                                                                        />
                                                                        {item.color}
                                                                    </span>
                                                                )}
                                                                {item.size && (
                                                                    <span className="badge-variant">
                                                                        Size: {item.size}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <p className="mb-1 text-muted small">
                                                            Price: <strong>Rs.{price.toLocaleString()}</strong>
                                                        </p>
                                                        <p className="mb-0 fw-semibold text-dark">
                                                            Total: Rs.{(price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>

                                                    {/* QTY + REMOVE */}
                                                    <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
                                                        <div className="qty-control">
                                                            <button
                                                                className="qty-btn"
                                                                disabled={item.quantity <= 1}
                                                                onClick={() => updateQty(productId, item.quantity - 1, variantId)}
                                                            >−</button>
                                                            <span className="qty-value">{item.quantity}</span>
                                                            <button
                                                                className="qty-btn"
                                                                onClick={() => updateQty(productId, item.quantity + 1, variantId)}
                                                            >+</button>
                                                        </div>
                                                        <button
                                                            className="btn btn-danger btn-sm px-3"
                                                            onClick={() => removeItem(productId, variantId, cartItemId)}
                                                        >✖</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* FREE SHIPPING BAR */}
                                <div className="bg-white shadow-sm rounded-4 p-3 mb-4">
                                    <div className="fw-semibold mb-2 small">
                                        {subtotal >= freeLimit ? (
                                            <span className="text-success">🎉 You unlocked free shipping!</span>
                                        ) : (
                                            <span className="text-success">
                                                🚚 Add <strong>Rs.{remaining.toFixed(2)}</strong> more for free shipping
                                            </span>
                                        )}
                                    </div>
                                    <div className="progress rounded-pill" style={{ height: 10 }}>
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: `${progress}%`, transition: "width 0.5s ease" }}
                                        />
                                    </div>
                                </div>

                                <Link to="/shop" className="btn btn-outline-dark w-100 py-2">
                                    ← Continue Shopping
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── CART SUMMARY ─────────────────────────────────── */}
                    <div className="col-12 col-lg-4">
                        <div className="bg-white shadow-sm rounded-4 p-4 sticky-lg-top">
                            <h5 className="fw-bold mb-4">Cart Summary</h5>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>Rs.{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row text-success">
                                <span>Discount</span>
                                <span>- Rs.{discount.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>
                                    {shippingCharge === 0
                                        ? <span className="text-success fw-semibold">Free 🎉</span>
                                        : `Rs.${shippingCharge}`}
                                </span>
                            </div>
                            {shippingCharge > 0 && (
                                <p className="text-muted" style={{ fontSize: 11, marginTop: -6 }}>
                                    Add Rs.{Math.max(0, freeLimit - finalTotal).toFixed(2)} after discount for free shipping
                                </p>
                            )}

                            <div className="summary-row border-top pt-3 mt-2 fw-bold fs-5">
                                <span>Total</span>
                                <span>Rs.{grandTotal.toFixed(2)}</span>
                            </div>

                            {dynamicCoupon && !appliedCoupon && (
                                <div className="alert alert-success py-2 mt-3 text-center small">
                                    🎁 <strong>{dynamicCoupon.code}</strong> — Save {dynamicCoupon.discountValue}
                                    {dynamicCoupon.discountType === "percent" ? "%" : " Rs"}
                                </div>
                            )}

                            <input
                                type="text"
                                className="form-control mt-3"
                                placeholder="Enter Coupon Code"
                                value={couponInput}
                                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                            />

                            <div className="d-flex gap-2 mt-2">
                                <button
                                    className="btn btn-success flex-grow-1 fw-bold"
                                    onClick={() => applyBestOffer(false)}
                                >
                                    Best Offer
                                </button>
                                <button
                                    className="btn btn-dark flex-grow-1"
                                    onClick={() => applyBestOffer(true)}
                                    disabled={!couponInput}
                                >
                                    Apply
                                </button>
                            </div>

                            {message && (
                                <p className="mt-2 text-center small fw-semibold text-success">{message}</p>
                            )}
                        </div>

                        <Link
                            to="/checkout"
                            className="btn btn-dark w-100 mt-3 py-2 fw-semibold"
                            onClick={() => localStorage.setItem("shippingCharge", shippingCharge)}
                        >
                            Proceed to Checkout →
                        </Link>
                    </div>

                </div>
            </div>

            <style>{`
                .cart-card {
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .cart-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(0,0,0,.09) !important;
                }
                .badge-variant {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                    padding: 2px 10px;
                    border-radius: 20px;
                    background: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    color: #444;
                    font-weight: 500;
                }
                .color-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,.15);
                    flex-shrink: 0;
                    display: inline-block;
                }
                .qty-control {
                    display: flex;
                    align-items: center;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                    height: 38px;
                }
                .qty-btn {
                    background: #f8f9fa;
                    border: none;
                    width: 36px;
                    height: 100%;
                    font-size: 18px;
                    line-height: 1;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .qty-btn:hover:not(:disabled) { background: #e9ecef; }
                .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .qty-value {
                    min-width: 36px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 15px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                @media (max-width: 576px) {
                    .shopping-cart { padding-top: 20px !important; padding-bottom: 20px !important; }
                    .rounded-4 { border-radius: 14px !important; }
                }
            `}</style>
        </section>
    );
};

export default Cart;
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";
// import api from "../api";

// const Cart = () => {
//     const { cartItems, updateQty, removeItem, subtotal } = useCart();
//     const navigate = useNavigate();
//     // ── Shipping settings from DB ──────────────────────────────────────────
//     const [shippingSettings, setShippingSettings] = useState({
//         shippingCharge: 79,
//         freeShippingThreshold: 999,
//     });
//     useEffect(() => {
//         api.get("/api/settings")
//             .then(res => {
//                 if (res.data) {
//                     setShippingSettings({
//                         shippingCharge: res.data.shippingCharge ?? 79,
//                         freeShippingThreshold: res.data.freeShippingThreshold ?? 999,
//                     });
//                 }
//             })
//             .catch(() => {
//             });
//     }, []);
//     const { shippingCharge: baseShippingCharge, freeShippingThreshold: freeLimit } = shippingSettings;
//     const [coupon, setCoupon] = useState("");
//     const [discount, setDiscount] = useState(0);
//     const [message, setMessage] = useState("");
//     const [dynamicCoupon, setDynamicCoupon] = useState(null);
//     const [couponInput, setCouponInput] = useState("");
//     const [appliedCoupon, setAppliedCoupon] = useState(null);
//     const finalTotal = subtotal - discount;
//     const shippingCharge = finalTotal >= freeLimit ? 0 : baseShippingCharge;
//     const grandTotal = finalTotal + shippingCharge;
//     const remaining = freeLimit - subtotal;
//     const progress = Math.min((subtotal / freeLimit) * 100, 100);

//     // ── Fetch best coupon ──────────────────────────────────────────────────
//     useEffect(() => {
//         const fetchBestCoupon = async () => {
//             try {
//                 if (subtotal <= 0) return;
//                 const userId = localStorage.getItem("userId");
//                 const res = await api.get(`/api/coupons/best?subtotal=${subtotal}&userId=${userId}`);
//                 const best = res.data?.coupon;

//                 // If no valid coupon or saved coupon no longer matches — clear it
//                 const saved = localStorage.getItem("coupon");
//                 if (!best || (saved && best.code !== saved)) {
//                     localStorage.removeItem("coupon");
//                     localStorage.removeItem("discount");
//                     setDiscount(0);
//                     setCouponInput("");
//                     setAppliedCoupon(null);
//                     setMessage("");
//                 }
//                 if (best?.code) setDynamicCoupon(best);
//                 else setDynamicCoupon(null);

//             } catch {
//                 console.log("Coupon fetch error");
//             }
//         };
//         fetchBestCoupon();
//     }, [subtotal]);
//     useEffect(() => {
//         if (dynamicCoupon && !coupon) setCoupon(dynamicCoupon.code);
//     }, [dynamicCoupon]);
//     // ── Apply coupon ─────────────
//     const applyBestOffer = (useManualInput = false) => {
//         if (!dynamicCoupon) { setMessage("No valid coupons available"); return; }
//         if (useManualInput && couponInput !== dynamicCoupon.code) { setMessage("Invalid coupon code"); return; }
//         const discountAmount = dynamicCoupon.discountType === "percent"
//             ? (subtotal * dynamicCoupon.discountValue) / 100
//             : dynamicCoupon.discountValue;
//         setDiscount(discountAmount);
//         setCouponInput(dynamicCoupon.code);
//         setAppliedCoupon(dynamicCoupon.code);
//         setMessage(`${dynamicCoupon.code} applied ✅`);
//         localStorage.setItem("discount", discountAmount);
//         localStorage.setItem("coupon", dynamicCoupon.code);
//     };

//     // ── Auth guard ──────────────────
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (!token) navigate("/login");
//     }, [navigate]);

//     // ── Image resolver ─────────────────────
//     const resolveImg = (item) => {
//         const src = item.img || item.product?.img || "/placeholder.png";
//         if (!src || src === "/placeholder.png") return "/placeholder.png";
//         if (src.startsWith("http") || src.startsWith("/")) return src;
//         return `${import.meta.env.VITE_API_URL || ""}/${src}`;
//     };

//     return (
//         <section className="shopping-cart py-5">
//             <div className="container">
//                 <div className="row g-4">

//                     {/* CART ITEMS */}
//                     <div className="col-12 col-lg-8">
//                         {cartItems.length === 0 ? (
//                             <div className="text-center shadow-sm p-5 rounded bg-white">
//                                 <h4>Your cart is empty 😢</h4>
//                                 <Link to="/shop" className="btn btn-dark mt-3">Continue Shopping</Link>
//                             </div>
//                         ) : (
//                             <>
//                                 {cartItems.map((item) => (
//                                     <div
//                                         key={`${item.product?._id}-${item.variantId || item.size}`}
//                                         className="card border-0 shadow-sm mb-3 rounded-4 cart-card animate-cart"
//                                     >
//                                         <div className="card-body">
//                                             <div className="d-flex flex-column flex-md-row align-items-center gap-3">

//                                                 {/* IMAGE */}
//                                                 <div style={{ position: "relative", flexShrink: 0 }}>
//                                                     <img
//                                                         src={resolveImg(item)}
//                                                         alt={item.product?.name}
//                                                         className="rounded"
//                                                         style={{ width: "95px", height: "95px", objectFit: "cover" }}
//                                                         onError={e => e.target.src = "/placeholder.png"}
//                                                     />
//                                                 </div>

//                                                 {/* INFO */}
//                                                 <div className="flex-grow-1 text-center text-md-start">
//                                                     <h6 className="mb-1 fw-bold">{item.product?.name}</h6>

//                                                     {(item.color || item.size) && (
//                                                         <div className="d-flex gap-2 justify-content-center justify-content-md-start mb-1 flex-wrap">
//                                                             {item.color && (
//                                                                 <span style={{
//                                                                     fontSize: 11, padding: "2px 10px", borderRadius: 20,
//                                                                     background: "#f5f5f5", border: "1px solid #e0e0e0",
//                                                                     color: "#444", fontWeight: 500,
//                                                                     display: "flex", alignItems: "center", gap: 5,
//                                                                 }}>
//                                                                     <span style={{
//                                                                         width: 8, height: 8, borderRadius: "50%",
//                                                                         background: ({
//                                                                             Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c",
//                                                                             Blue: "#5bb0e9", Green: "#27ae60", Yellow: "#f1c40f",
//                                                                             Pink: "#e91e8c", Beige: "#c9a96e", Brown: "#795548",
//                                                                             Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
//                                                                         })[item.color] || item.color.toLowerCase(),
//                                                                         border: "1px solid rgba(0,0,0,.15)", flexShrink: 0,
//                                                                     }} />
//                                                                     {item.color}
//                                                                 </span>
//                                                             )}
//                                                             {item.size && (
//                                                                 <span style={{
//                                                                     fontSize: 11, padding: "2px 10px", borderRadius: 20,
//                                                                     background: "#f5f5f5", border: "1px solid #e0e0e0",
//                                                                     color: "#444", fontWeight: 500,
//                                                                 }}>
//                                                                     Size: {item.size}
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     )}

//                                                     <p className="mb-1 text-muted small">Price: Rs.{item.price}</p>
//                                                     <p className="mb-0 fw-semibold">Total: Rs.{(item.price * item.quantity).toFixed(2)}</p>
//                                                 </div>

//                                                 {/* QTY + REMOVE */}
//                                                 <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
//                                                     <div className="d-flex align-items-center border rounded-3 overflow-hidden" style={{ height: "38px" }}>
//                                                         <button
//                                                             className="btn btn-light border-0 px-3 py-0 h-100"
//                                                             style={{ fontSize: "20px", lineHeight: 1 }}
//                                                             onClick={() => { if (item.quantity > 1) updateQty(item.product._id, item.quantity - 1, item.variantId); }}
//                                                         >−</button>
//                                                         <span className="px-3 fw-semibold" style={{ minWidth: "36px", textAlign: "center" }}>
//                                                             {item.quantity}
//                                                         </span>
//                                                         <button
//                                                             className="btn btn-light border-0 px-3 py-0 h-100"
//                                                             style={{ fontSize: "20px", lineHeight: 1 }}
//                                                             onClick={() => updateQty(item.product._id, item.quantity + 1, item.variantId)}
//                                                         >+</button>
//                                                     </div>
//                                                     <button
//                                                         className="btn btn-danger btn-sm px-3"
//                                                         onClick={() => removeItem(item.product._id, item.variantId, item.variantId)}
//                                                     >✖</button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}

//                                 {/* FREE SHIPPING BAR */}
//                                 <div className="bg-white shadow-sm rounded-4 p-3 mb-4 animate-cart">
//                                     <div className="fw-semibold mb-2">
//                                         {subtotal < freeLimit ? (
//                                             <span className="text-success">Add Rs.{remaining.toFixed(2)} more for free shipping 🚚</span>
//                                         ) : (
//                                             <span className="text-success">You unlocked free shipping 🎉</span>
//                                         )}
//                                     </div>
//                                     <div className="progress rounded-pill" style={{ height: "12px" }}>
//                                         <div className="progress-bar bg-success progress-animate" style={{ width: `${progress}%` }} />
//                                     </div>
//                                 </div>

//                                 <Link to="/shop" className="btn btn-outline-dark w-100 py-2">Continue Shopping</Link>
//                             </>
//                         )}
//                     </div>
//                     {/* SUMMARY */}
//                     <div className="col-12 col-lg-4">
//                         <div className="bg-white shadow-sm rounded-4 p-4 sticky-lg-top animate-cart">
//                             <h5 className="fw-bold mb-4">Cart Summary</h5>

//                             <div className="d-flex justify-content-between mb-2">
//                                 <span>Subtotal</span><span>Rs.{subtotal.toFixed(2)}</span>
//                             </div>
//                             <div className="d-flex justify-content-between mb-2 text-success">
//                                 <span>Discount</span><span>- Rs.{discount.toFixed(2)}</span>
//                             </div>
//                             <div className="d-flex justify-content-between mb-2">
//                                 <span>Shipping</span>
//                                 <span>
//                                     {shippingCharge === 0
//                                         ? <span className="text-success">Free 🎉</span>
//                                         : `Rs.${shippingCharge}`
//                                     }
//                                 </span>
//                             </div>
//                             {shippingCharge > 0 && (
//                                 <div className="text-muted small mb-2" style={{ fontSize: "12px" }}>
//                                     Add Rs.{Math.max(0, freeLimit - finalTotal).toFixed(2)} more after discount for free shipping
//                                 </div>
//                             )}
//                             <div className="d-flex justify-content-between border-top pt-3 fw-bold fs-5">
//                                 <span>Total</span><span>Rs.{grandTotal.toFixed(2)}</span>
//                             </div>

//                             {dynamicCoupon && (
//                                 <div className="alert alert-success text-center py-2 mt-3">
//                                     🎁 <b>{dynamicCoupon.code}</b> available<br />
//                                     Save {dynamicCoupon.discountValue}{dynamicCoupon.discountType === "percent" ? "%" : " Rs"}
//                                 </div>
//                             )}

//                             <input
//                                 type="text"
//                                 className="form-control mt-3"
//                                 placeholder="Enter Coupon Code"
//                                 value={couponInput}
//                                 onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
//                             />
//                             <button onClick={() => applyBestOffer(false)} className="btn btn-success w-100 mt-2 text-dark fw-bold">
//                                 Apply Best Offer
//                             </button>
//                             <button onClick={() => applyBestOffer(true)} className="btn btn-dark w-100 mt-2" disabled={!couponInput}>
//                                 Apply Coupon
//                             </button>
//                             {message && (
//                                 <p className="mt-2 text-center small fw-semibold text-success">{message}</p>
//                             )}
//                         </div>

//                         <Link
//                             to="/checkout"
//                             className="btn btn-dark w-100 mt-4 py-2"
//                             onClick={() => {
//                                 // also save shipping to localStorage so Checkout reads same value
//                                 localStorage.setItem("shippingCharge", shippingCharge);
//                             }}
//                         >
//                             Proceed to Checkout
//                         </Link>
//                     </div>
//                 </div>
//             </div>

//             <style>{`
//                 .cart-card { transition: 0.3s ease; }
//                 .cart-card:hover { transform: translateY(-4px); }
//                 .animate-cart { animation: fadeUp 0.6s ease; }
//                 @keyframes fadeUp {
//                     from { opacity:0; transform: translateY(20px); }
//                     to   { opacity:1; transform: translateY(0); }
//                 }
//                 .progress-animate { animation: growBar 1.2s ease; }
//                 @keyframes growBar { from { width:0; } }
//                 @media(max-width:768px){
//                     .card-body { padding:14px; }
//                     h5 { font-size:20px; }
//                     h6 { font-size:16px; }
//                     .btn { font-size:14px; }
//                 }
//                 @media(max-width:576px){
//                     .shopping-cart { padding-top:20px !important; padding-bottom:20px !important; }
//                     .rounded-4 { border-radius:14px !important; }
//                     .card-body { padding:12px; }
//                     .form-control { height:40px; }
//                 }
//             `}</style>
//         </section>
//     );
// };
// export default Cart;
// // import React, { useEffect, useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import { useCart } from "../context/CartContext";
// // import api from "../api";

// // const Cart = () => {
// //     const { cartItems, updateQty, removeItem, subtotal } = useCart();
// //     const navigate = useNavigate();

// //     const freeLimit = 999;
// //     const remaining = freeLimit - subtotal;
// //     const progress = Math.min((subtotal / freeLimit) * 100, 100);

// //     const [coupon, setCoupon] = useState("");
// //     const [discount, setDiscount] = useState(0);
// //     const [message, setMessage] = useState("");
// //     const [dynamicCoupon, setDynamicCoupon] = useState(null);
// //     const finalTotal = subtotal - discount;
// //     const shippingCharge = finalTotal >= freeLimit ? 0 : 79;
// //     const grandTotal = finalTotal + shippingCharge;
// //     const [couponInput, setCouponInput] = useState("");
// //     const [appliedCoupon, setAppliedCoupon] = useState(null);

// //     useEffect(() => {
// //         const fetchBestCoupon = async () => {
// //             try {
// //                 if (subtotal <= 0) return;
// //                 const userId = localStorage.getItem("userId");
// //                 const res = await api.get(`/api/coupons/best?subtotal=${subtotal}&userId=${userId}`);
// //                 if (res.data?.coupon?.code) setDynamicCoupon(res.data.coupon);
// //             } catch (error) {
// //                 console.log("Coupon fetch error:", error);
// //             }
// //         };
// //         fetchBestCoupon();
// //     }, [subtotal]);

// //     useEffect(() => {
// //         if (dynamicCoupon && !coupon) setCoupon(dynamicCoupon.code);
// //     }, [dynamicCoupon]);

// //     const applyBestOffer = (useManualInput = false) => {
// //         if (!dynamicCoupon) { setMessage("No valid coupons available"); return; }
// //         if (useManualInput && couponInput !== dynamicCoupon.code) { setMessage("Invalid coupon code"); return; }
// //         const discountAmount = dynamicCoupon.discountType === "percent"
// //             ? (subtotal * dynamicCoupon.discountValue) / 100
// //             : dynamicCoupon.discountValue;
// //         setDiscount(discountAmount);
// //         setCouponInput(dynamicCoupon.code);
// //         setAppliedCoupon(dynamicCoupon.code);
// //         setMessage(`${dynamicCoupon.code} applied `);
// //         localStorage.setItem("discount", discountAmount);
// //         localStorage.setItem("coupon", dynamicCoupon.code);
// //     };

// //     useEffect(() => {
// //         const token = localStorage.getItem("token");
// //         if (!token) navigate("/login");
// //     }, [navigate]);

// //     // Resolve image: prefer the saved variant img, fall back to product.img
// //     const resolveImg = (item) => {
// //         const src = item.img || item.product?.img || "/placeholder.png";
// //         if (!src || src === "/placeholder.png") return "/placeholder.png";
// //         if (src.startsWith("http") || src.startsWith("/")) return src;
// //         return `${import.meta.env.VITE_API_URL || ""}/${src}`;
// //     };

// //     return (
// //         <section className="shopping-cart py-5">
// //             <div className="container">
// //                 <div className="row g-4">

// //                     {/* CART ITEMS */}
// //                     <div className="col-12 col-lg-8">
// //                         {cartItems.length === 0 ? (
// //                             <div className="text-center shadow-sm p-5 rounded bg-white">
// //                                 <h4>Your cart is empty 😢</h4>
// //                                 <Link to="/shop" className="btn btn-dark mt-3">Continue Shopping</Link>
// //                             </div>
// //                         ) : (
// //                             <>
// //                                 {cartItems.map((item) => (
// //                                     <div
// //                                         key={`${item.product?._id}-${item.variantId || item.size}`}
// //                                         className="card border-0 shadow-sm mb-3 rounded-4 cart-card animate-cart"
// //                                     >
// //                                         <div className="card-body">
// //                                             <div className="d-flex flex-column flex-md-row align-items-center gap-3">

// //                                                 {/* IMAGE — shows the selected color's photo */}
// //                                                 <div style={{ position: "relative", flexShrink: 0 }}>
// //                                                     <img
// //                                                         src={resolveImg(item)}
// //                                                         alt={item.product?.name}
// //                                                         className="rounded"
// //                                                         style={{ width: "95px", height: "95px", objectFit: "cover" }}
// //                                                         onError={e => e.target.src = "/placeholder.png"}
// //                                                     />
// //                                                 </div>

// //                                                 {/* INFO */}
// //                                                 <div className="flex-grow-1 text-center text-md-start">
// //                                                     <h6 className="mb-1 fw-bold">{item.product?.name}</h6>

// //                                                     {/* Color + Size badges */}
// //                                                     {(item.color || item.size) && (
// //                                                         <div className="d-flex gap-2 justify-content-center justify-content-md-start mb-1 flex-wrap">
// //                                                             {item.color && (
// //                                                                 <span style={{
// //                                                                     fontSize: 11, padding: "2px 10px", borderRadius: 20,
// //                                                                     background: "#f5f5f5", border: "1px solid #e0e0e0",
// //                                                                     color: "#444", fontWeight: 500,
// //                                                                     display: "flex", alignItems: "center", gap: 5,
// //                                                                 }}>
// //                                                                     <span style={{
// //                                                                         width: 8, height: 8, borderRadius: "50%",
// //                                                                         background: ({
// //                                                                             Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c",
// //                                                                             Blue: "#5bb0e9", Green: "#27ae60", Yellow: "#f1c40f",
// //                                                                             Pink: "#e91e8c", Beige: "#c9a96e", Brown: "#795548",
// //                                                                             Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
// //                                                                         })[item.color] || item.color.toLowerCase(),
// //                                                                         border: "1px solid rgba(0,0,0,.15)", flexShrink: 0,
// //                                                                     }} />
// //                                                                     {item.color}
// //                                                                 </span>
// //                                                             )}
// //                                                             {item.size && (
// //                                                                 <span style={{
// //                                                                     fontSize: 11, padding: "2px 10px", borderRadius: 20,
// //                                                                     background: "#f5f5f5", border: "1px solid #e0e0e0",
// //                                                                     color: "#444", fontWeight: 500,
// //                                                                 }}>
// //                                                                     Size: {item.size}
// //                                                                 </span>
// //                                                             )}
// //                                                         </div>
// //                                                     )}

// //                                                     <p className="mb-1 text-muted small">Price: Rs.{item.price}</p>
// //                                                     <p className="mb-0 fw-semibold">Total: Rs.{(item.price * item.quantity).toFixed(2)}</p>
// //                                                 </div>

// //                                                 {/* QTY + REMOVE */}
// //                                                 <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
// //                                                     <div className="d-flex align-items-center border rounded-3 overflow-hidden" style={{ height: "38px" }}>
// //                                                         <button
// //                                                             className="btn btn-light border-0 px-3 py-0 h-100"
// //                                                             style={{ fontSize: "20px", lineHeight: 1 }}
// //                                                             onClick={() => { if (item.quantity > 1) updateQty(item.product._id, item.quantity - 1); }}
// //                                                         >−</button>
// //                                                         <span className="px-3 fw-semibold" style={{ minWidth: "36px", textAlign: "center" }}>
// //                                                             {item.quantity}
// //                                                         </span>
// //                                                         <button
// //                                                             className="btn btn-light border-0 px-3 py-0 h-100"
// //                                                             style={{ fontSize: "20px", lineHeight: 1 }}
// //                                                             onClick={() => updateQty(item.product._id, item.quantity + 1)}
// //                                                         >+</button>
// //                                                     </div>
// //                                                     <button
// //                                                         className="btn btn-danger btn-sm px-3"
// //                                                         onClick={() => removeItem(item.product._id, item.variantId)}
// //                                                     >✖</button>
// //                                                 </div>
// //                                             </div>
// //                                         </div>
// //                                     </div>
// //                                 ))}

// //                                 {/* FREE SHIPPING BAR */}
// //                                 <div className="bg-white shadow-sm rounded-4 p-3 mb-4 animate-cart">
// //                                     <div className="fw-semibold mb-2">
// //                                         {subtotal < freeLimit ? (
// //                                             <span className="text-success">Add Rs.{remaining.toFixed(2)} more for free shipping 🚚</span>
// //                                         ) : (
// //                                             <span className="text-success">You unlocked free shipping 🎉</span>
// //                                         )}
// //                                     </div>
// //                                     <div className="progress rounded-pill" style={{ height: "12px" }}>
// //                                         <div className="progress-bar bg-success progress-animate" style={{ width: `${progress}%` }} />
// //                                     </div>
// //                                 </div>

// //                                 <Link to="/shop" className="btn btn-outline-dark w-100 py-2">Continue Shopping</Link>
// //                             </>
// //                         )}
// //                     </div>

// //                     {/* SUMMARY */}
// //                     <div className="col-12 col-lg-4">
// //                         <div className="bg-white shadow-sm rounded-4 p-4 sticky-lg-top animate-cart">
// //                             <h5 className="fw-bold mb-4">Cart Summary</h5>

// //                             <div className="d-flex justify-content-between mb-2">
// //                                 <span>Subtotal</span><span>Rs.{subtotal.toFixed(2)}</span>
// //                             </div>
// //                             <div className="d-flex justify-content-between mb-2 text-success">
// //                                 <span>Discount</span><span>- Rs.{discount.toFixed(2)}</span>
// //                             </div>
// //                             <div className="d-flex justify-content-between mb-2">
// //                                 <span>Shipping</span>
// //                                 <span>{shippingCharge === 0 ? <span className="text-success">Free</span> : `Rs.${shippingCharge}`}</span>
// //                             </div>
// //                             <div className="d-flex justify-content-between border-top pt-3 fw-bold fs-5">
// //                                 <span>Total</span><span>Rs.{grandTotal.toFixed(2)}</span>
// //                             </div>

// //                             {dynamicCoupon && (
// //                                 <div className="alert alert-success text-center py-2 mt-3">
// //                                     🎁 <b>{dynamicCoupon.code}</b> available<br />
// //                                     Save {dynamicCoupon.discountValue}{dynamicCoupon.discountType === "percent" ? "%" : " Rs"}
// //                                 </div>
// //                             )}

// //                             <input
// //                                 type="text"
// //                                 className="form-control mt-3"
// //                                 placeholder="Enter Coupon Code"
// //                                 value={couponInput}
// //                                 onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
// //                             />
// //                             <button onClick={() => applyBestOffer(false)} className="btn btn-success w-100 mt-2 text-dark fw-bold">
// //                                 Apply Best Offer
// //                             </button>
// //                             <button onClick={() => applyBestOffer(true)} className="btn btn-dark w-100 mt-2" disabled={!couponInput}>
// //                                 Apply Coupon
// //                             </button>
// //                             {message && (
// //                                 <p className="mt-2 text-center small fw-semibold text-success">{message}</p>
// //                             )}
// //                         </div>

// //                         <Link
// //                             to="/checkout"
// //                             className="btn btn-dark w-100 mt-4 py-2"
// //                             onClick={() => {
// //                                 console.log("Navigating to checkout");
// //                                 console.log("localStorage discount:", localStorage.getItem("discount"));
// //                                 console.log("localStorage coupon:", localStorage.getItem("coupon"));
// //                             }}
// //                         >
// //                             Proceed to Checkout
// //                         </Link>
// //                     </div>
// //                 </div>
// //             </div>

// //             <style>{`
// //                 .cart-card { transition: 0.3s ease; }
// //                 .cart-card:hover { transform: translateY(-4px); }
// //                 .animate-cart { animation: fadeUp 0.6s ease; }
// //                 @keyframes fadeUp {
// //                     from { opacity:0; transform: translateY(20px); }
// //                     to   { opacity:1; transform: translateY(0); }
// //                 }
// //                 .progress-animate { animation: growBar 1.2s ease; }
// //                 @keyframes growBar { from { width:0; } }
// //                 @media(max-width:768px){
// //                     .card-body { padding:14px; }
// //                     h5 { font-size:20px; }
// //                     h6 { font-size:16px; }
// //                     .btn { font-size:14px; }
// //                 }
// //                 @media(max-width:576px){
// //                     .shopping-cart { padding-top:20px !important; padding-bottom:20px !important; }
// //                     .rounded-4 { border-radius:14px !important; }
// //                     .card-body { padding:12px; }
// //                     .form-control { height:40px; }
// //                 }
// //             `}</style>
// //         </section>
// //     );
// // };

// // export default Cart;