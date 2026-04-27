import React, { useEffect, useState } from "react";
// import api from "api";
import api from "../../api";
import PageHeader from "./PageHeader";

const UsersPage = ({ token, toggleSidebar, sidebarOpen }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("http://localhost:3001/api/admin/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(res.data);
            } catch (err) {
                setError("Failed to fetch users.");
                console.error("Users fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = users
        .filter(u => roleFilter === "all" || u.role?.toLowerCase() === roleFilter)
        .filter(u => {
            const q = search.toLowerCase();
            return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        });

    const stats = [
        ["Total", users.length, "registered"],
        ["Admins", users.filter(u => u.role?.toLowerCase() === "admin").length, "privileged"],
        ["Users", users.filter(u => u.role?.toLowerCase() === "user").length, "standard"],
    ];

    const initials = (name = "") =>
        name.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase();

    const RoleBadge = ({ role }) => {
        const r = role?.toLowerCase();
        return (
            <span className={`up-role-badge up-role--${r}`}>
                <span className="up-role-dot" />
                {role}
            </span>
        );
    };

    const ROLES = ["all", "admin", "user"];

    return (
        <div className="page">
            <style>{`
                .up-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;animation:up-sd .4s ease both}
                .up-stat{background:#f0f0f5;border-radius:8px;padding:13px 15px}
                .up-stat-label{font-size:11px;color:#999;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}
                .up-stat-val{font-size:22px;font-weight:600}
                .up-stat-sub{font-size:11px;color:#bbb;margin-top:2px}

                .up-toolbar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;animation:up-sd .42s .04s ease both}
                .up-search-wrap{flex:1;min-width:150px;position:relative}
                .up-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:#bbb;pointer-events:none}
                .up-search-wrap input{width:100%;padding:8px 10px 8px 32px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;outline:none;font-family:inherit}
                .up-search-wrap input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
                .up-search-wrap input::placeholder{color:#ccc}
                .up-fbtn{padding:8px 14px;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:12px;font-family:inherit;color:#777;cursor:pointer;transition:all .15s}
                .up-fbtn.active,.up-fbtn:hover{background:#eef2ff;color:#4338ca;border-color:transparent}
                .up-fbtn.fadmin.active,.up-fbtn.fadmin:hover{background:#fdf2f8;color:#be185d;border-color:transparent}

                .up-desktop{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;animation:up-fu .45s .08s ease both}
                .up-th{display:grid;grid-template-columns:2fr 2.5fr 1.2fr;padding:10px 16px;background:#f9f9f9;border-bottom:1px solid #f0f0f0;font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.06em}
                .up-tr{display:grid;grid-template-columns:2fr 2.5fr 1.2fr;padding:13px 16px;border-bottom:1px solid #f7f7f7;align-items:center;opacity:0;transform:translateY(5px);animation:up-ri .35s forwards}
                .up-tr:last-child{border-bottom:none}
                .up-tr:hover{background:#fafbff}
                .up-tr:nth-child(1){animation-delay:.12s}.up-tr:nth-child(2){animation-delay:.17s}.up-tr:nth-child(3){animation-delay:.22s}.up-tr:nth-child(4){animation-delay:.27s}.up-tr:nth-child(5){animation-delay:.32s}.up-tr:nth-child(6){animation-delay:.37s}.up-tr:nth-child(7){animation-delay:.42s}.up-tr:nth-child(8){animation-delay:.47s}

                .u-cell{display:flex;align-items:center;gap:9px;min-width:0}
                .u-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0}
                .up-av-admin{background:#fdf2f8;color:#be185d}
                .up-av-user{background:#eef2ff;color:#4338ca}
                .u-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .u-sub{font-size:11px;color:#ccc;margin-top:1px}
                .u-email{font-size:13px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

                .up-role-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500}
                .up-role--admin{background:#fdf2f8;color:#be185d}
                .up-role--user{background:#eef2ff;color:#4338ca}
                .up-role-dot{width:5px;height:5px;border-radius:50%;background:currentColor}

                .up-mobile{display:none}
                .up-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:14px 15px;margin-bottom:10px;opacity:0;transform:translateY(6px);animation:up-ri .35s forwards}
                .up-card:nth-child(1){animation-delay:.12s}.up-card:nth-child(2){animation-delay:.18s}.up-card:nth-child(3){animation-delay:.24s}.up-card:nth-child(4){animation-delay:.30s}.up-card:nth-child(5){animation-delay:.36s}
                .up-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
                .up-card-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f5f5f5;padding-top:9px;margin-top:9px}

                .sk-row-u{display:grid;grid-template-columns:2fr 2.5fr 1.2fr;align-items:center;padding:13px 16px;border-bottom:1px solid #f7f7f7;gap:12px}
                .sk-bar-u{height:11px;border-radius:6px;background:linear-gradient(90deg,#f0f0f5 25%,#e4e4ec 50%,#f0f0f5 75%);background-size:200% 100%;animation:up-sh 1.4s infinite}
                .sk-av-u{width:34px;height:34px;border-radius:50%;background:linear-gradient(90deg,#f0f0f5 25%,#e4e4ec 50%,#f0f0f5 75%);background-size:200% 100%;animation:up-sh 1.4s infinite;flex-shrink:0}
                .sk-uc{display:flex;align-items:center;gap:9px}
                .sk-un{height:11px;width:80px;border-radius:6px;background:linear-gradient(90deg,#f0f0f5 25%,#e4e4ec 50%,#f0f0f5 75%);background-size:200% 100%;animation:up-sh 1.4s infinite}

                @media(max-width:640px){.up-desktop{display:none}.up-mobile{display:block}}
                @keyframes up-sd{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
                @keyframes up-fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
                @keyframes up-ri{to{opacity:1;transform:none}}
                @keyframes up-sh{0%,100%{background-position:200% 0}50%{background-position:-200% 0}}
            `}</style>

            <PageHeader
                title="Users"
                subtitle="Manage registered users and roles"
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            {/* Stats */}
            <div className="up-stats">
                {stats.map(([label, val, sub]) => (
                    <div className="up-stat" key={label}>
                        <div className="up-stat-label">{label}</div>
                        <div className="up-stat-val">{val}</div>
                        <div className="up-stat-sub">{sub}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="up-toolbar">
                <div className="up-search-wrap">
                    <svg className="up-search-icon" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="6" cy="6" r="4" /><path d="M10 10l3 3" strokeLinecap="round" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                    />
                </div>
                {ROLES.map(r => (
                    <button
                        key={r}
                        className={`up-fbtn${r === "admin" ? " fadmin" : ""}${roleFilter === r ? " active" : ""}`}
                        onClick={() => setRoleFilter(r)}
                    >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                ))}
            </div>

            {error && <p style={{ color: "#e74c3c", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            {/* Desktop Table */}
            <div className="up-desktop">
                <div className="up-th">
                    <span>Name</span><span>Email</span><span>Role</span>
                </div>
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div className="sk-row-u" key={i}>
                            <div className="sk-uc"><div className="sk-av-u" /><div className="sk-un" /></div>
                            <div className="sk-bar-u" style={{ width: "70%" }} />
                            <div className="sk-bar-u" style={{ width: 52 }} />
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#bbb", fontSize: 13 }}>
                        No users found.
                    </p>
                ) : (
                    filtered.map(user => (
                        <div className="up-tr" key={user._id}>
                            <div className="u-cell">
                                <div className={`u-avatar up-av-${user.role?.toLowerCase()}`}>
                                    {initials(user.name)}
                                </div>
                                <div>
                                    <div className="u-name">{user.name}</div>
                                    <div className="u-sub">#{user._id?.slice(-6)}</div>
                                </div>
                            </div>
                            <div className="u-email">{user.email}</div>
                            <div><RoleBadge role={user.role} /></div>
                        </div>
                    ))
                )}
            </div>

            {/* Mobile Cards */}
            {!loading && (
                <div className="up-mobile">
                    {filtered.length === 0 ? (
                        <p style={{ textAlign: "center", padding: "40px", color: "#bbb", fontSize: 13 }}>
                            No users found.
                        </p>
                    ) : (
                        filtered.map(user => (
                            <div className="up-card" key={user._id}>
                                <div className="up-card-top">
                                    <div className="u-cell">
                                        <div className={`u-avatar up-av-${user.role?.toLowerCase()}`}>
                                            {initials(user.name)}
                                        </div>
                                        <div>
                                            <div className="u-name">{user.name}</div>
                                            <div style={{ fontSize: 12, color: "#aaa" }}>{user.email}</div>
                                        </div>
                                    </div>
                                    <RoleBadge role={user.role} />
                                </div>
                                <div className="up-card-footer">
                                    <span style={{ fontSize: 11, color: "#ddd" }}>#{user._id?.slice(-6)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default UsersPage;
