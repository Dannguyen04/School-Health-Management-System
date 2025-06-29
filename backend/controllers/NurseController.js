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
        const upcomingVaccinations = await prisma.vaccinationCampaign.count({
            where: {
                scheduledDate: {
                    gte: today,
                },
                status: "ACTIVE",
            },
        });

        // Lấy số công việc đang chờ
        const pendingTasks = await prisma.medicalEvent.count({
            where: {
                status: "PENDING",
            },
        });

        // Lấy số thuốc đang chờ
        const pendingMedications = await prisma.studentMedication.count({
            where: {
                status: "PENDING_APPROVAL",
            },
        });

        // Lấy số vật tư tồn kho thấp
        const medications = await prisma.medication.findMany();
        const lowStockItems = medications.filter(
            (med) => med.stockQuantity <= med.minStockLevel
        ).length;

        res.json({
            success: true,
            data: {
                totalStudents,
                totalMedicalEvents,
                upcomingVaccinations,
                pendingTasks,
                pendingMedications,
                lowStockItems,
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

// Lấy danh sách vật tư y tế
export const getMedicalInventory = async (req, res) => {
    try {
        const { search, category, lowStock } = req.query;

        let whereClause = {};

        // Tìm kiếm theo tên
        if (search) {
            whereClause.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        // Lọc theo danh mục
        if (category) {
            whereClause.description = category;
        }

        // Lọc theo tồn kho thấp
        if (lowStock === "true") {
            whereClause.stockQuantity = {
                lte: whereClause.minStockLevel || 10,
            };
        }

        const medications = await prisma.medication.findMany({
            where: whereClause,
            orderBy: {
                name: "asc",
            },
        });

        const formattedInventory = medications.map((med) => ({
            id: med.id,
            name: med.name,
            quantity: med.stockQuantity,
            unit: med.unit,
            minStock: med.minStockLevel,
            expiryDate: med.expiryDate,
            category: med.description || "General",
            manufacturer: med.manufacturer,
            dosage: med.dosage,
        }));

        res.json({
            success: true,
            data: formattedInventory,
        });
    } catch (error) {
        console.error("Error getting medical inventory:", error);
        res.status(500).json({
            success: false,
            error: "Error getting medical inventory",
        });
    }
};

// Thêm vật tư y tế mới
export const createMedicalInventory = async (req, res) => {
    try {
        const {
            name,
            description,
            dosage,
            unit,
            manufacturer,
            expiryDate,
            stockQuantity,
            minStockLevel,
        } = req.body;

        // Kiểm tra xem vật tư đã tồn tại chưa
        const existingMedication = await prisma.medication.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });

        if (existingMedication) {
            return res.status(400).json({
                success: false,
                error: "Vật tư y tế này đã tồn tại trong kho",
            });
        }

        const newMedication = await prisma.medication.create({
            data: {
                name,
                description,
                dosage,
                unit,
                manufacturer,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                stockQuantity: parseInt(stockQuantity) || 0,
                minStockLevel: parseInt(minStockLevel) || 10,
            },
        });

        // Tạo bản ghi stock movement cho việc nhập kho
        if (parseInt(stockQuantity) > 0) {
            await prisma.stockMovement.create({
                data: {
                    medicationId: newMedication.id,
                    type: "in",
                    quantity: parseInt(stockQuantity),
                    reason: "Nhập kho ban đầu",
                    reference: "Initial stock",
                },
            });
        }

        res.status(201).json({
            success: true,
            data: {
                id: newMedication.id,
                name: newMedication.name,
                quantity: newMedication.stockQuantity,
                unit: newMedication.unit,
                minStock: newMedication.minStockLevel,
                expiryDate: newMedication.expiryDate,
                category: newMedication.description || "General",
                manufacturer: newMedication.manufacturer,
                dosage: newMedication.dosage,
            },
        });
    } catch (error) {
        console.error("Error creating medical inventory:", error);
        res.status(500).json({
            success: false,
            error: "Error creating medical inventory",
        });
    }
};

// Cập nhật vật tư y tế
export const updateMedicalInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            dosage,
            unit,
            manufacturer,
            expiryDate,
            stockQuantity,
            minStockLevel,
        } = req.body;

        // Kiểm tra xem vật tư có tồn tại không
        const existingMedication = await prisma.medication.findUnique({
            where: { id },
        });

        if (!existingMedication) {
            return res.status(404).json({
                success: false,
                error: "Vật tư y tế không tồn tại",
            });
        }

        // Kiểm tra xem tên mới có trùng với vật tư khác không
        if (name && name !== existingMedication.name) {
            const duplicateMedication = await prisma.medication.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: "insensitive",
                    },
                    id: {
                        not: id,
                    },
                },
            });

            if (duplicateMedication) {
                return res.status(400).json({
                    success: false,
                    error: "Tên vật tư y tế này đã tồn tại",
                });
            }
        }

        // Tính toán sự thay đổi số lượng
        const quantityChange =
            parseInt(stockQuantity) - existingMedication.stockQuantity;

        const updatedMedication = await prisma.medication.update({
            where: { id },
            data: {
                name,
                description,
                dosage,
                unit,
                manufacturer,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                stockQuantity: parseInt(stockQuantity) || 0,
                minStockLevel: parseInt(minStockLevel) || 10,
            },
        });

        // Tạo bản ghi stock movement nếu có thay đổi số lượng
        if (quantityChange !== 0) {
            await prisma.stockMovement.create({
                data: {
                    medicationId: id,
                    type: quantityChange > 0 ? "in" : "out",
                    quantity: Math.abs(quantityChange),
                    reason:
                        quantityChange > 0
                            ? "Cập nhật số lượng"
                            : "Điều chỉnh số lượng",
                    reference: "Inventory update",
                },
            });
        }

        res.json({
            success: true,
            data: {
                id: updatedMedication.id,
                name: updatedMedication.name,
                quantity: updatedMedication.stockQuantity,
                unit: updatedMedication.unit,
                minStock: updatedMedication.minStockLevel,
                expiryDate: updatedMedication.expiryDate,
                category: updatedMedication.description || "General",
                manufacturer: updatedMedication.manufacturer,
                dosage: updatedMedication.dosage,
            },
        });
    } catch (error) {
        console.error("Error updating medical inventory:", error);
        res.status(500).json({
            success: false,
            error: "Error updating medical inventory",
        });
    }
};

