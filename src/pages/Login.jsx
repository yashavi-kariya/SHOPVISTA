import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from "../api";
import { toast, ToastProvider } from "../components/Toast";
const Login = () => {
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/users/login", {
                email,
                password
            });
            toast({
                type: "success",
                title: "Welcome back!",
                message: res.data.message,
                duration: 3000,
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("userId", res.data.user.id);
            setEmail("");
            setPassword("");
            setTimeout(() => {
                if (res.data.user.role === "admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/");
                }
            }, 1000);
        } catch (error) {

            toast({
                type: "error",
                title: "Login Failed",
                message: error.response?.data?.message || "Something went wrong. Please try again.",
                duration: 4000,
            });
        }
    };

    return (
        <>
            <ToastProvider />
            <div className="login-page-wrapper">
                {/* Visual Side */}
                <div className="login-visual">
                    <div className="brand-quote">
                        <h2>ShopVista</h2>
                        <p>Elevate your lifestyle with our curated collection of premium essentials. Quality you can trust, delivered to your door.</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="login-form-side">
                    <div className="login-content">
                        <h1>Sign In</h1>
                        <p className="subtext">Enter your details to access your account.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Email</label>
                                <div className="input-box">
                                    <Mail className="icon" size={20} />
                                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-box">
                                    <Lock className="icon" size={20} />
                                    <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <span onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer' }}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                            </div>

                            <button type="submit" className="login-btn">
                                Log In <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', margin: '20px 0', color: '#999' }}>OR</div>

                        <button className="google-btn">
                            <img src="https://www.gstatic.com" alt="" />
                            Sign in with Google
                        </button>

                        <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                            New member? <a href="/Register" style={{ color: '#111', fontWeight: 'bold' }}>Join ShopVista</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;