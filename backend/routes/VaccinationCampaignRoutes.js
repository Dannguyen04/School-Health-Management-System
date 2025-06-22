import express from "express";
import {
    createVaccinationCampaign,
    getAllVaccinationCampaigns,
    updateVaccinationCampaign,
    deleteVaccinationCampaign,
} from "../controllers/VaccinationCampaignController.js";
import {
    authenticateToken,
    verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, verifyManager, createVaccinationCampaign);

router.get("/", authenticateToken, verifyManager, getAllVaccinationCampaigns);

router.put("/:id", authenticateToken, verifyManager, updateVaccinationCampaign);

router.delete(
    "/:id",
    authenticateToken,
    verifyManager,
    deleteVaccinationCampaign
);

export default router;
