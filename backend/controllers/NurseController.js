import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function: Validate vaccination interval between doses
const validateVaccinationInterval = async (
    vaccine,
    doseOrder,
    administeredDate,
    previousDoses
) => {
    let error = null;
    let nextDoseSuggestion = null;
    let actualInterval = null;
    let requiredInterval = null;

    if (
        !vaccine ||
        !Array.isArray(vaccine.doseSchedules) ||
        vaccine.doseSchedules.length === 0
    ) {
        return {
            error: null,
            nextDoseSuggestion,
            actualInterval,
            requiredInterval,
        };
    }

    // Lấy phác đồ cho mũi hiện tại
    const currentDoseSchedule = vaccine.doseSchedules.find(
        (ds) => ds.doseOrder === doseOrder
    );

    // Nếu không có phác đồ cho mũi này, cảnh báo
    if (!currentDoseSchedule) {
        error = `Không tìm thấy phác đồ cho mũi số ${doseOrder} của vaccine ${vaccine.name}.`;
    } else {
        // Kiểm tra khoảng cách với mũi trước
        const prevRecord = previousDoses.find(
            (pr) => pr.doseOrder === doseOrder - 1
        );
        if (prevRecord && prevRecord.administeredDate) {
            const prevDate = new Date(prevRecord.administeredDate);
            const currDate = new Date(administeredDate);
            actualInterval = Math.floor(
                (currDate - prevDate) / (1000 * 60 * 60 * 24)
            );
            requiredInterval = currentDoseSchedule.minInterval;

            if (actualInterval < requiredInterval) {
                const nextAllowedDate = new Date(prevDate);
                nextAllowedDate.setDate(
                    nextAllowedDate.getDate() + requiredInterval
                );

                error = `Khoảng cách giữa mũi ${
                    doseOrder - 1
                } và mũi ${doseOrder} phải tối thiểu ${requiredInterval} ngày. Hiện tại mới ${actualInterval} ngày. Ngày sớm nhất có thể tiêm: ${nextAllowedDate.toLocaleDateString(
                    "vi-VN"
                )}.`;
            }
        }
    }

    // Gợi ý mũi tiếp theo nếu có
    const nextDoseSchedule = vaccine.doseSchedules.find(
        (ds) => ds.doseOrder === doseOrder + 1
    );
    if (nextDoseSchedule) {
        const currentDate = new Date(administeredDate);
        const suggestedDate = new Date(currentDate);
        suggestedDate.setDate(
            suggestedDate.getDate() +
                (nextDoseSchedule.recommendedInterval ||
                    nextDoseSchedule.minInterval)
        );

        nextDoseSuggestion = {
            doseOrder: nextDoseSchedule.doseOrder,
            minInterval: nextDoseSchedule.minInterval,
            recommendedInterval: nextDoseSchedule.recommendedInterval,
            description: nextDoseSchedule.description,
            suggestedDate: suggestedDate.toLocaleDateString("vi-VN"),
            earliestDate: new Date(
                currentDate.getTime() +
                    nextDoseSchedule.minInterval * 24 * 60 * 60 * 1000
            ).toLocaleDateString("vi-VN"),
        };
    }

    return { error, nextDoseSuggestion, actualInterval, requiredInterval };
};

// Helper function: Enhanced logging for vaccination process
const logger = {
    log: (level, message, data = {}) => {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            data,
            source: "NurseController",
        };

        // Log to console with different colors based on level
        if (level === "error") {
            console.error(`🔴 [${timestamp}] ERROR: ${message}`, data);
        } else if (level === "warn") {
            console.warn(`🟡 [${timestamp}] WARN: ${message}`, data);
        } else if (level === "info") {
            console.log(`🔵 [${timestamp}] INFO: ${message}`, data);
        } else {
            console.log(
                `⚪ [${timestamp}] ${level.toUpperCase()}: ${message}`,
                data
            );
        }

        // In production, you might want to send this to a logging service
        // Example: await logToExternalService(logEntry);
    },
};

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
            console.error("Lỗi khi lấy thống kê dashboard:", error);
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
        res.json({
            success: true,
            data: medications,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vật tư y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách vật tư y tế",
        });
    }
};

