import express from "express";
import {
  createVaccinationCampaign,
  deleteVaccinationCampaign,
  getAllVaccinationCampaigns,
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

router.put("/:id", authenticateToken, verifyManager, updateVaccinationCampaign);

router.delete(
  "/:id",
  authenticateToken,
  verifyManager,
  deleteVaccinationCampaign
);

export default router;
