import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE - Tạo chiến dịch tiêm chủng mới
const createVaccinationCampaign = async (req, res) => {
    try {
        const {
            name,
            description,
            vaccinationId,
            targetGrades,
            scheduledDate,
            deadline,
        } = req.body;

        // Validation
        if (!name || !vaccinationId || !scheduledDate || !deadline) {
            return res.status(400).json({
                success: false,
                error: "Thiếu thông tin bắt buộc: name, vaccinationId, scheduledDate, deadline",
            });
        }

        if (!Array.isArray(targetGrades) || targetGrades.length === 0) {
            return res.status(400).json({
                success: false,
                error: "targetGrades phải là array không rỗng",
            });
        }

        // Validate vaccination exists
        const vaccination = await prisma.vaccinations.findUnique({
            where: { id: vaccinationId },
        });

        if (!vaccination) {
            return res.status(400).json({
                success: false,
                error: "Loại vaccine không tồn tại",
            });
        }

        // Create campaign
        const campaign = await prisma.vaccinationCampaign.create({
            data: {
                name: name.trim(),
                description: description || "",
                vaccinationId,
                targetGrades: targetGrades.map((grade) => String(grade)),
                scheduledDate: new Date(scheduledDate),
                deadline: new Date(deadline),
            },
            include: {
                vaccinations: true,
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
                        vaccination.name
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

// READ - Lấy tất cả chiến dịch tiêm chủng
const getAllVaccinationCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.vaccinationCampaign.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                vaccinations: true,
            },
        });
        res.status(200).json({
            success: true,
            data: campaigns,
            total: campaigns.length,
        });
    } catch (error) {
        console.error("Error fetching vaccination campaigns:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi lấy danh sách chiến dịch",
        });
    }
};

// READ - Lấy chiến dịch theo ID
const getVaccinationCampaignById = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.vaccinationCampaign.findUnique({
            where: { id },
            include: {
                vaccinations: true,
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
        const { name, description, status, targetGrades } = req.body;

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

        if (status !== undefined) {
            if (!["ACTIVE", "FINISHED", "CANCELLED"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: "Trạng thái không hợp lệ",
                });
            }
            updateData.status = status;
            updateData.isActive = status === "ACTIVE";
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
            },
        });

        // Lấy tất cả userId của phụ huynh (loại trùng)
        const parentUserIds = Array.from(
            new Set(
                students.flatMap((student) =>
                    student.parents.map((sp) => sp.parent.user.id)
                )
            )
        );

        if (parentUserIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Không tìm thấy phụ huynh nào cho các học sinh trong các khối đã chọn",
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
                message: `Bạn đã gửi phiếu đồng ý tiêm chủng cho các khối: ${selectedGrades.join(
                    ", "
                )}`,
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
                sentGrades: selectedGrades,
                notificationsCount: notifications.length,
            },
            message: `Đã gửi ${
                notifications.length
            } phiếu đồng ý tiêm chủng cho phụ huynh các khối: ${selectedGrades.join(
                ", "
            )}`,
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
        const { campaignId, studentId, consent, notes } = req.body;

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
                vaccinations: true,
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
                },
            });

            res.json({
                success: true,
                data: updatedConsent,
                message: "Cập nhật phiếu đồng ý tiêm chủng thành công",
            });
        } else {
            // Create new consent
            const newConsent = await prisma.vaccinationConsent.create({
                data: {
                    campaignId,
                    studentId,
                    parentId,
                    consent,
                    notes,
                },
            });

            res.status(201).json({
                success: true,
                data: newConsent,
                message: "Gửi phiếu đồng ý tiêm chủng thành công",
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
                vaccinations: true, // Lấy loại vaccine từ bảng vaccinations (model mới)
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
                student: {
                    include: {
                        user: true,
                    },
                },
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
                    vaccinations: campaign.vaccinations, // Trả về loại vaccine
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
    updateVaccinationCampaign,
};
