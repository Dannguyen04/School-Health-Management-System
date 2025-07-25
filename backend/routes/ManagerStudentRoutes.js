import express from "express";
import {
    addParent,
    getAllGradesWithStudentCount,
    getAllParents,
} from "../controllers/AdminController.js";
import { getDashboardStats } from "../controllers/ManagerDashboardController.js";
import { getVaccinationReport } from "../controllers/NurseController.js";
import {
    authenticateToken,
    verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Xóa toàn bộ các route liên quan đến Student

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

router.get("/vaccination-report/:campaignId", getVaccinationReport);

export default router;
