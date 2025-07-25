import express from "express";
import studentRoutes from "./StudentRoutes.js";

import {
    addRole,
    filterUsers,
    getAllUsers,
    getDashboardStats,
    updateRole,
    getAllStudentsForNurse,
    getAllParents,
    addParent,
    updateParent,
    deleteParent,
    getAllGradesWithStudentCount,
} from "../controllers/AdminController.js";
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";
import {
    uploadExcel,
    handleUploadError,
} from "../middleware/uploadMiddleware.js";
import { importParentsStudents } from "../controllers/ImportController.js";

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

router.put("/users/:id", authenticateToken, verifyAdmin, updateRole);

router.get("/users/filter", authenticateToken, verifyAdmin, filterUsers);

// Route cho y tá lấy danh sách học sinh
router.get("/students-for-nurse", authenticateToken, getAllStudentsForNurse);

// Quản lý phụ huynh
router.get("/parents", authenticateToken, verifyAdmin, getAllParents);
router.post("/parents", authenticateToken, verifyAdmin, addParent);
router.put("/parents/:id", authenticateToken, verifyAdmin, updateParent);
router.delete("/parents/:id", authenticateToken, verifyAdmin, deleteParent);

// Quản lí MK
router.post(
    "/import-parents-students",
    uploadExcel,
    handleUploadError,
    importParentsStudents
);

router.get(
    "/grades-with-count",
    authenticateToken,
    verifyAdmin,
    getAllGradesWithStudentCount
);

export default router;
