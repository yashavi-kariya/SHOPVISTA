import { useState, useEffect, useRef } from "react";
import api from "../api";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes checkPop { 0% { transform: scale(0); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }

.cf-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }

.cf-wrap .map-section iframe {
  width: 100%; height: 420px; border: 0; display: block;
}

.cf-form-outer {
  max-width: 560px; margin: 0 auto; padding: 3rem 1.25rem 4rem;
}

.cf-eyebrow {
  font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
  text-transform: uppercase; color: #c0392b;
  margin-bottom: 0.4rem; animation: fadeUp .4s ease both;
}

.cf-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(28px, 5vw, 38px); font-weight: 400;
  color: var(--color-text-primary); line-height: 1.15;
  margin: 0 0 0.5rem; animation: fadeUp .45s .05s ease both;
}

.cf-subtitle {
  font-size: 14px; color: var(--color-text-secondary);
  line-height: 1.65; margin: 0 0 2rem;
  animation: fadeUp .45s .1s ease both;
}

.cf-card {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: 16px; padding: 1.75rem;
  animation: fadeUp .5s .15s ease both;
  position: relative; overflow: hidden;
}

.cf-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #c0392b 0%, #e74c3c 40%, #185FA5 100%);
}

.cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
@media (max-width: 480px) { .cf-row { grid-template-columns: 1fr; } }

.cf-field { position: relative; }
.cf-field label {
  display: block; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--color-text-secondary); margin-bottom: 6px;
}

.cf-input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  border: 1px solid var(--color-border-tertiary);
  background: var(--color-background-secondary);
  color: var(--color-text-primary); font-size: 14px;
  outline: none; transition: border .2s, background .2s, box-shadow .2s;
  font-family: 'DM Sans', sans-serif;
}
.cf-input:hover { border-color: var(--color-border-secondary); }
.cf-input:focus {
  border-color: #185FA5; background: var(--color-background-primary);
  box-shadow: 0 0 0 3px rgba(24,95,165,0.08);
}
.cf-input::placeholder { color: var(--color-text-tertiary); }

.cf-ai-box {
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: 12px; padding: 14px; margin-bottom: 14px;
  transition: border .2s;
}
.cf-ai-box:focus-within { border-color: rgba(24,95,165,.3); }

.cf-ai-label {
  font-size: 12px; font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}

.cf-ai-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #185FA5; animation: pulse 2s infinite;
}

.cf-ai-row { display: flex; gap: 8px; }

