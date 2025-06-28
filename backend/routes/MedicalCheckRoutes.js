import express from "express";
import {
    checkNursePermission,
    createMedicalCheck,
    getMedicalCheckDetail,
    getMedicalChecksByCampaign,
    getStudentMedicalChecks,
    updateMedicalCheckResults,
    updateParentNotification,
    validateMedicalCheckData,
} from "../controllers/MedicalCheck.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

// Tạo router
const router = express.Router();

router.post(
    "/create",
    authenticateToken,
    checkNursePermission,
    validateMedicalCheckData,
    createMedicalCheck
);

router.put(
    "/:id",
    authenticateToken,
    checkNursePermission,
    updateMedicalCheckResults
);

// Cập nhật trạng thái/thông báo phụ huynh
router.patch("/parent/:id", authenticateToken, updateParentNotification);

// Lấy danh sách kiểm tra theo campaign
router.get(
    "/campaign/:campaignId",
    authenticateToken,
    getMedicalChecksByCampaign
);

// Lấy lịch sử kiểm tra của học sinh
router.get("/student/:studentId", authenticateToken, getStudentMedicalChecks);

// Lấy chi tiết một báo cáo kiểm tra
router.get("/:id", authenticateToken, getMedicalCheckDetail);

export default router;
