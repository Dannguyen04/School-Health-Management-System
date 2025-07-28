import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tạo thông báo mới
export const createNotification = async (req, res) => {
    try {
        const {
            userId,
            title,
            message,
            type = "general",
            scheduledAt = null,
            vaccinationCampaignId = null,
            medicalCheckCampaignId = null,
        } = req.body;

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                status: "SENT",
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                sentAt: new Date(),
                vaccinationCampaignId,
                medicalCheckCampaignId,
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            data: notification,
            message: "Đã tạo thông báo thành công",
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi tạo thông báo",
        });
    }
};

// Lấy danh sách thông báo của user
export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, status, limit = 50, offset = 0 } = req.query;

        const where = {
            userId,
        };

        if (type) {
            where.type = type;
        }

        if (status) {
            where.status = status;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                vaccinationCampaign: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                medicalCheckCampaign: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        const total = await prisma.notification.count({ where });

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
            },
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách thông báo",
        });
    }
};

// Cập nhật trạng thái thông báo (đánh dấu đã đọc)
export const updateNotificationStatus = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { status } = req.body;

        const notification = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                status,
                readAt: status === "READ" ? new Date() : null,
            },
        });

        res.json({
            success: true,
            data: notification,
            message: "Đã cập nhật trạng thái thông báo thành công",
        });
    } catch (error) {
        console.error("Error updating notification status:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi cập nhật trạng thái thông báo",
        });
    }
};

// Gửi thông báo sự kiện y tế cho phụ huynh
export const sendMedicalEventNotification = async (req, res) => {
    try {
        const { medicalEventId } = req.params;
        const { parentIds } = req.body; // Array of parent IDs to notify

        // Lấy thông tin sự kiện y tế
        const medicalEvent = await prisma.medicalEvent.findUnique({
            where: { id: medicalEventId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!medicalEvent) {
            return res.status(404).json({
                success: false,
                error: "Medical event not found",
            });
        }

        // Hàm dịch severity sang tiếng Việt
        const getSeverityLabel = (severity) => {
            switch (severity?.toLowerCase()) {
                case "critical":
                    return "Nguy kịch";
                case "high":
                    return "Cao";
                case "medium":
                    return "Trung bình";
                case "low":
                    return "Thấp";
                default:
                    return severity;
            }
        };

        // Tạo thông báo cho từng phụ huynh
        const notifications = [];
        for (const parentId of parentIds) {
            const notification = await prisma.notification.create({
                data: {
                    userId: parentId,
                    title: `Sự kiện y tế - ${medicalEvent.student.fullName}`,
                    message: `Học sinh ${
                        medicalEvent.student.fullName
                    } đã có sự kiện y tế: ${
                        medicalEvent.title
                    }. Mức độ: ${getSeverityLabel(
                        medicalEvent.severity
                    )}. Vui lòng click vào hoặc liên hệ với nhà trường để biết thêm chi tiết.`,
                    type: "medical_event",
                    status: "SENT",
                    sentAt: new Date(),
                },
            });
            notifications.push(notification);
        }

        res.json({
            success: true,
            data: notifications,
            message: `Đã gửi ${notifications.length} thông báo thành công`,
        });
    } catch (error) {
        console.error("Error sending medical event notifications:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi gửi thông báo sự kiện y tế",
        });
    }
};

// Lấy số thông báo chưa đọc
export const getUnreadNotificationCount = async (req, res) => {
    try {
        const { userId } = req.params;

        const count = await prisma.notification.count({
            where: {
                userId,
                status: {
                    in: ["SENT", "DELIVERED"],
                },
            },
        });

        res.json({
            success: true,
            data: { count },
        });
    } catch (error) {
        console.error("Error getting unread notification count:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy số thông báo chưa đọc",
        });
    }
};

// Lưu trữ thông báo (thay vì xóa)
export const archiveNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                status: "ARCHIVED",
                archivedAt: new Date(),
            },
        });

        res.json({
            success: true,
            data: notification,
            message: "Đã lưu trữ thông báo thành công",
        });
    } catch (error) {
        console.error("Error archiving notification:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lưu trữ thông báo",
        });
    }
};

// Khôi phục thông báo từ lưu trữ
export const restoreNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                status: "SENT",
                archivedAt: null,
            },
        });

        res.json({
            success: true,
            data: notification,
            message: "Đã khôi phục thông báo thành công",
        });
    } catch (error) {
        console.error("Error restoring notification:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi khôi phục thông báo",
        });
    }
};

// Lấy chi tiết thông báo theo ID
export const getNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
            include: {
                vaccinationCampaign: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                medicalCheckCampaign: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: "Notification not found",
            });
        }

        // Nếu là thông báo sự kiện y tế, lấy thêm thông tin chi tiết
        let medicalEventDetails = null;
        if (notification.type === "medical_event") {
            // Tìm sự kiện y tế dựa trên nội dung thông báo
            // Thông báo có format: "Học sinh [Tên] đã có sự kiện y tế: [Title]"
            const studentNameMatch = notification.message.match(
                /Học sinh (.+?) đã có sự kiện y tế/
            );
            if (studentNameMatch) {
                const studentName = studentNameMatch[1];

                // Tìm học sinh theo tên
                const student = await prisma.student.findFirst({
                    where: {
                        fullName: studentName,
                    },
                    select: {
                        id: true,
                        fullName: true,
                    },
                });

                if (student) {
                    // Tìm sự kiện y tế gần nhất của học sinh này
                    const medicalEvent = await prisma.medicalEvent.findFirst({
                        where: {
                            studentId: student.id,
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                            nurse: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                        },
                    });

                    if (medicalEvent) {
                        medicalEventDetails = {
                            id: medicalEvent.id,
                            title: medicalEvent.title,
                            description: medicalEvent.description,
                            type: medicalEvent.type,
                            severity: medicalEvent.severity,
                            status: medicalEvent.status,
                            location: medicalEvent.location,
                            symptoms: medicalEvent.symptoms,
                            treatment: medicalEvent.treatment,
                            outcome: medicalEvent.outcome,
                            occurredAt: medicalEvent.occurredAt,
                            resolvedAt: medicalEvent.resolvedAt,
                            createdAt: medicalEvent.createdAt,
                            studentName: medicalEvent.student.fullName,
                            nurseName:
                                medicalEvent.nurse?.user?.fullName ||
                                "Chưa phân công",
                        };
                    }
                }
            }
        }

        res.json({
            success: true,
            data: {
                ...notification,
                medicalEventDetails,
            },
        });
    } catch (error) {
        console.error("Error fetching notification:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy thông báo",
        });
    }
};

// Đánh dấu tất cả thông báo là đã đọc
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const updated = await prisma.notification.updateMany({
            where: {
                userId,
                status: { in: ["SENT", "DELIVERED"] },
            },
            data: {
                status: "READ",
                readAt: new Date(),
            },
        });
        res.json({
            success: true,
            data: updated,
            message: "Đã đánh dấu tất cả thông báo là đã đọc",
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi đánh dấu tất cả thông báo là đã đọc",
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        console.log(
            "[deleteNotification] Bắt đầu xóa notification:",
            notificationId
        );
        const deleted = await prisma.notification.delete({
            where: { id: notificationId },
        });
        console.log("[deleteNotification] Đã xóa thành công:", deleted);
        res.json({ success: true, message: "Đã xóa thông báo" });
    } catch (error) {
        console.error("[deleteNotification] Lỗi khi xóa notification:", error);
        res.status(500).json({ error: "Lỗi khi xóa thông báo" });
    }
};
