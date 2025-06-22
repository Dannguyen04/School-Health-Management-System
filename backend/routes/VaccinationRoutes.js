import express from "express";
import {
    createVaccine,
    getAllVaccine,
    getAllRequiredVaccine,
    getAllOptionalVaccine,
    updateVaccine,
    deleteVaccine,
} from "../controllers/VaccineController.js";
import {
    authenticateToken,
    verifyManager,
} from "../middleware/authenticateToken.js";
import VaccinationRoutes from "./VaccinationRoutes.js";
const router = express.Router();

router.post("/", createVaccine);

router.get("/", authenticateToken, verifyManager, getAllVaccine);

router.get(
    "/required",
    authenticateToken,
    verifyManager,
    getAllRequiredVaccine
);

router.get(
    "/optional",
    authenticateToken,
    verifyManager,
    getAllOptionalVaccine
);

router.put("/:id", authenticateToken, verifyManager, updateVaccine);

router.delete("/:id", authenticateToken, verifyManager, deleteVaccine);

export default router;
