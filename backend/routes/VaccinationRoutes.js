import express from "express";
import {
    createVaccination,
    deleteVaccination,
    getAllOptionalVaccination,
    getAllRequiredVaccination,
    getVaccinations,
    updateVaccination,
} from "../controllers/VaccineController.js";
import {
    authenticateToken,
    verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", createVaccination);

router.get("/", authenticateToken, verifyManager, getVaccinations);

router.get(
    "/required",
    authenticateToken,
    verifyManager,
    getAllRequiredVaccination
);

router.get(
    "/optional",
    authenticateToken,
    verifyManager,
    getAllOptionalVaccination
);

router.put("/:id", authenticateToken, verifyManager, updateVaccination);

router.delete("/:id", authenticateToken, verifyManager, deleteVaccination);

export default router;