// Không cho phép nurse tự thêm thuốc mới vào inventory
export const createMedicalInventory = async (req, res) => {
    return res.status(403).json({
        success: false,
        error: "Không thể thêm thuốc trực tiếp. Chỉ thêm qua phê duyệt yêu cầu phụ huynh.",
    });
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
        console.error("Lỗi khi cập nhật vật tư y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi cập nhật vật tư y tế",
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
                studentName: sm.student?.fullName,
            }))
        );
        // Log chi tiết từng StudentMedication để debug
        console.log(
            "StudentMedications details:",
            existingMedication.studentMedications.map((sm) => ({
                id: sm.id,
                treatmentStatus: sm.treatmentStatus,
                status: sm.status,
                studentName: sm.student?.fullName,
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
        console.log("Delete successful");
        res.json({
            success: true,
            message: "Vật tư y tế đã được xóa thành công",
        });
    } catch (error) {
        console.error("Lỗi khi xóa vật tư y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi xóa vật tư y tế",
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
        console.error("Lỗi khi lấy danh mục vật tư:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh mục vật tư",
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
                        fullName: true,
                    },
                },
            },
        });
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
                        fullName: true,
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
            studentName: event.student.fullName,
            studentClass: `${event.student.grade}${event.student.class}`,
            studentCode: event.student.studentCode,
        }));
        const formattedEvents = events.map((event) => ({
            id: event.id,
            title: event.title,
            type: event.type,
            severity: event.severity,
            occurredAt: event.occurredAt,
            status: event.status,
            studentName: event.student.fullName,
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
        res.json({
            success: true,
            data: formattedEvents,
        });
    } catch (error) {
        console.error("Lỗi khi lấy sự kiện y tế gần đây:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy sự kiện y tế gần đây",
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
        res.json({
            success: true,
            data: formattedVaccinations,
        });
    } catch (error) {
        console.error("Lỗi khi lấy lịch tiêm chủng sắp tới:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy lịch tiêm chủng sắp tới",
        });
    }
};

// Cập nhật trạng thái sự cố y tế
export const updateMedicalEventStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status, treatment, outcome } = req.body;
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
        res.json({
            success: true,
            data: updatedEvent,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái sự kiện y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi cập nhật trạng thái sự kiện y tế",
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
                student: true,
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
    try {
        const events = await prisma.medicalEvent.findMany({
            orderBy: {
                occurredAt: "desc",
            },
            include: {
                student: true,
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
            studentName: event.student.fullName,
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
        const formattedEvents = events.map((event) => ({
            id: event.id,
            studentId: event.student.id,
            studentName: event.student.fullName,
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
        res.json({
            success: true,
            data: formattedEvents,
        });
    } catch (error) {
        console.error("Lỗi khi lấy tất cả sự kiện y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách sự kiện y tế",
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
            // Kiểm tra xem student có tồn tại không
            if (!newEvent.student) {
                console.log("Student not found, skipping notification");
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
        // Tự động gửi thông báo cho phụ huynh
        try {
            // Kiểm tra xem student có tồn tại không
            if (!newEvent.student) {
                console.log("Student not found, skipping notification");
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
                            title: `Sự kiện y tế - ${newEvent.student.fullName}`,
                            message: `Học sinh ${newEvent.student.fullName} đã có sự kiện y tế: ${title}. Mức độ: ${severity}. Vui lòng liên hệ với nhà trường để biết thêm chi tiết.`,
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
            studentName: newEvent.student.fullName,
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
        res.status(201).json({
            success: true,
            data: formattedEvent,
            message: "Đã tạo sự kiện y tế thành công",
        });
    } catch (error) {
        console.error("Lỗi khi tạo sự kiện y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi tạo sự kiện y tế",
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
                        fullName: true,
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
                        fullName: true,
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

        // Kiểm tra xem student có tồn tại không
        if (!updatedEvent.student) {
            return res.status(404).json({
                success: false,
                error: "Student information not found",
            });
        }

        const formattedEvent = {
            id: updatedEvent.id,
            studentId: updatedEvent.student.id,
            studentName: updatedEvent.student.fullName,
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
        res.json({
            success: true,
            data: formattedEvent,
            message: "Đã cập nhật sự kiện y tế thành công",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi cập nhật sự kiện y tế",
        });
    }
};

// Xóa sự kiện y tế
export const deleteMedicalEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
    try {
        const { eventId } = req.params;

        await prisma.medicalEvent.delete({
            where: { id: eventId },
        });
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
        res.json({
            success: true,
            message: "Đã xóa sự kiện y tế thành công",
        });
    } catch (error) {
        console.error("Lỗi khi xóa sự kiện y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi xóa sự kiện y tế",
        });
    }
};

// Lấy chi tiết sự kiện y tế
export const getMedicalEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
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
                        fullName: true,
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
        const event = await prisma.medicalEvent.findUnique({
            where: { id: eventId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        grade: true,
                        class: true,
                        fullName: true,
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
        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy sự kiện y tế",
            });
        }

        // Kiểm tra xem student có tồn tại không
        if (!event.student) {
            return res.status(404).json({
                success: false,
                error: "Student information not found",
            });
        }

        const formattedEvent = {
            id: event.id,
            studentId: event.student.id,
            studentName: event.student.fullName,
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
        res.json({
            success: true,
            data: formattedEvent,
        });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sự kiện y tế:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy chi tiết sự kiện y tế",
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
        // Đảm bảo trả về doseSchedules trong vaccine
        const campaignsWithDoseSchedules = campaigns.map((c) => ({
            ...c,
            vaccine: c.vaccine
                ? { ...c.vaccine, doseSchedules: c.vaccine.doseSchedules || [] }
                : null,
        }));
        res.json({
            success: true,
            data: campaignsWithDoseSchedules,
        });
    } catch (error) {
        console.error("Error fetching vaccination campaigns:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách chiến dịch tiêm chủng",
        });
    }
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
        // Đảm bảo trả về doseSchedules trong vaccine
        const campaignsWithDoseSchedules = campaigns.map((c) => ({
            ...c,
            vaccine: c.vaccine
                ? { ...c.vaccine, doseSchedules: c.vaccine.doseSchedules || [] }
                : null,
        }));
        res.json({
            success: true,
            data: campaignsWithDoseSchedules,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách chiến dịch tiêm chủng:", error);
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
                fullName: student.fullName,
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
        // Trả về cả phác đồ mũi tiêm trong vaccine
        res.json({
            success: true,
            data: {
                students: formattedStudents,
                vaccine: campaign.vaccine
                    ? {
                          ...campaign.vaccine,
                          doseSchedules: campaign.vaccine.doseSchedules || [],
                      }
                    : null,
            },
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
                fullName: student.fullName,
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
        // Trả về cả phác đồ mũi tiêm trong vaccine
        res.json({
            success: true,
            data: {
                students: formattedStudents,
                vaccine: campaign.vaccine
                    ? {
                          ...campaign.vaccine,
                          doseSchedules: campaign.vaccine.doseSchedules || [],
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách học sinh cho chiến dịch:", error);
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
            include: { vaccine: true },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }
        // Lấy tất cả học sinh trong khối mục tiêu và độ tuổi khuyến nghị
        const allStudents = await prisma.student.findMany({
            where: {
                grade: {
                    in: campaign.targetGrades,
                },
                // Thêm filter độ tuổi nếu vaccine có minAge/maxAge
                ...(campaign.vaccine?.minAge || campaign.vaccine?.maxAge
                    ? {
                          dateOfBirth: {
                              ...(campaign.vaccine.minAge && {
                                  lte: new Date(
                                      Date.now() -
                                          campaign.vaccine.minAge *
                                              365 *
                                              24 *
                                              60 *
                                              60 *
                                              1000
                                  ),
                              }),
                              ...(campaign.vaccine.maxAge && {
                                  gte: new Date(
                                      Date.now() -
                                          (campaign.vaccine.maxAge + 1) *
                                              365 *
                                              24 *
                                              60 *
                                              60 *
                                              1000
                                  ),
                              }),
                          },
                      }
                    : {}),
            },
            include: {
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
    try {
        const { campaignId } = req.params;
        // Kiểm tra campaign có tồn tại không
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
            include: { vaccine: true },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }
        // Lấy tất cả học sinh trong khối mục tiêu và độ tuổi khuyến nghị
        const allStudents = await prisma.student.findMany({
            where: {
                grade: {
                    in: campaign.targetGrades,
                },
                // Thêm filter độ tuổi nếu vaccine có minAge/maxAge
                ...(campaign.vaccine?.minAge || campaign.vaccine?.maxAge
                    ? {
                          dateOfBirth: {
                              ...(campaign.vaccine.minAge && {
                                  lte: new Date(
                                      Date.now() -
                                          campaign.vaccine.minAge *
                                              365 *
                                              24 *
                                              60 *
                                              60 *
                                              1000
                                  ),
                              }),
                              ...(campaign.vaccine.maxAge && {
                                  gte: new Date(
                                      Date.now() -
                                          (campaign.vaccine.maxAge + 1) *
                                              365 *
                                              24 *
                                              60 *
                                              60 *
                                              1000
                                  ),
                              }),
                          },
                      }
                    : {}),
            },
            include: {
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

        // Format dữ liệu để trả về - KHÔNG filter, trả về tất cả
        const formattedStudents = allStudents.map((student) => {
            const consent = student.vaccinationConsents[0];
            const vaccination = student.vaccinationRecords[0];
            return {
                id: student.id,
                studentCode: student.studentCode,
                fullName: student.fullName,
                grade: student.grade,
                class: student.class,
                consentStatus: consent ? consent.consent : null,
                consentReason:
                    consent && consent.consent === false ? consent.notes : null, // Thêm lý do từ chối
                consentDate: consent ? consent.createdAt : null, // Thêm ngày xác nhận
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
        // Trả về cả phác đồ mũi tiêm trong vaccine
        res.json({
            success: true,
            data: {
                students: formattedStudents,
                vaccine: campaign.vaccine
                    ? {
                          ...campaign.vaccine,
                          doseSchedules: campaign.vaccine.doseSchedules || [],
                      }
                    : null,
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
        // Format dữ liệu để trả về - KHÔNG filter, trả về tất cả
        const formattedStudents = allStudents.map((student) => {
            const consent = student.vaccinationConsents[0];
            const vaccination = student.vaccinationRecords[0];
            return {
                id: student.id,
                studentCode: student.studentCode,
                fullName: student.fullName,
                grade: student.grade,
                class: student.class,
                consentStatus: consent ? consent.consent : null,
                consentReason:
                    consent && consent.consent === false ? consent.notes : null, // Thêm lý do từ chối
                consentDate: consent ? consent.createdAt : null, // Thêm ngày xác nhận
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
        // Trả về cả phác đồ mũi tiêm trong vaccine
        res.json({
            success: true,
            data: {
                students: formattedStudents,
                vaccine: campaign.vaccine
                    ? {
                          ...campaign.vaccine,
                          doseSchedules: campaign.vaccine.doseSchedules || [],
                      }
                    : null,
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
            doseAmount,
            batchNumber,
            doseType,
            doseOrder, // thêm doseOrder vào destructuring
        } = req.body;
    // Track operation timing for performance monitoring
    const operationStartTime = Date.now();

    try {
        const {
            campaignId,
            studentId,
            administeredDate,
            notes,
            sideEffects,
            reaction,
            doseAmount,
            batchNumber,
            doseType,
            doseOrder, // thêm doseOrder vào destructuring
        } = req.body;

        // Enhanced input validation
        const validationErrors = validateVaccinationInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Dữ liệu đầu vào không hợp lệ",
                errorCode: "VALIDATION_ERROR",
                details: {
                    errors: validationErrors,
                },
            });
        }

        if (!doseType) {
            return res.status(400).json({
                success: false,
                error: "Thiếu loại liều (doseType)",
            });
        }
        if (!doseType) {
            return res.status(400).json({
                success: false,
                error: "Thiếu loại liều (doseType)",
                errorCode: "MISSING_DOSE_TYPE",
            });
        }

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }
        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            console.warn(
                `Unauthorized vaccination attempt by user ${req.user.id}: Not a nurse`
            );
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
                errorCode: "UNAUTHORIZED_ACCESS",
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
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy học sinh",
            });
        }
        // Kiểm tra student tồn tại
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy học sinh",
            });
        }

        // Kiểm tra đã tiêm trong campaign này chưa
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
        // Kiểm tra đã tiêm trong campaign này chưa
        const existingVaccination = await prisma.vaccinationRecord.findFirst({
            where: {
                campaignId: campaignId,
                studentId: studentId,
            },
        });
        if (existingVaccination) {
            return res.status(400).json({
                success: false,
                error: "Học sinh này đã được tiêm chủng trong chiến dịch này",
                errorCode: "DUPLICATE_VACCINATION",
                details: {
                    existingVaccinationId: existingVaccination.id,
                    administeredDate: existingVaccination.administeredDate,
                },
            });
        }

        // Kiểm tra consent
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
        // Kiểm tra consent
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
                errorCode: "NO_CONSENT",
                details: {
                    studentId: studentId,
                    campaignId: campaignId,
                },
            });
        }

        // Tự động sinh doseOrder hoặc sử dụng từ frontend
        const previousDoses = await prisma.vaccinationRecord.findMany({
            where: {
                studentId: studentId,
                vaccineId: campaign.vaccineId,
            },
            orderBy: { administeredDate: "asc" },
        });

        // Sử dụng doseOrder từ frontend nếu có,否则 tự động tính toán
        let calculatedDoseOrder = doseOrder || previousDoses.length + 1;
        const previousDoses = await prisma.vaccinationRecord.findMany({
            where: {
                studentId: studentId,
                vaccineId: campaign.vaccineId,
            },
            orderBy: { administeredDate: "asc" },
        });

        // Validate doseOrder
        if (calculatedDoseOrder < 1) {
            return res.status(400).json({
                success: false,
                error: "Dose order không hợp lệ",
            });
        }
        // Validate doseOrder
        if (doseOrder < 1) {
            return res.status(400).json({
                success: false,
                error: "Mũi tiêm không hợp lệ",
                errorCode: "INVALID_DOSE_ORDER",
                details: {
                    providedDoseOrder: doseOrder,
                    minimumRequired: 1,
                },
            });
        }

        // Kiểm tra xem đã tiêm mũi này chưa (tránh tiêm trùng)
        const existingDose = previousDoses.find(
            (dose) => dose.doseOrder === doseOrder
        );
        if (existingDose) {
            // Nếu đã tiêm mũi này rồi
            if (doseType === "CATCHUP" || doseType === "ADDITIONAL") {
                // Với CATCHUP/ADDITIONAL, cho phép tiêm lại (có thể là bổ sung)
                console.log(
                    `Allowing ${doseType} re-vaccination for dose ${doseOrder}`
                );
            } else {
                // Với PRIMARY/BOOSTER, không cho phép tiêm trùng
                return res.status(400).json({
                    success: false,
                    error: `Học sinh đã tiêm mũi ${doseOrder} rồi (ngày ${new Date(
                        existingDose.administeredDate
                    ).toLocaleDateString(
                        "vi-VN"
                    )}). Không thể tiêm lại cùng một mũi với loại liều "${doseType}".`,
                    errorCode: "DUPLICATE_DOSE_ORDER",
                    details: {
                        currentDoseOrder: doseOrder,
                        existingDose: {
                            id: existingDose.id,
                            administeredDate: existingDose.administeredDate,
                            doseType: existingDose.doseType,
                            batchNumber: existingDose.batchNumber,
                        },
                        suggestion:
                            "Sử dụng doseType 'ADDITIONAL' nếu cần tiêm bổ sung",
                        completedDoses: previousDoses
                            .map((d) => d.doseOrder)
                            .sort(),
                    },
                });
            }
        }

        // Kiểm tra xem có tiêm ngược thứ tự không (ví dụ: muốn tiêm mũi 1 mà đã tiêm mũi 2, 3)
        const higherDoses = previousDoses.filter(
            (dose) => dose.doseOrder > doseOrder
        );
        if (
            higherDoses.length > 0 &&
            doseType !== "CATCHUP" &&
            doseType !== "ADDITIONAL"
        ) {
            return res.status(400).json({
                success: false,
                error: `Không thể tiêm mũi ${doseOrder} vì học sinh đã tiêm các mũi cao hơn: ${higherDoses
                    .map((d) => d.doseOrder)
                    .sort()
                    .join(
                        ", "
                    )}. Nếu đây là tiêm bù, vui lòng chọn loại liều "Tiêm bù".`,
                errorCode: "REVERSE_DOSE_ORDER",
                details: {
                    requestedDoseOrder: doseOrder,
                    higherDosesCompleted: higherDoses.map((d) => ({
                        doseOrder: d.doseOrder,
                        administeredDate: d.administeredDate,
                        doseType: d.doseType,
                    })),
                    suggestion:
                        "Sử dụng doseType 'CATCHUP' để tiêm bù mũi đã bỏ lỡ",
                    completedDoses: previousDoses
                        .map((d) => d.doseOrder)
                        .sort(),
                },
            });
        }

        // Kiểm tra thứ tự mũi tiêm - có 2 cases:
        // Case 1: Tiêm tuần tự trong hệ thống (strict mode)
        // Case 2: Tiêm bù/tiếp tục từ mũi đã tiêm bên ngoài (flexible mode)
        if (doseOrder > 1) {
            const requiredPrevDose = previousDoses.find(
                (pr) => pr.doseOrder === doseOrder - 1
            );

            if (!requiredPrevDose) {
                // Nếu không tìm thấy mũi trước trong hệ thống
                // Kiểm tra xem có phải là tiêm bù/tiếp tục không
                if (doseType === "CATCHUP" || doseType === "ADDITIONAL") {
                    // Cho phép tiêm bù - không cần kiểm tra thứ tự nghiêm ngặt
                    console.log(
                        `Allowing ${doseType} vaccination for dose ${doseOrder} without previous dose validation`
                    );
                } else {
                    // Với PRIMARY và BOOSTER, vẫn yêu cầu thứ tự nghiêm ngặt
                    return res.status(400).json({
                        success: false,
                        error: `Phải tiêm mũi ${
                            doseOrder - 1
                        } trước khi tiêm mũi ${doseOrder}. Nếu học sinh đã tiêm mũi ${
                            doseOrder - 1
                        } ở nơi khác, vui lòng chọn loại liều "Tiêm bù" thay vì "${doseType}".`,
                        errorCode: "DOSE_ORDER_VIOLATION",
                        details: {
                            currentDoseOrder: doseOrder,
                            requiredPreviousDose: doseOrder - 1,
                            completedDoses: previousDoses
                                .map((d) => d.doseOrder)
                                .sort(),
                            suggestion:
                                "Sử dụng doseType 'Tiêm bù' nếu học sinh đã tiêm mũi trước ở nơi khác",
                        },
                    });
                }
            }
        }

        // Lấy maxDoseCount và doseSchedules từ vaccine
        const vaccine = await prisma.vaccine.findUnique({
            where: { id: campaign.vaccineId },
        });
        if (
            vaccine &&
            vaccine.maxDoseCount &&
            previousDoses.length >= vaccine.maxDoseCount
        ) {
            return res.status(400).json({
                success: false,
                error: `Học sinh này đã tiêm đủ số liều tối đa (${vaccine.maxDoseCount}) cho vaccine này. Không thể tiêm thêm!`,
            });
        }
        // Lấy maxDoseCount và doseSchedules từ vaccine
        const vaccine = await prisma.vaccine.findUnique({
            where: { id: campaign.vaccineId },
        });
        if (
            vaccine &&
            vaccine.maxDoseCount &&
            (previousDoses.length >= vaccine.maxDoseCount ||
                doseOrder > vaccine.maxDoseCount)
        ) {
            return res.status(400).json({
                success: false,
                error: `Học sinh này đã tiêm đủ số liều tối đa (${vaccine.maxDoseCount}) cho vaccine này. Không thể tiêm thêm!`,
                errorCode: "MAX_DOSE_EXCEEDED",
                details: {
                    maxDoses: vaccine.maxDoseCount,
                    completedDoses: previousDoses.length,
                    requestedDoseOrder: doseOrder,
                    vaccineName: vaccine.name,
                },
            });
        }

        // --- BẮT ĐẦU: Kiểm tra khoảng cách giữa các mũi dựa trên doseSchedules ---
        let intervalError = null;
        let nextDoseSuggestion = null;
        if (
            vaccine &&
            Array.isArray(vaccine.doseSchedules) &&
            vaccine.doseSchedules.length > 0
        ) {
            // Lấy phác đồ cho mũi hiện tại
            const currentDoseSchedule = vaccine.doseSchedules.find(
                (ds) => ds.doseOrder === calculatedDoseOrder
            );
            // Nếu không có phác đồ cho mũi này, cảnh báo
            if (!currentDoseSchedule) {
                intervalError = `Không tìm thấy phác đồ cho mũi số ${calculatedDoseOrder} của vaccine này.`;
            } else if (calculatedDoseOrder > 1) {
                // Kiểm tra khoảng cách với mũi trước
                const prevRecord = previousDoses[previousDoses.length - 1];
                if (prevRecord && prevRecord.administeredDate) {
                    const prevDate = new Date(prevRecord.administeredDate);
                    const currDate = new Date(administeredDate);
                    const diffDays = Math.floor(
                        (currDate - prevDate) / (1000 * 60 * 60 * 24)
                    );
                    if (diffDays < currentDoseSchedule.minInterval) {
                        intervalError = `Khoảng cách giữa mũi ${
                            calculatedDoseOrder - 1
                        } và mũi ${calculatedDoseOrder} phải tối thiểu ${
                            currentDoseSchedule.minInterval
                        } ngày. Hiện tại mới ${diffDays} ngày.`;
                    }
                }
            }
            // Gợi ý mũi tiếp theo nếu có
            const nextDoseSchedule = vaccine.doseSchedules.find(
                (ds) => ds.doseOrder === calculatedDoseOrder + 1
            );
            if (nextDoseSchedule) {
                nextDoseSuggestion = {
                    doseOrder: nextDoseSchedule.doseOrder,
                    minInterval: nextDoseSchedule.minInterval,
                    recommendedInterval: nextDoseSchedule.recommendedInterval,
                    description: nextDoseSchedule.description,
                };
            }
        }
        if (intervalError) {
            return res.status(400).json({
                success: false,
                error: intervalError,
            });
        }
        // --- KẾT THÚC: Kiểm tra khoảng cách giữa các mũi ---
        // --- BẮT ĐẦU: Kiểm tra khoảng cách giữa các mũi dựa trên doseSchedules ---
        const intervalValidation = await validateVaccinationInterval(
            vaccine,
            doseOrder,
            administeredDate,
            previousDoses
        );

        let intervalError = intervalValidation.error;
        let nextDoseSuggestion = intervalValidation.nextDoseSuggestion;

        // Ghi log chi tiết về interval validation
        logger.log("info", "Interval validation result", {
            studentId,
            campaignId,
            doseOrder,
            intervalValidation: {
                isValid: !intervalValidation.error,
                error: intervalValidation.error,
                actualInterval: intervalValidation.actualInterval,
                requiredInterval: intervalValidation.requiredInterval,
                nextDoseInfo: intervalValidation.nextDoseSuggestion,
            },
        });
        if (intervalError) {
            return res.status(400).json({
                success: false,
                error: intervalError,
                errorCode: "DOSE_INTERVAL_TOO_SHORT",
                details: {
                    currentDoseOrder: doseOrder,
                    previousDoseOrder: doseOrder - 1,
                    requiredInterval: currentDoseSchedule?.minInterval || 0,
                    actualInterval: diffDays || 0,
                },
            });
        }
        // --- KẾT THÚC: Kiểm tra khoảng cách giữa các mũi ---

        // Kiểm tra độ tuổi
        const { minAge, maxAge } = vaccine;
        if (minAge && maxAge) {
            const studentAge =
                new Date().getFullYear() -
                new Date(student.dateOfBirth).getFullYear();
            if (studentAge < minAge || studentAge > maxAge) {
                return res.status(400).json({
                    success: false,
                    error: "Học sinh không thuộc nhóm độ tuổi phù hợp",
                });
            }
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
                // References - dùng ObjectId trực tiếp
                vaccineId: campaign.vaccineId,
                campaignId: campaignId,
                studentId: studentId,
                nurseId: nurseId,
        // Kiểm tra độ tuổi
        const { minAge, maxAge } = vaccine;
        if (minAge || maxAge) {
            const studentAge =
                new Date().getFullYear() -
                new Date(student.dateOfBirth).getFullYear();
            if (minAge && studentAge < minAge) {
                return res.status(400).json({
                    success: false,
                    error: `Học sinh quá nhỏ. Độ tuổi tối thiểu: ${minAge} tuổi`,
                    errorCode: "AGE_TOO_YOUNG",
                    details: {
                        currentAge: studentAge,
                        requiredAge: minAge,
                        studentDateOfBirth: student.dateOfBirth,
                    },
                });
            }
            if (maxAge && studentAge > maxAge) {
                return res.status(400).json({
                    success: false,
                    error: `Học sinh quá lớn. Độ tuổi tối đa: ${maxAge} tuổi`,
                    errorCode: "AGE_TOO_OLD",
                    details: {
                        currentAge: studentAge,
                        maxAge: maxAge,
                        studentDateOfBirth: student.dateOfBirth,
                    },
                });
            }
        }

        // Kiểm tra ngày tiêm hợp lệ
        const vaccinationDate = new Date(administeredDate);
        const today = new Date();
        const campaignStart = new Date(campaign.scheduledDate);
        const campaignEnd = new Date(campaign.deadline);

        // Thiết lập giờ để so sánh chính xác theo ngày
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0); // Đầu ngày hôm nay
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999); // Cuối ngày hôm nay

        campaignStart.setHours(0, 0, 0, 0); // Đầu ngày bắt đầu chiến dịch
        campaignEnd.setHours(23, 59, 59, 999); // Cuối ngày kết thúc chiến dịch

        // CHỈ cho phép tiêm trong ngày hôm nay
        if (vaccinationDate < todayStart) {
            return res.status(400).json({
                success: false,
                error: "Không thể ghi nhận tiêm chủng trong quá khứ. Chỉ được phép ghi nhận tiêm trong ngày hôm nay.",
                errorCode: "INVALID_DATE",
                details: {
                    providedDate: administeredDate,
                    allowedDate: "today only",
                },
            });
        }

        if (vaccinationDate > todayEnd) {
            return res.status(400).json({
                success: false,
                error: "Không thể ghi nhận tiêm chủng trong tương lai",
                errorCode: "INVALID_DATE",
                details: {
                    providedDate: administeredDate,
                    allowedDate: "today only",
                },
            });
        }

        // Kiểm tra ngày tiêm có nằm trong thời gian chiến dịch không
        if (vaccinationDate < campaignStart) {
            return res.status(400).json({
                success: false,
                error: "Hôm nay chưa đến thời gian bắt đầu chiến dịch tiêm chủng",
                errorCode: "INVALID_DATE",
                details: {
                    providedDate: administeredDate,
                    campaignStartDate: campaign.scheduledDate,
                    campaignEndDate: campaign.deadline,
                },
            });
        }

        if (vaccinationDate > campaignEnd) {
            return res.status(400).json({
                success: false,
                error: "Chiến dịch tiêm chủng đã kết thúc",
                errorCode: "INVALID_DATE",
                details: {
                    providedDate: administeredDate,
                    campaignStartDate: campaign.scheduledDate,
                    campaignEndDate: campaign.deadline,
                },
            });
        }
        // Tạo bản ghi tiêm chủng với transaction để đảm bảo data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Tạo vaccination record
            const vaccination = await tx.vaccinationRecord.create({
                data: {
                    // References - dùng ObjectId trực tiếp
                    vaccineId: campaign.vaccineId,
                    campaignId: campaignId,
                    studentId: studentId,
                    nurseId: nurseId,

                // Denormalized data
                campaignName: campaign.name,
                vaccineName: campaign.vaccineName,
                studentName: student.fullName,
                studentGrade: student.grade,
                studentClass: student.class,
                nurseName: req.user.fullName,
                    // Denormalized data
                    campaignName: campaign.name,
                    vaccineName: campaign.vaccineName,
                    studentName: student.fullName,
                    studentGrade: student.grade,
                    studentClass: student.class,
                    nurseName: req.user.fullName,

                // Vaccination details
                administeredDate: vacciationDate,
                doseAmount: doseAmount || 0.5,
                batchNumber: batchNumber || null,
                doseOrder: calculatedDoseOrder,
                doseType: doseType,
                    // Vaccination details
                    administeredDate: vaccinationDate,
                    doseAmount: doseAmount || 0.5,
                    batchNumber: batchNumber || null,
                    doseOrder: doseOrder,
                    doseType: doseType,

                // Results and follow-up
                sideEffects: sideEffects || null,
                reaction: reaction || null,
                notes: notes || null,
                status: "COMPLETED",
                followUpRequired: false,
                followUpDate: null,
            },
            include: {
                student: true,
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
                    // Results and follow-up
                    sideEffects: sideEffects || null,
                    reaction: reaction || null,
                    notes: notes || null,
                    status: "COMPLETED",
                    followUpRequired: false,
                    followUpDate: null,
                },
                include: {
                    student: true,
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
                        title: `Thông báo tiêm chủng cho học sinh ${student.fullName}`,
                        message: `Học sinh ${student.fullName} đã được tiêm chủng thành công trong chiến dịch ${campaign.name}.`,
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
            // Cập nhật campaign statistics trong cùng transaction
            await tx.vaccinationCampaign.update({
                where: { id: campaignId },
                data: {
                    // Tăng số học sinh đã tiêm
                    updatedAt: new Date(),
                },
            });

            // Cập nhật consent status nếu cần
            await tx.vaccinationConsent.updateMany({
                where: {
                    campaignId: campaignId,
                    studentId: studentId,
                },
                data: {
                    updatedAt: new Date(),
                },
            });

            return vaccination;
        });

        // Gửi thông báo cho phụ huynh (ngoài transaction để không ảnh hưởng đến main flow)
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

            // Tạo notifications cho tất cả phụ huynh
            const notificationPromises = studentParents.map((studentParent) =>
                prisma.notification.create({
                    data: {
                        userId: studentParent.parent.user.id,
                        title: `Thông báo tiêm chủng cho học sinh ${student.fullName}`,
                        message: `Học sinh ${
                            student.fullName
                        } đã được tiêm chủng thành công trong chiến dịch ${
                            campaign.name
                        }. Mũi số ${doseOrder} - ${getDoseTypeLabel(
                            doseType
                        )}.`,
                        type: "vaccination",
                        status: "SENT",
                        sentAt: new Date(),
                        vaccinationCampaignId: campaignId,
                    },
                })
            );

            await Promise.all(notificationPromises);

            // Advanced monitoring và audit trail
            logger.log("info", "Vaccination completed successfully", {
                vaccinationId: result.id,
                nurseId,
                studentId,
                campaignId,
                doseOrder,
                doseType,
                vaccine: {
                    id: campaign.vaccineId,
                    name: campaign.vaccine?.name,
                },
                student: {
                    id: student.id,
                    name: student.fullName,
                    class: student.className,
                    grade: student.grade,
                },
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    location: campaign.location,
                },
                timing: {
                    administeredDate,
                    processedAt: new Date().toISOString(),
                    processingDuration: Date.now() - operationStartTime + "ms",
                },
                notifications: {
                    parentCount: studentParents.length,
                    sent: true,
                },
                performance: {
                    dbQueries: "transaction_mode",
                    dataConsistency: "ensured",
                },
            });

            // Monitoring cho business metrics
            await monitorVaccinationMetrics({
                campaignId,
                vaccineId: campaign.vaccineId,
                doseOrder,
                studentGrade: student.grade,
                location: campaign.location,
                timestamp: new Date(),
            });
        } catch (notificationError) {
            logger.log("error", "Error in post-vaccination processing", {
                vaccinationId: result.id,
                error: notificationError.message,
                stack: notificationError.stack,
                studentId,
                campaignId,
            });
            // Log lỗi nhưng không làm fail toàn bộ process
        }

        res.json({
            success: true,
            data: {
                id: vaccination.id,
                studentName: student.fullName,
                nurseName: vaccination.nurse.user.fullName,
                administeredDate: vaccination.administeredDate,
                batchNumber: vaccination.batchNumber,
                doseOrder: vaccination.doseOrder,
                doseType: vaccination.doseType,
                status: vaccination.status,
                nextDoseSuggestion: nextDoseSuggestion, // Gợi ý mũi tiếp theo nếu có
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
        res.json({
            success: true,
            data: {
                id: result.id,
                studentName: student.fullName,
                nurseName: result.nurse.user.fullName,
                administeredDate: result.administeredDate,
                batchNumber: result.batchNumber,
                doseOrder: result.doseOrder,
                doseType: result.doseType,
                status: result.status,
                nextDoseSuggestion: nextDoseSuggestion, // Gợi ý mũi tiếp theo nếu có
                campaignInfo: {
                    id: campaign.id,
                    name: campaign.name,
                    totalDoses: vaccine?.maxDoseCount || null,
                },
            },
            message: "Tiêm chủng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi thực hiện tiêm chủng:", error);

        // Enhanced error categorization
        let errorResponse = {
            success: false,
            error: "Lỗi khi thực hiện tiêm chủng",
            errorCode: "INTERNAL_ERROR",
            details: {
                timestamp: new Date().toISOString(),
                functionName: "performVaccination",
            },
        };

        // Handle specific Prisma errors
        if (error.code === "P2002") {
            errorResponse.error = "Bản ghi tiêm chủng đã tồn tại";
            errorResponse.errorCode = "DUPLICATE_RECORD";
        } else if (error.code === "P2025") {
            errorResponse.error = "Không tìm thấy dữ liệu liên quan";
            errorResponse.errorCode = "RECORD_NOT_FOUND";
        } else if (error.code === "P2003") {
            errorResponse.error = "Vi phạm ràng buộc dữ liệu";
            errorResponse.errorCode = "CONSTRAINT_VIOLATION";
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            errorResponse.error = "Dữ liệu không hợp lệ";
            errorResponse.errorCode = "VALIDATION_ERROR";
            errorResponse.details.validationErrors = error.errors;
        }

        // Add more context for debugging in development
        if (process.env.NODE_ENV === "development") {
            errorResponse.details.stackTrace = error.stack;
            errorResponse.details.originalError = error.message;
        }

        res.status(500).json(errorResponse);
    }
};

// Báo cáo kết quả tiêm chủng
export const reportVaccinationResult = async (req, res) => {
    try {
        const {
            sideEffects,
            reaction,
            followUpRequired,
            followUpDate,
            additionalNotes,
        } = req.body;
        const vaccinationRecordId = req.params.id;
    try {
        const {
            sideEffects,
            reaction,
            followUpRequired,
            followUpDate,
            additionalNotes,
        } = req.body;
        const vaccinationRecordId = req.params.id;

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }
        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        // Tìm bản ghi tiêm chủng theo _id
        const vaccination = await prisma.vaccinationRecord.findUnique({
            where: { id: vaccinationRecordId },
        });
        // Tìm bản ghi tiêm chủng theo _id
        const vaccination = await prisma.vaccinationRecord.findUnique({
            where: { id: vaccinationRecordId },
        });

        if (!vaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy bản ghi tiêm chủng",
            });
        }
        if (!vaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy bản ghi tiêm chủng",
            });
        }

        // Cập nhật báo cáo kết quả
        const updatedVaccination = await prisma.vaccinationRecord.update({
            where: { id: vaccinationRecordId },
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
        // Cập nhật báo cáo kết quả
        const updatedVaccination = await prisma.vaccinationRecord.update({
            where: { id: vaccinationRecordId },
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
                    title: `Theo dõi sau tiêm chủng: ${vaccination.studentName}`,
                    message: `Cần theo dõi học sinh ${
                        vaccination.studentName
                    } sau tiêm chủng. Ngày theo dõi: ${
                        followUpDate
                            ? new Date(followUpDate).toLocaleDateString("vi-VN")
                            : "Chưa xác định"
                    }.`,
                    type: "vaccination_followup",
                    status: "SENT",
                    sentAt: new Date(),
                    vaccinationCampaignId: vaccination.campaignId,
                },
            });
        }
        // Nếu cần theo dõi, tạo thông báo cho nurse
        if (followUpRequired) {
            await prisma.notification.create({
                data: {
                    userId: req.user.id,
                    title: `Theo dõi sau tiêm chủng: ${vaccination.studentName}`,
                    message: `Cần theo dõi học sinh ${
                        vaccination.studentName
                    } sau tiêm chủng. Ngày theo dõi: ${
                        followUpDate
                            ? new Date(followUpDate).toLocaleDateString("vi-VN")
                            : "Chưa xác định"
                    }.`,
                    type: "vaccination_followup",
                    status: "SENT",
                    sentAt: new Date(),
                    vaccinationCampaignId: vaccination.campaignId,
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
    try {
        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }

        const { status, studentId, parentId } = req.query;
        const { status, studentId, parentId } = req.query;

        let whereClause = {
            status: "PENDING_APPROVAL",
        };
        let whereClause = {
            status: "PENDING_APPROVAL",
        };

        // Lọc theo student nếu có
        if (studentId) {
            whereClause.studentId = studentId;
        }
        // Lọc theo student nếu có
        if (studentId) {
            whereClause.studentId = studentId;
        }

        // Lọc theo parent nếu có
        if (parentId) {
            whereClause.parentId = parentId;
        }
        // Lọc theo parent nếu có
        if (parentId) {
            whereClause.parentId = parentId;
        }

        const pendingRequests = await prisma.studentMedication.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
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
        const pendingRequests = await prisma.studentMedication.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
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
            studentName: request.student.fullName,
            studentEmail: null, // Email is not available in Student model
            parentId: request.parentId,
            parentName: request.parent.user.fullName,
            parentEmail: request.parent.user.email,
            medicationId: request.medicationId,
            medicationName: request.name,
            medicationDescription: request.description,
            type: request.type,
            dosage: request.dosage,
            unit: request.unit,
            frequency: request.frequency,
            duration: request.duration,
            instructions: request.instructions,
            status: request.status,
            startDate: request.startDate,
            endDate: request.endDate,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        }));
        const formattedRequests = pendingRequests.map((request) => ({
            id: request.id,
            studentId: request.studentId,
            studentName: request.student.fullName,
            studentEmail: null, // Email is not available in Student model
            parentId: request.parentId,
            parentName: request.parent.user.fullName,
            parentEmail: request.parent.user.email,
            medicationId: request.medicationId,
            medicationName: request.name,
            medicationDescription: request.description,
            type: request.type,
            dosage: request.dosage,
            unit: request.unit,
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
                student: true,
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
        // Kiểm tra yêu cầu có tồn tại không
        const medicationRequest = await prisma.studentMedication.findUnique({
            where: { id: requestId },
            include: {
                student: true,
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
        if (medicationRequest.status !== "PENDING_APPROVAL") {
            return res.status(400).json({
                success: false,
                error: "Yêu cầu này đã được xử lý",
            });
        }

        let newStatus;
        let message;
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
                student: true,
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
        // Cập nhật trạng thái yêu cầu
        const updatedRequest = await prisma.studentMedication.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                updatedAt: new Date(),
            },
            include: {
                student: true,
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
            if (medicationRequest.parent && medicationRequest.parent.user) {
                await prisma.notification.create({
                    data: {
                        userId: medicationRequest.parent.user.id,
                        title: `Yêu cầu thuốc - ${medicationRequest.name}`,
                        message: `Yêu cầu thuốc ${
                            medicationRequest.name
                        } cho học sinh ${
                            medicationRequest.student.fullName
                        } đã được ${
                            action === "APPROVE" ? "phê duyệt" : "từ chối"
                        }. ${notes ? `Ghi chú: ${notes}` : ""}`,
                        type: "medication_request",
                        status: "SENT",
                        sentAt: new Date(),
                    },
                });
            }
        } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
        }
        // Gửi thông báo cho phụ huynh
        try {
            if (medicationRequest.parent && medicationRequest.parent.user) {
                await prisma.notification.create({
                    data: {
                        userId: medicationRequest.parent.user.id,
                        title: `Yêu cầu thuốc - ${medicationRequest.name}`,
                        message: `Yêu cầu thuốc ${
                            medicationRequest.name
                        } cho học sinh ${
                            medicationRequest.student.fullName
                        } đã được ${
                            action === "APPROVE" ? "phê duyệt" : "từ chối"
                        }. ${notes ? `Ghi chú: ${notes}` : ""}`,
                        type: "medication_request",
                        status: "SENT",
                        sentAt: new Date(),
                    },
                });
            }
        } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
        }

        res.json({
            success: true,
            data: {
                id: updatedRequest.id,
                status: updatedRequest.status,
                studentName: updatedRequest.student.fullName,
                parentName: updatedRequest.parent?.user?.fullName || "N/A",
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
            details: error.message,
        });
    }
        res.json({
            success: true,
            data: {
                id: updatedRequest.id,
                status: updatedRequest.status,
                studentName: updatedRequest.student.fullName,
                parentName: updatedRequest.parent?.user?.fullName || "N/A",
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
            details: error.message,
        });
    }
};

// Lấy thống kê yêu cầu thuốc
export const getMedicationRequestStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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
    try {
        const { requestId } = req.params;

        // Kiểm tra xem user có phải là nurse không
        if (!req.user.nurseProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là y tá để thực hiện hành động này",
            });
        }
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
                student: true,
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
        const medicationRequest = await prisma.studentMedication.findUnique({
            where: { id: requestId },
            include: {
                student: true,
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
        if (!medicationRequest) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy yêu cầu thuốc",
            });
        }

        const formattedRequest = {
            id: medicationRequest.id,
            studentId: medicationRequest.studentId,
            studentName: medicationRequest.student.fullName,
            studentEmail: null, // Email is not available in Student model
            studentGrade: medicationRequest.student.class,
            parentId: medicationRequest.parentId,
            parentName: medicationRequest.parent.user.fullName,
            parentEmail: medicationRequest.parent.user.email,
            parentPhone: medicationRequest.parent.user.phone,
            // medicationId: medicationRequest.medicationId, // KHÔNG CÓ
            medicationName: medicationRequest.name,
            medicationDescription: medicationRequest.description,
            medicationType: medicationRequest.type,
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
        const formattedRequest = {
            id: medicationRequest.id,
            studentId: medicationRequest.studentId,
            studentName: medicationRequest.student.fullName,
            studentEmail: null, // Email is not available in Student model
            studentGrade: medicationRequest.student.class,
            parentId: medicationRequest.parentId,
            parentName: medicationRequest.parent.user.fullName,
            parentEmail: medicationRequest.parent.user.email,
            parentPhone: medicationRequest.parent.user.phone,
            // medicationId: medicationRequest.medicationId, // KHÔNG CÓ
            medicationName: medicationRequest.name,
            medicationDescription: medicationRequest.description,
            medicationType: medicationRequest.type,
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
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
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
    try {
        const meds = await prisma.studentMedication.findMany({
            where: { status: "APPROVED" },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
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
                        fullName: true,
                        grade: true,
                        class: true,
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
                        fullName: true,
                        grade: true,
                        class: true,
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
                    studentName: item.student.fullName,
                    studentEmail: null, // Email is not available in Student model
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
                    customTimes: item.customTimes,
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
                const treatment = {
                    id: item.id,
                    studentId: item.student.id,
                    studentName: item.student.fullName,
                    studentEmail: null, // Email is not available in Student model
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
                    customTimes: item.customTimes,
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
                        `Thuốc phụ huynh gửi sắp hết: ${treatment.medication.stockQuantity} ${treatment.medication.unit}`
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
                    treatment.warnings.push("Thuốc phụ huynh gửi đã hết hạn");
                }
                if (treatment.todayDosage >= treatment.dailyLimit) {
                    treatment.warnings.push("Đã đủ liều dùng hôm nay");
                }
                // Thêm cảnh báo
                if (treatment.medication.stockStatus === "low_stock") {
                    treatment.warnings.push(
                        `Thuốc phụ huynh gửi sắp hết: ${treatment.medication.stockQuantity} ${treatment.medication.unit}`
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
                    treatment.warnings.push("Thuốc phụ huynh gửi đã hết hạn");
                }
                if (treatment.todayDosage >= treatment.dailyLimit) {
                    treatment.warnings.push("Đã đủ liều dùng hôm nay");
                }

                return treatment;
            })
        );
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
                administeredToday: formatted.filter((t) => t.todayDosage > 0)
                    .length,
            },
        });
    } catch (error) {
        console.error("Error fetching student treatments:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách điều trị",
        });
    }
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
                administeredToday: formatted.filter((t) => t.todayDosage > 0)
                    .length,
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
        // Validation
        if (!studentMedicationId) {
            return res.status(400).json({
                success: false,
                error: "Thiếu ID đơn thuốc học sinh",
            });
        }

        // Xây dựng điều kiện tìm kiếm
        const whereClause = { studentMedicationId };
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
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
            },
            orderBy: { givenAt: "desc" },
            take: parseInt(limit),
        });
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
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
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
            studentName: log.student?.fullName || "N/A",
            formattedTime: new Date(log.givenAt).toLocaleString("vi-VN"),
            formattedDate: new Date(log.givenAt).toLocaleDateString("vi-VN"),
        }));
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
            studentName: log.student?.fullName || "N/A",
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
        if (!dosageGiven) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập liều dùng thực tế",
            });
        }

        // Lấy thông tin chi tiết đơn thuốc từ phụ huynh
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id: studentMedicationId },
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
            },
        });
        // Lấy thông tin chi tiết đơn thuốc từ phụ huynh
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id: studentMedicationId },
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
            },
        });

        if (!studentMedication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy đơn thuốc của học sinh",
            });
        }
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
        if (studentMedication.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                error: "Đơn thuốc chưa được phê duyệt hoặc đã bị từ chối",
            });
        }

        // Kiểm tra số lượng thuốc phụ huynh gửi
        const qty = parseInt(quantityUsed);
        if (studentMedication.stockQuantity < qty) {
            return res.status(400).json({
                success: false,
                error: `Số lượng thuốc phụ huynh gửi không đủ. Hiện có: ${studentMedication.stockQuantity} ${studentMedication.unit}, cần: ${qty} ${studentMedication.unit}`,
                currentStock: studentMedication.stockQuantity,
                requestedQuantity: qty,
            });
        }
        // Kiểm tra số lượng thuốc phụ huynh gửi
        const qty = parseInt(quantityUsed);
        if (studentMedication.stockQuantity < qty) {
            return res.status(400).json({
                success: false,
                error: `Số lượng thuốc phụ huynh gửi không đủ. Hiện có: ${studentMedication.stockQuantity} ${studentMedication.unit}, cần: ${qty} ${studentMedication.unit}`,
                currentStock: studentMedication.stockQuantity,
                requestedQuantity: qty,
            });
        }

        // Lấy log cấp phát hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        // Lấy log cấp phát hôm nay
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

        // Validate giờ cấp phát theo customTimes (cho phép lệch 10 phút)
        if (
            studentMedication.customTimes &&
            studentMedication.customTimes.length > 0
        ) {
            const now = administrationTime
                ? new Date(administrationTime)
                : new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const ALLOWED_DIFF = 10;
        // Validate giờ cấp phát theo customTimes (cho phép lệch 10 phút)
        if (
            studentMedication.customTimes &&
            studentMedication.customTimes.length > 0
        ) {
            const now = administrationTime
                ? new Date(administrationTime)
                : new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const ALLOWED_DIFF = 10;

            // Tìm customTime hợp lệ
            const matchedTime = studentMedication.customTimes.find((time) => {
                const [h, m] = time.split(":").map(Number);
                const scheduledMinutes = h * 60 + m;
                return Math.abs(nowMinutes - scheduledMinutes) <= ALLOWED_DIFF;
            });
            // Tìm customTime hợp lệ
            const matchedTime = studentMedication.customTimes.find((time) => {
                const [h, m] = time.split(":").map(Number);
                const scheduledMinutes = h * 60 + m;
                return Math.abs(nowMinutes - scheduledMinutes) <= ALLOWED_DIFF;
            });

            if (!matchedTime) {
                return res.status(400).json({
                    success: false,
                    error: `Chỉ được cấp phát vào các khung giờ đã lên lịch: ${studentMedication.customTimes.join(
                        ", "
                    )} (cho phép lệch tối đa ${ALLOWED_DIFF} phút)`,
                });
            }
            if (!matchedTime) {
                return res.status(400).json({
                    success: false,
                    error: `Chỉ được cấp phát vào các khung giờ đã lên lịch: ${studentMedication.customTimes.join(
                        ", "
                    )} (cho phép lệch tối đa ${ALLOWED_DIFF} phút)`,
                });
            }

            // Kiểm tra đã cấp phát cho customTime này chưa
            const alreadyGiven = todayAdministrations.some((log) => {
                const logDate = new Date(log.givenAt);
                const logMinutes =
                    logDate.getHours() * 60 + logDate.getMinutes();
                const [h, m] = matchedTime.split(":").map(Number);
                const scheduledMinutes = h * 60 + m;
                return Math.abs(logMinutes - scheduledMinutes) <= ALLOWED_DIFF;
            });
            // Kiểm tra đã cấp phát cho customTime này chưa
            const alreadyGiven = todayAdministrations.some((log) => {
                const logDate = new Date(log.givenAt);
                const logMinutes =
                    logDate.getHours() * 60 + logDate.getMinutes();
                const [h, m] = matchedTime.split(":").map(Number);
                const scheduledMinutes = h * 60 + m;
                return Math.abs(logMinutes - scheduledMinutes) <= ALLOWED_DIFF;
            });

            if (alreadyGiven) {
                return res.status(400).json({
                    success: false,
                    error: `Đã cấp phát cho khung giờ ${matchedTime} hôm nay rồi!`,
                });
            }
        }

        // Thực hiện giao dịch để đảm bảo tính nhất quán
        const result = await prisma.$transaction(async (tx) => {
            // Cập nhật số lượng thuốc phụ huynh gửi
            const updatedStudentMedication = await tx.studentMedication.update({
                where: { id: studentMedicationId },
                data: { stockQuantity: { decrement: qty } },
            });

            // Trong transaction ghi log cấp phát thuốc:
            const administrationLog =
                await tx.medicationAdministrationLog.create({
                    data: {
                        studentMedicationId,
                        studentId: studentMedication.studentId,
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
            // Trong transaction ghi log cấp phát thuốc:
            const administrationLog =
                await tx.medicationAdministrationLog.create({
                    data: {
                        studentMedicationId,
                        studentId: studentMedication.studentId,
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

            return { updatedStudentMedication, administrationLog };
        });

        // Chuẩn bị thông tin phản hồi
        const response = {
            success: true,
            message: "Đã ghi nhận cấp phát thuốc thành công",
            data: {
                studentName: studentMedication.student.fullName,
                medicationName: studentMedication.name,
                dosageGiven: dosageGiven,
                quantityUsed: qty,
                remainingStock: result.updatedStudentMedication.stockQuantity,
                administrationTime: result.administrationLog.givenAt,
                nurseName: result.administrationLog.nurse.user.fullName,
                notes: notes,
            },
            warnings: [],
        };

        // Thêm cảnh báo nếu thuốc phụ huynh gửi sắp hết
        if (result.updatedStudentMedication.stockQuantity <= 5) {
            response.warnings.push(
                `Cảnh báo: Thuốc ${studentMedication.name} chỉ còn ${result.updatedStudentMedication.stockQuantity} ${studentMedication.unit} từ phụ huynh`
            );
        }
        // Thêm cảnh báo nếu thuốc phụ huynh gửi sắp hết
        if (result.updatedStudentMedication.stockQuantity <= 5) {
            response.warnings.push(
                `Cảnh báo: Thuốc ${studentMedication.name} chỉ còn ${result.updatedStudentMedication.stockQuantity} ${studentMedication.unit} từ phụ huynh`
            );
        }

        // Sau khi cấp phát thành công, xóa matchedTime khỏi todaySchedules
        if (
            studentMedication.customTimes &&
            studentMedication.customTimes.length > 0
        ) {
            const now = administrationTime
                ? new Date(administrationTime)
                : new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const ALLOWED_DIFF = 10;
            const matchedTime = studentMedication.customTimes.find((time) => {
                const [h, m] = time.split(":").map(Number);
                const scheduledMinutes = h * 60 + m;
                return Math.abs(nowMinutes - scheduledMinutes) <= ALLOWED_DIFF;
            });
            if (matchedTime) {
                // Xóa matchedTime khỏi todaySchedules
                const updatedTodaySchedules = (
                    studentMedication.todaySchedules || []
                ).filter((time) => time !== matchedTime);
                await prisma.studentMedication.update({
                    where: { id: studentMedicationId },
                    data: { todaySchedules: updatedTodaySchedules },
                });
            }
        }
        // Sau khi cấp phát thành công, xóa matchedTime khỏi todaySchedules
        if (
            studentMedication.customTimes &&
            studentMedication.customTimes.length > 0
        ) {
            const now = administrationTime
                ? new Date(administrationTime)
                : new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const ALLOWED_DIFF = 10;
            const matchedTime = studentMedication.customTimes.find((time) => {
                const [h, m] = time.split(":").map(Number);
                const scheduledMinutes = h * 60 + m;
                return Math.abs(nowMinutes - scheduledMinutes) <= ALLOWED_DIFF;
            });
            if (matchedTime) {
                // Xóa matchedTime khỏi todaySchedules
                const updatedTodaySchedules = (
                    studentMedication.todaySchedules || []
                ).filter((time) => time !== matchedTime);
                await prisma.studentMedication.update({
                    where: { id: studentMedicationId },
                    data: { todaySchedules: updatedTodaySchedules },
                });
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
    try {
        const { campaignId } = req.params;

        // Kiểm tra campaign có tồn tại không
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
        });
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
        // Lấy số học sinh đã đồng ý tiêm chủng
        const consentedStudents = await prisma.vaccinationConsent.count({
            where: {
                campaignId: campaignId,
                consent: true,
            },
        });

        // Lấy số học sinh đã được tiêm chủng
        // Lấy số học sinh đã được tiêm chủng

        const vaccinatedStudents = await prisma.vaccinationRecord.count({
            where: {
                campaignId: campaignId,
                status: "COMPLETED",
            },
        });
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
                student: true,
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
                studentName: vaccination.student.fullName,
                nurseName: vaccination.nurse.user.fullName,
                administeredDate: vaccination.administeredDate,
                batchNumber: vaccination.batchNumber,
                dose: vaccination.dose,
            })
        );
        const formattedRecentVaccinations = recentVaccinations.map(
            (vaccination) => ({
                id: vaccination.id,
                studentName: vaccination.student.fullName,
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
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
                vaccine: true,
            },
            orderBy: { administeredDate: "desc" },
        });
        // Lấy vaccine và phác đồ mũi tiêm
        let vaccine = null;
        if (records.length > 0 && records[0].vaccine) {
            vaccine = {
                ...records[0].vaccine,
                doseSchedules: records[0].vaccine.doseSchedules || [],
            };
        }
        const reports = records.map((rec) => ({
            id: rec.id,
            studentId: rec.studentId,
            studentCode: rec.student?.studentCode,
            studentName: rec.student?.fullName,
            grade: rec.student?.grade,
            class: rec.student?.class,
            administeredDate: rec.administeredDate,
            doseType: rec.doseType,
            doseOrder: rec.doseOrder,
            sideEffects: rec.sideEffects,
            reaction: rec.reaction,
            followUpRequired: rec.followUpRequired,
            followUpDate: rec.followUpDate,
            additionalNotes: rec.notes,
            status: rec.status,
            batchNumber: rec.batchNumber,
        }));
        res.json({ success: true, data: { reports, vaccine } });
    } catch (error) {
        console.error("Error getting vaccination report:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy báo cáo tiêm chủng",
        });
    }
    try {
        const { campaignId } = req.params;
        // Lấy tất cả vaccinationRecord của campaign này
        const records = await prisma.vaccinationRecord.findMany({
            where: { campaignId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
                vaccine: true,
            },
            orderBy: { administeredDate: "desc" },
        });
        // Lấy vaccine và phác đồ mũi tiêm
        let vaccine = null;
        if (records.length > 0 && records[0].vaccine) {
            vaccine = {
                ...records[0].vaccine,
                doseSchedules: records[0].vaccine.doseSchedules || [],
            };
        }
        const reports = records.map((rec) => ({
            id: rec.id,
            studentId: rec.studentId,
            studentCode: rec.student?.studentCode,
            studentName: rec.student?.fullName,
            grade: rec.student?.grade,
            class: rec.student?.class,
            administeredDate: rec.administeredDate,
            doseType: rec.doseType,
            doseOrder: rec.doseOrder,
            sideEffects: rec.sideEffects,
            reaction: rec.reaction,
            followUpRequired: rec.followUpRequired,
            followUpDate: rec.followUpDate,
            additionalNotes: rec.notes,
            status: rec.status,
            batchNumber: rec.batchNumber,
        }));
        res.json({ success: true, data: { reports, vaccine } });
    } catch (error) {
        console.error("Error getting vaccination report:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy báo cáo tiêm chủng",
        });
    }
};

// Lấy danh sách lịch cấp phát thuốc
export const getScheduledTreatments = async (req, res) => {
    try {
        // Lấy danh sách các đơn thuốc đã được approve có customTimes
        const treatments = await prisma.studentMedication.findMany({
            where: {
                status: "APPROVED",
                customTimes: {
                    isEmpty: false,
                },
                treatmentStatus: "ONGOING",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
                parent: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
                medicationAdministrationLogs: true, // Lấy tất cả log để lọc
            },
        });
    try {
        // Lấy danh sách các đơn thuốc đã được approve có customTimes
        const treatments = await prisma.studentMedication.findMany({
            where: {
                status: "APPROVED",
                customTimes: {
                    isEmpty: false,
                },
                treatmentStatus: "ONGOING",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
                parent: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
                medicationAdministrationLogs: true, // Lấy tất cả log để lọc
            },
        });

        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const ALLOWED_DIFF = 10; // phút
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const ALLOWED_DIFF = 10; // phút
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Lọc các khung giờ chưa cấp phát hôm nay
        const scheduledTreatmentsFiltered = treatments.map((treatment) => {
            const remainingTimes = treatment.todaySchedules || [];
            return {
                ...treatment,
                todaySchedules: remainingTimes,
            };
        });
        // Lọc các khung giờ chưa cấp phát hôm nay
        const scheduledTreatmentsFiltered = treatments.map((treatment) => {
            const remainingTimes = treatment.todaySchedules || [];
            return {
                ...treatment,
                todaySchedules: remainingTimes,
            };
        });

        // KHÔNG filter theo todaySchedules.length > 0 nữa, trả về toàn bộ
        const scheduledTreatments = scheduledTreatmentsFiltered.map(
            (treatment) => {
                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const upcomingTimes = (treatment.todaySchedules || [])
                    .map((time) => {
                        const [hours, minutes] = time.split(":").map(Number);
                        const timeInMinutes = hours * 60 + minutes;
                        const diff = timeInMinutes - currentTime;
                        return { time, diff, timeInMinutes };
                    })
                    .sort((a, b) => a.timeInMinutes - b.timeInMinutes);
        // KHÔNG filter theo todaySchedules.length > 0 nữa, trả về toàn bộ
        const scheduledTreatments = scheduledTreatmentsFiltered.map(
            (treatment) => {
                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const upcomingTimes = (treatment.todaySchedules || [])
                    .map((time) => {
                        const [hours, minutes] = time.split(":").map(Number);
                        const timeInMinutes = hours * 60 + minutes;
                        const diff = timeInMinutes - currentTime;
                        return { time, diff, timeInMinutes };
                    })
                    .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

                const timeUntilNext = upcomingTimes[0];
                const timeUntilNext = upcomingTimes[0];

                return {
                    id: treatment.id,
                    studentId: treatment.student.id,
                    studentName: treatment.student.fullName,
                    studentCode: treatment.student.studentCode,
                    grade: treatment.student.grade,
                    class: treatment.student.class,
                    parentName: treatment.parent?.user?.fullName || "N/A",
                    medication: {
                        name: treatment.name,
                        dosage: treatment.dosage,
                        unit: treatment.unit,
                        stockQuantity: treatment.medication?.stockQuantity || 0,
                        stockStatus:
                            treatment.medication?.stockQuantity > 10
                                ? "available"
                                : treatment.medication?.stockQuantity > 0
                                ? "low_stock"
                                : "out_of_stock",
                    },
                    todaySchedules: treatment.todaySchedules,
                    frequency: treatment.frequency,
                    dosage: treatment.dosage,
                    canAdminister: true, // Có thể cấp phát nếu có todaySchedules
                    treatmentStatus: "ONGOING",
                    timeUntilNext: timeUntilNext
                        ? {
                              time: timeUntilNext.time,
                              hours: Math.floor(timeUntilNext.diff / 60),
                              minutes: timeUntilNext.diff % 60,
                          }
                        : null,
                };
            }
        );
                return {
                    id: treatment.id,
                    studentId: treatment.student.id,
                    studentName: treatment.student.fullName,
                    studentCode: treatment.student.studentCode,
                    grade: treatment.student.grade,
                    class: treatment.student.class,
                    parentName: treatment.parent?.user?.fullName || "N/A",
                    medication: {
                        name: treatment.name,
                        dosage: treatment.dosage,
                        unit: treatment.unit,
                        stockQuantity: treatment.medication?.stockQuantity || 0,
                        stockStatus:
                            treatment.medication?.stockQuantity > 10
                                ? "available"
                                : treatment.medication?.stockQuantity > 0
                                ? "low_stock"
                                : "out_of_stock",
                    },
                    todaySchedules: treatment.todaySchedules,
                    frequency: treatment.frequency,
                    dosage: treatment.dosage,
                    canAdminister: true, // Có thể cấp phát nếu có todaySchedules
                    treatmentStatus: "ONGOING",
                    timeUntilNext: timeUntilNext
                        ? {
                              time: timeUntilNext.time,
                              hours: Math.floor(timeUntilNext.diff / 60),
                              minutes: timeUntilNext.diff % 60,
                          }
                        : null,
                };
            }
        );

        // Tính toán thông báo sắp tới (trong vòng 30 phút)
        const upcomingNotifications = scheduledTreatments
            .filter((treatment) => {
                if (
                    !treatment.todaySchedules ||
                    treatment.todaySchedules.length === 0
                )
                    return false;
        // Tính toán thông báo sắp tới (trong vòng 30 phút)
        const upcomingNotifications = scheduledTreatments
            .filter((treatment) => {
                if (
                    !treatment.todaySchedules ||
                    treatment.todaySchedules.length === 0
                )
                    return false;

                return treatment.todaySchedules.some((time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    const timeInMinutes = hours * 60 + minutes;
                    const diff = timeInMinutes - currentTime;
                    return diff > 0 && diff <= 30; // 30 phút tới
                });
            })
            .map((treatment) => {
                const dueTimes = treatment.todaySchedules.filter((time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    const timeInMinutes = hours * 60 + minutes;
                    const diff = timeInMinutes - currentTime;
                    return diff > 0 && diff <= 30;
                });
                return treatment.todaySchedules.some((time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    const timeInMinutes = hours * 60 + minutes;
                    const diff = timeInMinutes - currentTime;
                    return diff > 0 && diff <= 30; // 30 phút tới
                });
            })
            .map((treatment) => {
                const dueTimes = treatment.todaySchedules.filter((time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    const timeInMinutes = hours * 60 + minutes;
                    const diff = timeInMinutes - currentTime;
                    return diff > 0 && diff <= 30;
                });

                // Sắp xếp thời gian theo thứ tự
                dueTimes.sort((a, b) => {
                    const timeA = a.split(":").map(Number);
                    const timeB = b.split(":").map(Number);
                    return (
                        timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
                    );
                });
                // Sắp xếp thời gian theo thứ tự
                dueTimes.sort((a, b) => {
                    const timeA = a.split(":").map(Number);
                    const timeB = b.split(":").map(Number);
                    return (
                        timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
                    );
                });

                return {
                    studentName: treatment.studentName,
                    medicationName: treatment.medication.name,
                    dosage: treatment.dosage,
                    scheduledTime: dueTimes.join(", "),
                    treatmentId: treatment.id,
                    times: dueTimes, // Thêm thông tin chi tiết về thời gian
                };
            });
                return {
                    studentName: treatment.studentName,
                    medicationName: treatment.medication.name,
                    dosage: treatment.dosage,
                    scheduledTime: dueTimes.join(", "),
                    treatmentId: treatment.id,
                    times: dueTimes, // Thêm thông tin chi tiết về thời gian
                };
            });

        res.json({
            success: true,
            data: scheduledTreatments,
            upcoming: upcomingNotifications,
        });
    } catch (error) {
        console.error("Error fetching scheduled treatments:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách lịch cấp phát thuốc",
        });
    }
        res.json({
            success: true,
            data: scheduledTreatments,
            upcoming: upcomingNotifications,
        });
    } catch (error) {
        console.error("Error fetching scheduled treatments:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách lịch cấp phát thuốc",
        });
    }
};

