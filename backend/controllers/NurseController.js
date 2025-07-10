import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Lấy thống kê tổng quan cho dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Thực hiện các truy vấn song song
        const [
            totalStudents,
            totalMedicalEvents,
            upcomingVaccinations,
            pendingTasks,
            pendingMedications,
            approvedMedications,
        ] = await Promise.all([
            prisma.student.count(),
            prisma.medicalEvent.count({
                where: { occurredAt: { gte: startOfMonth } },
            }),
            prisma.vaccinationCampaign.count({
                where: { scheduledDate: { gte: today }, status: "ACTIVE" },
            }),
            prisma.medicalEvent.count({
                where: { status: "PENDING" },
            }),
            prisma.studentMedication.count({
                where: { status: "PENDING_APPROVAL" },
            }),
            prisma.studentMedication.findMany({
                where: { status: "APPROVED" },
                select: { name: true, dosage: true, unit: true },
            }),
        ]);

        // Đếm số loại thuốc duy nhất đã được approve (theo tên, liều lượng, đơn vị)
        const uniqueApprovedMedications = new Set(
            approvedMedications.map(
                (med) => `${med.name}|${med.dosage}|${med.unit}`
            )
        ).size;

        res.json({
            success: true,
            data: {
                totalStudents,
                totalMedicalEvents,
                upcomingVaccinations,
                pendingTasks,
                pendingMedications,
                uniqueApprovedMedications,
            },
        });
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi lấy thống kê dashboard: " + error.message,
        });
    }
};

// Lấy danh sách vật tư y tế đã được approve từ phụ huynh
export const getMedicalInventory = async (req, res) => {
    try {
        // Lấy danh sách thuốc đã được approve từ phụ huynh
        const approvedMedications = await prisma.studentMedication.findMany({
            where: { status: "APPROVED" },
            select: {
                name: true,
                dosage: true,
                unit: true,
                description: true,
                manufacturer: true,
            },
        });

        // Lọc duy nhất theo name, dosage, unit
        const uniqueMedicationsMap = new Map();
        approvedMedications.forEach((med) => {
            const key = `${med.name}|${med.dosage}|${med.unit}`;
            if (!uniqueMedicationsMap.has(key)) {
                uniqueMedicationsMap.set(key, med);
            }
        });
        let medications = Array.from(uniqueMedicationsMap.values());

        // Lọc theo search, category nếu có
        const { search, category } = req.query;
        if (search) {
            medications = medications.filter((med) =>
                med.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (category) {
            medications = medications.filter(
                (med) =>
                    (med.description || "").toLowerCase() ===
                    category.toLowerCase()
            );
        }

        // Sắp xếp theo tên
        medications.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            data: medications,
        });
    } catch (error) {
        console.error("Error getting medical inventory:", error);
        res.status(500).json({
            success: false,
            error: "Error getting medical inventory",
        });
    }
};

// Không cho phép nurse tự thêm thuốc mới vào inventory
export const createMedicalInventory = async (req, res) => {
    return res.status(403).json({
        success: false,
        error: "Không thể thêm thuốc trực tiếp. Chỉ thêm qua phê duyệt yêu cầu phụ huynh.",
    });
};

