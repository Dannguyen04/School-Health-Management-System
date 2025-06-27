import express from "express";
import {
    authenticateToken,
    verifyNurse,
} from "../middleware/authenticateToken.js";
import {
    getDashboardStats,
    getRecentMedicalEvents,
    getUpcomingVaccinations,
    updateMedicalEventStatus,
    getMedicalInventory,
    createMedicalInventory,
    updateMedicalInventory,
    deleteMedicalInventory,
    getInventoryCategories,
    getAllMedicalEvents,
    createMedicalEvent,
    updateMedicalEvent,
    deleteMedicalEvent,
    getMedicalEventById,
    getVaccinationCampaigns,
    getStudentsForCampaign,
    performVaccination,
    reportVaccinationResult,
    getEligibleStudentsForVaccination,
} from "../controllers/NurseController.js";

const router = express.Router();

// Middleware xác thực cho tất cả các routes
router.use(authenticateToken);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent-events", getRecentMedicalEvents);
router.get("/dashboard/upcoming-vaccinations", getUpcomingVaccinations);

// Inventory routes
router.get("/inventory", getMedicalInventory);
router.post("/inventory", createMedicalInventory);
router.put("/inventory/:id", updateMedicalInventory);
router.delete("/inventory/:id", deleteMedicalInventory);
router.get("/inventory/categories", getInventoryCategories);

// Medical event routes
router.get("/medical-events", getAllMedicalEvents);
router.post("/medical-events", createMedicalEvent);
router.get("/medical-events/:eventId", getMedicalEventById);
router.put("/medical-events/:eventId", updateMedicalEvent);
router.delete("/medical-events/:eventId", deleteMedicalEvent);
router.patch("/medical-events/:eventId/status", updateMedicalEventStatus);

// Vaccination routes
router.get("/vaccination-campaigns", getVaccinationCampaigns);
router.get("/campaigns/:campaignId/students", getStudentsForCampaign);
router.get(
    "/vaccination-campaigns/:campaignId/eligible-students",
    verifyNurse,
    getEligibleStudentsForVaccination
);
router.post("/vaccinations/perform", verifyNurse, performVaccination);
router.post("/vaccinations/report", reportVaccinationResult);

export default router;
