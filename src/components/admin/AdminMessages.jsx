// import { useState, useEffect, useCallback } from "react";
// import api from "../../api";
// import PageHeader from "./PageHeader";

// const timeAgo = (d) => {
//     const diff = Date.now() - new Date(d);
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     return `${Math.floor(h / 24)}d ago`;
// };

// const initials = (name) =>
//     name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// const STATUS = {
//     unread: { bg: "#FEE2E2", color: "#DC2626", label: "Unread" },
//     read: { bg: "#FEF3C7", color: "#D97706", label: "Read" },
//     replied: { bg: "#D1FAE5", color: "#059669", label: "Replied" },
// };

// const Spinner = () => (
//     <span style={{
//         display: "inline-block", width: 13, height: 13,
//         border: "2px solid currentColor", borderTopColor: "transparent",
//         borderRadius: "50%", animation: "msgSpin 0.7s linear infinite",
//         verticalAlign: "middle",
//     }} />
// );

// async function fetchAISuggestion(customerName, customerMessage) {
//     const res = await api.post("/api/ai/admin-suggest", { customerName, customerMessage });
//     return res.data.suggestion || "";
// }

// function MessageDetail({ msg, onReply, onClose }) {
//     const [reply, setReply] = useState("");
//     const [aiLoading, setAiLoading] = useState(false);
//     const [sendLoading, setSendLoading] = useState(false);
//     const [aiError, setAiError] = useState("");

//     useEffect(() => { setReply(""); setAiError(""); }, [msg._id]);

//     const handleAISuggest = async () => {
//         setAiLoading(true); setAiError("");
//         try {
//             const text = await fetchAISuggestion(msg.name, msg.message);
//             if (text) setReply(text);
//             else setAiError("No suggestion returned. Try again.");
//         } catch { setAiError("AI unavailable. Write manually."); }
//         setAiLoading(false);
//     };

//     const handleSend = async () => {
//         if (!reply.trim()) return;
//         setSendLoading(true);
//         await onReply(msg._id, reply);
//         setReply(""); setSendLoading(false);
//     };

//     return (
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden", minWidth: 0 }}>
//             {/* header */}
//             <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                     <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#dc2626", flexShrink: 0 }}>
//                         {initials(msg.name)}
//                     </div>
//                     <div style={{ minWidth: 0 }}>
//                         <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.name}</p>
//                         <p style={{ margin: 0, fontSize: 11, color: "#3b82f6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.email}</p>
//                     </div>
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//                     <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: STATUS[msg.status].bg, color: STATUS[msg.status].color, fontWeight: 600 }}>
//                         {STATUS[msg.status].label}
//                     </span>
//                     <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1, padding: "2px 4px" }}>×</button>
//                 </div>
//             </div>

//             {/* chat body */}
//             <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
//                 {/* user bubble */}
//                 <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//                     <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#6b7280", flexShrink: 0, marginTop: 2 }}>
//                         {initials(msg.name)}
//                     </div>
//                     <div>
//                         <div style={{ background: "#f3f4f6", borderRadius: "4px 12px 12px 12px", padding: "10px 13px", maxWidth: "100%" }}>
//                             <p style={{ margin: 0, fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{msg.message}</p>
//                         </div>
//                         <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af" }}>{timeAgo(msg.createdAt)} · {msg.email}</p>
//                     </div>
//                 </div>

