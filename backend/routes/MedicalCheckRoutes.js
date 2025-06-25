import express from "express";
import {
    scheduleMedicalCheckForStudent,
    updateMedicalCheckResults,
    getMedicalChecksByCampaign,
    getStudentMedicalChecks,
    getMedicalCheckDetail,
    getMedicalCheckStatistics,
} from "../controllers/MedicalCheck.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { checkNursePermission } from "../controllers/MedicalCheck.js";

// Tạo router
const router = express.Router();

// Tạo lịch kiểm tra sức khỏe (chỉ y tá)
router.post(
    "/",
    authenticateToken,
    checkNursePermission,
    scheduleMedicalCheckForStudent
);

// Cập nhật kết quả kiểm tra (chỉ y tá)
router.put(
    "/:id",
    authenticateToken,
    checkNursePermission,
    updateMedicalCheckResults
);

// Lấy danh sách kiểm tra theo campaign (có thể phân quyền nếu cần)
router.get(
    "/campaign/:campaignId",
    authenticateToken,
    getMedicalChecksByCampaign
);

// Lấy lịch sử kiểm tra của học sinh
router.get("/student/:studentId", authenticateToken, getStudentMedicalChecks);

// Lấy chi tiết một báo cáo kiểm tra
router.get("/:id", authenticateToken, getMedicalCheckDetail);

// Thống kê báo cáo kiểm tra theo campaign
router.get(
    "/statistics/:campaignId",
    authenticateToken,
    getMedicalCheckStatistics
);
