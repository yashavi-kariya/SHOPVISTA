import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Protect middleware
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            id: user._id,
            name: user.name || "User",
            email: user.email || "",
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: "Not authorized" });
    }
};

// const adminOnly = (req, res, next) => {
//     if (req.user && req.user.role === "admin") {
//         next();
//     } else {
//         return res.status(403).json({
//             message: "Admin access only"
//         });
//     }
// };
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

export { protect, adminOnly };