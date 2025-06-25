import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Tạo campaign mới
export const createMedicalCampaign = async (req, res) => {
    const {
        name,
        checkTypes,
        scheduledDate,
        deadline,
        description,
        targetGrades,
    } = req.body;
    if (!name || !checkTypes || !targetGrades || !scheduledDate || !deadline) {
        return res.status(400).json({
            success: false,
            error: "Thiếu trường dữ liệu bắt buộc",
        });
    }
    // Kiểm tra deadline phải cách scheduledDate ít nhất 1 tuần
    const start = new Date(scheduledDate);
    const end = new Date(deadline);
    if (end - start < 7 * 24 * 60 * 60 * 1000) {
        return res.status(400).json({
            success: false,
            error: "Deadline phải cách ngày bắt đầu ít nhất 1 tuần.",
        });
    }
    try {
        const existed = await prisma.medicalCheckCampaign.findFirst({
            where: { name },
        });
        if (existed) {
            return res.status(409).json({
                success: false,
                error: "Tên chiến dịch đã tồn tại",
            });
        }
        const campaign = await prisma.medicalCheckCampaign.create({
            data: {
                name,
                description: description || null,
                checkTypes,
                targetGrades,
                scheduledDate: start,
                deadline: end,
                status: status || "ACTIVE",
                isActive: typeof isActive === "boolean" ? isActive : true,
            },
        });
        res.status(201).json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy tất cả campaign
export const getAllMedicalCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.medicalCheckCampaign.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Lấy campaign theo id
export const getMedicalCampaignById = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await prisma.medicalCheckCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }
        res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cập nhật campaign
export const updateMedicalCampaign = async (req, res) => {
    const { id } = req.params;
    const { name, description, targetGrades, status } = req.body;
    try {
        const campaign = await prisma.medicalCheckCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }
        // Kiểm tra deadline phải cách scheduledDate ít nhất 1 tuần nếu có update
        if (scheduledDate && deadline) {
            const start = new Date(scheduledDate);
            const end = new Date(deadline);
            if (end - start < 7 * 24 * 60 * 60 * 1000) {
                return res.status(400).json({
                    success: false,
                    error: "Deadline phải cách ngày bắt đầu ít nhất 1 tuần.",
                });
            }
        }
        const updated = await prisma.medicalCheckCampaign.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(checkTypes && { checkTypes }),
                ...(targetGrades && { targetGrades }),
                ...(scheduledDate && {
                    scheduledDate: new Date(scheduledDate),
                }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(status && { status }),
                ...(typeof isActive === "boolean" && { isActive }),
            },
        });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Xóa campaign
export const deleteMedicalCampaign = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await prisma.medicalCheckCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }
        await prisma.medicalCheckCampaign.delete({ where: { id } });
        res.status(200).json({
            success: true,
            message: "Xóa chiến dịch thành công",
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
