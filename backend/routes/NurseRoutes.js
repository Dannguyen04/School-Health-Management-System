import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
    getDashboardStats,
    getRecentMedicalEvents,
    getUpcomingVaccinations,
    updateMedicalEventStatus,
} from "../controllers/NurseController.js";

const router = express.Router();

// Middleware xác thực cho tất cả các routes
router.use(authenticateToken);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent-events", getRecentMedicalEvents);
router.get("/dashboard/upcoming-vaccinations", getUpcomingVaccinations);

// Medical event routes
router.patch("/medical-events/:eventId/status", updateMedicalEventStatus);

export default router;
