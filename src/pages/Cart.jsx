import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
    const { cartItems, updateQty, removeItem, subtotal } = useCart();
    const navigate = useNavigate();

    // console.log("Cart Items:", cartItems);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            // alert("Please login to view your cart");
            navigate("/login");
        }
    }, [navigate]);



    return (
        <section className="shopping-cart spad">
            <div className="container">
                <div className="row">

                    {/* CART ITEMS */}
                    <div className="col-lg-8">
                        <div className="shopping__cart__table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {cartItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                Your cart is empty 😢
                                            </td>
                                        </tr>
                                    ) : (
                                        cartItems.map((item) => (
                                            <tr key={item.product?._id}>
                                                {/* PRODUCT */}
                                                <td className="product__cart__item">
                                                    <div className="product__cart__item__pic">
                                                        <img
                                                            src={item.product?.img || "/placeholder.png"}
                                                            alt={item.product?.name}
                                                            width="80"
                                                        />
                                                    </div>

                                                    <div className="product__cart__item__text">
                                                        <h6>{item.product.name}</h6>
                                                        <h5>Rs.{Number(item.product.price).toFixed(2)}</h5>
                                                    </div>
                                                </td>

                                                {/* QUANTITY */}
                                                <td className="quantity__item">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 1;
                                                            if (val > 0) {
                                                                updateQty(item.product._id, val);
                                                            }
                                                        }}
                                                    />
                                                </td>

                                                {/* TOTAL */}
                                                <td className="cart__price">
                                                    Rs.{(item.product.price * item.quantity).toFixed(2)}
                                                </td>

                                                {/* REMOVE */}
                                                <td className="cart__close">
                                                    <button
                                                        onClick={() => removeItem(item.product._id)}
                                                        style={{ cursor: "pointer", fontSize: "18px", border: "none", background: "none" }}
                                                    >
                                                        ✖
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="continue__btn mt-3">
                            <Link to="/shop">Continue Shopping</Link>
                        </div>
                    </div>

                    {/* CART SUMMARY */}
                    <div className="col-lg-4">
                        <div className="cart__total">
                            <h6>Cart Total</h6>

                            <ul>
                                <li>
                                    Subtotal
                                    <span>Rs.{(subtotal || 0).toFixed(2)}</span>
                                </li>

                                <li>
                                    Total
                                    <span>Rs.{(subtotal || 0).toFixed(2)}</span>
                                </li>
                            </ul>

                            <Link to="/checkout" className="primary-btn">
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Cart;