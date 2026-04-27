import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    img: { type: String, required: true },
    date: { type: String },
    excerpt: { type: String },
    content: { type: String },
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);