// Cập nhật vật tư y tế (chỉ cho phép nếu thuốc đã từng được approve)
export const updateMedicalInventory = async (req, res) => {
    try {
        const { id } = req.params;
        // Kiểm tra thuốc có từng được approve không
        const approved = await prisma.studentMedication.findFirst({
            where: { medicationId: id, status: "APPROVED" },
        });
        if (!approved) {
            return res.status(403).json({
                success: false,
                error: "Chỉ được cập nhật thuốc đã được phê duyệt từ phụ huynh.",
            });
        }
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

// Xóa vật tư y tế (chỉ cho phép nếu thuốc đã từng được approve)
export const deleteMedicalInventory = async (req, res) => {
    try {
        const { id } = req.params;
        // Kiểm tra thuốc có từng được approve không
        const approved = await prisma.studentMedication.findFirst({
            where: { medicationId: id, status: "APPROVED" },
        });
        if (!approved) {
            return res.status(403).json({
                success: false,
                error: "Chỉ được xóa thuốc đã được phê duyệt từ phụ huynh.",
            });
        }
        console.log("Delete request for ID:", id);

        // Kiểm tra xem vật tư có tồn tại không
        const existingMedication = await prisma.medication.findUnique({
            where: { id },
            include: {
                studentMedications: {
                    select: {
                        id: true,
                        treatmentStatus: true,
                        status: true,
                        student: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
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

        // Log chi tiết từng StudentMedication để debug
        console.log(
            "StudentMedications details:",
            existingMedication.studentMedications.map((sm) => ({
                id: sm.id,
                treatmentStatus: sm.treatmentStatus,
                status: sm.status,
                studentName: sm.student?.user?.fullName,
            }))
        );

        // Kiểm tra xem vật tư có đang được sử dụng không (chỉ chặn nếu còn điều trị ONGOING và APPROVED)
        const ongoingTreatments = existingMedication.studentMedications.filter(
            (sm) => sm.treatmentStatus === "ONGOING" && sm.status === "APPROVED"
        );
        console.log(
            "Ongoing treatments (APPROVED) count:",
            ongoingTreatments.length
        );
        if (ongoingTreatments.length > 0) {
            console.log(
                "Cannot delete - used by students (ONGOING & APPROVED treatment)"
            );
            return res.status(400).json({
                success: false,
                error: "Không thể xóa vật tư đang được sử dụng bởi học sinh (còn điều trị hợp lệ)",
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
        // Lấy tất cả description từ studentMedication
        const categories = await prisma.studentMedication.findMany({
            select: { description: true },
            where: { description: { not: null } },
        });
        const categoryList = categories
            .map((cat) => cat.description)
            .filter((cat) => cat && cat.trim() !== "")
            .filter((cat, idx, arr) => arr.indexOf(cat) === idx) // lọc duy nhất
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
                vaccine: {
                    take: 1,
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
            vaccinationCount: campaign.vaccine ? 1 : 0,
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
                    include: { user: true },
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
            grade: event.student.grade,
            class: event.student.class,
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

        const formattedEvent = {
            id: newEvent.id,
            studentId: newEvent.student.id,
            studentName: newEvent.student.user.fullName,
            studentCode: newEvent.student.studentCode,
            grade: newEvent.student.grade,
            class: newEvent.student.class,
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
            grade: updatedEvent.student.grade,
            class: updatedEvent.student.class,
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
            grade: event.student.grade,
            class: event.student.class,
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
                vaccine: true, // Lấy loại vaccine gốc (1-1), KHÔNG phải danh sách tiêm chủng từng học sinh
                vaccinationRecords: true, // Nếu cần lấy danh sách tiêm chủng từng học sinh
            },
            orderBy: {
                scheduledDate: "desc",
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
        // Lấy thông tin chiến dịch
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
            include: { vaccine: true }, // Lấy loại vaccine gốc nếu cần
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Lấy danh sách học sinh trong các khối được nhắm đến
        const students = await prisma.student.findMany({
            where: {
                grade: {
                    in: campaign.targetGrades,
                },
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
                        campaign: { id: campaignId },
                    },
                },
                vaccinationRecords: {
                    where: {
                        campaignId: campaignId,
                    },
                    orderBy: { administeredDate: "desc" },
                    take: 1,
                },
            },
        });

        // Format dữ liệu để trả về
        const formattedStudents = students.map((student) => {
            const consent = student.vaccinationConsents[0];
            const vaccination = student.vaccinationRecords[0];

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

        res.json({
            success: true,
            data: formattedStudents,
        });
    } catch (error) {
        console.error("Error fetching students for campaign:", error);
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

        const students = await prisma.student.findMany({
            where: {
                grade: {
                    in: campaign.targetGrades,
                },
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
                        campaign: { id: campaignId },
                        consent: true,
                    },
                },
                vaccinationRecords: {
                    where: {
                        campaignId: campaignId,
                    },
                    orderBy: { administeredDate: "desc" },
                    take: 1,
                },
            },
        });

        // Format dữ liệu để trả về
        const formattedStudents = students.map((student) => {
            const consent = student.vaccinationConsents[0];
            const vaccination = student.vaccinationRecords[0];

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

        res.json({
            success: true,
            data: formattedStudents,
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

// Map frequency string to number
function getFrequencyNumber(frequency) {
    if (!frequency) return 1;
    if (!isNaN(frequency)) return parseInt(frequency);
    const map = {
        once: 1,
        one: 1,
        twice: 2,
        two: 2,
        three: 3,
        four: 4,
    };
    return map[frequency.toLowerCase()] || 1;
}

// Nurse thực hiện tiêm cho học sinh
export const performVaccination = async (req, res) => {
    try {
        const {
            campaignId,
            studentId,
            administeredDate,
            notes,
            sideEffects,
            reaction,
            dose,
            doseAmount,
            batchNumber,
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
        const existingVaccination = await prisma.vaccinationRecord.findFirst({
            where: {
                campaign: { id: campaignId },
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
                campaign: { id: campaignId },
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

        const existedVaccination = await prisma.vaccinationRecord.findFirst({
            where: {
                studentId: studentId,
                vaccineId: campaign.vaccineId,
                dose: dose,
            },
        });
        if (existedVaccination) {
            const doseInfor =
                existedVaccination.dose === "FIRST"
                    ? "đầu tiên"
                    : existedVaccination.dose === "SECOND"
                    ? "thứ hai"
                    : "nhắc lại";
            return res.status(400).json({
                success: false,
                error:
                    "Học sinh này đã được tiêm chủng với loại vaccine và liều này trước đây trong chiến dịch " +
                    existedVaccination.campaignName +
                    " liều " +
                    doseInfor,
            });
        }

        const vacciationDate = new Date(administeredDate);
        if (
            vacciationDate < new Date().setHours(0, 0, 0, 0) ||
            vacciationDate <
                new Date(campaign.scheduledDate).setHours(0, 0, 0, 0) ||
            vacciationDate > campaign.deadline
        ) {
            return res.status(400).json({
                success: false,
                error: "Ngày tiêm chủng không hợp lệ",
            });
        }
        // Tạo bản ghi tiêm chủng
        const vaccination = await prisma.vaccinationRecord.create({
            data: {
                campaignName: campaign.name,
                administeredDate: vacciationDate,
                vaccineName: campaign.vaccineName,
                studentName: student.user.fullName,
                studentGrade: student.grade,
                studentClass: student.class,
                nurseName: req.user.fullName,
                sideEffects: sideEffects || null,
                batchNumber: batchNumber || null,
                notes: notes || null,
                reaction: reaction || null,
                dose: dose || "FIRST",
                doseAmount: doseAmount || 0.5,
                campaign: { connect: { id: campaignId } },
                student: { connect: { id: studentId } },
                nurse: { connect: { id: nurseId } },
                vaccine: { connect: { id: campaign.vaccineId } },
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
                where: { studentId: studentId },
                include: {
                    parent: {
                        include: {
                            user: { select: { id: true, fullName: true } },
                        },
                    },
                },
            });
            for (const studentParent of studentParents) {
                await prisma.notification.create({
                    data: {
                        userId: studentParent.parent.user.id,
                        title: `Thông báo tiêm chủng cho học sinh ${student.user.fullName}`,
                        message: `Học sinh ${student.user.fullName} đã được tiêm chủng thành công trong chiến dịch ${campaign.name}.`,
                        type: "vaccination",
                        status: "SENT",
                        sentAt: new Date(),
                        vaccinationCampaignId: campaignId,
                    },
                });
            }
        } catch (notificationError) {
            console.error("Error sending notifications:", notificationError);
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
        const vaccination = await prisma.vaccinationRecord.findFirst({
            where: {
                campaign: { id: campaignId },
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
        const updatedVaccination = await prisma.vaccinationRecord.update({
            where: { id: vaccination.id },
            data: {
                sideEffects:
                    sideEffects !== undefined
                        ? sideEffects
                        : vaccination.sideEffects,
                notes:
                    additionalNotes !== undefined
                        ? additionalNotes
                        : vaccination.notes,
                reaction:
                    reaction !== undefined ? reaction : vaccination.reaction,
                followUpRequired:
                    followUpRequired !== undefined
                        ? followUpRequired
                        : vaccination.followUpRequired,
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

// Lấy danh sách yêu cầu thuốc đang chờ phê duyệt
export const getPendingMedicationRequests = async (req, res) => {
    try {
        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        const { status, studentId, parentId } = req.query;

        let whereClause = {
            status: "PENDING_APPROVAL",
        };

        // Lọc theo student nếu có
        if (studentId) {
            whereClause.studentId = studentId;
        }

        // Lọc theo parent nếu có
        if (parentId) {
            whereClause.parentId = parentId;
        }

        const pendingRequests = await prisma.studentMedication.findMany({
            where: whereClause,
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedRequests = pendingRequests.map((request) => ({
            id: request.id,
            studentId: request.studentId,
            studentName: request.student.user.fullName,
            studentEmail: request.student.user.email,
            parentId: request.parentId,
            parentName: request.parent.user.fullName,
            parentEmail: request.parent.user.email,
            medicationId: request.medicationId,
            medicationName: request.name,
            medicationDescription: request.description,
            dosage: request.dosage,
            frequency: request.frequency,
            duration: request.duration,
            instructions: request.instructions,
            status: request.status,
            startDate: request.startDate,
            endDate: request.endDate,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        }));

        res.json({
            success: true,
            data: formattedRequests,
        });
    } catch (error) {
        console.error("Error fetching pending medication requests:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách yêu cầu thuốc",
        });
    }
};

// Phê duyệt yêu cầu thuốc
export const approveMedicationRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, notes } = req.body; // action: "APPROVE" hoặc "REJECT"

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        // Kiểm tra yêu cầu có tồn tại không
        const medicationRequest = await prisma.studentMedication.findUnique({
            where: { id: requestId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                        healthProfile: true,
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                // XÓA medication: true
            },
        });

        if (!medicationRequest) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy yêu cầu thuốc",
            });
        }

        if (medicationRequest.status !== "PENDING_APPROVAL") {
            return res.status(400).json({
                success: false,
                error: "Yêu cầu này đã được xử lý",
            });
        }

        let newStatus;
        let message;

        if (action === "APPROVE") {
            newStatus = "APPROVED";
            message = "Yêu cầu thuốc đã được phê duyệt";
        } else if (action === "REJECT") {
            newStatus = "REJECTED";
            message = "Yêu cầu thuốc đã bị từ chối";
        } else {
            return res.status(400).json({
                success: false,
                error: "Hành động không hợp lệ. Chỉ chấp nhận 'APPROVE' hoặc 'REJECT'",
            });
        }

        // Cập nhật trạng thái yêu cầu
        const updatedRequest = await prisma.studentMedication.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                updatedAt: new Date(),
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
                parent: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                // XÓA medication: true
            },
        });

        // Gửi thông báo cho phụ huynh
        try {
            await prisma.notification.create({
                data: {
                    userId: medicationRequest.parent.user.id,
                    title: `Yêu cầu thuốc - ${medicationRequest.name}`,
                    message: `Yêu cầu thuốc ${
                        medicationRequest.name
                    } cho học sinh ${
                        medicationRequest.student.user.fullName
                    } đã được ${
                        action === "APPROVE" ? "phê duyệt" : "từ chối"
                    }. ${notes ? `Ghi chú: ${notes}` : ""}`,
                    type: "medication_request",
                    status: "SENT",
                    sentAt: new Date(),
                },
            });
        } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
        }

        res.json({
            success: true,
            data: {
                id: updatedRequest.id,
                status: updatedRequest.status,
                studentName: updatedRequest.student.user.fullName,
                parentName: updatedRequest.parent.user.fullName,
                medicationName: updatedRequest.name,
                action: action,
                notes: notes,
            },
            message: message,
        });
    } catch (error) {
        console.error("Error approving medication request:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi phê duyệt yêu cầu thuốc",
        });
    }
};

// Lấy thống kê yêu cầu thuốc
export const getMedicationRequestStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Đếm tổng số yêu cầu theo trạng thái
        const [
            totalPending,
            totalApproved,
            totalRejected,
            monthlyPending,
            monthlyApproved,
        ] = await Promise.all([
            prisma.studentMedication.count({
                where: { status: "PENDING_APPROVAL" },
            }),
            prisma.studentMedication.count({ where: { status: "APPROVED" } }),
            prisma.studentMedication.count({ where: { status: "REJECTED" } }),
            prisma.studentMedication.count({
                where: {
                    status: "PENDING_APPROVAL",
                    createdAt: { gte: startOfMonth },
                },
            }),
            prisma.studentMedication.count({
                where: {
                    status: "APPROVED",
                    createdAt: { gte: startOfMonth },
                },
            }),
        ]);

        // Thống kê top 5 loại thuốc được yêu cầu nhiều nhất (theo name, dosage, unit)
        const all = await prisma.studentMedication.findMany({
            select: { name: true, dosage: true, unit: true },
            where: { status: { not: "REJECTED" } },
        });
        const statsMap = new Map();
        all.forEach((med) => {
            const key = `${med.name}|${med.dosage}|${med.unit}`;
            statsMap.set(key, (statsMap.get(key) || 0) + 1);
        });
        const topMedications = Array.from(statsMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([key, count]) => {
                const [name, dosage, unit] = key.split("|");
                return { name, dosage, unit, count };
            });

        res.json({
            success: true,
            data: {
                total: {
                    pending: totalPending,
                    approved: totalApproved,
                    rejected: totalRejected,
                },
                monthly: {
                    pending: monthlyPending,
                    approved: monthlyApproved,
                },
                topMedications,
            },
        });
    } catch (error) {
        console.error("Error getting medication request stats:", error);
        res.status(500).json({
            success: false,
            error: "Error getting medication request stats",
        });
    }
};

// Lấy chi tiết một yêu cầu thuốc
export const getMedicationRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        const medicationRequest = await prisma.studentMedication.findUnique({
            where: { id: requestId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                        healthProfile: true,
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                // XÓA medication: true
            },
        });

        if (!medicationRequest) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy yêu cầu thuốc",
            });
        }

        const formattedRequest = {
            id: medicationRequest.id,
            studentId: medicationRequest.studentId,
            studentName: medicationRequest.student.user.fullName,
            studentEmail: medicationRequest.student.user.email,
            studentGrade: medicationRequest.student.class,
            parentId: medicationRequest.parentId,
            parentName: medicationRequest.parent.user.fullName,
            parentEmail: medicationRequest.parent.user.email,
            parentPhone: medicationRequest.parent.user.phone,
            // medicationId: medicationRequest.medicationId, // KHÔNG CÓ
            medicationName: medicationRequest.name,
            medicationDescription: medicationRequest.description,
            medicationDosage: medicationRequest.dosage,
            medicationUnit: medicationRequest.unit,
            dosage: medicationRequest.dosage,
            frequency: medicationRequest.frequency,
            duration: medicationRequest.duration,
            instructions: medicationRequest.instructions,
            status: medicationRequest.status,
            startDate: medicationRequest.startDate,
            endDate: medicationRequest.endDate,
            createdAt: medicationRequest.createdAt,
            updatedAt: medicationRequest.updatedAt,
            healthProfile: medicationRequest.student.healthProfile,
            image: medicationRequest.image,
        };

        res.json({
            success: true,
            data: formattedRequest,
        });
    } catch (error) {
        console.error("Error getting medication request details:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy chi tiết yêu cầu thuốc",
        });
    }
};

// Lấy danh sách thuốc đã được phê duyệt
export const getApprovedMedications = async (req, res) => {
    try {
        const meds = await prisma.studentMedication.findMany({
            where: { status: "APPROVED" },
            include: {
                student: {
                    include: {
                        user: { select: { fullName: true, email: true } },
                    },
                },
                parent: {
                    include: {
                        user: { select: { fullName: true, email: true } },
                    },
                },
                medicationAdministrationLogs: true,
            },
            orderBy: { updatedAt: "desc" },
        });
        // Map lại để luôn có duration (nếu null thì trả về rỗng)
        const mapped = meds.map((med) => ({
            ...med,
            duration: med.duration || "",
        }));
        res.json({ success: true, data: mapped });
    } catch (error) {
        console.error("Error getting approved medications:", error);
        res.status(500).json({
            success: false,
            error: "Error getting approved medications",
        });
    }
};

// Lấy danh sách học sinh cần điều trị (các đơn thuốc đã approve)
export const getStudentTreatments = async (req, res) => {
    try {
        const treatments = await prisma.studentMedication.findMany({
            where: {
                status: "APPROVED",
                treatmentStatus: "ONGOING",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        grade: true,
                        class: true,
                        user: { select: { fullName: true, email: true } },
                    },
                },
                parent: {
                    select: {
                        user: { select: { fullName: true, phone: true } },
                    },
                },
            },
            orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        });

        // Lấy todayDosage cho từng treatment
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Duyệt từng treatment để lấy tổng todayDosage
        const formatted = await Promise.all(
            treatments.map(async (item) => {
                // Lấy tất cả log cấp phát hôm nay
                const todayLogs =
                    await prisma.medicationAdministrationLog.findMany({
                        where: {
                            studentMedicationId: item.id,
                            givenAt: { gte: today, lt: tomorrow },
                        },
                    });
                const todayDosage = todayLogs.reduce(
                    (sum, log) => sum + (parseFloat(log.dosageGiven) || 0),
                    0
                );
                // Lấy lần cấp phát gần nhất (nếu cần)
                const lastLog =
                    await prisma.medicationAdministrationLog.findFirst({
                        where: { studentMedicationId: item.id },
                        orderBy: { givenAt: "desc" },
                    });

                // Kiểm tra trạng thái thuốc
                let stockStatus = "available";
                if ((item.stockQuantity ?? 0) <= 0) {
                    stockStatus = "out_of_stock";
                } else if ((item.stockQuantity ?? 0) <= 5) {
                    stockStatus = "low_stock";
                }

                // Kiểm tra hạn sử dụng
                let expiryStatus = "valid";
                if (item.expiryDate) {
                    const daysUntilExpiry = Math.ceil(
                        (new Date(item.expiryDate) - new Date()) /
                            (1000 * 60 * 60 * 24)
                    );
                    if (daysUntilExpiry <= 0) {
                        expiryStatus = "expired";
                    } else if (daysUntilExpiry <= 30) {
                        expiryStatus = "expiring_soon";
                    }
                }

                // Kiểm tra giới hạn liều dùng hàng ngày (nếu có)
                const freq = getFrequencyNumber(item.frequency);
                const dailyLimit = parseFloat(item.dosage) * freq;
                const canAdminister =
                    stockStatus !== "out_of_stock" &&
                    expiryStatus !== "expired" &&
                    todayDosage < dailyLimit;

                const treatment = {
                    id: item.id,
                    studentId: item.student.id,
                    studentName: item.student.user.fullName,
                    studentEmail: item.student.user.email,
                    studentCode: item.student.studentCode,
                    grade: item.student.grade,
                    class: item.student.class,
                    parentName: item.parent?.user?.fullName || "N/A",
                    parentPhone: item.parent?.user?.phone || "N/A",
                    medication: {
                        // These fields are now from item directly
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        stockQuantity: item.stockQuantity,
                        unit: item.unit,
                        expiryDate: item.expiryDate,
                        stockStatus: stockStatus,
                        expiryStatus: expiryStatus,
                    },
                    dosage: item.dosage,
                    frequency: item.frequency,
                    instructions: item.instructions,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    status: item.status,
                    treatmentStatus: item.treatmentStatus,
                    todayDosage: todayDosage,
                    dailyLimit: dailyLimit,
                    canAdminister: canAdminister,
                    lastAdministration: lastLog ? lastLog.givenAt : null,
                    warnings: [],
                };

                // Thêm cảnh báo
                if (treatment.medication.stockStatus === "low_stock") {
                    treatment.warnings.push(
                        `Tồn kho thấp: ${treatment.medication.stockQuantity} ${treatment.medication.unit}`
                    );
                }
                if (treatment.medication.expiryStatus === "expiring_soon") {
                    const daysUntilExpiry = Math.ceil(
                        (new Date(treatment.medication.expiryDate) -
                            new Date()) /
                            (1000 * 60 * 60 * 24)
                    );
                    treatment.warnings.push(
                        `Sắp hết hạn: ${daysUntilExpiry} ngày`
                    );
                }
                if (treatment.medication.expiryStatus === "expired") {
                    treatment.warnings.push("Thuốc đã hết hạn");
                }
                if (treatment.todayDosage >= treatment.dailyLimit) {
                    treatment.warnings.push("Đã đủ liều dùng hôm nay");
                }

                return treatment;
            })
        );

        res.json({
            success: true,
            data: formatted,
            summary: {
                total: formatted.length,
                canAdminister: formatted.filter((t) => t.canAdminister).length,
                lowStock: formatted.filter(
                    (t) => t.medication.stockStatus === "low_stock"
                ).length,
                outOfStock: formatted.filter(
                    (t) => t.medication.stockStatus === "out_of_stock"
                ).length,
                expiringSoon: formatted.filter(
                    (t) => t.medication.expiryStatus === "expiring_soon"
                ).length,
                expired: formatted.filter(
                    (t) => t.medication.expiryStatus === "expired"
                ).length,
            },
        });
    } catch (error) {
        console.error("Error fetching student treatments:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách điều trị",
        });
    }
};

// Lấy lịch sử điều trị học sinh
export const getMedicationHistory = async (req, res) => {
    try {
        const { studentMedicationId } = req.params;
        const { startDate, endDate, limit = 50 } = req.query;

        // Validation
        if (!studentMedicationId) {
            return res.status(400).json({
                success: false,
                error: "Thiếu ID đơn thuốc học sinh",
            });
        }

        // Xây dựng điều kiện tìm kiếm
        const whereClause = { studentMedicationId };

        if (startDate || endDate) {
            whereClause.givenAt = {};
            if (startDate) {
                whereClause.givenAt.gte = new Date(startDate);
            }
            if (endDate) {
                whereClause.givenAt.lte = new Date(endDate);
            }
        }

        const logs = await prisma.medicationAdministrationLog.findMany({
            where: whereClause,
            include: {
                nurse: {
                    include: {
                        user: {
                            select: { fullName: true, email: true },
                        },
                    },
                },
                medication: {
                    select: {
                        name: true,
                        unit: true,
                        description: true,
                    },
                },
                student: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
            },
            orderBy: { givenAt: "desc" },
            take: parseInt(limit),
        });

        // Tính toán thống kê
        const totalAdministrations = logs.length;
        const totalDosage = logs.reduce(
            (sum, log) => sum + (parseFloat(log.dosageGiven) || 0),
            0
        );
        const totalQuantity = logs.reduce(
            (sum, log) => sum + (parseInt(log.quantityUsed) || 0),
            0
        );

        // Nhóm theo ngày
        const groupedByDate = logs.reduce((groups, log) => {
            const date = new Date(log.givenAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(log);
            return groups;
        }, {});

        // Format dữ liệu trả về
        const formattedLogs = logs.map((log) => ({
            id: log.id,
            givenAt: log.givenAt,
            dosageGiven: log.dosageGiven,
            quantityUsed: log.quantityUsed,
            notes: log.notes,
            nurseName: log.nurse?.user?.fullName || "Không xác định",
            nurseEmail: log.nurse?.user?.email || "N/A",
            medicationName: log.medication?.name || "N/A",
            medicationUnit: log.medication?.unit || "N/A",
            studentName: log.student?.user?.fullName || "N/A",
            formattedTime: new Date(log.givenAt).toLocaleString("vi-VN"),
            formattedDate: new Date(log.givenAt).toLocaleDateString("vi-VN"),
        }));

        res.json({
            success: true,
            data: {
                logs: formattedLogs,
                summary: {
                    totalAdministrations,
                    totalDosage,
                    totalQuantity,
                    averageDosage:
                        totalAdministrations > 0
                            ? (totalDosage / totalAdministrations).toFixed(2)
                            : 0,
                    groupedByDate,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching medication history:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy lịch sử cấp phát thuốc",
        });
    }
};

// Nurse cho học sinh uống thuốc
export const giveMedicineToStudent = async (req, res) => {
    try {
        const { studentMedicationId } = req.params;
        const { quantityUsed, dosageGiven, notes, administrationTime } =
            req.body;
        const nurseId = req.user.nurseProfile?.id;

        // Validation dữ liệu đầu vào
        if (!studentMedicationId) {
            return res.status(400).json({
                success: false,
                error: "Thiếu ID đơn thuốc học sinh",
            });
        }

        if (!quantityUsed || quantityUsed <= 0) {
            return res.status(400).json({
                success: false,
                error: "Số lượng thuốc phải lớn hơn 0",
            });
        }

        if (!dosageGiven) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập liều dùng thực tế",
            });
        }

        // Lấy thông tin chi tiết đơn thuốc
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id: studentMedicationId },
            include: {
                medication: true,
                student: {
                    include: {
                        user: { select: { fullName: true, email: true } },
                    },
                },
                parent: {
                    include: {
                        user: { select: { fullName: true, email: true } },
                    },
                },
            },
        });

        if (!studentMedication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy đơn thuốc của học sinh",
            });
        }

        if (studentMedication.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                error: "Đơn thuốc chưa được phê duyệt hoặc đã bị từ chối",
            });
        }

        const medication = studentMedication.medication;
        if (!medication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy thông tin thuốc trong kho",
            });
        }

        // Kiểm tra số lượng tồn kho
        const qty = parseInt(quantityUsed);
        if (medication.stockQuantity < qty) {
            return res.status(400).json({
                success: false,
                error: `Số lượng thuốc trong kho không đủ. Hiện có: ${medication.stockQuantity} ${medication.unit}, cần: ${qty} ${medication.unit}`,
                currentStock: medication.stockQuantity,
                requestedQuantity: qty,
            });
        }

        // Kiểm tra hạn sử dụng
        if (
            medication.expiryDate &&
            new Date(medication.expiryDate) <= new Date()
        ) {
            return res.status(400).json({
                success: false,
                error: "Thuốc đã hết hạn sử dụng",
                expiryDate: medication.expiryDate,
            });
        }

        // Kiểm tra liều dùng trong ngày
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayAdministrations =
            await prisma.medicationAdministrationLog.findMany({
                where: {
                    studentMedicationId,
                    givenAt: { gte: today, lt: tomorrow },
                },
            });

        const totalDosageToday = todayAdministrations.reduce(
            (sum, admin) => sum + (parseFloat(admin.dosageGiven) || 0),
            0
        );
        const newTotalDosage = totalDosageToday + parseFloat(dosageGiven);

        // Kiểm tra giới hạn liều dùng hàng ngày (nếu có)
        const freq = getFrequencyNumber(studentMedication.frequency);
        const dailyLimit = parseFloat(studentMedication.dosage) * freq;
        if (newTotalDosage > dailyLimit) {
            return res.status(400).json({
                success: false,
                error: `Liều dùng vượt quá giới hạn hàng ngày. Đã dùng: ${totalDosageToday}, thêm: ${dosageGiven}, giới hạn: ${dailyLimit}`,
                dailyUsage: totalDosageToday,
                newDosage: dosageGiven,
                dailyLimit: dailyLimit,
            });
        }

        // Kiểm tra thời gian giữa các lần uống (tối thiểu 4 giờ)
        const lastAdministration = todayAdministrations[0];
        if (lastAdministration) {
            const timeDiff = new Date() - new Date(lastAdministration.givenAt);
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff < 4) {
                return res.status(400).json({
                    success: false,
                    error: `Cần đợi ít nhất 4 giờ giữa các lần uống. Lần cuối: ${new Date(
                        lastAdministration.givenAt
                    ).toLocaleString()}`,
                    lastAdministration: lastAdministration.givenAt,
                    hoursSinceLast: hoursDiff.toFixed(1),
                });
            }
        }

        // Thực hiện giao dịch để đảm bảo tính nhất quán
        const result = await prisma.$transaction(async (tx) => {
            // Cập nhật số lượng tồn kho
            const updatedMedication = await tx.medication.update({
                where: { id: medication.id },
                data: { stockQuantity: { decrement: qty } },
            });

            // Ghi log cấp phát thuốc
            const administrationLog =
                await tx.medicationAdministrationLog.create({
                    data: {
                        studentMedicationId,
                        studentId: studentMedication.studentId,
                        medicationId: medication.id,
                        nurseId,
                        dosageGiven: dosageGiven.toString(),
                        notes: notes || "",
                        givenAt: administrationTime
                            ? new Date(administrationTime)
                            : new Date(),
                    },
                    include: {
                        nurse: {
                            include: {
                                user: { select: { fullName: true } },
                            },
                        },
                    },
                });

            return { updatedMedication, administrationLog };
        });

        // Chuẩn bị thông tin phản hồi
        const response = {
            success: true,
            message: "Đã ghi nhận cấp phát thuốc thành công",
            data: {
                studentName: studentMedication.student.user.fullName,
                medicationName: medication.name,
                dosageGiven: dosageGiven,
                quantityUsed: qty,
                remainingStock: result.updatedMedication.stockQuantity,
                administrationTime: result.administrationLog.givenAt,
                nurseName: result.administrationLog.nurse.user.fullName,
                notes: notes,
            },
            warnings: [],
        };

        // Thêm cảnh báo nếu tồn kho thấp
        if (result.updatedMedication.stockQuantity <= 5) {
            response.warnings.push(
                `Cảnh báo: Thuốc ${medication.name} chỉ còn ${result.updatedMedication.stockQuantity} ${medication.unit} trong kho`
            );
        }

        // Thêm cảnh báo nếu sắp hết hạn (trong vòng 30 ngày)
        if (medication.expiryDate) {
            const daysUntilExpiry = Math.ceil(
                (new Date(medication.expiryDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
            );
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                response.warnings.push(
                    `Cảnh báo: Thuốc ${medication.name} sẽ hết hạn trong ${daysUntilExpiry} ngày`
                );
            }
        }

        res.json(response);
    } catch (error) {
        console.error("Error giving medicine to student:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi hệ thống khi cấp phát thuốc",
        });
    }
};