// Xóa vật tư y tế
export const deleteMedicalInventory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Delete request for ID:", id);

        // Kiểm tra xem vật tư có tồn tại không
        const existingMedication = await prisma.medication.findUnique({
            where: { id },
            include: {
                studentMedications: true,
                medicalEventMedications: true,
                stockMovements: true,
            },
        });

        if (!existingMedication) {
            console.log("Medication not found");
            return res.status(404).json({
                success: false,
                error: "Vật tư y tế không tồn tại",
            });
        }

        console.log("Found medication:", existingMedication.name);
        console.log("Related records:", {
            studentMedications: existingMedication.studentMedications.length,
            medicalEventMedications:
                existingMedication.medicalEventMedications.length,
            stockMovements: existingMedication.stockMovements.length,
        });

        // Kiểm tra xem vật tư có đang được sử dụng không
        if (existingMedication.studentMedications.length > 0) {
            console.log("Cannot delete - used by students");
            return res.status(400).json({
                success: false,
                error: "Không thể xóa vật tư đang được sử dụng bởi học sinh",
            });
        }

        if (existingMedication.medicalEventMedications.length > 0) {
            console.log("Cannot delete - used in medical events");
            return res.status(400).json({
                success: false,
                error: "Không thể xóa vật tư đã được sử dụng trong sự cố y tế",
            });
        }

        // Xóa các bản ghi stock movement trước
        if (existingMedication.stockMovements.length > 0) {
            console.log("Deleting stock movements...");
            await prisma.stockMovement.deleteMany({
                where: { medicationId: id },
            });
        }

        // Xóa vật tư
        console.log("Deleting medication...");
        await prisma.medication.delete({
            where: { id },
        });

        console.log("Delete successful");
        res.json({
            success: true,
            message: "Vật tư y tế đã được xóa thành công",
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            error: "Error deleting medical inventory",
        });
    }
};

