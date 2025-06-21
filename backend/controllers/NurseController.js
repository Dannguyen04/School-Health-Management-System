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

        // Kiểm tra xem vật tư có tồn tại không
        const existingMedication = await prisma.medication.findUnique({
            where: { id },
            include: {
                studentMedications: true,
                medicalEventMedications: true,
            },
        });

        if (!existingMedication) {
            return res.status(404).json({
                success: false,
                error: "Vật tư y tế không tồn tại",
            });
        }

        // Kiểm tra xem vật tư có đang được sử dụng không
        if (existingMedication.studentMedications.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Không thể xóa vật tư đang được sử dụng bởi học sinh",
            });
        }

        if (existingMedication.medicalEventMedications.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Không thể xóa vật tư đã được sử dụng trong sự cố y tế",
            });
        }

        // Xóa các bản ghi stock movement trước
        await prisma.stockMovement.deleteMany({
            where: { medicationId: id },
        });

        // Xóa vật tư
        await prisma.medication.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: "Vật tư y tế đã được xóa thành công",
        });
    } catch (error) {
        console.error("Error deleting medical inventory:", error);
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
