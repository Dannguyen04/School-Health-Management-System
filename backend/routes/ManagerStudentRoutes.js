import express from "express";
import {
  addParent,
  addStudent,
  deleteUser,
  filterStudents,
  getAllGradesWithStudentCount,
  getAllParents,
  getAllStudents,
  updateStudent,
} from "../controllers/AdminController.js";
import { getDashboardStats } from "../controllers/ManagerDashboardController.js";
import {
  authenticateToken,
  verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, verifyManager, addStudent);

router.get("/", authenticateToken, verifyManager, getAllStudents);

router.put("/:id", authenticateToken, verifyManager, updateStudent);

router.delete("/:id", authenticateToken, verifyManager, deleteUser);

router.get("/filter", authenticateToken, verifyManager, filterStudents);

// Add route to get all parents for manager
router.get("/parents", authenticateToken, verifyManager, getAllParents);

// Add route for manager to create new parent
router.post("/parents", authenticateToken, verifyManager, addParent);

router.get(
  "/grades-with-count",
  authenticateToken,
  verifyManager,
  getAllGradesWithStudentCount
);

// Dashboard stats for manager
router.get(
  "/dashboard-stats",
  authenticateToken,
  verifyManager,
  getDashboardStats
);

export default router;
