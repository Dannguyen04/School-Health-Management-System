import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function để tính toán năm học từ ngày
const getAcademicYearFromDate = (date) => {
    const targetDate = new Date(date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1; // 0-based

    // Năm học bắt đầu từ tháng 9 (tháng 9-12 thuộc năm học mới)
    if (month >= 9) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

// Helper function để lấy năm học hiện tại
const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-based

    // Năm học bắt đầu từ tháng 9 (tháng 9-12 thuộc năm học mới)
    if (month >= 9) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

// Helper function để update campaign statistics
const updateCampaignStatistics = async (campaignId) => {
    try {
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
            include: {
                consents: true,
                vaccinationRecords: {
                    where: { status: "COMPLETED" },
                },
            },
        });

        if (!campaign) return;

        const consentedCount = campaign.consents.length;
        const vaccinatedCount = campaign.vaccinationRecords.length;
        const completionRate =
            consentedCount > 0 ? (vaccinatedCount / consentedCount) * 100 : 0;

        // Update campaign statistics
        await prisma.vaccinationCampaign.update({
            where: { id: campaignId },
            data: {
                consentedStudents: consentedCount,
                vaccinatedStudents: vaccinatedCount,
                completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
            },
        });
    } catch (error) {
        console.error("Error updating campaign statistics:", error);
    }
};

// CREATE - Tạo chiến dịch tiêm chủng mới
const createVaccinationCampaign = async (req, res) => {
    try {
        const {
            name,
            description,
            vaccineId,
            targetGrades,
            scheduledDate,
            deadline,
            totalStudents,
        } = req.body;

        // Validation
        if (!name || !vaccineId || !scheduledDate || !deadline) {
            return res.status(400).json({
                success: false,
                error: "Thiếu thông tin bắt buộc: name, vaccineId, scheduledDate, deadline",
            });
        }

        // Validate totalStudents if provided
        if (
            totalStudents !== undefined &&
            (!Number.isInteger(totalStudents) || totalStudents < 0)
        ) {
            return res.status(400).json({
                success: false,
                error: "Tổng số học sinh phải là số nguyên không âm",
            });
        }

        const start = new Date(scheduledDate);
        if (start < new Date().setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                success: false,
                error: "Ngày bắt đầu phải ít nhất kể từ hôm nay",
            });
        }
        const end = new Date(deadline);
        if (end - start < 7 * 24 * 60 * 60 * 1000) {
            return res.status(400).json({
                success: false,
                error: "Deadline phải cách ngày bắt đầu ít nhất 1 tuần.",
            });
        }

        if (!Array.isArray(targetGrades) || targetGrades.length === 0) {
            return res.status(400).json({
                success: false,
                error: "phải có ít nhất một lớp cho chiến dịch",
            });
        }

        // Validate vaccination exists
        const vaccine = await prisma.vaccine.findUnique({
            where: { id: vaccineId },
        });

        if (!vaccine) {
            return res.status(400).json({
                success: false,
                error: "Loại vaccine không tồn tại",
            });
        }

        // Create campaign with denormalized data
        const campaign = await prisma.vaccinationCampaign.create({
            data: {
                name: name.trim(),
                description: description || "",
                vaccineId,
                // Denormalized vaccine data
                vaccineName: vaccine.name,
                vaccineManufacturer: vaccine.manufacturer,
                vaccineRequirement: vaccine.requirement,
                targetGrades: targetGrades.map((grade) => String(grade)),
                scheduledDate: new Date(scheduledDate),
                deadline: new Date(deadline),
                // User-provided total students (ước lượng)
                totalStudents: totalStudents || 0,
            },
            include: {
                vaccine: true,
            },
        });

        // Tạo thông báo cho manager sau khi tạo chiến dịch thành công
        try {
            const managerId = req.user.id; // Lấy ID của manager hiện tại

            await prisma.notification.create({
                data: {
                    userId: managerId,
                    title: `Chiến dịch tiêm chủng mới: ${campaign.name}`,
                    message: `Bạn đã tạo thành công chiến dịch tiêm chủng "${
                        campaign.name
                    }" với vaccine ${
                        vaccine.name
                    }. Chiến dịch sẽ diễn ra từ ${new Date(
                        scheduledDate
                    ).toLocaleDateString("vi-VN")} đến ${new Date(
                        deadline
                    ).toLocaleDateString(
                        "vi-VN"
                    )} cho các khối: ${targetGrades.join(", ")}.`,
                    type: "vaccination_campaign_created",
                    status: "SENT",
                    sentAt: new Date(),
                    vaccinationCampaignId: campaign.id,
                },
            });
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

        console.log(campaign);
        res.status(201).json({
            success: true,
            data: campaign,
            message: "Tạo chiến dịch tiêm chủng thành công",
        });
    } catch (error) {
        console.error("Error creating vaccination campaign:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi tạo chiến dịch tiêm chủng",
        });
    }
};

