import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    attributes: {
        color: { type: String, required: true },
        size: { type: String, required: true }
    },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },   // ← per-color image gallery
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    img: String,                            // first image (backwards compat)
    images: { type: [String], default: [] },   // product-level fallback images
    category: String,
    subCategory: String,
    brand: String,
    discount: { type: Number, default: 0 },
    collection: { type: String, default: "none" },
    price: Number,
    stock: Number,
    colors: [String],
    sizes: [String],
    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    variants: [variantSchema],                   // ← single source of truth
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;