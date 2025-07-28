import express from "express";

import {
  addParent,
  getAllGradesWithStudentCount,
  getAllParents,
} from "../controllers/AdminController.js";
import { getDashboardStats } from "../controllers/ManagerDashboardController.js";
import { getVaccinationReport } from "../controllers/NurseController.js";
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
} from "../controllers/StudentController.js";
import {
  authenticateToken,
  verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Student CRUD routes for manager
router.post("/", authenticateToken, verifyManager, createStudent);
router.get("/", authenticateToken, verifyManager, getAllStudents);

// Parent routes (must come before /:id routes)
router.get("/parents", authenticateToken, verifyManager, getAllParents);
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

router.get("/vaccination-report/:campaignId", getVaccinationReport);

// Student routes with ID (must come after specific routes)
router.get("/:id", authenticateToken, verifyManager, getStudentById);
router.put("/:id", authenticateToken, verifyManager, updateStudent);
router.delete("/:id", authenticateToken, verifyManager, deleteStudent);

export default router;