// Lên lịch cấp phát thuốc
export const scheduleTreatment = async (req, res) => {
    try {
        const { studentMedicationId } = req.params;
        const {
            scheduledTime,
            frequency,
            customTimes,
            isRecurring,
            recurringDays,
            notes,
        } = req.body;
    try {
        const { studentMedicationId } = req.params;
        const {
            scheduledTime,
            frequency,
            customTimes,
            isRecurring,
            recurringDays,
            notes,
        } = req.body;

        // Kiểm tra studentMedication có tồn tại và đã được approve
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id: studentMedicationId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
            },
        });
        // Kiểm tra studentMedication có tồn tại và đã được approve
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id: studentMedicationId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
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
        if (!studentMedication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy đơn thuốc của học sinh",
            });
        }

        if (studentMedication.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                error: "Đơn thuốc chưa được phê duyệt",
            });
        }
        if (studentMedication.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                error: "Đơn thuốc chưa được phê duyệt",
            });
        }

        // Validate và sắp xếp customTimes
        let validatedCustomTimes = [];
        if (customTimes && Array.isArray(customTimes)) {
            // Lọc bỏ các giá trị rỗng và validate format
            validatedCustomTimes = customTimes
                .filter((time) => time && time.trim() !== "")
                .map((time) => {
                    // Đảm bảo format HH:MM
                    const [hours, minutes] = time.split(":").map(Number);
                    if (
                        hours >= 0 &&
                        hours <= 23 &&
                        minutes >= 0 &&
                        minutes <= 59
                    ) {
                        return `${hours.toString().padStart(2, "0")}:${minutes
                            .toString()
                            .padStart(2, "0")}`;
                    }
                    return null;
                })
                .filter((time) => time !== null)
                .sort((a, b) => {
                    const timeA = a.split(":").map(Number);
                    const timeB = b.split(":").map(Number);
                    return (
                        timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
                    );
                });
        }

        // Cập nhật customTimes cho studentMedication
        const updatedMedication = await prisma.studentMedication.update({
            where: { id: studentMedicationId },
            data: {
                customTimes: validatedCustomTimes,
                frequency: frequency || studentMedication.frequency,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        grade: true,
                        class: true,
                    },
                },
            },
        });

        // Tạo notification cho y tá
        const nurses = await prisma.schoolNurse.findMany({
            include: { user: true },
        });
        // Tạo notification cho y tá
        const nurses = await prisma.schoolNurse.findMany({
            include: { user: true },
        });

        const timeString =
            customTimes && customTimes.length > 0
                ? customTimes.join(", ")
                : new Date(scheduledTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                  });
        const timeString =
            customTimes && customTimes.length > 0
                ? customTimes.join(", ")
                : new Date(scheduledTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                  });

        for (const nurse of nurses) {
            await prisma.notification.create({
                data: {
                    userId: nurse.userId,
                    title: "Lịch cấp phát thuốc mới",
                    message: `Học sinh ${studentMedication.student.fullName} cần được cấp phát thuốc ${studentMedication.name} vào ${timeString}`,
                    type: "medication",
                    status: "SENT",
                },
            });
        }
        for (const nurse of nurses) {
            await prisma.notification.create({
                data: {
                    userId: nurse.userId,
                    title: "Lịch cấp phát thuốc mới",
                    message: `Học sinh ${studentMedication.student.fullName} cần được cấp phát thuốc ${studentMedication.name} vào ${timeString}`,
                    type: "medication",
                    status: "SENT",
                },
            });
        }

        res.json({
            success: true,
            data: updatedMedication,
            message: "Đã lên lịch cấp phát thuốc thành công",
        });
    } catch (error) {
        console.error("Error scheduling treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lên lịch cấp phát thuốc",
        });
    }
        res.json({
            success: true,
            data: updatedMedication,
            message: "Đã lên lịch cấp phát thuốc thành công",
        });
    } catch (error) {
        console.error("Error scheduling treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lên lịch cấp phát thuốc",
        });
    }
};