// GET - Lấy tất cả chiến dịch tiêm chủng với filter theo năm học
const getAllVaccinationCampaigns = async (req, res) => {
    try {
        const { academicYear } = req.query;
        let whereClause = {};

        // Nếu có filter theo năm học, tính toán từ scheduledDate
        if (academicYear) {
            const [startYear, endYear] = academicYear.split("-");
            const startDate = new Date(parseInt(startYear), 8, 1); // Tháng 9
            const endDate = new Date(parseInt(endYear), 7, 31); // Tháng 8 năm sau

            whereClause = {
                scheduledDate: {
                    gte: startDate,
                    lte: endDate,
                },
            };
        }

        const campaigns = await prisma.vaccinationCampaign.findMany({
            where: whereClause,
            include: {
                vaccine: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Thêm thông tin năm học được tính toán
        const campaignsWithAcademicYear = campaigns.map((campaign) => ({
            ...campaign,
            calculatedAcademicYear: getAcademicYearFromDate(
                campaign.scheduledDate
            ),
        }));

        res.json({
            success: true,
            data: campaignsWithAcademicYear,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// READ - Lấy chiến dịch theo ID
const getVaccinationCampaignById = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id },
            include: {
                vaccine: true,
            },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }
        res.status(200).json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error("Error fetching vaccination campaign:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi lấy thông tin chiến dịch",
        });
    }
};

// UPDATE - Cập nhật chiến dịch tiêm chủng
const updateVaccinationCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, targetGrades, totalStudents } = req.body;

        // Check if campaign exists
        const existingCampaign = await prisma.vaccinationCampaign.findUnique({
            where: { id },
        });

        if (!existingCampaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }
        if (!existingCampaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Prepare update data
        const updateData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    error: "Tên chiến dịch không được để trống",
                });
            }
            updateData.name = name.trim();
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (targetGrades !== undefined) {
            if (!Array.isArray(targetGrades) || targetGrades.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "targetGrades phải là array không rỗng",
                });
            }
            updateData.targetGrades = targetGrades.map((grade) =>
                String(grade)
            );
        }

        if (totalStudents !== undefined) {
            if (!Number.isInteger(totalStudents) || totalStudents < 0) {
                return res.status(400).json({
                    success: false,
                    error: "Tổng số học sinh phải là số nguyên không âm",
                });
            }
            updateData.totalStudents = totalStudents;
        }

        // Update campaign
        const updatedCampaign = await prisma.vaccinationCampaign.update({
            where: { id },
            data: updateData,
        });

        // Tạo thông báo cho manager sau khi cập nhật chiến dịch thành công
        try {
            const managerId = req.user.id; // Lấy ID của manager hiện tại

            await prisma.notification.create({
                data: {
                    userId: managerId,
                    title: `Cập nhật chiến dịch tiêm chủng: ${updatedCampaign.name}`,
                    message: `Bạn đã cập nhật thành công chiến dịch tiêm chủng "${updatedCampaign.name}".`,
                    type: "vaccination_campaign_updated",
                    status: "SENT",
                    sentAt: new Date(),
                    vaccinationCampaignId: updatedCampaign.id,
                },
            });
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

        res.status(200).json({
            success: true,
            data: updatedCampaign,
            message: "Cập nhật chiến dịch tiêm chủng thành công",
        });
    } catch (error) {
        console.error("Error updating vaccination campaign:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi cập nhật chiến dịch",
        });
    }
};

