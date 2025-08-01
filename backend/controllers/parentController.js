import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Thêm hàm gửi notification nếu thiếu số điện thoại
async function notifyParentToUpdatePhone(user) {
    if (!user.phone) {
        // Kiểm tra đã có notification chưa đọc cùng loại chưa
        const existing = await prisma.notification.findFirst({
            where: {
                userId: user.id,
                type: "update_phone",
                status: { in: ["SENT", "DELIVERED"] },
            },
        });
        if (!existing) {
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    title: "Cập nhật số điện thoại",
                    message:
                        "Vui lòng cập nhật số điện thoại để nhận đầy đủ thông báo từ nhà trường.",
                    type: "update_phone",
                    status: "SENT",
                    sentAt: new Date(),
                },
            });
        }
    }
}

export const getMyChildren = async (req, res) => {
    try {
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }
        // Kiểm tra và gửi notification nếu thiếu số điện thoại
        await notifyParentToUpdatePhone(req.user);

        const parentId = req.user.parentProfile.id;
        console.log("[getMyChildren] parentId:", parentId);

        // Lấy danh sách con và thông tin healthProfile
        const childrenRelations = await prisma.studentParent.findMany({
            where: {
                parentId: parentId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        studentCode: true,
                        class: true,
                        grade: true,
                        healthProfile: true,
                    },
                },
            },
        });

        // Gửi notification nếu có ít nhất một con chưa có healthProfile (chỉ gửi 1 lần)
        // (ĐÃ CHUYỂN LOGIC NÀY SANG LOGIN.JS, KHÔNG LÀM Ở ĐÂY NỮA)

        const children = childrenRelations.map((rel) => ({
            studentId: rel.student.id,
            fullName: rel.student.fullName,
            studentCode: rel.student.studentCode,
            class: rel.student.class,
            grade: rel.student.grade,
        }));

        console.log("[getMyChildren] children response:", children);

        res.json({
            success: true,
            data: children,
        });
    } catch (error) {
        console.error("Error fetching children:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const getHealthProfile = async (req, res) => {
    try {
        console.log("getHealthProfile called with params:", req.params);
        console.log("User data:", req.user);

        const { studentId } = req.params;

        // Check if user has parent profile
        if (!req.user.parentProfile) {
            console.log("No parent profile found for user");
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }

        const parentId = req.user.parentProfile.id;

        // Find student through parent-student relationship
        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId,
            },
            include: {
                student: {
                    include: {
                        healthProfile: true,
                    },
                },
            },
        });

        if (!studentParent) {
            return res.status(404).json({
                success: false,
                error: "Health profile not found or you are not authorized to view it",
            });
        }

        if (!studentParent.student.healthProfile) {
            return res.status(404).json({
                success: false,
                error: "Health profile not found",
            });
        }

        // Transform data to ensure proper format for frontend
        const healthProfile = studentParent.student.healthProfile;

        const transformedHealthProfile = {
            ...healthProfile,
            // Ensure arrays are properly formatted
            allergies: Array.isArray(healthProfile.allergies)
                ? healthProfile.allergies
                : [],
            chronicDiseases: Array.isArray(healthProfile.chronicDiseases)
                ? healthProfile.chronicDiseases
                : [],
            // Ensure other fields are properly formatted
            vision: healthProfile.vision || "",
            hearing: healthProfile.hearing || "",
            height: healthProfile.height || null,
            weight: healthProfile.weight || null,
        };

        // Log for debugging
        console.log("Student Parent:", studentParent);
        console.log("Original Health Profile:", healthProfile);
        console.log("Transformed Health Profile:", transformedHealthProfile);

        res.json({
            success: true,
            data: {
                healthProfile: transformedHealthProfile,
                student: {
                    id: studentParent.student.id,
                    fullName: studentParent.student.fullName,
                    email: studentParent.student.email,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching health profile:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const upsertHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if user has parent profile
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }

        const parentId = req.user.parentProfile.id;
        const {
            allergies,
            chronicDiseases,
            medications,
            treatmentHistory,
            vision,
            hearing,
            height,
            weight,
            notes,
        } = req.body;

        // Validate input data
        if (allergies && !Array.isArray(allergies)) {
            return res.status(400).json({
                success: false,
                error: "Allergies must be an array",
            });
        }

        if (chronicDiseases && !Array.isArray(chronicDiseases)) {
            return res.status(400).json({
                success: false,
                error: "Chronic diseases must be an array",
            });
        }

        // Validate allergy objects
        if (allergies) {
            for (let i = 0; i < allergies.length; i++) {
                const allergy = allergies[i];
                if (
                    !allergy.type ||
                    !allergy.name ||
                    !allergy.level ||
                    !allergy.symptoms
                ) {
                    return res.status(400).json({
                        success: false,
                        error: `Allergy at index ${i} is missing required fields: type, name, level, symptoms`,
                    });
                }
            }
        }

        // Validate chronic disease objects
        if (chronicDiseases) {
            for (let i = 0; i < chronicDiseases.length; i++) {
                const disease = chronicDiseases[i];
                if (
                    !disease.group ||
                    !disease.name ||
                    !disease.level ||
                    !disease.status
                ) {
                    return res.status(400).json({
                        success: false,
                        error: `Chronic disease at index ${i} is missing required fields: group, name, onsetDate, level, status`,
                    });
                }
            }
        }

        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId,
            },
            include: {
                student: true,
            },
        });

        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to update this health profile",
            });
        }

        // Validation cơ bản cho các trường số
        if (vision !== null && vision !== undefined && vision !== "") {
            const visionNum = parseFloat(vision);
            if (isNaN(visionNum) || visionNum < 0) {
                return res.status(400).json({
                    success: false,
                    error: "Thị lực phải là số không âm",
                });
            }
        }

        if (hearing !== null && hearing !== undefined && hearing !== "") {
            const hearingNum = parseFloat(hearing);
            if (isNaN(hearingNum) || hearingNum < 0) {
                return res.status(400).json({
                    success: false,
                    error: "Thính lực phải là số không âm",
                });
            }
        }

        if (height !== null && height !== undefined && height !== "") {
            const heightNum = parseFloat(height);
            if (isNaN(heightNum) || heightNum <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Chiều cao phải là số dương",
                });
            }
        }

        if (weight !== null && weight !== undefined && weight !== "") {
            const weightNum = parseFloat(weight);
            if (isNaN(weightNum) || weightNum <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Cân nặng phải là số dương",
                });
            }
        }
        // Transform data for storage
        const healthProfileData = {
            vision: vision || "",
            hearing: hearing || "",
            height: height ? parseFloat(height) : "",
            weight: weight ? parseFloat(weight) : "",
            allergies: allergies || [],
            chronicDiseases: chronicDiseases || [],
            medications: medications || [],
            treatmentHistory: treatmentHistory || "",
            notes: notes || "",
            lastUpdatedBy: req.user.id,
        };

        const healthProfile = await prisma.healthProfile.upsert({
            where: {
                studentId: studentId,
            },
            update: healthProfileData,
            create: {
                studentId: studentId,
                ...healthProfileData,
            },
        });

        // Log the update for audit
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: "update",
                resource: "health_profile",
                resourceId: healthProfile.id,
                details: {
                    studentId: studentId,
                    updatedFields: Object.keys(healthProfileData).filter(
                        (key) => healthProfileData[key] !== null
                    ),
                },
            },
        });

        res.json({
            success: true,
            data: healthProfile,
            message: "Health profile updated successfully",
        });
    } catch (error) {
        console.error("Error upserting health profile:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const deleteHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if user has parent profile
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }

        const parentId = req.user.parentProfile.id;

        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId,
            },
            include: {
                student: true,
            },
        });

        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to delete this health profile",
            });
        }

        await prisma.healthProfile.delete({
            where: {
                studentId: studentId,
            },
        });

        res.json({
            success: true,
            message: "Health profile deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting health profile:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// --- SỬA HÀM YÊU CẦU THUỐC ---
export const requestMedication = async (req, res) => {
    try {
        console.log("[requestMedication] Body:", req.body);
        console.log("[requestMedication] File:", req.file);
        const { studentId } = req.params;
        const {
            medicationName,
            type,
            dosage,
            frequency,
            instructions,
            startDate,
            endDate,
            description,
            unit,
            manufacturer,
            stockQuantity,
            usageNote,
            customTimes, // nhận customTimes từ request
        } = req.body;
        console.log("[requestMedication] Input:", {
            studentId,
            medicationName,
            type,
            dosage,
            frequency,
            instructions,
            startDate,
            endDate,
            description,
            unit,
            manufacturer,
            stockQuantity,
            usageNote,
        });

        if (
            !medicationName ||
            !dosage ||
            !frequency ||
            !startDate ||
            !unit ||
            !type
        ) {
            return res.status(400).json({
                success: false,
                error: "Thiếu thông tin bắt buộc: medicationName, dosage, frequency, startDate, unit, type",
            });
        }
        if (stockQuantity !== undefined && isNaN(Number(stockQuantity))) {
            return res.status(400).json({
                success: false,
                error: "Số lượng thuốc (stockQuantity) phải là số",
            });
        }
        let parsedStartDate = null;
        let parsedEndDate = null;
        try {
            parsedStartDate = new Date(startDate);
            if (endDate) parsedEndDate = new Date(endDate);
            if (
                isNaN(parsedStartDate.getTime()) ||
                (endDate && isNaN(parsedEndDate.getTime()))
            ) {
                throw new Error();
            }
        } catch {
            return res.status(400).json({
                success: false,
                error: "Ngày bắt đầu/kết thúc không hợp lệ",
            });
        }
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }
        // Validate customTimes - linh hoạt hơn cho thực tế
        if (customTimes) {
            let timesArr;
            try {
                timesArr = Array.isArray(customTimes)
                    ? customTimes
                    : JSON.parse(customTimes);
            } catch {
                return res.status(400).json({
                    success: false,
                    error: 'customTimes phải là mảng giờ hợp lệ (VD: ["08:00", "12:30"])',
                });
            }
            const isValid = timesArr.every((t) => {
                // t: "HH:mm"
                if (!t || typeof t !== "string") return false;
                const [h, m] = t.split(":").map(Number);
                if (isNaN(h) || isNaN(m)) return false;
                // Validation linh hoạt: 00:00 - 23:59
                return h >= 0 && h <= 23 && m >= 0 && m <= 59;
            });
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    error: "customTimes phải có định dạng giờ hợp lệ (HH:mm)",
                });
            }
        }
        const parentId = req.user.parentProfile.id;
        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId,
            },
        });
        if (!studentParent) {
            console.log(
                "[requestMedication] Không tìm thấy studentParent hoặc không đúng quyền"
            );
            return res.status(403).json({
                success: false,
                error: "You are not authorized to request medication for this student",
            });
        }
        let image = null;
        if (req.file) {
            console.log(
                "[requestMedication] Đã nhận file ảnh:",
                req.file.filename
            );
            image = `/api/uploads/medicine-images/${req.file.filename}`;
        } else {
            console.log("[requestMedication] Không nhận được file ảnh");
        }
        // Lưu thông tin thuốc trực tiếp vào StudentMedication
        try {
            const studentMedication = await prisma.studentMedication.create({
                data: {
                    studentId,
                    parentId,
                    name: medicationName,
                    description: description || "",
                    type,
                    dosage,
                    unit,
                    manufacturer: manufacturer || null,
                    frequency,
                    customTimes: customTimes ? JSON.parse(customTimes) : [], // lịch mẫu cố định mỗi ngày
                    todaySchedules: customTimes ? JSON.parse(customTimes) : [], // lịch còn lại trong ngày, khởi tạo bằng customTimes
                    instructions: instructions || null,
                    status: "PENDING_APPROVAL",
                    treatmentStatus: "ONGOING",
                    startDate: parsedStartDate,
                    endDate: parsedEndDate || null,
                    image,
                    stockQuantity:
                        stockQuantity !== undefined ? Number(stockQuantity) : 1,
                    usageNote: usageNote || null,
                },
            });
            console.log(
                "[requestMedication] Đã tạo studentMedication:",
                studentMedication
            );
            // Gửi notification cho tất cả y tá
            const nurses = await prisma.schoolNurse.findMany({
                include: { user: true },
            });
            // Lấy tên học sinh
            const student = await prisma.student.findUnique({
                where: { id: studentId },
            });
            const studentName = student?.user?.fullName || "học sinh";
            for (const nurse of nurses) {
                await prisma.notification.create({
                    data: {
                        userId: nurse.userId,
                        title: "Yêu cầu gửi thuốc mới",
                        message: `Có yêu cầu gửi thuốc mới cho học sinh ${studentName} từ phụ huynh. Thuốc: ${medicationName}, liều lượng: ${dosage} ${
                            unit || ""
                        }. Vui lòng kiểm tra và xác nhận!`,
                        type: "medication",
                        status: "SENT",
                        sentAt: new Date(),
                    },
                });
            }
            res.json({
                success: true,
                data: studentMedication,
                message: "Medication request submitted successfully",
            });
        } catch (insertErr) {
            console.error(
                "[requestMedication] Lỗi khi insert studentMedication:",
                insertErr
            );
            return res.status(500).json({
                success: false,
                error: "Lỗi khi lưu thông tin thuốc vào database!",
            });
        }
    } catch (error) {
        console.error(
            "Error requesting medication:",
            error.message,
            error.stack
        );
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// --- SỬA HÀM LẤY THUỐC CỦA HỌC SINH ---
export const getStudentMedicines = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }
        const parentId = req.user.parentProfile.id;
        const studentParent = await prisma.studentParent.findFirst({
            where: { parentId, studentId },
        });
        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to view this student's medicines",
            });
        }
        const studentMedicines = await prisma.studentMedication.findMany({
            where: { studentId },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            success: true,
            data: studentMedicines,
        });
    } catch (error) {
        console.error("Error fetching student medicines:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// --- SỬA HÀM LẤY CHIẾN DỊCH TIÊM CHỦNG CHO PHỤ HUYNH ---
export const getVaccinationCampaignsForParent = async (req, res) => {
    try {
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }
        const parentId = req.user.parentProfile.id;
        const children = await prisma.studentParent.findMany({
            where: { parentId },
            include: {
                student: true,
            },
        });
        if (!children || children.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No children found for this parent",
            });
        }
        const childGrades = children
            .map((child) => child.student.grade)
            .filter(Boolean);
        const childIds = children.map((child) => child.studentId);
        const campaigns = await prisma.vaccinationCampaign.findMany({
            where: {
                isActive: true,
                targetGrades: { hasSome: childGrades },
            },
            include: {
                vaccine: true,
                consents: {
                    where: { studentId: { in: childIds } },
                },
            },
            orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
        });
        const campaignsWithConsent = campaigns.map((campaign) => {
            const campaignData = {
                ...campaign,
                // Đảm bảo trả về doseSchedules trong vaccine
                vaccine: campaign.vaccine
                    ? {
                          ...campaign.vaccine,
                          doseSchedules: campaign.vaccine.doseSchedules || [],
                      }
                    : null,
                childrenConsent: children.map((child) => {
                    const existingConsent = campaign.consents.find(
                        (consent) => consent.studentId === child.studentId
                    );
                    console.log(
                        "Existing consent for student",
                        child.studentId,
                        "(" + child.student.fullName + ")",
                        ":",
                        existingConsent
                    ); // Debug log
                    return {
                        studentId: child.studentId,
                        studentName: child.student.fullName,
                        className: child.student.class || null,
                        consent: existingConsent
                            ? existingConsent.consent
                            : null,
                        consentDate: existingConsent
                            ? existingConsent.createdAt
                            : null,
                        reason: existingConsent ? existingConsent.notes : null,
                    };
                }),
            };
            delete campaignData.consents;
            return campaignData;
        });
        res.status(200).json({
            success: true,
            data: campaignsWithConsent,
            children: children.map((child) => ({
                id: child.studentId,
                fullName: child.student.fullName,
                grade: child.student.grade,
            })),
        });
    } catch (error) {
        console.error(
            "Error fetching vaccination campaigns for parent:",
            error
        );
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// --- SỬA HÀM LẤY CHIẾN DỊCH TIÊM CHỦNG CỦA HỌC SINH ---
export const getStudentVaccinationCampaigns = async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentId = req.user.parentProfile.id;
        const studentParent = await prisma.studentParent.findFirst({
            where: { parentId, studentId },
            include: { student: true },
        });
        if (!studentParent) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy học sinh hoặc bạn không có quyền truy cập",
            });
        }
        const campaigns = await prisma.vaccinationCampaign.findMany({
            where: {
                OR: [
                    {
                        vaccinationRecords: {
                            some: { studentId: studentId },
                        },
                    },
                    {
                        targetGrades: {
                            hasSome: [studentParent.student.grade],
                        },
                        status: "ACTIVE",
                    },
                ],
            },
            include: {
                vaccine: true,
                vaccinationRecords: {
                    where: { studentId: studentId },
                },
            },
            orderBy: { scheduledDate: "desc" },
        });
        const transformedCampaigns = campaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            scheduledDate: campaign.scheduledDate,
            deadline: campaign.deadline,
            status: campaign.status,
            vaccine: campaign.vaccine
                ? {
                      ...campaign.vaccine,
                      doseSchedules: campaign.vaccine.doseSchedules || [],
                  }
                : null,
            vaccinated: campaign.vaccinationRecords.length > 0,
        }));
        return res.status(200).json({
            success: true,
            data: transformedCampaigns,
        });
    } catch (error) {
        console.error("Error in getStudentVaccinationCampaigns:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy thông tin chiến dịch tiêm chủng",
        });
    }
};

