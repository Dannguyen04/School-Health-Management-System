import express from "express";
import {
    getOverview,
    getAttentionSummaryController,
    getComparisonSummary,
    getStudentsNeedingAttention,
} from "../controllers/ReportMedicalCheck.Controller.js";
import {
    authenticateToken,
    verifyManager,
    verifyNurse,
} from "../middleware/authenticateToken.js";
const router = express.Router();

// Tổng quan báo cáo khám sức khỏe
router.get("/overview", authenticateToken, verifyManager, getOverview);

// Báo cáo số lượng học sinh cần chú ý/theo dõi
router.get(
    "/attention-summary",
    authenticateToken,
    verifyManager,
    getAttentionSummaryController
);

// So sánh giữa hai kỳ khám sức khỏe
router.post(
    "/comparison-summary",
    authenticateToken,
    verifyManager,
    getComparisonSummary
);

// Lấy danh sách học sinh cần chú ý hoặc điều trị
router.get(
    "/students-needing-attention",
    authenticateToken,
    verifyManager,
    getStudentsNeedingAttention
);

export default router;