// Lấy danh sách danh mục vật tư
export const getInventoryCategories = async (req, res) => {
    try {
        const categories = await prisma.medication.findMany({
            select: {
                description: true,
            },
            where: {
                description: {
                    not: null,
                },
            },
            distinct: ["description"],
        });

        const categoryList = categories
            .map((cat) => cat.description)
            .filter((cat) => cat && cat.trim() !== "")
            .sort();

        res.json({
            success: true,
            data: categoryList,
        });
    } catch (error) {
        console.error("Error getting inventory categories:", error);
        res.status(500).json({
            success: false,
            error: "Error getting inventory categories",
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
        const vaccinations = await prisma.vaccinationCampaign.findMany({
            where: {
                scheduledDate: {
                    gte: today,
                },
                status: "ACTIVE",
            },
            take: 5,
            orderBy: {
                scheduledDate: "asc",
            },
            include: {
                vaccinations: {
                    take: 1, // Chỉ lấy 1 vaccination để đếm
                },
            },
        });

        const formattedVaccinations = vaccinations.map((campaign) => ({
            id: campaign.id,
            campaignName: campaign.name,
            description: campaign.description,
            scheduledDate: campaign.scheduledDate,
            deadline: campaign.deadline,
            targetGrades: campaign.targetGrades,
            status: campaign.status,
            vaccinationCount: campaign.vaccinations.length,
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

// Lấy tất cả sự kiện y tế
export const getAllMedicalEvents = async (req, res) => {
    try {
        const events = await prisma.medicalEvent.findMany({
            orderBy: {
                occurredAt: "desc",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        grade: true,
                        class: true,
                        bloodType: true,
                        emergencyContact: true,
                        emergencyPhone: true,
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                nurse: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });

        const formattedEvents = events.map((event) => ({
            id: event.id,
            studentId: event.student.id,
            studentName: event.student.user.fullName,
            studentCode: event.student.studentCode,
            grade: `${event.student.grade}${event.student.class}`,
            title: event.title,
            description: event.description,
            type: event.type,
            status: event.status,
            severity: event.severity,
            location: event.location,
            symptoms: event.symptoms,
            treatment: event.treatment,
            outcome: event.outcome,
            occurredAt: event.occurredAt,
            resolvedAt: event.resolvedAt,
            createdAt: event.createdAt,
            nurseName: event.nurse?.user?.fullName || "Chưa phân công",
            createdByName: event.createdBy.fullName,
        }));

        res.json({
            success: true,
            data: formattedEvents,
        });
    } catch (error) {
        console.error("Error getting all medical events:", error);
        res.status(500).json({
            success: false,
            error: "Error getting medical events",
        });
    }
};

// Tạo sự kiện y tế mới
export const createMedicalEvent = async (req, res) => {
    try {
        const {
            studentId,
            title,
            description,
            type,
            severity,
            status,
            location,
            symptoms,
            treatment,
            outcome,
            occurredAt,
            resolvedAt,
        } = req.body;

        const nurseId = req.user.nurseProfile?.id;
        const createdById = req.user.id;

        const newEvent = await prisma.medicalEvent.create({
            data: {
                studentId,
                nurseId,
                createdById,
                title,
                description,
                type,
                severity,
                status,
                location,
                symptoms: symptoms || [],
                treatment,
                outcome,
                occurredAt: new Date(occurredAt),
                resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
            },
            include: {
                student: {
                    select: {
                        id: true,
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
                nurse: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        // Tự động gửi thông báo cho phụ huynh
        try {
            // Kiểm tra xem student có user không
            if (!newEvent.student.user) {
                console.log("Student has no user, skipping notification");
                return;
            }

            // Lấy danh sách phụ huynh của học sinh
            const studentParents = await prisma.studentParent.findMany({
                where: {
                    studentId: studentId,
                },
                include: {
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            });

            // Gửi thông báo cho từng phụ huynh
            for (const studentParent of studentParents) {
                if (studentParent.parent.user) {
                    await prisma.notification.create({
                        data: {
                            userId: studentParent.parent.user.id,
                            title: `Sự kiện y tế - ${newEvent.student.user.fullName}`,
                            message: `Học sinh ${newEvent.student.user.fullName} đã có sự kiện y tế: ${title}. Mức độ: ${severity}. Vui lòng liên hệ với nhà trường để biết thêm chi tiết.`,
                            type: "medical_event",
                            status: "SENT",
                            sentAt: new Date(),
                        },
                    });
                }
            }
        } catch (notificationError) {
            console.error("Error sending notifications:", notificationError);
            // Không fail toàn bộ request nếu gửi thông báo thất bại
        }

        // Kiểm tra xem student có user không
        if (!newEvent.student.user) {
            return res.status(404).json({
                success: false,
                error: "Student information not found",
            });
        }

        const formattedEvent = {
            id: newEvent.id,
            studentId: newEvent.student.id,
            studentName: newEvent.student.user.fullName,
            studentCode: newEvent.student.studentCode,
            grade: `${newEvent.student.grade}${newEvent.student.class}`,
            title: newEvent.title,
            description: newEvent.description,
            type: newEvent.type,
            status: newEvent.status,
            severity: newEvent.severity,
            location: newEvent.location,
            symptoms: newEvent.symptoms,
            treatment: newEvent.treatment,
            outcome: newEvent.outcome,
            occurredAt: newEvent.occurredAt,
            resolvedAt: newEvent.resolvedAt,
            createdAt: newEvent.createdAt,
            nurseName: newEvent.nurse?.user?.fullName || "Chưa phân công",
        };

        res.status(201).json({
            success: true,
            data: formattedEvent,
            message: "Medical event created successfully",
        });
    } catch (error) {
        console.error("Error creating medical event:", error);
        res.status(500).json({
            success: false,
            error: "Error creating medical event",
        });
    }
};

// Cập nhật sự kiện y tế
export const updateMedicalEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const {
            title,
            description,
            type,
            severity,
            status,
            location,
            symptoms,
            treatment,
            outcome,
            occurredAt,
            resolvedAt,
        } = req.body;

        const updatedEvent = await prisma.medicalEvent.update({
            where: { id: eventId },
            data: {
                title,
                description,
                type,
                severity,
                status,
                location,
                symptoms: symptoms || [],
                treatment,
                outcome,
                occurredAt: new Date(occurredAt),
                resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
            },
            include: {
                student: {
                    select: {
                        id: true,
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
                nurse: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        // Kiểm tra xem student có user không
        if (!updatedEvent.student.user) {
            return res.status(404).json({
                success: false,
                error: "Student information not found",
            });
        }

        const formattedEvent = {
            id: updatedEvent.id,
            studentId: updatedEvent.student.id,
            studentName: updatedEvent.student.user.fullName,
            studentCode: updatedEvent.student.studentCode,
            grade: `${updatedEvent.student.grade}${updatedEvent.student.class}`,
            title: updatedEvent.title,
            description: updatedEvent.description,
            type: updatedEvent.type,
            status: updatedEvent.status,
            severity: updatedEvent.severity,
            location: updatedEvent.location,
            symptoms: updatedEvent.symptoms,
            treatment: updatedEvent.treatment,
            outcome: updatedEvent.outcome,
            occurredAt: updatedEvent.occurredAt,
            resolvedAt: updatedEvent.resolvedAt,
            createdAt: updatedEvent.createdAt,
            nurseName: updatedEvent.nurse?.user?.fullName || "Chưa phân công",
        };

        res.json({
            success: true,
            data: formattedEvent,
            message: "Medical event updated successfully",
        });
    } catch (error) {
        console.error("Error updating medical event:", error);
        res.status(500).json({
            success: false,
            error: "Error updating medical event",
        });
    }
};

// Xóa sự kiện y tế
export const deleteMedicalEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        await prisma.medicalEvent.delete({
            where: { id: eventId },
        });

        res.json({
            success: true,
            message: "Medical event deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting medical event:", error);
        res.status(500).json({
            success: false,
            error: "Error deleting medical event",
        });
    }
};

// Lấy chi tiết sự kiện y tế
export const getMedicalEventById = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await prisma.medicalEvent.findUnique({
            where: { id: eventId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        grade: true,
                        class: true,
                        bloodType: true,
                        emergencyContact: true,
                        emergencyPhone: true,
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                nurse: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Medical event not found",
            });
        }

        // Kiểm tra xem student có user không
        if (!event.student.user) {
            return res.status(404).json({
                success: false,
                error: "Student information not found",
            });
        }

        const formattedEvent = {
            id: event.id,
            studentId: event.student.id,
            studentName: event.student.user.fullName,
            studentCode: event.student.studentCode,
            grade: `${event.student.grade}${event.student.class}`,
            title: event.title,
            description: event.description,
            type: event.type,
            status: event.status,
            severity: event.severity,
            location: event.location,
            symptoms: event.symptoms,
            treatment: event.treatment,
            outcome: event.outcome,
            occurredAt: event.occurredAt,
            resolvedAt: event.resolvedAt,
            createdAt: event.createdAt,
            nurseName: event.nurse?.user?.fullName || "Chưa phân công",
            createdByName: event.createdBy.fullName,
        };

        res.json({
            success: true,
            data: formattedEvent,
        });
    } catch (error) {
        console.error("Error getting medical event:", error);
        res.status(500).json({
            success: false,
            error: "Error getting medical event",
        });
    }
};

// Lấy danh sách chiến dịch tiêm chủng cho nurse
export const getVaccinationCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.vaccinationCampaign.findMany({
            where: {
                isActive: true,
                status: "ACTIVE",
            },
            include: {
                vaccinations: true,
            },
            orderBy: {
                scheduledDate: "asc",
            },
        });

        res.json({
            success: true,
            data: campaigns,
        });
    } catch (error) {
        console.error("Error fetching vaccination campaigns:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách chiến dịch tiêm chủng",
        });
    }
};

// Lấy danh sách học sinh cho một chiến dịch tiêm chủng
export const getStudentsForCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        console.log("Fetching students for campaign:", campaignId);

        // Lấy thông tin chiến dịch
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
            include: { vaccinations: true },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        console.log("Campaign found:", {
            id: campaign.id,
            name: campaign.name,
            targetGrades: campaign.targetGrades,
        });

        // Lấy danh sách học sinh trong các khối được nhắm đến
        const students = await prisma.student.findMany({
            where: {
                grade: {
                    in: campaign.targetGrades,
                },
                // Chỉ lấy những học sinh có user
                user: {
                    is: {},
                },
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                    },
                },
                vaccinationConsents: {
                    where: {
                        campaignId: campaignId,
                    },
                },
                vaccinations: {
                    where: {
                        campaignId: campaignId,
                    },
                },
            },
        });

        console.log("Found students:", students.length);
        console.log(
            "Students grades:",
            students.map((s) => s.grade)
        );

        // Format dữ liệu để trả về
        const formattedStudents = students.map((student) => {
            const consent = student.vaccinationConsents[0];
            const vaccination = student.vaccinations[0];

            return {
                id: student.id,
                studentCode: student.studentCode,
                user: student.user,
                grade: student.grade,
                consentStatus: consent ? consent.consent : null,
                vaccinationStatus: vaccination
                    ? vaccination.status
                    : "UNSCHEDULED",
                administeredDate: vaccination
                    ? vaccination.administeredDate
                    : null,
                batchNumber: vaccination ? vaccination.batchNumber : null,
                doseType: vaccination ? vaccination.dose : null,
            };
        });

        console.log("Formatted students:", formattedStudents.length);

        res.json({
            success: true,
            data: formattedStudents,
        });
    } catch (error) {
        console.error("Error fetching students for campaign:", error);
        if (error instanceof Error && error.stack) {
            console.error("Stack trace:", error.stack);
        }
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách học sinh",
            details: error.message,
            campaignId: req.params.campaignId,
        });
    }
};

// Lấy danh sách học sinh đã được phụ huynh đồng ý tiêm cho một campaign
export const getEligibleStudentsForVaccination = async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Kiểm tra campaign có tồn tại không
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Lấy tất cả consent đã đồng ý cho campaign này
        const consents = await prisma.vaccinationConsent.findMany({
            where: {
                campaignId: campaignId,
                consent: true, // Chỉ lấy những consent đã đồng ý
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });

        // Kiểm tra xem học sinh đã được tiêm chủng chưa
        const studentsWithVaccinationStatus = await Promise.all(
            consents.map(async (consent) => {
                // Kiểm tra xem học sinh đã được tiêm chủng chưa
                const existingVaccination = await prisma.vaccinations.findFirst(
                    {
                        where: {
                            campaignId: campaignId,
                            studentId: consent.studentId,
                        },
                    }
                );

                return {
                    consentId: consent.id,
                    student: {
                        id: consent.student.id,
                        studentCode: consent.student.studentCode,
                        grade: consent.student.grade,
                        class: consent.student.class,
                        dateOfBirth: consent.student.dateOfBirth,
                        gender: consent.student.gender,
                        bloodType: consent.student.bloodType,
                        emergencyContact: consent.student.emergencyContact,
                        emergencyPhone: consent.student.emergencyPhone,
                        user: consent.student.user,
                    },
                    parent: {
                        id: consent.parent.id,
                        occupation: consent.parent.occupation,
                        workplace: consent.parent.workplace,
                        user: consent.parent.user,
                    },
                    consent: {
                        consent: consent.consent,
                        notes: consent.notes,
                        submittedAt: consent.submittedAt,
                    },
                    vaccinationStatus: existingVaccination
                        ? {
                              id: existingVaccination.id,
                              status: existingVaccination.status,
                              administeredDate:
                                  existingVaccination.administeredDate,
                              batchNumber: existingVaccination.batchNumber,
                              dose: existingVaccination.dose,
                              sideEffects: existingVaccination.sideEffects,
                              notes: existingVaccination.notes,
                              reaction: existingVaccination.reaction,
                          }
                        : null,
                };
            })
        );

        // Lọc bỏ những học sinh không có user (nếu có)
        const validStudents = studentsWithVaccinationStatus.filter(
            (item) => item.student.user !== null
        );

        res.json({
            success: true,
            data: {
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    description: campaign.description,
                    scheduledDate: campaign.scheduledDate,
                    deadline: campaign.deadline,
                    targetGrades: campaign.targetGrades,
                },
                eligibleStudents: validStudents,
                totalCount: validStudents.length,
            },
        });
    } catch (error) {
        console.error(
            "Error getting eligible students for vaccination:",
            error
        );
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách học sinh đủ điều kiện tiêm chủng",
            details: error.message,
        });
    }
};

// Nurse thực hiện tiêm cho học sinh
export const performVaccination = async (req, res) => {
    try {
        const {
            campaignId,
            studentId,
            administeredDate,
            batchNumber,
            notes,
            sideEffects,
            reaction,
            dose = "FIRST",
        } = req.body;

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        const nurseId = req.user.nurseProfile.id;

        // Kiểm tra campaign tồn tại
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Kiểm tra student tồn tại
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy học sinh",
            });
        }

        // Kiểm tra xem học sinh đã được tiêm chủng chưa
        const existingVaccination = await prisma.vaccinations.findFirst({
            where: {
                campaignId: campaignId,
                studentId: studentId,
            },
        });

        if (existingVaccination) {
            return res.status(400).json({
                success: false,
                error: "Học sinh này đã được tiêm chủng trong chiến dịch này",
            });
        }

        // Kiểm tra xem phụ huynh đã đồng ý chưa
        const consent = await prisma.vaccinationConsent.findFirst({
            where: {
                campaignId: campaignId,
                studentId: studentId,
                consent: true,
            },
        });

        if (!consent) {
            return res.status(400).json({
                success: false,
                error: "Phụ huynh chưa đồng ý cho học sinh này tiêm chủng",
            });
        }

        // Tạo bản ghi tiêm chủng
        const vaccination = await prisma.vaccinations.create({
            data: {
                name: campaign.name,
                requirement: "REQUIRED",
                expiredDate: campaign.deadline,
                administeredDate: new Date(administeredDate),
                dose: dose,
                sideEffects: sideEffects || null,
                notes: notes || null,
                reaction: reaction || null,
                campaignId: campaignId,
                studentId: studentId,
                nurseId: nurseId,
                batchNumber: batchNumber || null,
                status: "COMPLETED",
                followUpRequired: false,
            },
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

        // Gửi thông báo cho phụ huynh
        try {
            const studentParents = await prisma.studentParent.findMany({
                where: {
                    studentId: studentId,
                },
                include: {
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            });

            for (const studentParent of studentParents) {
                await prisma.notification.create({
                    data: {
                        userId: studentParent.parent.user.id,
                        title: `Đã tiêm chủng: ${campaign.name}`,
                        message: `Học sinh ${
                            student.user.fullName
                        } đã được tiêm chủng ${
                            campaign.name
                        } vào ngày ${new Date(
                            administeredDate
                        ).toLocaleDateString("vi-VN")}.`,
                        type: "vaccination_completed",
                        status: "SENT",
                        sentAt: new Date(),
                        vaccinationCampaignId: campaignId,
                    },
                });
            }
        } catch (notificationError) {
            console.error("Error sending notifications:", notificationError);
            // Không fail toàn bộ request nếu gửi thông báo thất bại
        }

        res.json({
            success: true,
            data: {
                id: vaccination.id,
                name: vaccination.name,
                studentName: vaccination.student.user.fullName,
                nurseName: vaccination.nurse.user.fullName,
                administeredDate: vaccination.administeredDate,
                batchNumber: vaccination.batchNumber,
                dose: vaccination.dose,
                status: vaccination.status,
            },
            message: "Tiêm chủng thành công",
        });
    } catch (error) {
        console.error("Error performing vaccination:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi thực hiện tiêm chủng",
            details: error.message,
        });
    }
};