// Lấy toàn bộ kết quả khám sức khỏe của học sinh cho phụ huynh
export const getStudentHealthCheckups = async (req, res) => {
    try {
        const { studentId } = req.params;
        // Kiểm tra quyền truy cập: phụ huynh phải là cha/mẹ của học sinh này
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }
        const parentId = req.user.parentProfile.id;
        const studentParent = await prisma.studentParent.findFirst({
            where: { parentId, studentId },
        });
        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to view this student's health checkups",
            });
        }
        // Lấy toàn bộ kết quả khám sức khỏe
        const checkups = await prisma.medicalCheck.findMany({
            where: { studentId },
            orderBy: { scheduledDate: "desc" },
            include: {
                campaign: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        res.json({ success: true, data: checkups });
    } catch (error) {
        console.error("Error fetching health checkups:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const getVaccinationHistory = async (req, res) => {
    try {
        // Lấy studentId từ params hoặc query hoặc user (nếu cần)
        const studentId = req.params.studentId || req.query.studentId;
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn không có quyền truy cập chức năng này!",
            });
        }
        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: "Thiếu mã học sinh!",
            });
        }
        // Kiểm tra quyền phụ huynh
        const parentId = req.user.parentProfile.id;
        const studentParent = await prisma.studentParent.findFirst({
            where: { parentId, studentId },
        });
        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "Bạn không có quyền xem lịch sử tiêm chủng của học sinh này!",
            });
        }
        // Lấy lịch sử tiêm chủng từ vaccinationRecord
        const records = await prisma.vaccinationRecord.findMany({
            where: { studentId },
            include: {
                vaccine: true,
                campaign: true,
                nurse: { include: { user: { select: { fullName: true } } } },
            },
            orderBy: { administeredDate: "desc" },
        });
        const result = records.map((r) => ({
            id: r.id,
            administeredDate: r.administeredDate,
            vaccine: r.vaccine
                ? { ...r.vaccine, doseSchedules: r.vaccine.doseSchedules || [] }
                : null,
            campaign: r.campaign,
            dose: r.dose,
            status: r.status,
            notes: r.notes,
            nurse: r.nurse,
        }));
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error getVaccinationHistory:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy lịch sử tiêm chủng",
        });
    }
};

