import express from "express";
import studentRoutes from "StudentRoutes.js";
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Đăng nhập admin
router.post("/admin", authenticateToken, verifyAdmin);

// Mount các route con liên quan đến student
router.use("/students", authenticateToken, verifyAdmin, studentRoutes);

export default router;
