import express from "express";
import { getBlogs, addBlog, deleteBlog, getSingleBlog, updateBlog } from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getSingleBlog);
router.post("/", protect, addBlog);
router.delete("/:id", protect, deleteBlog);
router.put("/:id", updateBlog);

export default router;