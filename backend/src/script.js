import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";

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

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Image Upload Setup ──────────────────────────────────────────
const uploadDir = path.join(__dirname, "public/uploads/products");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// ✅ STEP 1 — Fix storage destination to match your uploadDir
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),  // ← use uploadDir
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        // Allows image/jpeg, image/png, image/webp, image/gif, etc.
        cb(null, true);
    } else {
        cb(new Error('Only image files allowed'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

//  This is fine as-is
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(
    "/products",
    express.static(path.join(__dirname, "..", "..", "public", "products"))
);

// Fix the upload route to return the correct URL
app.post("/api/upload", (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.log("Multer error:", err.message);
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const url = `${process.env.BASE_URL}/uploads/products/${req.file.filename}`; res.json({ url });
    });
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