// Lấy thống kê tổng quan kho thuốc
export const getInventoryStats = async (req, res) => {};

// Dừng điều trị cho học sinh
export const stopStudentTreatment = async (req, res) => {
    try {
        const { id } = req.params;
        // Kiểm tra quyền nếu cần
        const updated = await prisma.studentMedication.update({
            where: { id },
            data: { treatmentStatus: "STOPPED", updatedAt: new Date() },
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error stopping student treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi dừng điều trị",
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

        const vaccinatedStudents = await prisma.vaccinationRecord.count({
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
        const recentVaccinations = await prisma.vaccinationRecord.findMany({
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

// Lấy danh sách báo cáo tiêm chủng cho một chiến dịch
export const getVaccinationReport = async (req, res) => {
    try {
        const { campaignId } = req.params;
        // Lấy tất cả vaccinationRecord của campaign này
        const records = await prisma.vaccinationRecord.findMany({
            where: { campaignId },
            include: {
                student: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
            },
            orderBy: { administeredDate: "desc" },
        });
        const reports = records.map((rec) => ({
            id: rec.id,
            studentId: rec.studentId,
            studentCode: rec.student?.studentCode,
            studentName: rec.student?.user?.fullName,
            grade: rec.student?.grade,
            administeredDate: rec.administeredDate,
            dose: rec.dose,
            sideEffects: rec.sideEffects,
            reaction: rec.reaction,
            followUpRequired: rec.followUpRequired,
            followUpDate: rec.followUpDate,
            additionalNotes: rec.notes,
            status: rec.status,
            batchNumber: rec.batchNumber,
        }));
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error("Error getting vaccination report:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy báo cáo tiêm chủng",
        });
    }
};
