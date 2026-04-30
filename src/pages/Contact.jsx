import { useState, useEffect } from "react";
import api from "../api";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes checkPop { 0% { transform: scale(0); } 70% { transform: scale(1.12); } 100% { transform: scale(1); } }

.cp * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }

.cp-hero { position: relative; height: 340px; overflow: hidden; }
.cp-hero iframe { width: 100%; height: 100%; border: 0; display: block; filter: saturate(.8); }
.cp-hero-overlay {
  position: absolute; inset: 0;
  background: rgba(12,30,58,.54);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 2rem;
}
.cp-hero-overlay h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px,5vw,48px); font-weight: 600;
  color: #fff; line-height: 1.1; margin-bottom: .5rem;
}
.cp-hero-overlay h1 em { font-style: italic; font-weight: 400; color: #85B7EB; }
.cp-hero-overlay p { font-size: 14px; color: rgba(255,255,255,.72); max-width: 340px; line-height: 1.7; }

.cp-body {
  display: grid; grid-template-columns: 1fr 1fr;
  animation: fadeUp .5s .1s ease both;
}
@media (max-width: 640px) { .cp-body { grid-template-columns: 1fr; } }

.cp-left { padding: 2.5rem 2rem; border-right: 0.5px solid var(--color-border-tertiary); }

.cp-section-tag {
  font-size: 10px; font-weight: 600; letter-spacing: .14em;
  text-transform: uppercase; color: #993C1D;
  margin-bottom: .6rem; display: flex; align-items: center; gap: 7px;
}
.cp-section-tag::before { content: ''; display: inline-block; width: 18px; height: 1px; background: #993C1D; }

.cp-left h2 {
  font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 400;
  color: var(--color-text-primary); line-height: 1.25; margin-bottom: .6rem;
}
.cp-left h2 em { font-style: italic; color: #185FA5; }
.cp-desc { font-size: 13.5px; color: var(--color-text-secondary); line-height: 1.75; margin-bottom: 1.75rem; }

.cp-info-item { display: flex; gap: 13px; align-items: flex-start; margin-bottom: 1.4rem; }
.cp-info-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: #E6F1FB; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cp-info-icon svg { width: 16px; height: 16px; stroke: #185FA5; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.cp-info-label { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); margin-bottom: 3px; }
.cp-info-val { font-size: 13.5px; color: var(--color-text-primary); line-height: 1.65; }
.cp-info-val a { color: #185FA5; text-decoration: none; }

.cp-hours {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  margin-top: 1.5rem; padding-top: 1.5rem; border-top: 0.5px solid var(--color-border-tertiary);
}
.cp-hour-row { font-size: 12px; color: var(--color-text-secondary); display: flex; justify-content: space-between; gap: 8px; }
.cp-hour-row span:last-child { color: var(--color-text-primary); font-weight: 500; }

.cp-right { padding: 2.5rem 2rem; }
.cp-right h2 {
  font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 400;
  color: var(--color-text-primary); margin-bottom: .6rem;
}
.cp-right h2 em { font-style: italic; color: #185FA5; }

.cp-chips-label { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: var(--color-text-secondary); margin-bottom: 8px; }
.cp-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 14px; }
.cp-chip {
  font-size: 11px; font-weight: 500; padding: 5px 12px; border-radius: 20px;
  border: 1px solid var(--color-border-secondary); color: var(--color-text-secondary);
  cursor: pointer; transition: all .15s; background: transparent; font-family: 'Outfit', sans-serif;
}
.cp-chip:hover { border-color: #185FA5; color: #185FA5; }
.cp-chip.active { background: #185FA5; color: #fff; border-color: #185FA5; }

.cp-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
@media (max-width: 400px) { .cp-row2 { grid-template-columns: 1fr; } }

.cp-field { position: relative; margin-bottom: 10px; }
.cp-field label {
  display: block; font-size: 10px; font-weight: 600; letter-spacing: .09em;
  text-transform: uppercase; color: var(--color-text-secondary); margin-bottom: 5px;
}
.cp-input {
  width: 100%; padding: 10px 13px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-tertiary);
  border-radius: 9px; font-size: 13.5px;
  font-family: 'Outfit', sans-serif; color: var(--color-text-primary);
  outline: none; transition: border .18s, box-shadow .18s, background .18s;
}
.cp-input:hover { border-color: var(--color-border-secondary); }
.cp-input:focus { border-color: #185FA5; box-shadow: 0 0 0 3px rgba(24,95,165,.08); background: var(--color-background-primary); }
.cp-input::placeholder { color: var(--color-text-tertiary); }
textarea.cp-input { resize: vertical; min-height: 100px; }

.cp-ai-box {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-tertiary);
  border-radius: 11px; padding: 13px; margin-bottom: 12px; transition: border .2s;
}
.cp-ai-box:focus-within { border-color: rgba(24,95,165,.3); }
.cp-ai-head { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.cp-ai-dot { width: 6px; height: 6px; border-radius: 50%; background: #378ADD; animation: pulse 2s infinite; }
.cp-ai-badge { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; background: #E6F1FB; color: #0C447C; }
.cp-ai-sub { font-size: 12px; color: var(--color-text-secondary); }
.cp-ai-row { display: flex; gap: 8px; }

.cp-suggest-btn {
  padding: 9px 15px; border-radius: 9px; border: none;
  background: #185FA5; color: #fff;
  font-size: 12px; font-weight: 600; font-family: 'Outfit', sans-serif;
  cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 5px;
  transition: background .15s, transform .1s;
}
.cp-suggest-btn:hover:not(:disabled) { background: #0C447C; transform: translateY(-1px); }
.cp-suggest-btn:disabled { background: #85B7EB; cursor: not-allowed; }

.cp-suggestion {
  margin-top: 8px; padding: 10px 12px; border-radius: 8px;
  background: var(--color-background-primary); border: 1px solid var(--color-border-tertiary);
  cursor: pointer; font-size: 13px; line-height: 1.55; color: var(--color-text-primary);
  transition: border .15s, transform .15s; animation: slideIn .2s ease both;
}
.cp-suggestion:hover { border-color: #185FA5; transform: translateX(3px); }

.cp-sep { display: flex; align-items: center; gap: 10px; margin: 13px 0; }
.cp-sep-line { flex: 1; height: .5px; background: var(--color-border-tertiary); }
.cp-sep-txt { font-size: 11px; color: var(--color-text-tertiary); }

.cp-error { font-size: 12px; color: #A32D2D; background: #FCEBEB; padding: 9px 12px; border-radius: 8px; margin-bottom: 12px; animation: fadeUp .2s ease; }

.cp-submit {
  width: 100%; padding: 13px; border: none; border-radius: 11px;
  background: #185FA5; color: #fff;
  font-size: 14px; font-weight: 600; font-family: 'Outfit', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; margin-top: 14px; letter-spacing: .01em;
  transition: background .15s, transform .1s;
}
.cp-submit:hover:not(:disabled) { background: #0C447C; transform: translateY(-1px); }
.cp-submit:disabled { background: #85B7EB; cursor: not-allowed; transform: none; }
.cp-submit .arr {
  width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,.2);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; transition: transform .15s;
}
.cp-submit:hover:not(:disabled) .arr { transform: translateX(3px); }

.cp-spinner {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid #fff; border-top-color: transparent;
  border-radius: 50%; animation: spin .7s linear infinite;
}

.cp-success { text-align: center; padding: 4rem 1rem; animation: fadeUp .4s ease both; }
.cp-check {
  width: 58px; height: 58px; border-radius: 50%; background: #E1F5EE;
  margin: 0 auto 1.25rem; display: flex; align-items: center; justify-content: center;
  animation: checkPop .4s ease;
}
.cp-check svg { width: 24px; height: 24px; stroke: #0F6E56; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.cp-success h3 { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; color: var(--color-text-primary); margin-bottom: .5rem; }
.cp-success p { font-size: 13.5px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 1.5rem; }
.cp-reset-btn {
  padding: 9px 22px; border-radius: 9px; border: 1px solid var(--color-border-secondary);
  background: transparent; color: var(--color-text-secondary);
  cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: background .15s;
}
.cp-reset-btn:hover { background: var(--color-background-secondary); }
`;

const Spinner = () => <span className="cp-spinner" />;

const TOPICS = ["General inquiry", "Partnership", "Support", "Billing", "Other"];

const INFO = [
    {
        label: "Americas",
        val: <span>195 E Parker Square Dr<br />Parker, CO 80134</span>,
        icon: <><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></>,
    },
    {
        label: "Europe",
        val: <span>109 Avenue Léon<br />Clermont-Ferrand, France</span>,
        icon: <><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></>,
    },
    {
        label: "Phone",
        val: <span>+1 982-314-0958 (US)<br />+33 345-423-9893 (FR)</span>,
        icon: <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 012 4.18 2 2 0 014 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
    },
    {
        label: "Email",
        val: <span><a href="mailto:hello@company.com">hello@company.com</a><br /><a href="mailto:support@company.com">support@company.com</a></span>,
        icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    },
];

const HOURS = [
    ["Mon – Fri", "9am – 6pm"],
    ["Saturday", "10am – 4pm"],
    ["Sunday", "Closed"],
    ["Holidays", "Varies"],
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [topic, setTopic] = useState("");
    const [activeTopic, setActiveTopic] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        api.get("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setForm(p => ({ ...p, name: res.data.name || "", email: res.data.email || "" })))
            .catch(() => { });
    }, []);

    const firstName = form.name.split(" ")[0] || "";

    const setFirstName = val => setForm(p => {
        const last = p.name.split(" ").slice(1).join(" ");
        return { ...p, name: val + (last ? " " + last : "") };
    });

    const setLastName = val => setForm(p => {
        const first = p.name.split(" ")[0] || "";
        return { ...p, name: first + (val ? " " + val : "") };
    });

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
            setError("Please fill in your name, email, and message.");
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
        setTopic(""); setActiveTopic(""); setSuggestions([]); setError("");
    };

    return (
        <div className="cp">
            <style>{css}</style>

            {/* Map Hero */}
            <div className="cp-hero">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111551.9926412813!2d-90.27317134641879!3d38.606612219170856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited%20States!5e0!3m2!1sen!2sbd!4v1597926938024!5m2!1sen!2sbd"
                    allowFullScreen="" loading="lazy" title="Office Location"
                />
                <div className="cp-hero-overlay">
                    <h1>Let's <em>connect</em></h1>
                    <p>Our team is ready to hear from you — reach out and we'll get back to you promptly.</p>
                </div>
            </div>

            {/* Two-column body */}
            <div className="cp-body">

                {/* Left: Company details */}
                <div className="cp-left">
                    <p className="cp-section-tag">Company info</p>
                    <h2>We're a team<br />that <em>cares.</em></h2>
                    <p className="cp-desc">
                        From first inquiry to final delivery, every detail matters to us. Find us at any of our offices below.
                    </p>

                    {INFO.map(({ label, val, icon }) => (
                        <div className="cp-info-item" key={label}>
                            <div className="cp-info-icon">
                                <svg viewBox="0 0 24 24">{icon}</svg>
                            </div>
                            <div>
                                <p className="cp-info-label">{label}</p>
                                <p className="cp-info-val">{val}</p>
                            </div>
                        </div>
                    ))}

                    <div className="cp-hours">
                        {HOURS.map(([day, time]) => (
                            <div className="cp-hour-row" key={day}>
                                <span>{day}</span><span>{time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Contact form */}
                <div className="cp-right">
                    {sent ? (
                        <div className="cp-success">
                            <div className="cp-check">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h3>Message sent{firstName ? `, ${firstName}` : ""}!</h3>
                            <p>We received your note and will get back to you within 24 hours.<br />Talk soon.</p>
                            <button onClick={reset} className="cp-reset-btn">Send another message</button>
                        </div>
                    ) : (
                        <>
                            <p className="cp-section-tag">Send a message</p>
                            <h2>How can we<br /><em>help you?</em></h2>
                            <p className="cp-desc">Fill in the form and we'll get back to you within 24 hours.</p>

                            <p className="cp-chips-label">Topic</p>
                            <div className="cp-chips">
                                {TOPICS.map(t => (
                                    <button
                                        key={t}
                                        className={`cp-chip${activeTopic === t ? " active" : ""}`}
                                        onClick={() => setActiveTopic(prev => prev === t ? "" : t)}
                                    >{t}</button>
                                ))}
                            </div>

                            <div className="cp-row2">
                                <div className="cp-field">
                                    <label>First name</label>
                                    <input className="cp-input" placeholder="Jane"
                                        value={form.name.split(" ")[0] || ""}
                                        onChange={e => setFirstName(e.target.value)} />
                                </div>
                                <div className="cp-field">
                                    <label>Last name</label>
                                    <input className="cp-input" placeholder="Smith"
                                        value={form.name.split(" ").slice(1).join(" ") || ""}
                                        onChange={e => setLastName(e.target.value)} />
                                </div>
                            </div>

                            <div className="cp-field">
                                <label>Email address</label>
                                <input className="cp-input" type="email" placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                            </div>

                            <div className="cp-ai-box">
                                <div className="cp-ai-head">
                                    <span className="cp-ai-dot" />
                                    <span className="cp-ai-badge">AI helper</span>
                                    <span className="cp-ai-sub">Describe topic, get a draft</span>
                                </div>
                                <div className="cp-ai-row">
                                    <input
                                        className="cp-input"
                                        style={{ flex: 1, background: "var(--color-background-primary)" }}
                                        value={topic}
                                        onChange={e => setTopic(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleAISuggest()}
                                        placeholder="e.g. issue with my order…"
                                    />
                                    <button className="cp-suggest-btn" onClick={handleAISuggest} disabled={aiLoading || !topic.trim()}>
                                        {aiLoading ? <Spinner /> : "✦"} Suggest
                                    </button>
                                </div>
                                {suggestions.map((s, i) => (
                                    <div key={i} className="cp-suggestion"
                                        onClick={() => { setForm(p => ({ ...p, message: s })); setSuggestions([]); }}>
                                        {s}
                                    </div>
                                ))}
                            </div>

                            <div className="cp-sep">
                                <span className="cp-sep-line" /><span className="cp-sep-txt">your message</span><span className="cp-sep-line" />
                            </div>

                            <div className="cp-field">
                                <label>Message</label>
                                <textarea className="cp-input" placeholder="Tell us what's on your mind…"
                                    value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                            </div>

                            {error && <div className="cp-error">{error}</div>}

                            <button className="cp-submit" onClick={handleSend} disabled={sendLoading}>
                                {sendLoading ? <><Spinner /> Sending…</> : <>Send message <span className="arr">→</span></>}
                            </button>
                        </>
                    )}
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