//update tiến độ chiến dịch
const updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: id },
        });

        if (!campaign)
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });

        if (!status || !["FINISHED", "CANCELLED"].includes(status))
            return res.status(400).json({
                success: false,
                error: "Status phải là FINISHED hoặc CANCELLED",
            });

        const updatedCampaign = await prisma.vaccinationCampaign.update({
            where: { id: id },
            data: { status: status },
        });

        try {
            const managerId = req.user.id; // Lấy ID của manager hiện tại

            await prisma.notification.create({
                data: {
                    userId: managerId,
                    title: `Cập nhật chiến dịch tiêm chủng: ${updatedCampaign.name}`,
                    message: `Bạn đã cập nhật thành công chiến dịch tiêm chủng "${updatedCampaign.name}".`,
                    type: "vaccination_campaign_updated",
                    status: "SENT",
                    sentAt: new Date(),
                    vaccinationCampaignId: updatedCampaign.id,
                },
            });
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

        res.status(200).json({
            success: true,
            data: updatedCampaign,
            message: "Cập nhật tiến độ chiến dịch tiểm chủng",
        });
    } catch (error) {
        console.error("Error updating campaign progress:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi cập nhật tiến độ chiến dịch",
        });
    }
};

// DELETE - Xóa chiến dịch tiêm chủng
const deleteVaccinationCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if campaign exists
        const existingCampaign = await prisma.vaccinationCampaign.findUnique({
            where: { id },
        });

        if (!existingCampaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Trước khi xóa campaign, xóa các bản ghi liên quan:
        await prisma.vaccinationRecord.deleteMany({
            where: { campaignId: id },
        });

        await prisma.vaccinationConsent.deleteMany({
            where: { campaignId: id },
        });

        // Xóa tất cả notification liên quan đến campaign này
        await prisma.notification.deleteMany({
            where: { vaccinationCampaignId: id },
        });

        // Delete campaign
        await prisma.vaccinationCampaign.delete({
            where: { id },
        });

        // Tạo thông báo cho manager sau khi xóa chiến dịch thành công
        try {
            const managerId = req.user.id; // Lấy ID của manager hiện tại

            await prisma.notification.create({
                data: {
                    userId: managerId,
                    title: `Xóa chiến dịch tiêm chủng: ${existingCampaign.name}`,
                    message: `Bạn đã xóa thành công chiến dịch tiêm chủng "${existingCampaign.name}".`,
                    type: "vaccination_campaign_deleted",
                    status: "SENT",
                    sentAt: new Date(),
                },
            });
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

        res.status(200).json({
            success: true,
            message: "Xóa chiến dịch tiêm chủng thành công",
        });
    } catch (error) {
        console.error("Error deleting vaccination campaign:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi xóa chiến dịch",
        });
    }
};