// Báo cáo kết quả tiêm chủng
export const reportVaccinationResult = async (req, res) => {
    try {
        const {
            campaignId,
            studentId,
            sideEffects,
            reaction,
            followUpRequired,
            followUpDate,
            additionalNotes,
        } = req.body;

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        // Kiểm tra xem đã tiêm chủng chưa
        const vaccination = await prisma.vaccinations.findFirst({
            where: {
                campaignId,
                studentId,
            },
        });

        if (!vaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy bản ghi tiêm chủng",
            });
        }

        // Cập nhật báo cáo kết quả
        const updatedVaccination = await prisma.vaccinations.update({
            where: { id: vaccination.id },
            data: {
                sideEffects: sideEffects || vaccination.sideEffects,
                notes: additionalNotes || vaccination.notes,
                reaction: reaction || vaccination.reaction,
                followUpRequired: followUpRequired || false,
                followUpDate: followUpDate
                    ? new Date(followUpDate)
                    : vaccination.followUpDate,
            },
        });

        // Nếu cần theo dõi, tạo thông báo cho nurse
        if (followUpRequired) {
            await prisma.notification.create({
                data: {
                    userId: req.user.id,
                    title: `Theo dõi sau tiêm chủng: ${vaccination.name}`,
                    message: `Cần theo dõi học sinh sau tiêm chủng ${
                        vaccination.name
                    }. Ngày theo dõi: ${
                        followUpDate
                            ? new Date(followUpDate).toLocaleDateString("vi-VN")
                            : "Chưa xác định"
                    }.`,
                    type: "vaccination_followup",
                    status: "SENT",
                    sentAt: new Date(),
                    vaccinationCampaignId: campaignId,
                },
            });
        }

        res.json({
            success: true,
            data: updatedVaccination,
            message: "Đã báo cáo kết quả tiêm chủng",
        });
    } catch (error) {
        console.error("Error reporting vaccination result:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi báo cáo kết quả tiêm chủng",
        });
    }
};

