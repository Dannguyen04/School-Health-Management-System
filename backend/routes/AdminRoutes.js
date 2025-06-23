import express from "express";
import studentRoutes from "./StudentRoutes.js";

import {
    addRole,
    deleteUser,
    filterUsers,
    getAllUsers,
    getDashboardStats,
    updateRole,
    addStudent,
    getAllStudents,
    updateStudent,
    filterStudents,
    getAllStudentsForNurse,
    getAllParents,
    addParent,
    updateParent,
    deleteParent,
} from "../controllers/AdminController.js";
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Đăng nhập admin
router.post("/admin", authenticateToken, verifyAdmin);

// Dashboard statistics
router.get(
    "/dashboard/stats",
    authenticateToken,
    verifyAdmin,
    getDashboardStats
);

// Mount các route con liên quan đến student
router.use("/students", authenticateToken, verifyAdmin, studentRoutes);

router.post("/users/", authenticateToken, verifyAdmin, addRole);

router.get("/users/getAllUsers", authenticateToken, verifyAdmin, getAllUsers);

router.delete("/users/:id", authenticateToken, verifyAdmin, deleteUser);

router.put("/users/:id", authenticateToken, verifyAdmin, updateRole);

router.get("/users/filter", authenticateToken, verifyAdmin, filterUsers);

router.post("/", authenticateToken, verifyAdmin, addStudent);

router.get("/", authenticateToken, verifyAdmin, getAllStudents);

router.put("/:id", authenticateToken, verifyAdmin, updateStudent);

router.delete("/:id", authenticateToken, verifyAdmin, deleteUser);

router.get("/filter", authenticateToken, verifyAdmin, filterStudents);

// Route cho y tá lấy danh sách học sinh
router.get("/students-for-nurse", authenticateToken, getAllStudentsForNurse);

// Quản lý phụ huynh
router.get("/parents", authenticateToken, verifyAdmin, getAllParents);
router.post("/parents", authenticateToken, verifyAdmin, addParent);
router.put("/parents/:id", authenticateToken, verifyAdmin, updateParent);
router.delete("/parents/:id", authenticateToken, verifyAdmin, deleteParent);

export default router;
