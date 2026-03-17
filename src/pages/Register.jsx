import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from "axios";

const Register = () => {

    const [showPass, setShowPass] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const res = await axios.post(
                "http://localhost:3001/api/auth/register",
                { name, email, password }
            );

            alert(res.data.message);

            localStorage.setItem("token", res.data.token);

        } catch (error) {

            alert(error.response?.data?.message || "Registration failed");

        }
    };

    return (
        <div className="login-page-wrapper">

            <div className="login-visual register-bg">
                <div className="brand-quote">
                    <h2>Join ShopVista</h2>
                    <p>Create an account to unlock personalized recommendations, track your orders, and enjoy faster checkout.</p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-content">

                    <h1>Create Account</h1>
                    <p className="subtext">Fill in your details to get started.</p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-box">
                                <User className="icon" size={20} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-box">
                                <Mail className="icon" size={20} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-box">
                                <Lock className="icon" size={20} />
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Minimum 8 characters"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer' }}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="login-btn">
                            Create Account <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default Register;