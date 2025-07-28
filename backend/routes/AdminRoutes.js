import express from "express";
import studentRoutes from "./StudentRoutes.js";

import {
  addParent,
  addRole,
  deleteParent,
  deleteUser,
  filterUsers,
  getAllGradesWithStudentCount,
  getAllParents,
  getAllStudentsForNurse,
  getAllUsers,
  getDashboardStats,
  getUserPassword,
  updateParent,
  updateRole,
  updateUserPassword,
} from "../controllers/AdminController.js";
import { importParentsStudents } from "../controllers/ImportController.js";
import {
  authenticateToken,
  verifyAdmin,
} from "../middleware/authenticateToken.js";
import {
  handleUploadError,
  uploadExcel,
} from "../middleware/uploadMiddleware.js";

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

router.delete("/users/:id", authenticateToken, verifyAdmin, deleteUser);

router.get("/users/filter", authenticateToken, verifyAdmin, filterUsers);

// Quản lý mật khẩu user
router.get(
  "/user/password/:id",
  authenticateToken,
  verifyAdmin,
  getUserPassword
);
router.put(
  "/user/password/:id",
  authenticateToken,
  verifyAdmin,
  updateUserPassword
);

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
