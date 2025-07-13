import express from "express";
import { getVaccinationReport } from "../controllers/NurseController.js";
import {
  createVaccinationCampaign,
  deleteVaccinationCampaign,
  getAllVaccinationCampaigns,
  getCampaignConsents,
  getVaccinationCampaignById,
  sendConsentNotification,
  submitVaccinationConsent,
  updateProgress,
  updateVaccinationCampaign,
} from "../controllers/VaccinationCampaignController.js";
import {
  authenticateToken,
  verifyManager,
} from "../middleware/authenticateToken.js";
import VaccinationRoutes from "./VaccinationRoutes.js";

const router = express.Router();

router.use("/vaccines", authenticateToken, verifyManager, VaccinationRoutes);

router.post("/", authenticateToken, verifyManager, createVaccinationCampaign);

router.get("/", authenticateToken, verifyManager, getAllVaccinationCampaigns);

router.get(
  "/:id",
  authenticateToken,
  verifyManager,
  getVaccinationCampaignById
);

router.put("/:id", authenticateToken, verifyManager, updateVaccinationCampaign);
router.put("/:id/status", authenticateToken, verifyManager, updateProgress);

router.delete(
  "/:id",
  authenticateToken,
  verifyManager,
  deleteVaccinationCampaign
);

router.post(
  "/:id/send-consent",
  authenticateToken,
  verifyManager,
  sendConsentNotification
);

router.post("/:id/consent", authenticateToken, submitVaccinationConsent);

router.get(
  "/:id/consents",
  authenticateToken,
  verifyManager,
  getCampaignConsents
);

router.get("/vaccination-report/:campaignId", getVaccinationReport);

export default router;
