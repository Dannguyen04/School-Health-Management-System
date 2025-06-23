import express from "express";
import {
  createVaccine,
  deleteVaccine,
  getAllOptionalVaccine,
  getAllRequiredVaccine,
  getVaccines,
  updateVaccine,
} from "../controllers/VaccineController.js";
import {
  authenticateToken,
  verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", createVaccine);

router.get("/", authenticateToken, verifyManager, getVaccines);

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
