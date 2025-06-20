import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Lấy tổng số học sinh
        const totalStudents = await prisma.student.count();

        // Lấy số sự cố y tế trong tháng
        const totalMedicalEvents = await prisma.medicalEvent.count({
            where: {
                occurredAt: {
                    gte: startOfMonth,
                },
            },
        });

        // Lấy số tiêm chủng sắp tới
        const upcomingVaccinations = await prisma.vaccination.count({
            where: {
                scheduledDate: {
                    gte: today,
                },
                status: "SCHEDULED",
            },
        });

        // Lấy số công việc đang chờ
        const pendingTasks = await prisma.medicalEvent.count({
            where: {
                status: "PENDING",
            },
        });

        res.json({
            success: true,
            data: {
                totalStudents,
                totalMedicalEvents,
                upcomingVaccinations,
                pendingTasks,
            },
        });
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        res.status(500).json({
            success: false,
            error: "Error getting dashboard statistics",
        });
    }
};

// Lấy danh sách sự cố y tế gần đây
export const getRecentMedicalEvents = async (req, res) => {
    try {
        const events = await prisma.medicalEvent.findMany({
            take: 5,
            orderBy: {
                occurredAt: "desc",
            },
            include: {
                student: {
                    select: {
                        studentCode: true,
                        grade: true,
                        class: true,
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedEvents = events.map((event) => ({
            id: event.id,
            title: event.title,
            type: event.type,
            severity: event.severity,
            occurredAt: event.occurredAt,
            status: event.status,
            studentName: event.student.user.fullName,
            studentClass: `${event.student.grade}${event.student.class}`,
            studentCode: event.student.studentCode,
        }));

        res.json({
            success: true,
            data: formattedEvents,
        });
    } catch (error) {
        console.error("Error getting recent medical events:", error);
        res.status(500).json({
            success: false,
            error: "Error getting recent medical events",
        });
    }
};

// Lấy lịch tiêm chủng sắp tới
export const getUpcomingVaccinations = async (req, res) => {
    try {
        const today = new Date();
        const vaccinations = await prisma.vaccination.findMany({
            where: {
                scheduledDate: {
                    gte: today,
                },
                status: "SCHEDULED",
            },
            take: 5,
            orderBy: {
                scheduledDate: "asc",
            },
            include: {
                campaign: true,
                student: {
                    select: {
                        grade: true,
                        class: true,
                    },
                },
            },
        });

        const formattedVaccinations = vaccinations.map((vaccination) => ({
            id: vaccination.id,
            campaignName: vaccination.campaign.name,
            scheduledDate: vaccination.scheduledDate,
            studentClass: `${vaccination.student.grade}${vaccination.student.class}`,
            status: vaccination.status,
        }));

        res.json({
            success: true,
            data: formattedVaccinations,
        });
    } catch (error) {
        console.error("Error getting upcoming vaccinations:", error);
        res.status(500).json({
            success: false,
            error: "Error getting upcoming vaccinations",
        });
    }
};

// Cập nhật trạng thái sự cố y tế
export const updateMedicalEventStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status, treatment, outcome } = req.body;

        const updatedEvent = await prisma.medicalEvent.update({
            where: { id: eventId },
            data: {
                status,
                treatment,
                outcome,
                resolvedAt: status === "RESOLVED" ? new Date() : null,
            },
        });

        res.json({
            success: true,
            data: updatedEvent,
        });
    } catch (error) {
        console.error("Error updating medical event:", error);
        res.status(500).json({
            success: false,
            error: "Error updating medical event",
        });
    }
};
