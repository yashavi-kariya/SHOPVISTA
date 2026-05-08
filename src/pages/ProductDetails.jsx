import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import heartIcon from "../assets/img/icon/heart.png";

const GALLERY_STYLES = `
  @keyframes gal-fade { from { opacity:0; transform:scale(0.98) } to { opacity:1; transform:scale(1) } }
  @keyframes lb-in { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }

  .gal-wrap { display:flex; flex-direction:column; gap:10px; }
  .gal-main {
    position:relative; width:100%; aspect-ratio:1; border-radius:16px;
    overflow:hidden; background:#f5f5f5; cursor:zoom-in;
    box-shadow:0 4px 20px rgba(0,0,0,.08);
  }
  .gal-main img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:transform .4s ease; animation:gal-fade .25s ease;
  }
  .gal-main:hover img { transform:scale(1.03); }
  .gal-zoom-hint {
    position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,.45);
    color:#fff; font-size:11px; padding:4px 9px; border-radius:20px;
    backdrop-filter:blur(4px); pointer-events:none; opacity:0; transition:opacity .2s;
  }
  .gal-main:hover .gal-zoom-hint { opacity:1; }
  .gal-badge {
    position:absolute; top:12px; left:12px; background:rgba(0,0,0,.5);
    color:#fff; font-size:11px; padding:3px 10px; border-radius:12px;
    backdrop-filter:blur(4px);
  }
  .gal-color-badge {
    position:absolute; top:12px; right:12px; display:flex; align-items:center; gap:5px;
    background:rgba(255,255,255,.92); color:#111; font-size:11px; font-weight:600;
    padding:4px 10px; border-radius:20px; backdrop-filter:blur(4px);
    box-shadow:0 2px 6px rgba(0,0,0,.12);
  }
  .gal-nav {
    position:absolute; top:50%; transform:translateY(-50%);
    width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.85);
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:16px; transition:all .18s; box-shadow:0 2px 8px rgba(0,0,0,.15);
    backdrop-filter:blur(4px);
  }
  .gal-nav:hover { background:#fff; transform:translateY(-50%) scale(1.1); }
  .gal-prev { left:10px; } .gal-next { right:10px; }

  .gal-thumbs {
    display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;
    scrollbar-width:thin; scrollbar-color:#e0e0e0 transparent;
  }
  .gal-thumbs::-webkit-scrollbar { height:4px; }
  .gal-thumbs::-webkit-scrollbar-thumb { background:#e0e0e0; border-radius:4px; }
  .gal-thumb {
    flex-shrink:0; width:68px; height:68px; border-radius:10px;
    overflow:hidden; cursor:pointer;
    border:2px solid transparent; transition:all .18s; opacity:.65;
  }
  .gal-thumb:hover { opacity:.9; transform:translateY(-2px); }
  .gal-thumb.active { border-color:#6b2737; opacity:1; box-shadow:0 0 0 1px rgba(107,39,55,.2); }
  .gal-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  .gal-count { font-size:11px; color:#aaa; text-align:center; }

  .lb-overlay {
    position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.92);
    display:flex; align-items:center; justify-content:center;
    padding:20px; animation:gal-fade .2s ease;
  }
  .lb-img-wrap { position:relative; animation:lb-in .25s ease; }
  .lb-img-wrap img {
    max-width:90vw; max-height:82vh; border-radius:10px;
    object-fit:contain; display:block;
  }
  .lb-close {
    position:absolute; top:-36px; right:0; background:none; border:none;
    color:rgba(255,255,255,.8); font-size:22px; cursor:pointer;
    line-height:1; transition:color .15s;
  }
  .lb-close:hover { color:#fff; }
  .lb-nav {
    position:fixed; top:50%; transform:translateY(-50%);
    background:rgba(255,255,255,.12); border:none; color:#fff;
    font-size:28px; padding:12px 16px; cursor:pointer; border-radius:8px;
    transition:background .18s; backdrop-filter:blur(6px);
  }
  .lb-nav:hover { background:rgba(255,255,255,.22); }
  .lb-nav-prev { left:12px; } .lb-nav-next { right:12px; }
  .lb-counter {
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    color:rgba(255,255,255,.6); font-size:12px; display:flex; gap:8px; align-items:center;
  }
  .lb-dot {
    width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.35);
    transition:background .18s; cursor:pointer;
  }
  .lb-dot.active { background:#fff; }
`;

const COLORS_MAP = {
    Black: "#1a1a1a", White: "#f0f0f0", Red: "#e74c3c", Blue: "#5bb0e9",
    Green: "#27ae60", Yellow: "#f1c40f", Pink: "#e91e8c", Beige: "#c9a96e",
    Brown: "#795548", Navy: "#1a237e", Grey: "#9e9e9e", Orange: "#d75323"
};

