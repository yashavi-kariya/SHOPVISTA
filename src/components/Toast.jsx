import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const css = `
@keyframes toastIn  { from { opacity: 0; transform: translateY(12px) scale(.97); } to   { opacity: 1; transform: translateY(0)    scale(1);    } }
@keyframes toastOut { from { opacity: 1; transform: translateY(0)    scale(1);    } to   { opacity: 0; transform: translateY(8px)  scale(.97);  } }
@keyframes toastBar { from { width: 100%; } to { width: 0%; } }

.toast-viewport {
  position: fixed; top: 24px; left: 50%;
  transform: translateX(-50%);
  align-items: center;
  display: flex; flex-direction: column; gap: 10px;
  z-index: 9999; pointer-events: none;
}
.toast-item {
  pointer-events: all;
  display: flex; align-items: flex-start; gap: 11px;
    background: #ffffff;
    border: 1px solid #d0d0d0;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    border-radius: 14px; padding: 13px 15px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.10);
    max-width: 340px; min-width: 280px;
    animation: toastIn .25s ease both;
    font-family: 'Outfit', sans-serif;
    overflow: hidden; position: relative;
}
.toast-item.leaving { animation: toastOut .2s ease forwards; }

.toast-icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 15px;
}
.toast-icon.warn    { background: #e8d082; }
.toast-icon.success { background: #5578ea; }
.toast-icon.error   { background: #de2626; }
.toast-icon.info    { background: #304259; }

.toast-title {
  font-size: 13.5px; font-weight: 600;
 color: #1a1a1a; margin: 0 0 2px;
}
.toast-msg {
  font-size: 12.5px; color: #555555;
  margin: 0; line-height: 1.45;
}
.toast-actions { display: flex; gap: 7px; margin-top: 9px; }
.toast-btn-primary {
  font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
  background: #185FA5; color:#ffffff; border: none;
  border-radius: 7px; padding: 6px 14px; cursor: pointer; transition: background .15s;
}
.toast-btn-primary:hover { background: #0C447C; }
.toast-btn-ghost {
  font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500;
  background: transparent; color: var(--color-text-secondary);
  border: 0.5px solid var(--color-border-secondary);
  border-radius: 7px; padding: 6px 12px; cursor: pointer; transition: background .15s;
}
.toast-btn-ghost:hover { background: var(--color-background-secondary); }
.toast-close {
  position: absolute; top: 10px; right: 12px;
  background: none; border: none; cursor: pointer;
  color: var(--color-text-secondary); font-size: 16px;
  line-height: 1; opacity: 0.45; padding: 0;
}
.toast-close:hover { opacity: 1; }
.toast-progress {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--color-border-tertiary);
}
.toast-progress-fill {
  height: 100%; border-radius: 0 0 0 14px;
  animation: toastBar linear forwards;
}
.toast-progress-fill.warn    { background: #E24B4A; }
.toast-progress-fill.success { background: #1D9E75; }
.toast-progress-fill.error   { background: #E24B4A; }
.toast-progress-fill.info    { background: #378ADD; }
`;

const ICONS = {
    warn: "🔐",
    success: "✓",
    error: "✕",
    info: "ℹ",
};

let _addToast = null;

export function toast(options) {
    if (_addToast) _addToast(options);
}

export function ToastProvider() {
    const [toasts, setToasts] = useState([]);

    const add = useCallback((options) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, ...options }]);
    }, []);

    useEffect(() => { _addToast = add; return () => { _addToast = null; }; }, [add]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220);
    }, []);

    return createPortal(
        <>
            <style>{css}</style>
            <div className="toast-viewport">
                {toasts.map(t => (
                    <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>
        </>,
        document.body
    );
}

function ToastItem({ type = "info", title, message, actions, duration = 4000, leaving, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`toast-item${leaving ? " leaving" : ""}`}>
            <div className={`toast-icon ${type}`}>{ICONS[type]}</div>
            <div style={{ flex: 1 }}>
                <p className="toast-title">{title}</p>
                {message && <p className="toast-msg">{message}</p>}
                {actions?.length > 0 && (
                    <div className="toast-actions">
                        {actions.map((a, i) => (
                            <button
                                key={i}
                                className={i === 0 ? "toast-btn-primary" : "toast-btn-ghost"}
                                onClick={() => { a.onClick?.(); onDismiss(); }}
                            >{a.label}</button>
                        ))}
                    </div>
                )}
            </div>
            <button className="toast-close" onClick={onDismiss}>×</button>
            <div className="toast-progress">
                <div
                    className={`toast-progress-fill ${type}`}
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>
        </div>
    );
}