.cf-suggest-btn {
  padding: 9px 15px; border-radius: 9px; border: none;
  background: #185FA5; color: white;
  font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  cursor: pointer; white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
  transition: background .15s, transform .1s;
}
.cf-suggest-btn:hover:not(:disabled) { background: #0C447C; transform: translateY(-1px); }
.cf-suggest-btn:active:not(:disabled) { transform: translateY(0); }
.cf-suggest-btn:disabled { background: #85B7EB; cursor: not-allowed; }

.cf-suggestion {
  margin-top: 8px; padding: 10px 12px; border-radius: 9px;
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  cursor: pointer; font-size: 13px; line-height: 1.55;
  color: var(--color-text-primary); transition: border .15s, transform .15s;
  animation: slideIn .25s ease both;
}
.cf-suggestion:hover {
  border-color: #185FA5; transform: translateX(3px);
}

.cf-divider {
  height: 0.5px; background: var(--color-border-tertiary);
  margin: 16px 0;
}

.cf-error {
  font-size: 12px; color: #E24B4A;
  margin-bottom: 12px; padding: 9px 12px;
  background: #FCEBEB; border-radius: 8px;
  animation: fadeUp .2s ease;
}

.cf-submit {
  width: 100%; padding: 13px; border-radius: 11px; border: none;
  background: #185FA5; color: white;
  font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; transition: background .15s, transform .1s, box-shadow .15s;
  letter-spacing: 0.01em;
}
.cf-submit:hover:not(:disabled) {
  background: #0C447C;
  box-shadow: 0 4px 14px rgba(24,95,165,.25);
  transform: translateY(-1px);
}
.cf-submit:active:not(:disabled) { transform: translateY(0); }
.cf-submit:disabled { background: #85B7EB; cursor: not-allowed; }

.cf-offices {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px; margin-top: 20px;
  animation: fadeUp .6s .25s ease both;
}

.cf-office {
  padding: 14px 16px; border-radius: 12px;
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  transition: border .2s, transform .2s;
}
.cf-office:hover { border-color: var(--color-border-secondary); transform: translateY(-2px); }

.cf-office-city {
  font-size: 13px; font-weight: 500;
  color: var(--color-text-primary); margin-bottom: 5px;
  display: flex; align-items: center; gap: 7px;
}
.cf-office-flag { font-size: 16px; }
.cf-office-detail {
  font-size: 12px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;
}

.cf-sent-wrap {
  max-width: 420px; margin: 5rem auto; padding: 0 1.25rem;
  text-align: center; animation: fadeUp .4s ease both;
}
.cf-sent-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: #E1F5EE; margin: 0 auto 1.25rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: #0F6E56;
  animation: checkPop .4s .1s ease both;
}
.cf-sent-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px; font-weight: 400; margin-bottom: 8px;
  color: var(--color-text-primary);
}
.cf-sent-sub { font-size: 13.5px; color: var(--color-text-secondary); line-height: 1.65; margin-bottom: 1.75rem; }
.cf-reset-btn {
  padding: 9px 22px; border-radius: 9px;
  border: 0.5px solid var(--color-border-secondary);
  background: transparent; color: var(--color-text-secondary);
  cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif;
  transition: background .15s;
}
.cf-reset-btn:hover { background: var(--color-background-secondary); }

.cf-spinner {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle;
}
`;

const Spinner = () => <span className="cf-spinner" />;

const offices = [
    { city: "America", flag: "🇺🇸", addr: "195 E Parker Square Dr, Parker, CO", phone: "+1 982-314-0958" },
    { city: "France", flag: "🇫🇷", addr: "109 Avenue Léon, Clermont-Ferrand", phone: "+33 345-423-9893" },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [topic, setTopic] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        api.get("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setForm(p => ({ ...p, name: res.data.name || "", email: res.data.email || "" }));
            })
            .catch(() => { });
    }, []);

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

    const handleSend = async () => {
        setError("");
        if (!form.name || !form.email || !form.message) {
            setError("Please fill in all fields before sending.");
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
        <div className="cf-wrap">
            <style>{css}</style>
            <div className="cf-sent-wrap">
                <div className="cf-sent-icon">✓</div>
                <h2 className="cf-sent-title">Message received</h2>
                <p className="cf-sent-sub">
                    We got your message and will get back to you as soon as possible. Thank you for reaching out.
                </p>
                <button onClick={reset} className="cf-reset-btn">Send another message</button>
            </div>
        </div>
    );

    return (
        <div className="cf-wrap">
            <style>{css}</style>

            {/* Map — untouched */}
            <div className="map-section">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111551.9926412813!2d-90.27317134641879!3d38.606612219170856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited%20States!5e0!3m2!1sen!2sbd!4v1597926938024!5m2!1sen!2sbd"
                    height="500"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    aria-hidden="false"
                    tabIndex="0"
                    title="Office Location"
                />
            </div>

            {/* Form Section */}
            <div className="cf-form-outer">

                {/* Header */}
                <p className="cf-eyebrow">Get in touch</p>
                <h1 className="cf-title">Send us a message</h1>
                <p className="cf-subtitle">
                    We pay attention to every detail —<br />from first contact to final delivery.
                </p>

                {/* Card */}
                <div className="cf-card">

                    {/* Name + Email */}
                    <div className="cf-row">
                        {[
                            { key: "name", label: "Name", type: "text", ph: "Jane Smith" },
                            { key: "email", label: "Email", type: "email", ph: "you@example.com" },
                        ].map(({ key, label, type, ph }) => (
                            <div className="cf-field" key={key}>
                                <label>{label}</label>
                                <input
                                    className="cf-input"
                                    type={type}
                                    placeholder={ph}
                                    value={form[key]}
                                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>

                    {/* AI Helper */}
                    <div className="cf-ai-box">
                        <p className="cf-ai-label">
                            <span className="cf-ai-dot" />
                            AI message helper
                        </p>
                        <div className="cf-ai-row">
                            <input
                                className="cf-input"
                                style={{ flex: 1, background: "var(--color-background-primary)" }}
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAISuggest()}
                                placeholder="Describe your topic…"
                            />
                            <button
                                className="cf-suggest-btn"
                                onClick={handleAISuggest}
                                disabled={aiLoading || !topic.trim()}
                            >
                                {aiLoading ? <Spinner /> : "✦"} Suggest
                            </button>
                        </div>
                        {suggestions.map((s, i) => (
                            <div
                                key={i}
                                className="cf-suggestion"
                                onClick={() => { setForm(p => ({ ...p, message: s })); setSuggestions([]); }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    <div className="cf-divider" />

                    {/* Message */}
                    <div className="cf-field" style={{ marginBottom: 16 }}>
                        <label>Message</label>
                        <textarea
                            className="cf-input"
                            rows={4}
                            placeholder="How can we help you?"
                            value={form.message}
                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                            style={{ resize: "vertical", minHeight: 110 }}
                        />
                    </div>

                    {/* Error */}
                    {error && <div className="cf-error">{error}</div>}

                    {/* Submit */}
                    <button className="cf-submit" onClick={handleSend} disabled={sendLoading}>
                        {sendLoading ? <><Spinner /> Sending…</> : "Send message →"}
                    </button>
                </div>

                {/* Offices */}
                <div className="cf-offices">
                    {offices.map(loc => (
                        <div key={loc.city} className="cf-office">
                            <p className="cf-office-city">
                                <span className="cf-office-flag">{loc.flag}</span>
                                {loc.city}
                            </p>
                            <p className="cf-office-detail">{loc.addr}<br />{loc.phone}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
// import { useState, useEffect } from "react";
// import api from "../api";

// const Spinner = () => (
//     <span style={{
//         display: "inline-block", width: 13, height: 13,
//         border: "2px solid currentColor", borderTopColor: "transparent",
//         borderRadius: "50%", animation: "spin 0.7s linear infinite", verticalAlign: "middle"
//     }} />
// );

// export default function ContactPage() {
//     const [form, setForm] = useState({ name: "", email: "", message: "" });
//     const [topic, setTopic] = useState("");
//     const [suggestions, setSuggestions] = useState([]);
//     const [aiLoading, setAiLoading] = useState(false);
//     const [sendLoading, setSendLoading] = useState(false);
//     const [sent, setSent] = useState(false);
//     const [error, setError] = useState("");
//     const [focused, setFocused] = useState("");

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (!token) return;
//         api.get("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } })
//             .then(res => {
//                 setForm(p => ({
//                     ...p,
//                     name: res.data.name || "",
//                     email: res.data.email || ""
//                 }));
//             })
//             .catch(() => { });
//     }, []);

//     const fieldStyle = (name) => ({
//         width: "100%", padding: "10px 12px", borderRadius: 8,
//         border: `1.5px solid ${focused === name ? "#378ADD" : "#D3D1C7"}`,
//         background: "var(--color-background-primary)",
//         color: "var(--color-text-primary)",
//         fontSize: 14, outline: "none", transition: "border 0.2s",
//         boxSizing: "border-box", fontFamily: "inherit",
//     });

//     // ✅ CHANGE 1: was fetch(), now uses api axios instance
//     const handleAISuggest = async () => {
//         if (!topic.trim()) return;
//         setAiLoading(true);
//         try {
//             const { data } = await api.post("/api/ai/customer-suggest", { topic });
//             if (data.suggestion) setSuggestions([data.suggestion, ...suggestions.slice(0, 1)]);
//         } catch {
//             setError("AI unavailable — write your message manually.");
//         }
//         setAiLoading(false);
//     };

//     // ✅ CHANGE 2: was fetch(), now uses api axios instance
//     const handleSend = async () => {
//         setError("");
//         if (!form.name || !form.email || !form.message) {
//             setError("Please fill in all fields.");
//             return;
//         }
//         setSendLoading(true);
//         try {
//             const { data } = await api.post("/api/messages", form);
//             if (!data.success) throw new Error(data.error || "Failed to send");
//             setSent(true);
//         } catch (e) {
//             setError(e.response?.data?.error || e.message || "Something went wrong. Please try again.");
//         }
//         setSendLoading(false);
//     };

//     const reset = () => {
//         setSent(false);
//         setForm({ name: "", email: "", message: "" });
//         setTopic("");
//         setSuggestions([]);
//         setError("");
//     };

//     if (sent) return (
//         <div style={{ maxWidth: 520, margin: "4rem auto", padding: "0 16px", textAlign: "center" }}>
//             <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
//             <div style={{ animation: "fadeUp .35s ease" }}>
//                 <div style={{
//                     width: 56, height: 56, borderRadius: "50%",
//                     background: "#E1F5EE", margin: "0 auto 1rem",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: 22, color: "#1D9E75"
//                 }}>✓</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Message sent!</h2>
//                 <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
//                     We received your message and will get back to you soon.
//                 </p>
//                 <button onClick={reset} style={{
//                     padding: "8px 22px", borderRadius: 8,
//                     border: "1.5px solid #15191d", background: "transparent",
//                     color: "#53575a", cursor: "pointer", fontSize: 13
//                 }}>
//                     Send another message
//                 </button>
//             </div>
//         </div>
//     );

//     return (
//         <>
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
//             <div style={{ maxWidth: 520, margin: "2.5rem auto", padding: "0 16px" }}>
//                 <style>{`
//                 @keyframes spin { to { transform: rotate(360deg); } }
//                 @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//             `}</style>

//                 <div style={{ animation: "fadeUp .35s ease" }}>
//                     {/* Header */}
//                     <div style={{ marginBottom: "1.5rem" }}>
//                         <p style={{
//                             fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
//                             textTransform: "uppercase", color: "#d63449", marginBottom: 4
//                         }}>Get in touch</p>
//                         <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Send us a message</h1>
//                         <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
//                             We pay attention to every detail — from first contact to final delivery.
//                         </p>
//                     </div>

//                     {/* Card */}
//                     <div style={{
//                         background: "var(--color-background-primary)",
//                         border: "0.5px solid var(--color-border-tertiary)",
//                         borderRadius: 12, padding: "1.5rem"
//                     }}>
//                         {/* Name + Email */}
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
//                             {[
//                                 { key: "name", label: "Name", type: "text", ph: "Jane Smith" },
//                                 { key: "email", label: "Email", type: "email", ph: "you@example.com" },
//                             ].map(({ key, label, type, ph }) => (
//                                 <div key={key}>
//                                     <label style={{
//                                         fontSize: 11, fontWeight: 500, display: "block", marginBottom: 5,
//                                         textTransform: "uppercase", letterSpacing: "0.05em",
//                                         color: "var(--color-text-secondary)"
//                                     }}>{label}</label>
//                                     <input
//                                         type={type}
//                                         placeholder={ph}
//                                         value={form[key]}
//                                         onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
//                                         onFocus={() => setFocused(key)}
//                                         onBlur={() => setFocused("")}
//                                         style={fieldStyle(key)}
//                                     />
//                                 </div>
//                             ))}
//                         </div>

//                         {/* AI Helper */}
//                         <div style={{
//                             background: "var(--color-background-secondary)",
//                             border: "0.5px solid var(--color-border-tertiary)",
//                             borderRadius: 10, padding: 13, marginBottom: 14
//                         }}>
//                             <p style={{
//                                 fontSize: 12, fontWeight: 500, color: "#4a4246",
//                                 marginBottom: 9, display: "flex", alignItems: "center", gap: 5
//                             }}>
//                                 <span style={{ fontSize: 14 }}>✦</span> AI message helper
//                             </p>
//                             <div style={{ display: "flex", gap: 7 }}>
//                                 <input
//                                     value={topic}
//                                     onChange={e => setTopic(e.target.value)}
//                                     onKeyDown={e => e.key === "Enter" && handleAISuggest()}
//                                     onFocus={() => setFocused("topic")}
//                                     onBlur={() => setFocused("")}
//                                     placeholder="Describe your topic…"
//                                     style={{ ...fieldStyle("topic"), flex: 1, padding: "8px 11px", fontSize: 13 }}
//                                 />
//                                 <button
//                                     onClick={handleAISuggest}
//                                     disabled={aiLoading || !topic.trim()}
//                                     style={{
//                                         padding: "8px 14px", borderRadius: 8, border: "none",
//                                         background: topic.trim() ? "#185FA5" : "#B5D4F4",
//                                         color: "white",
//                                         cursor: topic.trim() ? "pointer" : "not-allowed",
//                                         fontSize: 12, display: "flex", alignItems: "center", gap: 5,
//                                         whiteSpace: "nowrap", fontFamily: "inherit"
//                                     }}
//                                 >
//                                     {aiLoading ? <Spinner /> : "✦"} Suggest
//                                 </button>
//                             </div>

//                             {suggestions.map((s, i) => (
//                                 <div
//                                     key={i}
//                                     onClick={() => { setForm(p => ({ ...p, message: s })); setSuggestions([]); }}
//                                     style={{
//                                         marginTop: 8, padding: "9px 11px", borderRadius: 8,
//                                         background: "var(--color-background-primary)",
//                                         border: "0.5px solid var(--color-border-tertiary)",
//                                         cursor: "pointer", fontSize: 13,
//                                         color: "var(--color-text-primary)", lineHeight: 1.5, transition: "border .15s"
//                                     }}
//                                     onMouseEnter={e => e.currentTarget.style.borderColor = "#378ADD"}
//                                     onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
//                                 >
//                                     {s}
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Message */}
//                         <div style={{ marginBottom: 14 }}>
//                             <label style={{
//                                 fontSize: 11, fontWeight: 500, display: "block", marginBottom: 5,
//                                 textTransform: "uppercase", letterSpacing: "0.05em",
//                                 color: "var(--color-text-secondary)"
//                             }}>Message</label>
//                             <textarea
//                                 rows={4}
//                                 placeholder="How can we help you?"
//                                 value={form.message}
//                                 onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
//                                 onFocus={() => setFocused("msg")}
//                                 onBlur={() => setFocused("")}
//                                 style={{ ...fieldStyle("msg"), resize: "vertical", minHeight: 100 }}
//                             />
//                         </div>