//                 {/* admin reply bubble */}
//                 {msg.adminReply && (
//                     <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
//                         <div>
//                             <div style={{ background: "#ef4444", borderRadius: "12px 4px 12px 12px", padding: "10px 13px", maxWidth: "100%" }}>
//                                 <p style={{ margin: "0 0 3px", fontSize: 10, color: "#fecaca", fontWeight: 600 }}>You replied</p>
//                                 <p style={{ margin: 0, fontSize: 13, color: "#fff", lineHeight: 1.6 }}>{msg.adminReply}</p>
//                             </div>
//                             <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af", textAlign: "right" }}>Admin</p>
//                         </div>
//                         <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#dc2626", flexShrink: 0, marginTop: 2 }}>
//                             A
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* reply composer */}
//             {msg.status !== "replied" && (
//                 <div style={{ padding: "12px 18px", borderTop: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
//                         <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Reply to {msg.name}</span>
//                         <button
//                             onClick={handleAISuggest}
//                             disabled={aiLoading}
//                             style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 20, border: "1px solid #fca5a5", background: aiLoading ? "#fff5f5" : "#fff", color: "#ef4444", cursor: aiLoading ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}
//                         >
//                             {aiLoading ? <><Spinner /> Generating…</> : <>✦ AI suggest</>}
//                         </button>
//                     </div>
//                     {aiError && <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 7 }}>{aiError}</p>}
//                     <textarea
//                         value={reply}
//                         onChange={(e) => setReply(e.target.value)}
//                         placeholder="Type your reply… or click ✦ AI suggest"
//                         rows={3}
//                         style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fafafa", color: "#1f2937", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 8, transition: "border 0.2s" }}
//                         onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
//                         onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
//                     />
//                     <button
//                         onClick={handleSend}
//                         disabled={sendLoading || !reply.trim()}
//                         style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: reply.trim() && !sendLoading ? "#ef4444" : "#fca5a5", color: "#fff", fontSize: 13, fontWeight: 600, cursor: reply.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}
//                     >
//                         {sendLoading ? <><Spinner /> Sending…</> : "Send reply"}
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default function AdminMessages({ toggleSidebar, sidebarOpen }) {
//     const [messages, setMessages] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [selected, setSelected] = useState(null);
//     const [filter, setFilter] = useState("all");
//     const [showDetail, setShowDetail] = useState(false); // mobile: show detail pane

//     const loadMessages = useCallback(async () => {
//         try {
//             const res = await api.get("/api/messages");
//             if (Array.isArray(res.data)) setMessages(res.data);
//             else throw new Error("Bad response");
//         } catch {
//             setError("Could not load messages. Check your API connection.");
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         loadMessages();
//         const id = setInterval(loadMessages, 15000);
//         return () => clearInterval(id);
//     }, [loadMessages]);

//     const handleSelect = async (msg) => {
//         setSelected(msg);
//         setShowDetail(true);
//         if (msg.status === "unread") {
//             try {
//                 await api.patch(`/api/messages/${msg._id}/read`);
//                 setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, status: "read" } : m));
//                 setSelected((prev) => prev ? { ...prev, status: "read" } : prev);
//             } catch { }
//         }
//     };

//     const handleReply = async (id, replyText) => {
//         try {
//             await api.patch(`/api/messages/${id}/reply`, { adminReply: replyText });
//             setMessages((prev) => prev.map((m) => m._id === id ? { ...m, adminReply: replyText, status: "replied" } : m));
//             setSelected((prev) => prev ? { ...prev, adminReply: replyText, status: "replied" } : prev);
//         } catch { alert("Failed to send reply. Try again."); }
//     };

//     const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);
//     const counts = {
//         all: messages.length,
//         unread: messages.filter((m) => m.status === "unread").length,
//         read: messages.filter((m) => m.status === "read").length,
//         replied: messages.filter((m) => m.status === "replied").length,
//     };
//     const unreadCount = counts.unread;

//     return (
//         <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "inherit", background: "#f9fafb" }}>
//             <style>{`
//     @keyframes msgSpin { to { transform: rotate(360deg); } }

//     /* Hamburger — hidden on desktop, visible on tablet/mobile */
//     .msg-hamburger {
//         display: none;
//     }
//     @media (max-width: 1024px) {
//         .msg-hamburger {
//             display: flex !important;
//             align-items: center;
//             justify-content: center;
//         }
//     }

//     /* ── Mobile (≤640px) ── */
//     @media (max-width: 640px) {
//         .msg-layout {
//             position: relative;
//         }
//         .msg-list-pane {
//             width: 100% !important;
//             min-width: 0 !important;
//             border-right: none !important;
//             height: 100%;
//         }
//         .msg-list-pane.hidden {
//             display: none !important;
//         }
//         .msg-detail-pane {
//             display: none !important;
//         }
//         .msg-detail-pane.active {
//             display: flex !important;
//             position: absolute !important;
//             inset: 0 !important;
//             z-index: 10 !important;
//             background: #fff !important;
//         }
//         .msg-back-btn {
//             display: block !important;
//         }
//     }

//     /* ── Tablet (641px–1024px) ── */
//     @media (min-width: 641px) and (max-width: 1024px) {
//         .msg-list-pane {
//             width: 240px !important;
//             min-width: 240px !important;
//         }
//     }
// `}</style>
//             {/* Page Header */}
//             <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                         <button
//                             onClick={toggleSidebar}
//                             className="msg-hamburger"
//                             style={{
//                                 border: "none",
//                                 background: "none",
//                                 cursor: "pointer",
//                                 fontSize: 20,
//                                 color: "#374151",
//                                 padding: "4px 6px",
//                                 borderRadius: "6px",
//                                 lineHeight: 1,
//                             }}
//                         >
//                             ☰
//                         </button>
//                         <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Messages</h1>
//                         {unreadCount > 0 && (
//                             <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>
//                                 {unreadCount} new
//                             </span>
//                         )}
//                     </div>
//                     <button onClick={loadMessages} style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
//                         ↻ Refresh
//                     </button>
//                 </div>
//                 <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Customer messages from the contact form</p>

//                 {/* Stats */}
//                 <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
//                     {[
//                         { label: "Total", value: counts.all, color: "#374151" },
//                         { label: "Unread", value: counts.unread, color: "#dc2626" },
//                         { label: "Read", value: counts.read, color: "#d97706" },
//                         { label: "Replied", value: counts.replied, color: "#059669" },
//                     ].map(({ label, value, color }) => (
//                         <div key={label} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 14px", minWidth: 60, textAlign: "center" }}>
//                             <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color }}>{value}</p>
//                             <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{label}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Body */}
//             {loading ? (
//                 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#9ca3af", fontSize: 14 }}>
//                     <Spinner /> Loading messages…
//                 </div>
//             ) : error ? (
//                 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
//                     <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
//                     <button onClick={loadMessages} style={{ padding: "7px 18px", borderRadius: 8, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Retry</button>
//                 </div>
//             ) : (
//                 <div className="msg-layout" style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
//                     {/* LEFT: message list */}
//                     <div className={`msg-list-pane${showDetail && window.innerWidth < 640 ? " hidden" : ""}`}
//                         style={{ width: 290, minWidth: 290, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>

//                         {/* back btn on mobile when detail shown */}
//                         {showDetail && (
//                             <button onClick={() => setShowDetail(false)}
//                                 style={{ display: "none", padding: "8px 14px", border: "none", borderBottom: "1px solid #e5e7eb", background: "#fff", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
//                                 className="msg-back-btn">
//                                 ← Back to messages
//                             </button>
//                         )}

//                         {/* Filters */}
//                         <div style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 4, flexWrap: "wrap" }}>
//                             {["all", "unread", "read", "replied"].map((f) => (
//                                 <button key={f} onClick={() => setFilter(f)}
//                                     style={{ padding: "3px 9px", borderRadius: 20, border: `1px solid ${filter === f ? "#ef4444" : "#e5e7eb"}`, background: filter === f ? "#ef4444" : "transparent", color: filter === f ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: filter === f ? 600 : 400, textTransform: "capitalize", fontFamily: "inherit" }}>
//                                     {f}{f !== "all" && counts[f] > 0 ? ` (${counts[f]})` : ""}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* List */}
//                         {/* Back button — only visible on mobile when detail is shown */}
//                         <button
//                             onClick={() => { setSelected(null); setShowDetail(false); }}
//                             className="msg-back-btn"
//                             style={{
//                                 display: "none",
//                                 padding: "10px 14px",
//                                 border: "none",
//                                 borderBottom: "1px solid #e5e7eb",
//                                 background: "#fff",
//                                 color: "#ef4444",
//                                 fontWeight: 600,
//                                 fontSize: 12,
//                                 cursor: "pointer",
//                                 textAlign: "left",
//                                 fontFamily: "inherit",
//                                 width: "100%",
//                             }}
//                         >
//                             ← Back to messages
//                         </button>
//                         <div style={{ overflowY: "auto", flex: 1 }}>
//                             {filtered.length === 0 && (
//                                 <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No messages</p>
//                             )}
//                             {filtered.map((msg) => (
//                                 <div key={msg._id} onClick={() => handleSelect(msg)}
//                                     style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", background: selected?._id === msg._id ? "#fef2f2" : "#fff", borderLeft: selected?._id === msg._id ? "3px solid #ef4444" : "3px solid transparent", transition: "background 0.15s" }}
//                                     onMouseEnter={(e) => { if (selected?._id !== msg._id) e.currentTarget.style.background = "#f9fafb"; }}
//                                     onMouseLeave={(e) => { if (selected?._id !== msg._id) e.currentTarget.style.background = "#fff"; }}>
//                                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
//                                         <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
//                                             <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#dc2626", flexShrink: 0 }}>
//                                                 {initials(msg.name)}
//                                             </div>
//                                             <span style={{ fontWeight: msg.status === "unread" ? 600 : 400, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                                 {msg.name}
//                                             </span>
//                                         </div>
//                                         <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: STATUS[msg.status].bg, color: STATUS[msg.status].color, fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>
//                                             {STATUS[msg.status].label}
//                                         </span>
//                                     </div>
//                                     <p style={{ margin: "0 0 3px 35px", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.message}</p>
//                                     <p style={{ margin: "0 0 0 35px", fontSize: 10, color: "#9ca3af" }}>{timeAgo(msg.createdAt)}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* RIGHT: detail */}
//                     <div className={`msg-list-pane${showDetail ? " hidden" : ""}`}
//                         style={{ width: 290, minWidth: 290, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
//                         {selected ? (
//                             <MessageDetail
//                                 msg={selected}
//                                 onReply={handleReply}
//                                 onClose={() => { setSelected(null); setShowDetail(false); }}
//                             />
//                         ) : (
//                             <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: "#fff" }}>
//                                 <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#ef4444", marginBottom: 4 }}>✉</div>
//                                 <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>Select a message</p>
//                                 <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Click any message on the left to read and reply</p>
//                             </div>
//                         )}
//                     </div>

//                 </div>
//             )}
//         </div>
//     );
// }

import { useState, useEffect, useCallback } from "react";
import api from "../../api";

const timeAgo = (d) => {
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const initials = (name) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const STATUS = {
    unread: { bg: "#FEE2E2", color: "#DC2626", label: "Unread" },
    read: { bg: "#FEF3C7", color: "#D97706", label: "Read" },
    replied: { bg: "#D1FAE5", color: "#059669", label: "Replied" },
};

const Spinner = () => (
    <span style={{
        display: "inline-block", width: 13, height: 13,
        border: "2px solid currentColor", borderTopColor: "transparent",
        borderRadius: "50%", animation: "msgSpin 0.7s linear infinite",
        verticalAlign: "middle",
    }} />
);

async function fetchAISuggestion(customerName, customerMessage) {
    const res = await api.post("/api/ai/admin-suggest", { customerName, customerMessage });
    return res.data.suggestion || "";
}

function MessageDetail({ msg, onReply, onClose }) {
    const [reply, setReply] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    useEffect(() => { setReply(""); setAiError(""); }, [msg._id]);

    const handleAISuggest = async () => {
        setAiLoading(true); setAiError("");
        try {
            const text = await fetchAISuggestion(msg.name, msg.message);
            if (text) setReply(text);
            else setAiError("No suggestion returned. Try again.");
        } catch { setAiError("AI unavailable. Write manually."); }
        setAiLoading(false);
    };

    const handleSend = async () => {
        if (!reply.trim()) return;
        setSendLoading(true);
        await onReply(msg._id, reply);
        setReply(""); setSendLoading(false);
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden", minWidth: 0 }}>
            {/* header */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#dc2626", flexShrink: 0 }}>
                        {initials(msg.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#3b82f6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.email}</p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: STATUS[msg.status].bg, color: STATUS[msg.status].color, fontWeight: 600 }}>
                        {STATUS[msg.status].label}
                    </span>
                    {/* × closes and goes back to list on mobile */}
                    <button
                        onClick={onClose}
                        className="msg-close-btn"
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1, padding: "2px 4px" }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* chat body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#6b7280", flexShrink: 0, marginTop: 2 }}>
                        {initials(msg.name)}
                    </div>
                    <div>
                        <div style={{ background: "#f3f4f6", borderRadius: "4px 12px 12px 12px", padding: "10px 13px", maxWidth: "100%" }}>
                            <p style={{ margin: 0, fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{msg.message}</p>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af" }}>{timeAgo(msg.createdAt)} · {msg.email}</p>
                    </div>
                </div>

                {msg.adminReply && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
                        <div>
                            <div style={{ background: "#ef4444", borderRadius: "12px 4px 12px 12px", padding: "10px 13px", maxWidth: "100%" }}>
                                <p style={{ margin: "0 0 3px", fontSize: 10, color: "#fecaca", fontWeight: 600 }}>You replied</p>
                                <p style={{ margin: 0, fontSize: 13, color: "#fff", lineHeight: 1.6 }}>{msg.adminReply}</p>
                            </div>
                            <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af", textAlign: "right" }}>Admin</p>
                        </div>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#dc2626", flexShrink: 0, marginTop: 2 }}>
                            A
                        </div>
                    </div>
                )}
            </div>

            {/* reply composer */}
            {msg.status !== "replied" && (
                <div style={{ padding: "12px 18px", borderTop: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Reply to {msg.name}</span>
                        <button
                            onClick={handleAISuggest}
                            disabled={aiLoading}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 20, border: "1px solid #fca5a5", background: aiLoading ? "#fff5f5" : "#fff", color: "#ef4444", cursor: aiLoading ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}
                        >
                            {aiLoading ? <><Spinner /> Generating…</> : <>✦ AI suggest</>}
                        </button>
                    </div>
                    {aiError && <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 7 }}>{aiError}</p>}
                    <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply… or click ✦ AI suggest"
                        rows={3}
                        style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fafafa", color: "#1f2937", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 8, transition: "border 0.2s" }}
                        onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sendLoading || !reply.trim()}
                        style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: reply.trim() && !sendLoading ? "#ef4444" : "#fca5a5", color: "#fff", fontSize: 13, fontWeight: 600, cursor: reply.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}
                    >
                        {sendLoading ? <><Spinner /> Sending…</> : "Send reply"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AdminMessages({ toggleSidebar, sidebarOpen }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("all");
    const [showDetail, setShowDetail] = useState(false);

    const loadMessages = useCallback(async () => {
        try {
            const res = await api.get("/api/messages");
            if (Array.isArray(res.data)) setMessages(res.data);
            else throw new Error("Bad response");
        } catch {
            setError("Could not load messages. Check your API connection.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadMessages();
        const id = setInterval(loadMessages, 15000);
        return () => clearInterval(id);
    }, [loadMessages]);

    const handleSelect = async (msg) => {
        setSelected(msg);
        setShowDetail(true);
        if (msg.status === "unread") {
            try {
                await api.patch(`/api/messages/${msg._id}/read`);
                setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, status: "read" } : m));
                setSelected((prev) => prev ? { ...prev, status: "read" } : prev);
            } catch { }
        }
    };

    const handleReply = async (id, replyText) => {
        try {
            await api.patch(`/api/messages/${id}/reply`, { adminReply: replyText });
            setMessages((prev) => prev.map((m) => m._id === id ? { ...m, adminReply: replyText, status: "replied" } : m));
            setSelected((prev) => prev ? { ...prev, adminReply: replyText, status: "replied" } : prev);
        } catch { alert("Failed to send reply. Try again."); }
    };

    const handleClose = () => {
        setSelected(null);
        setShowDetail(false);
    };

    const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);
    const counts = {
        all: messages.length,
        unread: messages.filter((m) => m.status === "unread").length,
        read: messages.filter((m) => m.status === "read").length,
        replied: messages.filter((m) => m.status === "replied").length,
    };
    const unreadCount = counts.unread;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "inherit", background: "#f9fafb" }}>
            <style>{`
                @keyframes msgSpin { to { transform: rotate(360deg); } }

                .msg-hamburger { display: none; }

                @media (max-width: 1024px) {
                    .msg-hamburger {
                        display: flex !important;
                        align-items: center;
                        justify-content: center;
                    }
                }

                /* Tablet */
                @media (min-width: 641px) and (max-width: 1024px) {
                    .msg-list-pane {
                        width: 240px !important;
                        min-width: 240px !important;
                    }
                }

                /* Mobile */
                @media (max-width: 640px) {
                    .msg-layout { position: relative; }

                    .msg-list-pane {
                        width: 100% !important;
                        min-width: 0 !important;
                        border-right: none !important;
                        height: 100%;
                    }
                    .msg-list-pane.hidden { display: none !important; }

                    .msg-detail-pane { display: none !important; }
                    .msg-detail-pane.active {
                        display: flex !important;
                        position: absolute !important;
                        inset: 0 !important;
                        z-index: 10 !important;
                        background: #fff !important;
                         height: 100% !important;             /* ← add this */
                         overflow: hidden !important;   
                    }

                    .msg-back-btn { display: block !important; }
                    .msg-close-btn { font-size: 26px !important; padding: 4px 10px !important; }
                }
            `}</style>

            {/* Page Header */}
            <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            onClick={toggleSidebar}
                            className="msg-hamburger"
                            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#374151", padding: "4px 6px", borderRadius: "6px", lineHeight: 1 }}
                        >
                            ☰
                        </button>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Messages</h1>
                        {unreadCount > 0 && (
                            <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <button onClick={loadMessages} style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
                        ↻ Refresh
                    </button>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Customer messages from the contact form</p>

                {/* Stats */}
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    {[
                        { label: "Total", value: counts.all, color: "#374151" },
                        { label: "Unread", value: counts.unread, color: "#dc2626" },
                        { label: "Read", value: counts.read, color: "#d97706" },
                        { label: "Replied", value: counts.replied, color: "#059669" },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 14px", minWidth: 60, textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color }}>{value}</p>
                            <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            {loading ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#9ca3af", fontSize: 14 }}>
                    <Spinner /> Loading messages…
                </div>
            ) : error ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                    <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
                    <button onClick={loadMessages} style={{ padding: "7px 18px", borderRadius: 8, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Retry</button>
                </div>
            ) : (
                <div className="msg-layout" style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

                    {/* LEFT: message list */}
                    <div
                        className={`msg-list-pane${showDetail ? " hidden" : ""}`}
                        style={{ width: 290, minWidth: 290, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}
                    >
                        {/* Back button — mobile only */}
                        <button
                            onClick={handleClose}
                            className="msg-back-btn"
                            style={{ display: "none", padding: "10px 14px", border: "none", borderBottom: "1px solid #e5e7eb", background: "#fff", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%" }}
                        >
                            ← Back to messages
                        </button>

                        {/* Filters */}
                        <div style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {["all", "unread", "read", "replied"].map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                    style={{ padding: "3px 9px", borderRadius: 20, border: `1px solid ${filter === f ? "#ef4444" : "#e5e7eb"}`, background: filter === f ? "#ef4444" : "transparent", color: filter === f ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: filter === f ? 600 : 400, textTransform: "capitalize", fontFamily: "inherit" }}>
                                    {f}{f !== "all" && counts[f] > 0 ? ` (${counts[f]})` : ""}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {filtered.length === 0 && (
                                <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No messages</p>
                            )}
                            {filtered.map((msg) => (
                                <div key={msg._id} onClick={() => handleSelect(msg)}
                                    style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", background: selected?._id === msg._id ? "#fef2f2" : "#fff", borderLeft: selected?._id === msg._id ? "3px solid #ef4444" : "3px solid transparent", transition: "background 0.15s" }}
                                    onMouseEnter={(e) => { if (selected?._id !== msg._id) e.currentTarget.style.background = "#f9fafb"; }}
                                    onMouseLeave={(e) => { if (selected?._id !== msg._id) e.currentTarget.style.background = "#fff"; }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#dc2626", flexShrink: 0 }}>
                                                {initials(msg.name)}
                                            </div>
                                            <span style={{ fontWeight: msg.status === "unread" ? 600 : 400, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {msg.name}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: STATUS[msg.status].bg, color: STATUS[msg.status].color, fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>
                                            {STATUS[msg.status].label}
                                        </span>
                                    </div>
                                    <p style={{ margin: "0 0 3px 35px", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.message}</p>
                                    <p style={{ margin: "0 0 0 35px", fontSize: 10, color: "#9ca3af" }}>{timeAgo(msg.createdAt)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: detail pane — correct className now */}
                    {/* RIGHT: detail pane */}
                    <div
                        className={`msg-detail-pane${showDetail ? " active" : ""}`}
                        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}
                    >
                        {selected ? (
                            <MessageDetail
                                msg={selected}
                                onReply={handleReply}
                                onClose={handleClose}
                            />
                        ) : (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: "#fff" }}>
                                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#ef4444", marginBottom: 4 }}>✉</div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>Select a message</p>
                                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Click any message on the left to read and reply</p>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}