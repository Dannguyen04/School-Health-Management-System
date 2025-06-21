import express from "express";
import studentRoutes from "./StudentRoutes.js";

import {
  addRole,
  deleteUser,
  filterUsers,
  getAllUsers,
  updateRole,
} from "../controllers/AdminController.js";
import {
  authenticateToken,
  verifyAdmin,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Đăng nhập admin
router.post("/admin", authenticateToken, verifyAdmin);

// Mount các route con liên quan đến student
router.use("/students", authenticateToken, verifyAdmin, studentRoutes);

router.post("/users/", authenticateToken, verifyAdmin, addRole);

router.get("/users/getAllUsers", authenticateToken, verifyAdmin, getAllUsers);

router.delete("/users/:id", authenticateToken, verifyAdmin, deleteUser);

router.put("/users/:id", authenticateToken, verifyAdmin, updateRole);

router.get("/users/filter", authenticateToken, verifyAdmin, filterUsers);

export default router;
