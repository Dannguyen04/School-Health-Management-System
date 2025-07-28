import express from "express";
import SchoolYearController from "../controllers/SchoolYearController.js";
const router = express.Router();

router.get("/preview-promotion", SchoolYearController.previewPromotion);
router.post("/promote", SchoolYearController.promoteStudents);
router.get("/academic-years", SchoolYearController.getAcademicYears);
router.get("/stats/:academicYear", SchoolYearController.getStatsByAcademicYear);

export default router;
