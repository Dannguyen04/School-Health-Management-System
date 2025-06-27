import express from "express";
import {
    createVaccinationCampaign,
    deleteVaccinationCampaign,
    getAllVaccinationCampaigns,
    getVaccinationCampaignById,
    updateVaccinationCampaign,
    sendConsentNotification,
    submitVaccinationConsent,
    getCampaignConsents,
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

export default router;
