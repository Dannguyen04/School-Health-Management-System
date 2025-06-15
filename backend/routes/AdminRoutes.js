import express from "express";
import studentRoutes from "./StudentRoutes.js";

import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";
import {
    getAllUsers,
    addRole,
    deleteUser,
} from "../controllers/AdminController.js";

const router = express.Router();

// Đăng nhập admin
router.post("/admin", authenticateToken, verifyAdmin);

// Mount các route con liên quan đến student
router.use("/students", authenticateToken, verifyAdmin, studentRoutes);

router.post("/users/addRole", authenticateToken, verifyAdmin, addRole);

router.get("/users/getAllUsers", authenticateToken, verifyAdmin, getAllUsers);

router.delete("/users/:id", authenticateToken, verifyAdmin, deleteUser);

export default router;