export const getVaccinationDetail = async (req, res) => {
    try {
        const { campaignId, studentId } = req.params;
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn không có quyền truy cập chức năng này!",
            });
        }
        if (!campaignId || !studentId) {
            return res.status(400).json({
                success: false,
                error: "Thiếu mã chiến dịch hoặc học sinh!",
            });
        }
        // Kiểm tra quyền phụ huynh
        const parentId = req.user.parentProfile.id;
        const studentParent = await prisma.studentParent.findFirst({
            where: { parentId, studentId },
        });
        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "Bạn không có quyền xem chi tiết tiêm chủng của học sinh này!",
            });
        }
        // Lấy record tiêm chủng theo campaignId và studentId
        const record = await prisma.vaccinationRecord.findFirst({
            where: { campaignId, studentId },
            include: {
                vaccine: true,
                campaign: true,
                nurse: { include: { user: { select: { fullName: true } } } },
            },
        });
        if (!record) {
            // Nếu chưa tiêm, trả về thông tin campaign và consent (nếu có)
            const campaign = await prisma.vaccinationCampaign.findUnique({
                where: { id: campaignId },
                include: {
                    vaccine: true,
                    consents: { where: { studentId } },
                },
            });
            return res.json({
                success: true,
                data: {
                    notVaccinated: true,
                    campaign,
                    student: { studentId },
                    consent: campaign?.consents?.[0] || null,
                },
            });
        }
        res.json({ success: true, data: record });
    } catch (error) {
        console.error("Error getVaccinationDetail:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy chi tiết tiêm chủng",
        });
    }
};

