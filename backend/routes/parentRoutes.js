import express from "express";
import {
    deleteHealthProfile,
    getHealthProfile,
    getMyChildren,
    getStudentMedicines,
    getVaccinationCampaignsForParent,
    requestMedication,
    upsertHealthProfile,
    getVaccinationHistory,
    getVaccinationDetail,
    getStudentVaccinationCampaigns,
    getStudentHealthCheckups,
    deliverMedication,
    addVaccinationHistoryByParent,
    deleteVaccinationHistoryByParent,
    getMedicalCampaigns,
} from "../controllers/parentController.js";
import { getVaccinations } from "../controllers/VaccineController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
    uploadMedicineImage,
    handleUploadError,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Route to get all children of a parent
router.get("/my-children", authenticateToken, getMyChildren);

// Routes for health profiles
router.get("/health-profile/:studentId", authenticateToken, getHealthProfile);
router.post(
    "/health-profile/:studentId",
    authenticateToken,
    upsertHealthProfile
);
router.put(
    "/health-profile/:studentId",
    authenticateToken,
    upsertHealthProfile
);
router.delete(
    "/health-profile/:studentId",
    authenticateToken,
    deleteHealthProfile
);

// Route for medication requests
router.post(
    "/request-medication/:studentId",
    authenticateToken,
    uploadMedicineImage,
    handleUploadError,
    requestMedication
);

// Route cho phụ huynh xác nhận đã gửi thuốc vật lý đến trường
router.put(
    "/medication/:medicationId/deliver",
    authenticateToken,
    deliverMedication // controller mới
);

// Route to get student medicines
router.get(
    "/students/:studentId/medicines",
    authenticateToken,
    getStudentMedicines
);

// Route to get all vaccination campaigns for parent's children
router.get(
    "/vaccination-campaigns",
    authenticateToken,
    getVaccinationCampaignsForParent
);

// Routes for vaccination history and details
router.get("/vaccination-history", authenticateToken, getVaccinationHistory);
router.get(
    "/vaccination-history/:studentId",
    authenticateToken,
    getVaccinationHistory
);
router.get(
    "/vaccination-detail/:campaignId/:studentId",
    authenticateToken,
    getVaccinationDetail
);

// Vaccination routes
router.get(
    "/students/:studentId/vaccination-campaigns",
    authenticateToken,
    getStudentVaccinationCampaigns
);

// Route lấy toàn bộ kết quả khám sức khỏe của học sinh cho phụ huynh
router.get(
    "/students/:studentId/health-checkups",
    authenticateToken,
    getStudentHealthCheckups
);

// Route lấy danh sách chiến dịch khám sức khỏe cho phụ huynh
router.get("/medical-campaigns", authenticateToken, getMedicalCampaigns);

// Route lấy danh sách vaccine cho phụ huynh
router.get("/vaccines", authenticateToken, getVaccinations);

// Route thêm lịch sử tiêm chủng bên ngoài
router.post(
    "/vaccination-history/:studentId",
    authenticateToken,
    addVaccinationHistoryByParent
);

// Route xóa lịch sử tiêm chủng bên ngoài
router.delete(
    "/vaccination-history/:recordId",
    authenticateToken,
    deleteVaccinationHistoryByParent
);

// Routes for notifications
router.get("/notifications", authenticateToken, (req, res) => {
    // Redirect to notification API
    const userId = req.user.id;
    const { type, status, limit, offset } = req.query;

    // Import and use the getUserNotifications function
    import("../controllers/NotificationController.js").then(
        ({ getUserNotifications }) => {
            req.params.userId = userId;
            req.query = { type, status, limit, offset };
            getUserNotifications(req, res);
        }
    );
});

router.patch(
    "/notifications/:notificationId/status",
    authenticateToken,
    (req, res) => {
        // Redirect to notification API
        import("../controllers/NotificationController.js").then(
            ({ updateNotificationStatus }) => {
                updateNotificationStatus(req, res);
            }
        );
    }
);

router.patch(
    "/notifications/:notificationId/archive",
    authenticateToken,
    (req, res) => {
        // Redirect to notification API
        import("../controllers/NotificationController.js").then(
            ({ archiveNotification }) => {
                archiveNotification(req, res);
            }
        );
    }
);

router.patch(
    "/notifications/:notificationId/restore",
    authenticateToken,
    (req, res) => {
        // Redirect to notification API
        import("../controllers/NotificationController.js").then(
            ({ restoreNotification }) => {
                restoreNotification(req, res);
            }
        );
    }
);

router.get("/notifications/unread-count", authenticateToken, (req, res) => {
    // Redirect to notification API
    const userId = req.user.id;
    import("../controllers/NotificationController.js").then(
        ({ getUnreadNotificationCount }) => {
            req.params.userId = userId;
            getUnreadNotificationCount(req, res);
        }
    );
});

export default router;
