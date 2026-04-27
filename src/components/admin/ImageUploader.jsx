import React, { useEffect, useState, useRef, useCallback } from "react";
// import api from "api";
import api from "../../api";
import { useNavigate } from "react-router-dom";

// // ─── INLINE IMAGE UPLOADER (no extra file needed) ───────────────
const UPLOADER_STYLES = `
  @keyframes iu-pop { 0% { transform:scale(0.85); opacity:0 } 60% { transform:scale(1.05) } 100% { transform:scale(1); opacity:1 } }
  @keyframes iu-spin { to { transform:rotate(360deg) } }
  .iu-wrap { display:flex; flex-direction:column; gap:10px; }
  .iu-drop {
    position:relative; border:2px dashed #d8c5c9; border-radius:12px;
    background:repeating-linear-gradient(135deg,#fdf8f9 0,#fdf8f9 10px,#fff 10px,#fff 20px);
    padding:22px 16px; text-align:center; cursor:pointer;
    transition:border-color .2s,background .2s;
  }
  .iu-drop:hover,.iu-drop.drag{border-color:#6b2737;background:rgba(107,39,55,.04);}
  .iu-drop-icon{font-size:24px;margin-bottom:6px;line-height:1;}
  .iu-drop-title{font-size:12px;font-weight:600;color:#444;margin:0 0 2px;}
  .iu-drop-hint{font-size:10px;color:#bbb;margin:0;}
  .iu-browse{display:inline-block;margin-top:8px;padding:5px 16px;background:#6b2737;color:#fff;border-radius:20px;font-size:11px;font-weight:600;border:none;cursor:pointer;font-family:inherit;}
  .iu-browse:hover{background:#7d2f42;}
  .iu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;}
  .iu-thumb{position:relative;aspect-ratio:1;border-radius:9px;overflow:hidden;border:1.5px solid #f0f0f0;animation:iu-pop .22s ease both;background:#f7f7f7;}
  .iu-thumb:first-child{border-color:#6b2737;box-shadow:0 0 0 2px rgba(107,39,55,.15);}
  .iu-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
  .iu-thumb-badge{position:absolute;top:3px;left:3px;background:#6b2737;color:#fff;font-size:8px;font-weight:700;padding:2px 5px;border-radius:8px;}
  .iu-thumb-del{position:absolute;top:3px;right:3px;width:18px;height:18px;background:rgba(0,0,0,.55);color:#fff;border:none;border-radius:50%;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;font-family:inherit;}
  .iu-thumb:hover .iu-thumb-del{opacity:1;}
  .iu-thumb-uploading{position:absolute;inset:0;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;}
  .iu-spinner{width:16px;height:16px;border:2px solid #ddd;border-top-color:#6b2737;border-radius:50%;animation:iu-spin .7s linear infinite;}
  .iu-info{font-size:10px;color:#aaa;} .iu-info span{color:#6b2737;font-weight:600;}
  .iu-error{font-size:11px;color:#e74c3c;background:#fde8e8;padding:5px 9px;border-radius:7px;}
  .iu-reorder{font-size:10px;color:#ccc;text-align:center;}
`;

const ImageUploader = ({ images, setImages, uploadEndpoint, token, maxImages = 6 }) => {
    const safeImages = Array.isArray(images) ? images : [];  // ← fixes the .map error
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState([]);
    const [error, setError] = useState("");

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await fetch(uploadEndpoint || `${import.meta.env.VITE_API_URL}/api/upload`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            console.log("Upload status:", res.status);  // ← add this

            if (!res.ok) {
                const errText = await res.text();
                console.log("Upload error response:", errText);  // ← add this
                throw new Error();
            }
            const data = await res.json();
            console.log("Upload response data:", data);  // ← add this
            return data.url || data.path || data.imageUrl || null;
        } catch (err) {
            console.log("Upload catch error:", err);  // ← add this
            return null;
        }
    };

    const processFiles = useCallback(async (files) => {
        setError("");
        const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));
        if (!fileArr.length) return;

        // ✅ Read current images fresh from state
        setImages(prev => {
            const current = Array.isArray(prev) ? prev : [];
            const remaining = maxImages - current.length;
            if (remaining <= 0) {
                setError(`Max ${maxImages} images allowed.`);
                return current;
            }

            const toUpload = fileArr.slice(0, remaining);
            const tempUrls = toUpload.map(f => URL.createObjectURL(f));
            const startIdx = current.length;

            // Start uploads after setting temp previews
            setUploading(toUpload.map((_, i) => startIdx + i));

            Promise.all(toUpload.map(f => uploadFile(f))).then(uploadedUrls => {
                setUploading([]);
                setImages(prev2 => {
                    const updated = [...prev2];
                    toUpload.forEach((_, i) => {
                        if (uploadedUrls[i]) {
                            URL.revokeObjectURL(tempUrls[i]);
                            updated[startIdx + i] = uploadedUrls[i];
                        }
                    });
                    return updated;
                });
                const failed = uploadedUrls.filter(u => !u).length;
                if (failed > 0) setError(`${failed} upload(s) failed.`);
            });

            return [...current, ...tempUrls]; // ✅ always appends to latest state
        });
    }, [maxImages, token]); // ✅ removed safeImages from deps

    return (
        <>
            <style>{UPLOADER_STYLES}</style>
            <div className="iu-wrap">
                {safeImages.length < maxImages && (
                    <div
                        className={`iu-drop ${dragging ? "drag" : ""}`}
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => { processFiles(e.target.files); e.target.value = ""; }} />
                        <div className="iu-drop-icon">🖼️</div>
                        <p className="iu-drop-title">{dragging ? "Drop images here" : "Drag & drop or upload images"}</p>
                        <p className="iu-drop-hint">PNG, JPG, WEBP • max {maxImages} images</p>
                        <button type="button" className="iu-browse" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>Browse Files</button>
                    </div>
                )}
                {error && <div className="iu-error">⚠️ {error}</div>}
                {safeImages.length > 0 && (
                    <>
                        <div className="iu-grid">
                            {safeImages.map((url, idx) => (
                                <div key={url + idx} className="iu-thumb" title={idx === 0 ? "Main image" : "Click to set as main"}>
                                    <img src={url} alt="" onError={e => e.target.src = "/placeholder.png"}
                                        onClick={() => {
                                            if (idx === 0) return;
                                            const u = [...safeImages];
                                            u.splice(idx, 1);
                                            u.unshift(url);
                                            setImages(u);
                                        }}
                                        style={{ cursor: idx === 0 ? "default" : "pointer" }} />
                                    {idx === 0 && <span className="iu-thumb-badge">MAIN</span>}
                                    {uploading.includes(idx) && <div className="iu-thumb-uploading"><div className="iu-spinner" /></div>}
                                    <button type="button" className="iu-thumb-del"
                                        onClick={e => { e.stopPropagation(); setImages(safeImages.filter((_, i) => i !== idx)); }}>✕</button>
                                </div>
                            ))}
                        </div>
                        <div className="iu-reorder">Click any image to set it as the main photo</div>
                        <div className="iu-info"><span>{safeImages.length}</span> / {maxImages} images</div>
                    </>
                )}
            </div>
        </>
    );
};

export default ImageUploader;