export const deliverMedication = async (req, res) => {
    try {
        const { medicationId } = req.params;
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn không có quyền thực hiện thao tác này!",
            });
        }
        const parentId = req.user.parentProfile.id;
        // Tìm thuốc và kiểm tra quyền
        const medication = await prisma.studentMedication.findUnique({
            where: { id: medicationId },
        });
        if (!medication) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy thông tin thuốc!",
            });
        }
        if (medication.parentId !== parentId) {
            return res.status(403).json({
                success: false,
                error: "Bạn không có quyền xác nhận gửi thuốc này!",
            });
        }
        if (medication.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                error: "Thuốc chưa được y tá duyệt hoặc đã xác nhận gửi!",
            });
        }
        // Cập nhật trạng thái
        const updated = await prisma.studentMedication.update({
            where: { id: medicationId },
            data: { status: "DELIVERED" },
        });
        res.json({
            success: true,
            data: updated,
            message: "Đã xác nhận gửi thuốc thành công!",
        });
    } catch (error) {
        console.error("Error in deliverMedication:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi máy chủ khi xác nhận gửi thuốc!",
        });
    }
};

// Lấy danh sách chiến dịch khám sức khỏe cho phụ huynh
export const getMedicalCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy thông tin phụ huynh và con cái
    const parent = await prisma.parent.findFirst({
      where: { userId },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thông tin phụ huynh",
      });
    }

    // Lấy tất cả chiến dịch khám sức khỏe
    const campaigns = await prisma.medicalCheckCampaign.findMany({
      where: {
        status: { in: ["ACTIVE", "SCHEDULED"] }
      },
      orderBy: {
        scheduledDate: "desc"
      }
    });

    // Lọc chiến dịch phù hợp với khối của con cái
    const childrenGrades = parent.students.map(sp => sp.student.grade);
    const relevantCampaigns = campaigns.filter(campaign => 
      campaign.targetGrades.some(grade => childrenGrades.includes(grade))
    );

    // Thêm thông tin consent cho từng chiến dịch
    const campaignsWithConsent = await Promise.all(
      relevantCampaigns.map(async (campaign) => {
        const consentPromises = parent.students.map(async (studentParent) => {
          const student = studentParent.student;
          
          // Chỉ kiểm tra nếu học sinh thuộc khối được nhắm đến
          if (!campaign.targetGrades.includes(student.grade)) {
            return null;
          }

          const medicalCheck = await prisma.medicalCheck.findFirst({
            where: {
              studentId: student.id,
              campaignId: campaign.id,
            },
            select: {
              parentConsent: true,
              parentNotified: true,
            },
          });

          return {
            studentId: student.id,
            studentName: student.fullName,
            parentConsent: medicalCheck?.parentConsent || [],
            parentNotified: medicalCheck?.parentNotified || false,
          };
        });

        const consents = (await Promise.all(consentPromises)).filter(Boolean);

        return {
          ...campaign,
          childrenConsent: consents,
          hasOptionalExaminations: campaign.optionalExaminations && campaign.optionalExaminations.length > 0,
        };
      })
    );

    res.json({
      success: true,
      data: campaignsWithConsent,
    });
  } catch (error) {
    console.error("Error fetching medical campaigns:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy danh sách chiến dịch",
    });
  }
};
