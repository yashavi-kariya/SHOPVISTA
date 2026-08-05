import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { upload } from "./config/cloudinary.js";
import dbconnect from "./config/dbConnect.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
dbconnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({
    origin: function (origin, callback) {
        const allowed = [
            "https://shopvista-zreu.vercel.app",
            "http://localhost:5173"
        ];
        // Allow any vercel.app preview URL for this project
        if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

const healthCheck = (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "shopvista-backend",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};

app.get("/healthz", healthCheck);
app.get("/api/health", healthCheck);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/products", express.static(path.join(__dirname, "..", "..", "public", "products")));

// ── Upload Route 
app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ url: req.file.path });
});
// Routes 
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/notifications", notificationRoutes);
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at port ${PORT}`);
});