// Hoàn thành lịch cấp phát
export const completeScheduledTreatment = async (req, res) => {
    try {
        const { id } = req.params;
    try {
        const { id } = req.params;

        // Cập nhật customTimes để xóa thời gian đã hoàn thành
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id },
        });
        // Cập nhật customTimes để xóa thời gian đã hoàn thành
        const studentMedication = await prisma.studentMedication.findUnique({
            where: { id },
        });

        if (!studentMedication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy đơn thuốc",
            });
        }
        if (!studentMedication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy đơn thuốc",
            });
        }

        // Xóa thời gian đã hoàn thành khỏi customTimes
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        // Xóa thời gian đã hoàn thành khỏi customTimes
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

        // Tìm thời gian gần nhất với thời gian hiện tại để xóa
        let timeToRemove = null;
        let minDiff = Infinity;
        // Tìm thời gian gần nhất với thời gian hiện tại để xóa
        let timeToRemove = null;
        let minDiff = Infinity;

        (studentMedication.todaySchedules || []).forEach((time) => {
            const [hours, minutes] = time.split(":").map(Number);
            const timeInMinutes = hours * 60 + minutes;
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
            const diff = Math.abs(timeInMinutes - currentTimeInMinutes);
        (studentMedication.todaySchedules || []).forEach((time) => {
            const [hours, minutes] = time.split(":").map(Number);
            const timeInMinutes = hours * 60 + minutes;
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
            const diff = Math.abs(timeInMinutes - currentTimeInMinutes);

            if (diff < minDiff && diff <= 30) {
                // Chỉ xóa nếu cách thời gian hiện tại không quá 30 phút
                minDiff = diff;
                timeToRemove = time;
            }
        });

        const updatedTodaySchedules = (
            studentMedication.todaySchedules || []
        ).filter((time) => time !== timeToRemove);

        const updatedMedication = await prisma.studentMedication.update({
            where: { id },
            data: {
                todaySchedules: updatedTodaySchedules,
            },
        });
        const updatedMedication = await prisma.studentMedication.update({
            where: { id },
            data: {
                todaySchedules: updatedTodaySchedules,
            },
        });

        res.json({
            success: true,
            data: updatedMedication,
            message: "Đã hoàn thành lịch cấp phát thuốc",
        });
    } catch (error) {
        console.error("Error completing scheduled treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi hoàn thành lịch cấp phát thuốc",
        });
    }
        res.json({
            success: true,
            data: updatedMedication,
            message: "Đã hoàn thành lịch cấp phát thuốc",
        });
    } catch (error) {
        console.error("Error completing scheduled treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi hoàn thành lịch cấp phát thuốc",
        });
    }
};

