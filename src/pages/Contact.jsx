import { useState, useEffect } from "react";
import api from "../api";

const Spinner = () => (
    <span style={{
        display: "inline-block", width: 13, height: 13,
        border: "2px solid currentColor", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.7s linear infinite", verticalAlign: "middle"
    }} />
);

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [topic, setTopic] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        api.get("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setForm(p => ({
                    ...p,
                    name: res.data.name || "",
                    email: res.data.email || ""
                }));
            })
            .catch(() => { });
    }, []);

    const fieldStyle = (name) => ({
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: `1.5px solid ${focused === name ? "#378ADD" : "#D3D1C7"}`,
        background: "var(--color-background-primary)",
        color: "var(--color-text-primary)",
        fontSize: 14, outline: "none", transition: "border 0.2s",
        boxSizing: "border-box", fontFamily: "inherit",
    });

    // ✅ CHANGE 1: was fetch(), now uses api axios instance
    const handleAISuggest = async () => {
        if (!topic.trim()) return;
        setAiLoading(true);
        try {
            const { data } = await api.post("/api/ai/customer-suggest", { topic });
            if (data.suggestion) setSuggestions([data.suggestion, ...suggestions.slice(0, 1)]);
        } catch {
            setError("AI unavailable — write your message manually.");
        }
        setAiLoading(false);
    };

    // ✅ CHANGE 2: was fetch(), now uses api axios instance
    const handleSend = async () => {
        setError("");
        if (!form.name || !form.email || !form.message) {
            setError("Please fill in all fields.");
            return;
        }
        setSendLoading(true);
        try {
            const { data } = await api.post("/api/messages", form);
            if (!data.success) throw new Error(data.error || "Failed to send");
            setSent(true);
        } catch (e) {
            setError(e.response?.data?.error || e.message || "Something went wrong. Please try again.");
        }
        setSendLoading(false);
    };

    const reset = () => {
        setSent(false);
        setForm({ name: "", email: "", message: "" });
        setTopic("");
        setSuggestions([]);
        setError("");
    };

    if (sent) return (
        <div style={{ maxWidth: 520, margin: "4rem auto", padding: "0 16px", textAlign: "center" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ animation: "fadeUp .35s ease" }}>
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "#E1F5EE", margin: "0 auto 1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: "#1D9E75"
                }}>✓</div>
                <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Message sent!</h2>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    We received your message and will get back to you soon.
                </p>
                <button onClick={reset} style={{
                    padding: "8px 22px", borderRadius: 8,
                    border: "1.5px solid #15191d", background: "transparent",
                    color: "#53575a", cursor: "pointer", fontSize: 13
                }}>
                    Send another message
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Map Section */}
            <div className="map">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111551.9926412813!2d-90.27317134641879!3d38.606612219170856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited%20States!5e0!3m2!1sen!2sbd!4v1597926938024!5m2!1sen!2sbd"
                    height="500"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    ariaHidden="false"
                    tabIndex="0"
                    title="Office Location"
                ></iframe>
            </div>
            <div style={{ maxWidth: 520, margin: "2.5rem auto", padding: "0 16px" }}>
                <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

                <div style={{ animation: "fadeUp .35s ease" }}>
                    {/* Header */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <p style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: "#d63449", marginBottom: 4
                        }}>Get in touch</p>
                        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Send us a message</h1>
                        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                            We pay attention to every detail — from first contact to final delivery.
                        </p>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: 12, padding: "1.5rem"
                    }}>
                        {/* Name + Email */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                            {[
                                { key: "name", label: "Name", type: "text", ph: "Jane Smith" },
                                { key: "email", label: "Email", type: "email", ph: "you@example.com" },
                            ].map(({ key, label, type, ph }) => (
                                <div key={key}>
                                    <label style={{
                                        fontSize: 11, fontWeight: 500, display: "block", marginBottom: 5,
                                        textTransform: "uppercase", letterSpacing: "0.05em",
                                        color: "var(--color-text-secondary)"
                                    }}>{label}</label>
                                    <input
                                        type={type}
                                        placeholder={ph}
                                        value={form[key]}
                                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                        onFocus={() => setFocused(key)}
                                        onBlur={() => setFocused("")}
                                        style={fieldStyle(key)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* AI Helper */}
                        <div style={{
                            background: "var(--color-background-secondary)",
                            border: "0.5px solid var(--color-border-tertiary)",
                            borderRadius: 10, padding: 13, marginBottom: 14
                        }}>
                            <p style={{
                                fontSize: 12, fontWeight: 500, color: "#4a4246",
                                marginBottom: 9, display: "flex", alignItems: "center", gap: 5
                            }}>
                                <span style={{ fontSize: 14 }}>✦</span> AI message helper
                            </p>
                            <div style={{ display: "flex", gap: 7 }}>
                                <input
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleAISuggest()}
                                    onFocus={() => setFocused("topic")}
                                    onBlur={() => setFocused("")}
                                    placeholder="Describe your topic…"
                                    style={{ ...fieldStyle("topic"), flex: 1, padding: "8px 11px", fontSize: 13 }}
                                />
                                <button
                                    onClick={handleAISuggest}
                                    disabled={aiLoading || !topic.trim()}
                                    style={{
                                        padding: "8px 14px", borderRadius: 8, border: "none",
                                        background: topic.trim() ? "#185FA5" : "#B5D4F4",
                                        color: "white",
                                        cursor: topic.trim() ? "pointer" : "not-allowed",
                                        fontSize: 12, display: "flex", alignItems: "center", gap: 5,
                                        whiteSpace: "nowrap", fontFamily: "inherit"
                                    }}
                                >
                                    {aiLoading ? <Spinner /> : "✦"} Suggest
                                </button>
                            </div>

                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    onClick={() => { setForm(p => ({ ...p, message: s })); setSuggestions([]); }}
                                    style={{
                                        marginTop: 8, padding: "9px 11px", borderRadius: 8,
                                        background: "var(--color-background-primary)",
                                        border: "0.5px solid var(--color-border-tertiary)",
                                        cursor: "pointer", fontSize: 13,
                                        color: "var(--color-text-primary)", lineHeight: 1.5, transition: "border .15s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = "#378ADD"}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>

                        {/* Message */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{
                                fontSize: 11, fontWeight: 500, display: "block", marginBottom: 5,
                                textTransform: "uppercase", letterSpacing: "0.05em",
                                color: "var(--color-text-secondary)"
                            }}>Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help you?"
                                value={form.message}
                                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                onFocus={() => setFocused("msg")}
                                onBlur={() => setFocused("")}
                                style={{ ...fieldStyle("msg"), resize: "vertical", minHeight: 100 }}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p style={{ color: "#E24B4A", fontSize: 12, marginBottom: 12 }}>{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSend}
                            disabled={sendLoading}
                            style={{
                                width: "100%", padding: 12, borderRadius: 9, border: "none",
                                background: sendLoading ? "#85B7EB" : "#185FA5",
                                color: "white", fontSize: 14, fontWeight: 500,
                                cursor: sendLoading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 7, fontFamily: "inherit"
                            }}
                        >
                            {sendLoading ? <><Spinner /> Sending…</> : "Send message →"}
                        </button>
                    </div>

                    {/* Contact info */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 12, marginTop: 16
                    }}>
                        {[
                            { city: "America", addr: "195 E Parker Square Dr, Parker, CO", phone: "+1 982-314-0958" },
                            { city: "France", addr: "109 Avenue Léon, Clermont-Ferrand", phone: "+33 345-423-9893" },
                        ].map(loc => (
                            <div key={loc.city} style={{
                                padding: "11px 13px", borderRadius: 9,
                                background: "var(--color-background-secondary)",
                                border: "0.5px solid var(--color-border-tertiary)"
                            }}>
                                <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 3 }}>{loc.city}</p>
                                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                                    {loc.addr}<br />{loc.phone}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
// import React from 'react';

// const Contact = () => {
//     return (
//         <main>
//             {/* Map Section */}
//             <div className="map">
//                 <iframe
//                     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111551.9926412813!2d-90.27317134641879!3d38.606612219170856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited%20States!5e0!3m2!1sen!2sbd!4v1597926938024!5m2!1sen!2sbd"
//                     height="500"
//                     style={{ border: 0 }}
//                     allowFullScreen=""
//                     ariaHidden="false"
//                     tabIndex="0"
//                     title="Office Location"
//                 ></iframe>
//             </div>

//             {/* Contact Section */}
//             <section className="contact spad">
//                 <div className="container">
//                     <div className="row">
//                         <div className="col-lg-6 col-md-6">
//                             <div className="contact__text">
//                                 <div className="section-title">
//                                     <span>Information</span>
//                                     <h2>Contact Us</h2>
//                                     <p>As you might expect of a company that began as a high-end interiors contractor, we pay strict attention.</p>
//                                 </div>
//                                 <ul>
//                                     <li>
//                                         <h4>America</h4>
//                                         <p>195 E Parker Square Dr, Parker, CO 801 <br />+43 982-314-0958</p>
//                                     </li>
//                                     <li>
//                                         <h4>France</h4>
//                                         <p>109 Avenue Léon, 63 Clermont-Ferrand <br />+12 345-423-9893</p>
//                                     </li>
//                                 </ul>
//                             </div>
//                         </div>
//                         <div className="col-lg-6 col-md-6">
//                             <div className="contact__form">
//                                 <form onSubmit={(e) => e.preventDefault()}>
//                                     <div className="row">
//                                         <div className="col-lg-6">
//                                             <input type="text" placeholder="Name" />
//                                         </div>
//                                         <div className="col-lg-6">
//                                             <input type="text" placeholder="Email" />
//                                         </div>
//                                         <div className="col-lg-12">
//                                             <textarea placeholder="Message"></textarea>
//                                             <button type="submit" className="site-btn">Send Message</button>
//                                         </div>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </main>
//     );
// };

// export default Contact;