//                         {/* Error */}
//                         {error && (
//                             <p style={{ color: "#E24B4A", fontSize: 12, marginBottom: 12 }}>{error}</p>
//                         )}

//                         {/* Submit */}
//                         <button
//                             onClick={handleSend}
//                             disabled={sendLoading}
//                             style={{
//                                 width: "100%", padding: 12, borderRadius: 9, border: "none",
//                                 background: sendLoading ? "#85B7EB" : "#185FA5",
//                                 color: "white", fontSize: 14, fontWeight: 500,
//                                 cursor: sendLoading ? "not-allowed" : "pointer",
//                                 display: "flex", alignItems: "center", justifyContent: "center",
//                                 gap: 7, fontFamily: "inherit"
//                             }}
//                         >
//                             {sendLoading ? <><Spinner /> Sending…</> : "Send message →"}
//                         </button>
//                     </div>

//                     {/* Contact info */}
//                     <div style={{
//                         display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//                         gap: 12, marginTop: 16
//                     }}>
//                         {[
//                             { city: "America", addr: "195 E Parker Square Dr, Parker, CO", phone: "+1 982-314-0958" },
//                             { city: "France", addr: "109 Avenue Léon, Clermont-Ferrand", phone: "+33 345-423-9893" },
//                         ].map(loc => (
//                             <div key={loc.city} style={{
//                                 padding: "11px 13px", borderRadius: 9,
//                                 background: "var(--color-background-secondary)",
//                                 border: "0.5px solid var(--color-border-tertiary)"
//                             }}>
//                                 <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 3 }}>{loc.city}</p>
//                                 <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
//                                     {loc.addr}<br />{loc.phone}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }
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
