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

        const childrenRelations = await prisma.studentParent.findMany({
            where: {
                parentId: parentId,
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
            },
        });

        console.log("[getMyChildren] childrenRelations:", childrenRelations);

        const children = childrenRelations.map((rel) => ({
            studentId: rel.student.id,
            fullName: rel.student.user.fullName,
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
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
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

        // Log for debugging
        console.log("Student Parent:", studentParent);
        console.log("Health Profile:", studentParent.student.healthProfile);

        res.json({
            success: true,
            data: {
                healthProfile: studentParent.student.healthProfile,
                student: {
                    id: studentParent.student.id,
                    fullName: studentParent.student.user.fullName,
                    email: studentParent.student.user.email,
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

        const healthProfile = await prisma.healthProfile.upsert({
            where: {
                studentId: studentId,
            },
            update: {
                allergies,
                chronicDiseases,
                medications,
                treatmentHistory,
                vision,
                hearing,
                height,
                weight,
                notes,
            },
            create: {
                studentId: studentId,
                allergies,
                chronicDiseases,
                medications,
                treatmentHistory,
                vision,
                hearing,
                height,
                weight,
                notes,
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

export const requestMedication = async (req, res) => {
    try {
        console.log("[requestMedication] Body:", req.body);
        console.log("[requestMedication] File:", req.file);
        const { studentId } = req.params;
        const {
            medicationName,
            dosage,
            frequency,
            instructions,
            startDate,
            endDate,
            description,
            unit,
            stockQuantity,
        } = req.body;

        // Validate dữ liệu đầu vào
        if (!medicationName || !dosage || !frequency || !startDate || !unit) {
            return res.status(400).json({
                success: false,
                error: "Thiếu thông tin bắt buộc: medicationName, dosage, frequency, startDate, unit",
            });
        }
        if (isNaN(Number(stockQuantity))) {
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

        // Check if user has parent profile
        if (!req.user.parentProfile) {
            console.log("User is not a parent.");
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }

        const parentId = req.user.parentProfile.id;

        // Verify parent-student relationship
        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId,
            },
        });

        if (!studentParent) {
            console.log("Parent-student relationship not found.");
            return res.status(403).json({
                success: false,
                error: "You are not authorized to request medication for this student",
            });
        }

        // Find or create medication based on name
        let medication = await prisma.medication.findFirst({
            where: {
                name: medicationName,
            },
        });

        if (!medication) {
            console.log("Medication not found, creating new one.");
            medication = await prisma.medication.create({
                data: {
                    name: medicationName,
                    description: description || "",
                    dosage: dosage || "",
                    unit: unit || "",
                    stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
                },
            });
        }

        // Create medication request using the found/created medication's ID
        let image = null;
        if (req.file) {
            // Đường dẫn public để client truy cập
            image = `/api/uploads/medicine-images/${req.file.filename}`;
        }
        const studentMedication = await prisma.studentMedication.create({
            data: {
                studentId,
                parentId,
                medicationId: medication.id,
                dosage,
                frequency,
                instructions,
                startDate: parsedStartDate,
                endDate: parsedEndDate || null,
                status: "PENDING_APPROVAL",
                image,
            },
            include: {
                medication: true,
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

        console.log(
            "Medication request submitted successfully:",
            studentMedication
        );
        res.json({
            success: true,
            data: studentMedication,
            message: "Medication request submitted successfully",
        });
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
            where: {
                parentId: parentId,
                studentId: studentId,
            },
        });

        if (!studentParent) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to view this student's medicines",
            });
        }

        const studentMedicines = await prisma.studentMedication.findMany({
            where: {
                studentId: studentId,
            },
            include: {
                medication: true,
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
            orderBy: {
                createdAt: "desc",
            },
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

export const getVaccinationCampaignsForParent = async (req, res) => {
    try {
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }

        const parentId = req.user.parentProfile.id;

        // Get parent's children with their grades
        const children = await prisma.studentParent.findMany({
            where: {
                parentId: parentId,
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
            },
        });

        if (!children || children.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No children found for this parent",
            });
        }

        // Get grades of parent's children
        const childGrades = children
            .map((child) => child.student.grade)
            .filter(Boolean);

        console.log("Parent children grades:", childGrades);

        // Get vaccination campaigns that target the grades of parent's children
        const campaigns = await prisma.vaccinationCampaign.findMany({
            where: {
                isActive: true,
                targetGrades: {
                    hasSome: childGrades,
                },
            },
            include: {
                vaccinations: true,
                consents: {
                    where: {
                        studentId: {
                            in: children.map((child) => child.studentId),
                        },
                    },
                },
            },
            orderBy: { scheduledDate: "asc" },
        });

        console.log("Found campaigns:", campaigns.length);

        // Add consent status for each child
        const campaignsWithConsent = campaigns.map((campaign) => {
            const campaignData = {
                ...campaign,
                childrenConsent: children.map((child) => {
                    const existingConsent = campaign.consents.find(
                        (consent) => consent.studentId === child.studentId
                    );
                    return {
                        studentId: child.studentId,
                        studentName: child.student.user.fullName,
                        consent: existingConsent
                            ? existingConsent.consent
                            : null,
                        consentDate: existingConsent
                            ? existingConsent.createdAt
                            : null,
                    };
                }),
            };
            delete campaignData.consents; // Remove the raw consents data
            return campaignData;
        });

        res.status(200).json({
            success: true,
            data: campaignsWithConsent,
            children: children.map((child) => ({
                id: child.studentId,
                fullName: child.student.user.fullName,
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

export const getVaccinationDetail = async (req, res) => {
    try {
        const { campaignId, studentId } = req.params;
        const vaccination = await prisma.vaccine.findFirst({
            where: {
                studentId,
                campaign: { id: campaignId },
            },
            include: {
                campaign: true,
                nurse: { include: { user: true } },
                student: { include: { user: true } },
            },
        });
        if (!vaccination) {
            // Nếu không có record tiêm chủng, trả về thông tin campaign, student, consent (nếu có)
            const campaign = await prisma.VaccinationCampaign.findUnique({
                where: { id: campaignId },
                include: {
                    vaccinations: true,
                    consents: true,
                },
            });
            const student = await prisma.Student.findUnique({
                where: { id: studentId },
                include: {
                    user: true,
                    parents: {
                        include: {
                            parent: {
                                include: { user: true },
                            },
                        },
                    },
                    healthProfile: true,
                },
            });
            // Lấy consent của học sinh này với campaign này (nếu có)
            const consent = await prisma.VaccinationConsent.findFirst({
                where: {
                    campaignId: campaignId,
                    studentId: studentId,
                },
            });
            if (!campaign || !student) {
                return res.status(404).json({
                    success: false,
                    error: "Không tìm thấy dữ liệu tiêm chủng hoặc chiến dịch",
                });
            }
            return res.json({
                success: true,
                data: {
                    campaign,
                    student,
                    consent,
                    status: "SCHEDULED",
                    notVaccinated: true,
                },
            });
        }
        res.json({ success: true, data: vaccination });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getVaccinationHistory = async (req, res) => {
    try {
        const parentId = req.user.parentProfile.id;
        const { studentId } = req.params;

        // Lấy danh sách con của phụ huynh
        const children = await prisma.studentParent.findMany({
            where: { parentId },
            include: {
                student: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
            },
        });

        let studentIds = children.map((child) => child.student.id);
        if (studentId) {
            // Kiểm tra studentId có thuộc parent không
            if (!studentIds.includes(studentId)) {
                return res.status(403).json({
                    success: false,
                    error: "Bạn không có quyền xem lịch sử tiêm chủng của học sinh này.",
                });
            }
            studentIds = [studentId];
        }

        // Lấy lịch sử tiêm chủng của các con
        const vaccinations = await prisma.vaccine.findMany({
            where: {
                studentId: { in: studentIds },
                status: "COMPLETED",
            },
            include: {
                campaign: true,
                nurse: { include: { user: { select: { fullName: true } } } },
                student: { include: { user: { select: { fullName: true } } } },
            },
            orderBy: { administeredDate: "desc" },
        });

        // Bổ sung trường vaccineName cho mỗi vaccination
        const vaccinationsWithVaccineName = vaccinations.map((vac) => ({
            ...vac,
            vaccineName: vac.name || "",
        }));

        res.json({ success: true, data: vaccinationsWithVaccineName });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getStudentVaccinationCampaigns = async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentId = req.user.parentProfile.id;

        // Verify that the student belongs to the parent using StudentParent relationship
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
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy học sinh hoặc bạn không có quyền truy cập",
            });
        }

        // Get vaccination campaigns for the student
        const campaigns = await prisma.vaccinationCampaign.findMany({
            where: {
                OR: [
                    {
                        vaccinations: {
                            studentId: studentId,
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
                vaccinations: true,
            },
            orderBy: {
                scheduledDate: "desc",
            },
        });

        // Transform the data
        const transformedCampaigns = campaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            scheduledDate: campaign.scheduledDate,
            deadline: campaign.deadline,
            status: campaign.status,
            vaccineName: campaign.vaccinations?.name || "",
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