// Gửi phiếu đồng ý tiêm chủng cho phụ huynh
const sendConsentNotification = async (req, res) => {
    try {
        const { id } = req.params; // campaign id
        const { grades } = req.body; // danh sách khối được chọn

        // Lấy thông tin chiến dịch
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }

        // Lấy thông tin vaccine để lấy minAge, maxAge
        const vaccine = await prisma.vaccine.findUnique({
            where: { id: campaign.vaccineId },
        });

        if (!vaccine) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy thông tin vaccine cho chiến dịch này",
            });
        }

        const minAge = vaccine?.minAge;
        const maxAge = vaccine?.maxAge;

        // Nếu không truyền grades thì mặc định lấy tất cả targetGrades
        const selectedGrades =
            Array.isArray(grades) && grades.length > 0
                ? grades
                : campaign.targetGrades;

        // Lấy tất cả học sinh thuộc các khối đã chọn
        const students = await prisma.student.findMany({
            where: { grade: { in: selectedGrades } },
            include: {
                parents: { include: { parent: { include: { user: true } } } },
                vaccinationRecords: {
                    where: {
                        vaccineId: campaign.vaccineId,
                        status: "COMPLETED",
                    },
                    select: {
                        id: true,
                        doseOrder: true,
                        administeredDate: true,
                        status: true,
                    },
                },
            },
        });

        // Lọc học sinh theo độ tuổi hợp lệ
        const now = new Date();
        const ageEligibleStudents = students.filter((student) => {
            if (!student.dateOfBirth) return false;
            const birthDate = new Date(student.dateOfBirth);
            let age = now.getFullYear() - birthDate.getFullYear();
            // Điều chỉnh nếu chưa đến sinh nhật trong năm nay
            const m = now.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
                age--;
            }
            if (minAge && age < minAge) return false;
            if (maxAge && age > maxAge) return false;
            return true;
        });

        // Lọc tiếp theo lịch sử tiêm chủng - loại bỏ học sinh đã tiêm đủ số mũi
        const vaccinationEligibleStudents = [];
        const alreadyVaccinatedStudents = [];
        const ageIneligibleStudents = students.filter(
            (student) => !ageEligibleStudents.includes(student)
        );

        for (const student of ageEligibleStudents) {
            const completedDoses = student.vaccinationRecords.length;
            const maxDoses = vaccine?.maxDoseCount || 999; // Nếu không có giới hạn thì mặc định là 999

            if (completedDoses >= maxDoses) {
                // Học sinh đã tiêm đủ số mũi tối đa
                alreadyVaccinatedStudents.push({
                    ...student,
                    completedDoses,
                    maxDoses,
                    reason: "Đã tiêm đủ số mũi tối đa",
                });
            } else {
                // Học sinh vẫn cần tiêm thêm
                vaccinationEligibleStudents.push({
                    ...student,
                    completedDoses,
                    maxDoses,
                    remainingDoses: maxDoses - completedDoses,
                });
            }
        }

        // Danh sách tổng hợp học sinh không đủ điều kiện
        const ineligibleStudents = [
            ...ageIneligibleStudents.map((s) => ({
                ...s,
                reason: "Không đủ độ tuổi",
            })),
            ...alreadyVaccinatedStudents,
        ];

        // Lấy tất cả userId của phụ huynh (loại trùng) - chỉ từ học sinh đủ điều kiện tiêm
        const parentUserIds = Array.from(
            new Set(
                vaccinationEligibleStudents.flatMap((student) =>
                    student.parents.map((sp) => sp.parent.user.id)
                )
            )
        );

        if (parentUserIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Không tìm thấy phụ huynh nào cho các học sinh đủ điều kiện trong các khối đã chọn. Tất cả học sinh đã tiêm đủ số mũi hoặc không đủ tuổi.",
                details: {
                    totalStudents: students.length,
                    ageEligibleStudents: ageEligibleStudents.length,
                    vaccinationEligibleStudents:
                        vaccinationEligibleStudents.length,
                    alreadyVaccinatedStudents: alreadyVaccinatedStudents.length,
                    ageIneligibleStudents: ageIneligibleStudents.length,
                },
            });
        }

        // Gửi thông báo cho từng phụ huynh (song song)
        const notifications = await Promise.all(
            parentUserIds.map((userId) =>
                prisma.notification.create({
                    data: {
                        userId,
                        title: `Phiếu đồng ý tiêm chủng: ${campaign.name}`,
                        message: `Vui lòng xác nhận đồng ý tiêm chủng cho con em bạn trong chiến dịch: ${campaign.name}.`,
                        type: "vaccination_consent",
                        status: "SENT",
                        sentAt: new Date(),
                        vaccinationCampaignId: campaign.id,
                    },
                })
            )
        );

        // Gửi thông báo cho manager về việc gửi phiếu thành công
        const managerId = req.user.id;
        await prisma.notification.create({
            data: {
                userId: managerId,
                title: "Gửi phiếu đồng ý tiêm chủng thành công",
                message: `Bạn đã gửi ${
                    notifications.length
                } phiếu đồng ý tiêm chủng cho các khối: ${selectedGrades.join(
                    ", "
                )}. Có ${
                    alreadyVaccinatedStudents.length
                } học sinh đã tiêm đủ số mũi và ${
                    ageIneligibleStudents.length
                } học sinh không đủ tuổi được bỏ qua.`,
                type: "info",
                status: "SENT",
                sentAt: new Date(),
                vaccinationCampaignId: campaign.id,
            },
        });

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
                vaccine: {
                    id: vaccine.id,
                    name: vaccine.name,
                    maxDoseCount: vaccine.maxDoseCount,
                    minAge: vaccine.minAge,
                    maxAge: vaccine.maxAge,
                },
                sentGrades: selectedGrades,
                notificationsCount: notifications.length,
                statistics: {
                    totalStudents: students.length,
                    ageEligibleStudents: ageEligibleStudents.length,
                    vaccinationEligibleStudents:
                        vaccinationEligibleStudents.length,
                    alreadyVaccinatedStudents: alreadyVaccinatedStudents.length,
                    ageIneligibleStudents: ageIneligibleStudents.length,
                },
                eligibleStudents: vaccinationEligibleStudents.map((s) => ({
                    id: s.id,
                    fullName: s.user?.fullName,
                    grade: s.grade,
                    dateOfBirth: s.dateOfBirth,
                    completedDoses: s.completedDoses,
                    maxDoses: s.maxDoses,
                    remainingDoses: s.remainingDoses,
                })),
                ineligibleStudents: ineligibleStudents.map((s) => ({
                    id: s.id,
                    fullName: s.user?.fullName,
                    grade: s.grade,
                    dateOfBirth: s.dateOfBirth,
                    reason: s.reason,
                    completedDoses: s.completedDoses || 0,
                    maxDoses: s.maxDoses || vaccine?.maxDoseCount || 0,
                })),
            },
            message: `Đã gửi ${
                notifications.length
            } phiếu đồng ý tiêm chủng cho phụ huynh các khối: ${selectedGrades.join(
                ", "
            )}. Bỏ qua ${
                alreadyVaccinatedStudents.length
            } học sinh đã tiêm đủ và ${
                ageIneligibleStudents.length
            } học sinh không đủ tuổi.`,
        });
    } catch (error) {
        console.error("Error sending consent notifications:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi gửi phiếu đồng ý tiêm chủng",
        });
    }
};

