import express from "express";
import {
    createMedicalCampaign,
    deleteMedicalCampaign,
    getAllMedicalCampaigns,
    getMedicalCampaignById,
    updateMedicalCampaign,
    updateProgress,
    notifyParentsAboutCampaign, // thêm hàm mới
    getStudentsForMedicalCampaign,
    submitParentConsent,
} from "../controllers/MedicalCampaign.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Tạo campaign mới
router.post("/", authenticateToken, createMedicalCampaign);

// Lấy tất cả campaign
router.get("/", authenticateToken, getAllMedicalCampaigns);

// Lấy campaign theo id
router.get("/:id", authenticateToken, getMedicalCampaignById);

// Lấy danh sách học sinh thuộc campaign
router.get("/:id/students", authenticateToken, getStudentsForMedicalCampaign);

// Cập nhật campaign
router.put("/:id", authenticateToken, updateMedicalCampaign);

// Cập nhật tiến độ campaign
router.put("/:id/status", authenticateToken, updateProgress);

// Xóa campaign
router.delete("/:id", authenticateToken, deleteMedicalCampaign);

// Gửi thông báo chiến dịch về cho phụ huynh
router.post(
    "/:id/notify-parents",
    authenticateToken,
    notifyParentsAboutCampaign
);

// Submit parent consent for optional examinations
router.post(
    "/:id/consent",
    authenticateToken,
    submitParentConsent
);

export default router;
