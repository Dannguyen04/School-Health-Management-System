import express from "express";
import {
    archiveNotification,
    createNotification,
    getNotificationById,
    getUnreadNotificationCount,
    getUserNotifications,
    restoreNotification,
    sendMedicalEventNotification,
    updateNotificationStatus,
    markAllAsRead,
    deleteNotification,
} from "../controllers/NotificationController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Tạo thông báo mới
router.post("/", authenticateToken, createNotification);

// Lấy danh sách thông báo của user
router.get("/user/:userId", authenticateToken, getUserNotifications);

// Lấy chi tiết thông báo theo ID
router.get("/:notificationId", authenticateToken, getNotificationById);

// Cập nhật trạng thái thông báo
router.patch(
    "/:notificationId/status",
    authenticateToken,
    updateNotificationStatus
);

// Lưu trữ thông báo
router.patch(
    "/:notificationId/archive",
    authenticateToken,
    archiveNotification
);

// Khôi phục thông báo từ lưu trữ
router.patch(
    "/:notificationId/restore",
    authenticateToken,
    restoreNotification
);

// Lấy số thông báo chưa đọc
router.get(
    "/user/:userId/unread-count",
    authenticateToken,
    getUnreadNotificationCount
);

// Gửi thông báo sự kiện y tế cho phụ huynh
router.post(
    "/medical-event/:medicalEventId/send",
    authenticateToken,
    sendMedicalEventNotification
);

// Đánh dấu tất cả thông báo là đã đọc
router.patch("/user/:userId/read-all", authenticateToken, markAllAsRead);

// Xóa thông báo theo ID
router.delete("/:notificationId", authenticateToken, deleteNotification);

export default router;