// API để phụ huynh submit consent cho vaccination campaign
const submitVaccinationConsent = async (req, res) => {
    try {
        const { campaignId, studentId, consent, notes, confirmVaccination } =
            req.body;

        // Kiểm tra user có phải là parent không
        if (!req.user.parentProfile) {
            return res.status(403).json({
                success: false,
                error: "Bạn phải là phụ huynh để thực hiện hành động này",
            });
        }

        const parentId = req.user.parentProfile.id;

        // Kiểm tra campaign có tồn tại không
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id: campaignId },
            include: {
                vaccine: true,
            },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Kiểm tra học sinh có tồn tại và thuộc phụ huynh này không
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                parents: {
                    some: {
                        parentId: parentId,
                    },
                },
            },
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy học sinh hoặc học sinh không thuộc quyền quản lý của bạn",
            });
        }

        // Get parent info
        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            include: { user: true },
        });

        // Validation cho việc xác nhận tiêm chủng
        if (consent === true && !confirmVaccination) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng xác nhận đồng ý cho con em tiêm chủng",
            });
        }

        // Validation cho lý do từ chối
        if (consent === false && (!notes || notes.trim() === "")) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập lý do từ chối",
            });
        }

        // Kiểm tra xem đã có consent cho campaign và student này chưa
        const existingConsent = await prisma.vaccinationConsent.findUnique({
            where: {
                campaignId_studentId_parentId: {
                    campaignId,
                    studentId,
                    parentId,
                },
            },
        });

        if (existingConsent) {
            // Update existing consent
            const updatedConsent = await prisma.vaccinationConsent.update({
                where: {
                    campaignId_studentId_parentId: {
                        campaignId,
                        studentId,
                        parentId,
                    },
                },
                data: {
                    consent,
                    notes,
                    updatedAt: new Date(),
                    // Update denormalized data if needed
                    campaignName: campaign.name,
                    vaccineName: campaign.vaccineName,
                    studentName: student.fullName,
                    parentName: parent.user.fullName,
                    studentGrade: student.grade,
                },
            });

            // Update campaign statistics
            await updateCampaignStatistics(campaignId);

            res.json({
                success: true,
                data: updatedConsent,
                message: consent
                    ? "Cập nhật phiếu đồng ý tiêm chủng thành công. Con em của bạn sẽ được tiêm chủng theo lịch trình."
                    : "Cập nhật phiếu từ chối tiêm chủng thành công.",
            });
        } else {
            // Create new consent with denormalized data
            const newConsent = await prisma.vaccinationConsent.create({
                data: {
                    campaignId,
                    studentId,
                    parentId,
                    consent,
                    notes,
                    // Denormalized data
                    campaignName: campaign.name,
                    vaccineName: campaign.vaccineName,
                    studentName: student.fullName,
                    parentName: parent.user.fullName,
                    studentGrade: student.grade,
                },
            });

            // Update campaign statistics
            await updateCampaignStatistics(campaignId);

            res.status(201).json({
                success: true,
                data: newConsent,
                message: consent
                    ? "Gửi phiếu đồng ý tiêm chủng thành công. Con em của bạn sẽ được tiêm chủng theo lịch trình."
                    : "Gửi phiếu từ chối tiêm chủng thành công.",
            });
        }
    } catch (error) {
        console.error("Error submitting vaccination consent:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi gửi phiếu đồng ý tiêm chủng",
        });
    }
};

