import express from "express";
import {
    getPublishedBlogPosts,
    getBlogCategories,
    getBlogPostById,
} from "../controllers/BlogController.js";

const router = express.Router();

// Public blog routes (no authentication required)
// Specific routes must come before parameterized routes
router.get("/categories", getBlogCategories);
router.get("/published", getPublishedBlogPosts);
router.get("/:id", getBlogPostById);

export default router;