// Lấy thống kê tiêm chủng cho dashboard
export const getVaccinationStats = async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Kiểm tra campaign có tồn tại không
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Lấy tổng số học sinh trong khối được nhắm đến
        const totalStudents = await prisma.student.count({
            where: {
                grade: {
                    in: campaign.targetGrades,
                },
            },
        });

        // Lấy số học sinh đã đồng ý tiêm chủng
        const consentedStudents = await prisma.vaccinationConsent.count({
            where: {
                campaignId: campaignId,
                consent: true,
            },
        });

        // Lấy số học sinh đã được tiêm chủng
        const vaccinatedStudents = await prisma.vaccinations.count({
            where: {
                campaignId: campaignId,
                status: "COMPLETED",
            },
        });

        // Lấy số học sinh từ chối tiêm chủng
        const refusedStudents = await prisma.vaccinationConsent.count({
            where: {
                campaignId: campaignId,
                consent: false,
            },
        });

        // Lấy số học sinh chưa phản hồi
        const pendingStudents =
            totalStudents - consentedStudents - refusedStudents;

        // Lấy danh sách học sinh đã tiêm chủng gần đây (5 học sinh cuối)
        const recentVaccinations = await prisma.vaccinations.findMany({
            where: {
                campaignId: campaignId,
                status: "COMPLETED",
            },
            take: 5,
            orderBy: {
                administeredDate: "desc",
            },
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

        const formattedRecentVaccinations = recentVaccinations.map(
            (vaccination) => ({
                id: vaccination.id,
                studentName: vaccination.student.user.fullName,
                nurseName: vaccination.nurse.user.fullName,
                administeredDate: vaccination.administeredDate,
                batchNumber: vaccination.batchNumber,
                dose: vaccination.dose,
            })
        );

        res.json({
            success: true,
            data: {
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    scheduledDate: campaign.scheduledDate,
                    deadline: campaign.deadline,
                },
                stats: {
                    totalStudents,
                    consentedStudents,
                    vaccinatedStudents,
                    refusedStudents,
                    pendingStudents,
                    consentRate:
                        totalStudents > 0
                            ? (
                                  (consentedStudents / totalStudents) *
                                  100
                              ).toFixed(1)
                            : 0,
                    vaccinationRate:
                        totalStudents > 0
                            ? (
                                  (vaccinatedStudents / totalStudents) *
                                  100
                              ).toFixed(1)
                            : 0,
                },
                recentVaccinations: formattedRecentVaccinations,
            },
        });
    } catch (error) {
        console.error("Error getting vaccination stats:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy thống kê tiêm chủng",
            details: error.message,
        });
    }
};
