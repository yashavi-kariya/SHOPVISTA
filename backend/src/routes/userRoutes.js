import express from "express";
import {
    loginUser,
    getProfile,
    getAllUsers,
    deleteUser,
    registerUser,     // 👈 add
    updateProfile,    // 👈 add
    addToWishlist,    // 👈 add
    removeFromWishlist // 👈 add
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/register", registerUser);   // add register
router.post("/login", loginUser);

// User
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);         // 👈 update profile
router.put("/wishlist/add", protect, addToWishlist);    // 👈 wishlist
router.put("/wishlist/remove", protect, removeFromWishlist);

// Admin
router.get("/admin/users", protect, adminOnly, getAllUsers);
router.delete("/admin/users/:id", protect, adminOnly, deleteUser);

export default router;
// import express from "express";
// import { loginUser, getProfile, getAllUsers, deleteUser } from "../controllers/userController.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/login", loginUser);
// router.get("/profile", protect, getProfile);
// router.get("/admin/users", protect, adminOnly, getAllUsers);
// router.delete("/admin/users/:id", protect, adminOnly, deleteUser);

// export default router;