// Hủy lịch cấp phát
export const cancelScheduledTreatment = async (req, res) => {
    try {
        const { id } = req.params;
    try {
        const { id } = req.params;

        // Xóa customTimes để hủy lịch
        await prisma.studentMedication.update({
            where: { id },
            data: {
                customTimes: [],
                treatmentStatus: "STOPPED",
            },
        });
        // Xóa customTimes để hủy lịch
        await prisma.studentMedication.update({
            where: { id },
            data: {
                customTimes: [],
                treatmentStatus: "STOPPED",
            },
        });

        res.json({
            success: true,
            message: "Đã hủy lịch cấp phát thuốc",
        });
    } catch (error) {
        console.error("Error canceling scheduled treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi hủy lịch cấp phát thuốc",
        });
    }
        res.json({
            success: true,
            message: "Đã hủy lịch cấp phát thuốc",
        });
    } catch (error) {
        console.error("Error canceling scheduled treatment:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi hủy lịch cấp phát thuốc",
        });
    }
};

// Lấy lịch sử tiêm chủng của học sinh cho một vaccine cụ thể
export const getStudentVaccinationHistory = async (req, res) => {
    try {
        const { studentId, vaccineId } = req.params;
    try {
        const { studentId, vaccineId } = req.params;

        // Lấy tất cả vaccination records của học sinh cho vaccine này
        const vaccinationRecords = await prisma.vaccinationRecord.findMany({
            where: {
                studentId: studentId,
                vaccineId: vaccineId,
            },
            orderBy: [{ doseOrder: "asc" }, { administeredDate: "asc" }],
            select: {
                id: true,
                doseOrder: true,
                doseType: true,
                administeredDate: true,
                doseAmount: true,
                batchNumber: true,
                sideEffects: true,
                reaction: true,
                status: true,
                followUpRequired: true,
                followUpDate: true,
                notes: true,
                createdAt: true,
            },
        });

        res.json({
            success: true,
            data: vaccinationRecords,
        });
    } catch (error) {
        console.error("Error fetching student vaccination history:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy lịch sử tiêm chủng",
        });
    }
};