// ─────────────────────────────────────────────
// IMAGE GALLERY COMPONENT
// ─────────────────────────────────────────────
const ImageGallery = ({ images = [], productName = "", colorLabel = "" }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => { setActiveIdx(0); }, [images]);

    const safeImages = images.filter(Boolean);
    if (safeImages.length === 0) return null;

    const prev = (e) => { e?.stopPropagation(); setActiveIdx(i => (i - 1 + safeImages.length) % safeImages.length); };
    const next = (e) => { e?.stopPropagation(); setActiveIdx(i => (i + 1) % safeImages.length); };

    const handleKeyDown = (e) => {
        if (!lightboxOpen) return;
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === "Escape") setLightboxOpen(false);
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, safeImages.length]);

    return (
        <>
            <style>{GALLERY_STYLES}</style>
            <div className="gal-wrap">
                <div className="gal-main" onClick={() => setLightboxOpen(true)}>
                    <img
                        key={`${colorLabel}-${activeIdx}`}
                        src={safeImages[activeIdx]}
                        alt={`${productName} — image ${activeIdx + 1}`}
                        onError={e => e.target.src = "/no-image.png"}
                    />
                    {safeImages.length > 1 && (
                        <span className="gal-badge">{activeIdx + 1} / {safeImages.length}</span>
                    )}
                    {colorLabel && (
                        <span className="gal-color-badge">
                            <span style={{
                                width: 10, height: 10, borderRadius: "50%",
                                background: COLORS_MAP[colorLabel] || colorLabel,
                                display: "inline-block", border: "1px solid rgba(0,0,0,.1)"
                            }} />
                            {colorLabel}
                        </span>
                    )}
                    <span className="gal-zoom-hint">🔍 Click to enlarge</span>
                    {safeImages.length > 1 && (
                        <>
                            <button type="button" className="gal-nav gal-prev" onClick={prev}>‹</button>
                            <button type="button" className="gal-nav gal-next" onClick={next}>›</button>
                        </>
                    )}
                </div>

                {safeImages.length > 1 && (
                    <>
                        <div className="gal-thumbs">
                            {safeImages.map((img, idx) => (
                                <div key={idx} className={`gal-thumb ${idx === activeIdx ? "active" : ""}`} onClick={() => setActiveIdx(idx)}>
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} onError={e => e.target.src = "/no-image.png"} />
                                </div>
                            ))}
                        </div>
                        <p className="gal-count">{safeImages.length} photos · click main image to enlarge</p>
                    </>
                )}
            </div>

            {lightboxOpen && (
                <div className="lb-overlay" onClick={() => setLightboxOpen(false)}>
                    <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
                        <button className="lb-close" onClick={() => setLightboxOpen(false)}>✕</button>
                        <img src={safeImages[activeIdx]} alt={`${productName} — full view`} onError={e => e.target.src = "/no-image.png"} />
                    </div>
                    {safeImages.length > 1 && (
                        <>
                            <button type="button" className="lb-nav lb-nav-prev" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
                            <button type="button" className="lb-nav lb-nav-next" onClick={e => { e.stopPropagation(); next(); }}>›</button>
                            <div className="lb-counter">
                                {safeImages.map((_, i) => (
                                    <div key={i} className={`lb-dot ${i === activeIdx ? "active" : ""}`}
                                        onClick={e => { e.stopPropagation(); setActiveIdx(i); }} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

// ─────────────────────────────────────────────
// PRODUCT DETAILS PAGE
// ─────────────────────────────────────────────
const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart, cartItems } = useContext(CartContext);
    const [addedToCart, setAddedToCart] = useState(false);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [currentVariant, setCurrentVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/api/products/${id}`);
                const data = res.data.product || res.data;
                setProduct(data);
                const firstColor = data.variants?.[0]?.attributes?.color || data.colors?.[0] || "";
                const firstSize = data.variants?.find(v => v.attributes?.size)?.attributes?.size || "";
                setSelectedColor(firstColor);
                setSelectedSize(firstSize);
            } catch (error) { console.log(error); }
        };
        fetchProduct();
    }, [id]);

    const getImgUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http") || path.startsWith("/")) return path;
        return `${import.meta.env.VITE_API_URL || ""}/${path}`;
    };

    // Gallery images — driven by selected color
    const galleryImages = (() => {
        if (!product) return [];

        // All variants for this color (one per size, but images are shared)
        const colorVariants = (product.variants || []).filter(v =>
            (v.attributes?.color || "").trim().toLowerCase() === (selectedColor || "").trim().toLowerCase()
        );

        // Deduplicated images from matching variants
        const variantImgs = [];
        for (const v of colorVariants) {
            const imgs = v.images?.length ? v.images : (v.image ? [v.image] : []);
            imgs.forEach(img => { if (img && !variantImgs.includes(img)) variantImgs.push(img); });
        }

        if (variantImgs.length > 0) return variantImgs.map(getImgUrl).filter(Boolean);

        // Fallback to product-level images
        const productImgs = product.images?.length > 0 ? product.images : (product.img ? [product.img] : []);
        return productImgs.map(getImgUrl).filter(Boolean);
    })();

    // Find exact (color + size) variant → gives per-size stock & price
    useEffect(() => {
        if (product?.variants?.length > 0) {
            const variant = product.variants.find(v => {
                const colorMatch = v.attributes?.color === selectedColor;
                const sizeMatch = !v.attributes?.size || !selectedSize || v.attributes.size === selectedSize;
                return colorMatch && sizeMatch;
            });
            setCurrentVariant(variant || null);
        }
    }, [product, selectedSize, selectedColor]);

    useEffect(() => {
        if (cartItems?.length && product) {
            const inCart = cartItems.some(item => item.product?._id === product._id);
            setAddedToCart(inCart);
        }
    }, [cartItems, product]);

    if (!product) return <div className="text-center py-5">Loading...</div>;

    const handleAddToCart = () => {
        if (!isLoggedIn) { alert("Please login first!"); navigate("/login"); return; }
        // Use the selected color's first image so cart/wishlist show the right variant photo
        const variantImg = galleryImages[0] || product.img || "";
        addToCart({
            _id: product._id,
            ...product,
            quantity,
            selectedColor,
            selectedSize,
            variantId: currentVariant?._id || null,
            price: currentVariant?.price || product.price,
            // These three fields go into the cart item record
            img: variantImg,
            color: selectedColor,
            size: selectedSize,
        });
        setAddedToCart(true);
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) { alert("Please login first!"); navigate("/login"); return; }
        navigate("/checkout", {
            state: {
                buyNowItem: {
                    productId: product._id, quantity, selectedColor, selectedSize,
                    variantId: currentVariant?._id || null,
                    price: currentVariant?.price || product.price,
                    product: { ...product, price: currentVariant?.price || product.price },
                }
            }
        });
    };

    return (
        <section className="product-details py-5">
            <div className="container">
                <div className="row g-5">

                    {/* LEFT — Color-aware Image Gallery */}
                    <div className="col-lg-6">
                        <ImageGallery images={galleryImages} productName={product.name} colorLabel={selectedColor} />
                    </div>

                    {/* RIGHT — Product Info */}
                    <div className="col-lg-6">
                        <h2>{product.name}</h2>
                        <h4 className="text-success">Rs {currentVariant?.price || product.price}</h4>
                        <p>{product.description}</p>

                        {/* Color */}
                        {(() => {
                            const variantColors = [...new Set((product.variants || []).map(v => v.attributes?.color).filter(Boolean))];
                            const colorList = variantColors.length > 0 ? variantColors : (product.colors || []);
                            if (colorList.length === 0) return null;
                            return (
                                <div className="mb-3">
                                    <strong>Color: <span style={{ fontWeight: 400, color: "#555" }}>{selectedColor}</span></strong>
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                        {colorList.map((color) => {
                                            const isColorAvailable = product.variants?.length > 0
                                                ? product.variants.some(v => v.attributes?.color === color && v.stock > 0)
                                                : true;
                                            const bg = COLORS_MAP[color] || color.toLowerCase();
                                            return (
                                                <button key={color} onClick={() => {
                                                    setSelectedColor(color);
                                                    // Switch to first available size for this color
                                                    const firstVariant = product.variants?.find(v => v.attributes?.color === color && v.stock > 0);
                                                    if (firstVariant?.attributes?.size) setSelectedSize(firstVariant.attributes.size);
                                                }} title={color} style={{
                                                    width: "36px", height: "36px", borderRadius: "50%",
                                                    backgroundColor: bg,
                                                    border: selectedColor === color ? "3px solid #333" : "2px solid #ccc",
                                                    outline: selectedColor === color ? "2px solid #fff" : "none",
                                                    outlineOffset: "-4px", cursor: "pointer",
                                                    opacity: isColorAvailable ? 1 : 0.4, padding: 0, transition: "all 0.2s",
                                                }} />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                        {/* Size — each variant is now exactly one size, so stock check is direct */}
                        {product.variants?.some(v => v.attributes?.size) && (
                            <div className="mb-3">
                                <strong>Size:</strong>
                                <div className="d-flex gap-2 mt-2 flex-wrap">
                                    {[...new Set(
                                        product.variants
                                            .filter(v => v.attributes?.size)
                                            .map(v => v.attributes.size)
                                    )].map((size) => {
                                        // Exact lookup: this color + this size
                                        const exactVariant = product.variants.find(v =>
                                            v.attributes.color === selectedColor && v.attributes.size === size
                                        );
                                        const isAvailable = exactVariant ? exactVariant.stock > 0 : false;

                                        return (
                                            <button key={size} onClick={() => {
                                                if (!isAvailable) return;
                                                setSelectedSize(size);
                                            }} title={!isAvailable ? "Not available for this color" : size} style={{
                                                minWidth: "44px", height: "38px", padding: "0 12px", borderRadius: "8px",
                                                border: selectedSize === size ? "2px solid #6b2737" : "1.5px solid #ccc",
                                                backgroundColor: selectedSize === size ? "#6b2737" : "#fff",
                                                color: selectedSize === size ? "#fff" : "#333",
                                                fontWeight: "600", fontSize: "13px",
                                                cursor: isAvailable ? "pointer" : "not-allowed",
                                                opacity: isAvailable ? 1 : 0.35, position: "relative", transition: "all 0.2s",
                                            }}>
                                                {!isAvailable && (
                                                    <span style={{ position: "absolute", top: "50%", left: "0", width: "100%", height: "1.5px", backgroundColor: "#aaa", transform: "rotate(-45deg)", display: "block" }} />
                                                )}
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Stock — now shows exact stock for selected color+size */}
                        <div className="mb-3">
                            <p>
                                <strong>Stock:</strong>{" "}
                                {currentVariant
                                    ? (currentVariant.stock > 0 ? currentVariant.stock : "Out of stock")
                                    : (product.stock > 0 ? product.stock : "Out of stock")}
                            </p>
                        </div>

                        {/* Quantity */}
                        <div className="d-flex align-items-center mb-4">
                            <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input type="text" readOnly value={quantity} className="form-control text-center mx-2" style={{ width: "60px" }} />
                            <button className="btn btn-outline-secondary"
                                onClick={() => setQuantity(q => q < (currentVariant?.stock ?? product.stock) ? q + 1 : q)}>+</button>
                        </div>

                        {/* Buttons */}
                        <div className="d-flex gap-2 flex-wrap">
                            <button
                                className="btn flex-grow-1"
                                onClick={() => { if (addedToCart) navigate("/cart"); else handleAddToCart(); }}
                                disabled={!addedToCart && (currentVariant ? currentVariant.stock === 0 : product.stock === 0)}
                                style={{
                                    backgroundColor: addedToCart ? "#111" : "#6b2737",
                                    color: "#fff", border: "none",
                                    transition: "background 0.25s, transform 0.15s",
                                }}
                            >
                                {currentVariant?.stock === 0 || (!addedToCart && product.stock === 0)
                                    ? "Out of Stock"
                                    : addedToCart ? "Go to Cart →" : "Add To Cart"
                                }
                            </button>
                            <button className="btn btn-success flex-grow-1" onClick={handleBuyNow}>Buy Now</button>
                            <button className="btn btn-outline-danger" onClick={() =>
                                toggleWishlist({
                                    ...product,
                                    variantId: currentVariant?._id || null,
                                    color: selectedColor,
                                    size: selectedSize,
                                    img: galleryImages?.length > 0
                                        ? galleryImages[0]
                                        : (product.img || product.images?.[0])
                                })
                            }>
                                <img src={heartIcon} width="20" alt=""
                                    style={{
                                        filter: isInWishlist(product._id, currentVariant?._id)
                                            ? "invert(24%) sepia(98%) saturate(7420%) hue-rotate(345deg)"
                                            : "none"
                                    }} />
                            </button>
                        </div>

                        {/* Extra info */}
                        <ul className="list-unstyled mt-4 text-muted">
                            <li>
                                <strong>Availability:</strong>{" "}
                                {currentVariant
                                    ? (currentVariant.stock > 0 ? `In Stock (${currentVariant.stock} left)` : "Out of Stock")
                                    : (product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock")}
                            </li>
                            <li><strong>Brand:</strong> {product.brand}</li>
                            <li><strong>Shipping:</strong> Free Delivery</li>
                            {galleryImages.length > 1 && (
                                <li><strong>Photos:</strong> {galleryImages.length} images for {selectedColor || "this color"}</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </section >
    );
};
export default ProductDetails;
