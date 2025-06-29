import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getMyChildren = async (req, res) => {
    try {
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "You must be a parent to access this resource",
            });
        }

        const parentId = req.user.parentProfile.id;

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

        const children = childrenRelations.map((rel) => ({
            studentId: rel.student.id,
            fullName: rel.student.user.fullName,
        }));

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
        console.log("Requesting medication with body:", req.body);
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
        const studentMedication = await prisma.studentMedication.create({
            data: {
                studentId,
                parentId,
                medicationId: medication.id,
                dosage,
                frequency,
                instructions,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status: "PENDING_APPROVAL",
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
        const vaccination = await prisma.vaccinations.findFirst({
            where: { campaignId, studentId },
            include: {
                campaign: true,
                nurse: { include: { user: true } },
                student: { include: { user: true } },
            },
        });
        if (!vaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy dữ liệu tiêm chủng",
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

        const studentIds = children.map((child) => child.student.id);

        // Lấy lịch sử tiêm chủng của các con
        const vaccinations = await prisma.vaccinations.findMany({
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

        res.json({ success: true, data: vaccinations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
