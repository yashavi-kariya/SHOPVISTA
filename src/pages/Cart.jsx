import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
// import api from "api";
import api from "../api";
const Cart = () => {
    const { cartItems, updateQty, removeItem, subtotal } = useCart();
    const navigate = useNavigate();

    const freeLimit = 999;
    const remaining = freeLimit - subtotal;
    const progress = Math.min((subtotal / freeLimit) * 100, 100);

    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [message, setMessage] = useState("");
    const [dynamicCoupon, setDynamicCoupon] = useState(null);
    const finalTotal = subtotal - discount;
    const shippingCharge = finalTotal >= freeLimit ? 0 : 79;
    const grandTotal = finalTotal + shippingCharge;
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    useEffect(() => {
        const fetchBestCoupon = async () => {
            try {
                if (subtotal <= 0) return;

                const userId = localStorage.getItem("userId"); // ✅ must be saved at login

                const res = await api.get(
                    `/api/coupons/best?subtotal=${subtotal}&userId=${userId}` // ✅
                );

                if (res.data?.coupon?.code) {
                    setDynamicCoupon(res.data.coupon);
                }

            } catch (error) {
                console.log("Coupon fetch error:", error);
            }
        };

        fetchBestCoupon();
    }, [subtotal]);

    useEffect(() => {
        if (dynamicCoupon && !coupon) {
            setCoupon(dynamicCoupon.code);
        }
    }, [dynamicCoupon]);

    const applyBestOffer = (useManualInput = false) => {
        if (!dynamicCoupon) {
            setMessage("No valid coupons available");
            return;
        }


        if (useManualInput && couponInput !== dynamicCoupon.code) {
            setMessage("Invalid coupon code");
            return;
        }

        const discountAmount =
            dynamicCoupon.discountType === "percent"
                ? (subtotal * dynamicCoupon.discountValue) / 100
                : dynamicCoupon.discountValue;

        setDiscount(discountAmount);
        setCouponInput(dynamicCoupon.code);
        setAppliedCoupon(dynamicCoupon.code);
        setMessage(`${dynamicCoupon.code} applied `);
        localStorage.setItem("discount", discountAmount);
        localStorage.setItem("coupon", dynamicCoupon.code);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/login");
    }, [navigate]);

    return (
        <section className="shopping-cart py-5">
            <div className="container">
                <div className="row g-4">

                    {/* CART ITEMS */}
                    <div className="col-12 col-lg-8">

                        {cartItems.length === 0 ? (
                            <div className="text-center shadow-sm p-5 rounded bg-white">
                                <h4>Your cart is empty 😢</h4>
                                <Link to="/shop" className="btn btn-dark mt-3">
                                    Continue Shopping
                                </Link>
                            </div>
                        ) : (
                            <>
                                {cartItems.map((item) => (
                                    <div
                                        key={`${item.product?._id}-${item.variantId || item.size}`}
                                        className="card border-0 shadow-sm mb-3 rounded-4 cart-card animate-cart"
                                    >
                                        <div className="card-body">

                                            {/* MOBILE + DESKTOP FLEX */}
                                            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                                                {/* IMAGE */}
                                                <img
                                                    src={item.product?.img || "/placeholder.png"}
                                                    alt={item.product?.name}
                                                    className="rounded"
                                                    style={{
                                                        width: "95px",
                                                        height: "95px",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                                {/* INFO */}
                                                <div className="flex-grow-1 text-center text-md-start">
                                                    <h6 className="mb-1 fw-bold">
                                                        {item.product?.name}
                                                    </h6>
                                                    <p className="mb-1 text-muted small">
                                                        Price: Rs.{item.price}
                                                    </p>
                                                    <p className="mb-0 fw-semibold">
                                                        Total: Rs.
                                                        {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>

                                                {/* QTY + REMOVE */}
                                                <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
                                                    <div className="d-flex align-items-center border rounded-3 overflow-hidden" style={{ height: "38px" }}>
                                                        <button
                                                            className="btn btn-light border-0 px-3 py-0 h-100"
                                                            style={{ fontSize: "20px", lineHeight: 1 }}
                                                            onClick={() => {
                                                                if (item.quantity > 1) {
                                                                    updateQty(item.product._id, item.quantity - 1);
                                                                }
                                                            }}
                                                        >−</button>
                                                        <span className="px-3 fw-semibold" style={{ minWidth: "36px", textAlign: "center" }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-light border-0 px-3 py-0 h-100"
                                                            style={{ fontSize: "20px", lineHeight: 1 }}
                                                            onClick={() => updateQty(item.product._id, item.quantity + 1)}
                                                        >+</button>
                                                    </div>

                                                    <button
                                                        className="btn btn-danger btn-sm px-3"
                                                        onClick={() => removeItem(item.product._id, item.variantId)}
                                                    >✖</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* FREE SHIPPING BOX */}
                                <div className="bg-white shadow-sm rounded-4 p-3 mb-4 animate-cart">
                                    <div className="fw-semibold mb-2">
                                        {subtotal < freeLimit ? (
                                            <span className="text-success">
                                                Add Rs.{remaining.toFixed(2)} more for
                                                free shipping 🚚
                                            </span>
                                        ) : (
                                            <span className="text-success">
                                                You unlocked free shipping 🎉
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className="progress rounded-pill"
                                        style={{ height: "12px" }}
                                    >
                                        <div
                                            className="progress-bar bg-success progress-animate"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* CONTINUE SHOPPING */}
                                <Link
                                    to="/shop"
                                    className="btn btn-outline-dark w-100 py-2"
                                >
                                    Continue Shopping
                                </Link>
                            </>
                        )}
                    </div>

                    {/* SUMMARY */}
                    <div className="col-12 col-lg-4">
                        <div className="bg-white shadow-sm rounded-4 p-4 sticky-lg-top animate-cart">
                            <h5 className="fw-bold mb-4">Cart Summary</h5>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>Rs.{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 text-success">
                                <span>Discount</span>
                                <span>- Rs.{discount.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Shipping</span>
                                <span>{shippingCharge === 0 ? (
                                    <span className="text-success">Free</span>
                                ) : (
                                    `Rs.${shippingCharge}`
                                )}</span>
                            </div>

                            <div className="d-flex justify-content-between border-top pt-3 fw-bold fs-5">
                                <span>Total</span>
                                <span>Rs.{grandTotal.toFixed(2)}</span>
                            </div>
                            {dynamicCoupon && (
                                <div className="alert alert-success text-center py-2">
                                    🎁 <b>{dynamicCoupon.code}</b> available<br />
                                    Save {dynamicCoupon.discountValue}
                                    {dynamicCoupon.discountType === "percent" ? "%" : " Rs"}
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Enter Coupon Code"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            />

                            {/* Auto-applies best coupon */}
                            <button onClick={() => applyBestOffer(false)} className="btn btn-success w-100 mt-2 text-dark fw-bold">
                                Apply Best Offer
                            </button>

                            {/* Validates manually typed code */}
                            <button onClick={() => applyBestOffer(true)} className="btn btn-dark w-100" disabled={!couponInput}>
                                Apply Coupon
                            </button>
                            {message && (
                                <p className="mt-2 text-center small fw-semibold text-success">
                                    {message}
                                </p>
                            )}
                        </div>

                        <Link
                            to="/checkout"
                            className="btn btn-dark w-100 mt-4 py-2"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
            {/* </div> */}

            {/* CSS */}
            <style>{`
                .cart-card{
                    transition: 0.3s ease;
                }

                .cart-card:hover{
                    transform: translateY(-4px);
                }

                .animate-cart{
                    animation: fadeUp 0.6s ease;
                }

                @keyframes fadeUp{
                    from{
                        opacity:0;
                        transform: translateY(20px);
                    }
                    to{
                        opacity:1;
                        transform: translateY(0);
                    }
                }

                .progress-animate{
                    animation: growBar 1.2s ease;
                }

                @keyframes growBar{
                    from{
                        width:0;
                    }
                }
                @media(max-width:768px){
                    .card-body{
                        padding:14px;
                    }

                    h5{
                        font-size:20px;
                    }

                    h6{
                        font-size:16px;
                    }

                    .btn{
                        font-size:14px;
                    }
                }
                @media(max-width:576px){
                    .shopping-cart{
                        padding-top:20px !important;
                        padding-bottom:20px !important;
                    }

                    .rounded-4{
                        border-radius:14px !important;
                    }

                    .card-body{
                        padding:12px;
                    }

                    .form-control{
                        height:40px;
                    }
                }
            `}</style>
        </section >
    );
};
export default Cart;

// import React, { useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";

// const Cart = () => {
//     const { cartItems, updateQty, removeItem, subtotal } = useCart();
//     const navigate = useNavigate();

//     const freeLimit = 999;
//     const remaining = freeLimit - subtotal;
//     // const cartTotal = cartItems.reduce(
//     //     (total, item) => total + item.price * item.quantity,
//     //     0
//     // );


//     // console.log("Cart Items:", cartItems);

//     useEffect(() => {
//         const token = localStorage.getItem("token");

//         if (!token) {
//             // alert("Please login to view your cart");
//             navigate("/login");
//         }
//     }, [navigate]);



//     return (
//         <section className="shopping-cart spad">
//             <div className="container">
//                 <div className="row">

//                     {/* CART ITEMS */}
//                     <div className="col-lg-8">
//                         <div className="shopping__cart__table">
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th>Product</th>
//                                         <th>Quantity</th>
//                                         <th>Total</th>
//                                         <th></th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {cartItems.length === 0 ? (
//                                         <tr>
//                                             <td colSpan="4" className="text-center">
//                                                 Your cart is empty 😢
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         cartItems.map((item) => (
//                                             <tr key={`${item.product?._id}-${item.variantId || item.size || Math.random()}`}>
//                                                 {/* PRODUCT */}
//                                                 <td className="product__cart__item">
//                                                     <div className="product__cart__item__pic">
//                                                         <img
//                                                             src={item.product?.img || "/placeholder.png"}
//                                                             alt={item.product?.name}
//                                                             width="80"
//                                                         />
//                                                     </div>
//                                                     <div className="product__cart__item__text">
//                                                         <h6>{item.product.name}</h6>
//                                                         Rs.{(item.price * item.quantity).toFixed(2)}
//                                                     </div>
//                                                 </td>

//                                                 {/* QUANTITY */}
//                                                 <td className="quantity__item">
//                                                     <input
//                                                         type="number"
//                                                         min="1"
//                                                         value={item.quantity}
//                                                         onChange={(e) => {
//                                                             const val = parseInt(e.target.value) || 1;
//                                                             if (val > 0) {
//                                                                 updateQty(item.product._id, item.variantId, val)
//                                                             }
//                                                         }}
//                                                     />
//                                                 </td>

//                                                 {/* TOTAL */}
//                                                 <td className="cart__price">
//                                                     Rs.{(item.price * item.quantity).toFixed(2)}
//                                                 </td>
//                                                 {subtotal < freeLimit ? (
//                                                     <p style={{ color: "green", fontWeight: "bold" }}>Add Rs.{remaining.toFixed(2)} more for free shipping!</p>
//                                                 ) : (
//                                                     <p>You have free shipping!</p>
//                                                 )}

//                                                 {/* REMOVE */}
//                                                 <td className="cart__close">
//                                                     <button
//                                                         className="cart__remove-btn"
//                                                         onClick={() => removeItem(item.product._id, item.variantId)}
//                                                         aria-label="Remove item"
//                                                     >
//                                                         ✖
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="continue__btn mt-3">
//                             <Link to="/shop">Continue Shopping</Link>
//                         </div>
//                     </div>

//                     {/* CART SUMMARY */}
//                     <div className="col-lg-4">
//                         <div className="cart__total">
//                             <h6>Cart Total</h6>

//                             <ul>
//                                 <li>
//                                     Subtotal
//                                     <span>Rs.{(subtotal || 0).toFixed(2)}</span>
//                                 </li>

//                                 <li>
//                                     Total
//                                     <span>Rs.{(subtotal || 0).toFixed(2)}</span>
//                                 </li>
//                             </ul>

//                             <Link to="/checkout" className="primary-btn">
//                                 Proceed to Checkout
//                             </Link>
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Cart;