import express from "express";
import {
  approveMedicationRequest,
  createMedicalEvent,
  createMedicalInventory,
  deleteMedicalEvent,
  deleteMedicalInventory,
  getAllMedicalEvents,
  getApprovedMedications,
  getDashboardStats,
  getEligibleStudentsForVaccination,
  getInventoryCategories,
  getInventoryStats,
  getMedicalEventById,
  getMedicalInventory,
  getMedicationHistory,
  getMedicationRequestById,
  getMedicationRequestStats,
  getPendingMedicationRequests,
  getRecentMedicalEvents,
  getStudentsForCampaign,
  getStudentTreatments,
  getUpcomingVaccinations,
  getVaccinationCampaigns,
  giveMedicineToStudent,
  performVaccination,
  reportVaccinationResult,
  stopStudentTreatment,
  updateMedicalEvent,
  updateMedicalEventStatus,
  updateMedicalInventory,
} from "../controllers/NurseController.js";
import {
  authenticateToken,
  verifyNurse,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Middleware xác thực cho tất cả các routes
router.use(authenticateToken);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/recent-events", getRecentMedicalEvents);
router.get("/dashboard/upcoming-vaccinations", getUpcomingVaccinations);

// Inventory routes
router.get("/inventory", getMedicalInventory);
router.get("/inventory/stats", getInventoryStats);
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

// Medication request routes
router.get("/medication-requests", getPendingMedicationRequests);
router.get("/medication-requests/stats", getMedicationRequestStats);
router.get("/medication-requests/:requestId", getMedicationRequestById);
router.patch(
  "/medication-requests/:requestId/approve",
  approveMedicationRequest
);

// Thuốc đã được phê duyệt
router.get("/approved-medications", getApprovedMedications);

// Điều trị học sinh
router.get("/student-treatments", getStudentTreatments);
router.post("/give-medicine/:studentMedicationId", giveMedicineToStudent);
router.get("/medication-history/:studentMedicationId", getMedicationHistory);
router.patch("/student-treatments/:id/stop", stopStudentTreatment);

export default router;
