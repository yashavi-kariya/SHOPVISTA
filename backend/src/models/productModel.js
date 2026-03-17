import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    brand: String,
    stock: Number,
    img: String,
    colors: [String],
    sizes: [String]
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema, "products");

export default Product;