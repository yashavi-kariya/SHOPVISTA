import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { upload } from "./config/cloudinary.js";
dotenv.config();

import dbconnect from "./config/dbConnect.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./models/couponRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

const app = express();
dbconnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
    origin: "https://shopvista-zreu.vercel.app",
    credentials: true
}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/products", express.static(path.join(__dirname, "..", "..", "public", "products")));

// ── Upload Route ──────────────────────────────────────────────────────
app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ url: req.file.path });
});

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/blogs", blogRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at port ${PORT}`);
});