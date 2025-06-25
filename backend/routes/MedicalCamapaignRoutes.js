import express from "express";
import {
    createMedicalCampaign,
    getAllMedicalCampaigns,
    getMedicalCampaignById,
    updateMedicalCampaign,
    deleteMedicalCampaign,
} from "../controllers/MedicalCampaign.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Tạo campaign mới
router.post("/", authenticateToken, createMedicalCampaign);

// Lấy tất cả campaign
router.get("/", authenticateToken, getAllMedicalCampaigns);

// Lấy campaign theo id
router.get("/:id", authenticateToken, getMedicalCampaignById);

// Cập nhật campaign
router.put("/:id", authenticateToken, updateMedicalCampaign);

// Xóa campaign
router.delete("/:id", authenticateToken, deleteMedicalCampaign);

export default router;