// Lấy danh sách consent của một campaign
const getCampaignConsents = async (req, res) => {
    try {
        const { id } = req.params; // campaign id

        // Kiểm tra campaign có tồn tại không
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id },
            include: {
                vaccine: true, // Lấy loại vaccine từ bảng Vaccine (model mới)
            },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch tiêm chủng",
            });
        }

        // Lấy tất cả consent của campaign này
        const consents = await prisma.vaccinationConsent.findMany({
            where: { campaignId: id },
            include: {
                student: true,
                parent: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                submittedAt: "desc",
            },
        });

        res.json({
            success: true,
            data: {
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    description: campaign.description,
                    vaccine: campaign.vaccine, // Trả về loại vaccine
                    scheduledDate: campaign.scheduledDate,
                    deadline: campaign.deadline,
                    targetGrades: campaign.targetGrades,
                },
                consents: consents,
                totalConsents: consents.length,
                agreedCount: consents.filter((c) => c.consent).length,
                declinedCount: consents.filter((c) => !c.consent).length,
            },
        });
    } catch (error) {
        console.error("Error fetching campaign consents:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi lấy danh sách phiếu đồng ý",
        });
    }
};

export {
    createVaccinationCampaign,
    deleteVaccinationCampaign,
    getAllVaccinationCampaigns,
    getCampaignConsents,
    getVaccinationCampaignById,
    sendConsentNotification,
    submitVaccinationConsent,
    updateCampaignStatistics,
    updateProgress,
    updateVaccinationCampaign,
};
