// import { useNavigate } from "react-router-dom";
// import React, { useState } from 'react';
// import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
// import api from "api";

// const Login = () => {
//     const [showPass, setShowPass] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const navigate = useNavigate();
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {

//             const res = await api.post("http://localhost:3001/api/users/login", {
//                 email,
//                 password
//             });

//             alert(res.data.message);

//             localStorage.setItem("token", res.data.token);

//             setEmail("");
//             setPassword("");
//             navigate("/");
//         } catch (error) {

//             alert(error.response.data.message);

//         }
//     };

//     return (
//         <div className="login-page-wrapper">
//             {/* Visual Side */}
//             <div className="login-visual">
//                 <div className="brand-quote">
//                     <h2>ShopVista</h2>
//                     <p>Elevate your lifestyle with our curated collection of premium essentials. Quality you can trust, delivered to your door.</p>
//                 </div>
//             </div>

//             {/* Form Side */}
//             <div className="login-form-side">
//                 <div className="login-content">
//                     <h1>Sign In</h1>
//                     <p className="subtext">Enter your details to access your account.</p>

//                     <form onSubmit={handleSubmit}>
//                         <div className="input-group">
//                             <label>Email</label>
//                             <div className="input-box">
//                                 <Mail className="icon" size={20} />
//                                 <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
//                             </div>
//                         </div>
//                         <div className="input-group">
//                             <label>Password</label>
//                             <div className="input-box">
//                                 <Lock className="icon" size={20} />
//                                 <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
//                                 <span onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer' }}>
//                                     {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
//                                 </span>
//                             </div>
//                         </div>

//                         <button type="submit" className="login-btn">
//                             Log In <ArrowRight size={18} style={{ marginLeft: '10px' }} />
//                         </button>
//                     </form>

//                     <div style={{ textAlign: 'center', margin: '20px 0', color: '#999' }}>OR</div>

//                     <button className="google-btn">
//                         <img src="https://www.gstatic.com" alt="" />
//                         Sign in with Google
//                     </button>

//                     <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
//                         New member? <a href="/Register" style={{ color: '#111', fontWeight: 'bold' }}>Join ShopVista</a>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;

import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
// import api from "api";
import api from "../api";

const Login = () => {
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            const res = await api.post("http://localhost:3001/api/users/login", {
                email,
                password
            });

            alert(res.data.message);

            // ✅ Store token + user
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("userId", res.data.user.id);

            setEmail("");
            setPassword("");

            // ✅ Role-based redirect
            if (res.data.user.role === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/");
            }

        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
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
    );
};

export default Login;

