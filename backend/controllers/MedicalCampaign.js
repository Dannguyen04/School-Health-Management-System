import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Tạo campaign mới
export const createMedicalCampaign = async (req, res) => {
    const { name, scheduledDate, deadline, description, targetGrades } =
        req.body;
    // Validate bắt buộc
    if (!name || !targetGrades || !scheduledDate || !deadline) {
        return res.status(400).json({
            success: false,
            error: "Thiếu trường dữ liệu bắt buộc",
        });
    }
    // Validate name không chỉ toàn khoảng trắng
    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Tên chiến dịch không hợp lệ",
        });
    }
    // Validate ngày hợp lệ
    const start = new Date(scheduledDate);
    const end = new Date(deadline);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
            success: false,
            error: "Ngày bắt đầu hoặc deadline không hợp lệ",
        });
    }
    if (start < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({
            success: false,
            error: "Ngày bắt đầu phải ít nhất kể từ hôm nay",
        });
    }
    if (end - start < 7 * 24 * 60 * 60 * 1000) {
        return res.status(400).json({
            success: false,
            error: "Ngày kết thúc phải cách ngày bắt đầu ít nhất 1 tuần.",
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
                name: name.trim(),
                description: description || null,
                targetGrades,
                scheduledDate: start,
                deadline: end,
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
    const { name, description, targetGrades, status, scheduledDate, deadline } =
        req.body;
    console.log("[Update campaign] id:", id, "data:", req.body);
    try {
        const existed = await prisma.medicalCheckCampaign.findUnique({
            where: { id },
        });
        if (!existed) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }
        // Validate name nếu có
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).json({
                    success: false,
                    error: "Tên chiến dịch không hợp lệ",
                });
            }
            if (name !== existed.name) {
                const nameExists = await prisma.medicalCheckCampaign.findFirst({
                    where: { name },
                });
                if (nameExists) {
                    return res.status(409).json({
                        success: false,
                        error: "Tên chiến dịch đã tồn tại",
                    });
                }
            }
        }
        // Validate targetGrades nếu có
        if (targetGrades !== undefined) {
            if (
                !Array.isArray(targetGrades) ||
                targetGrades.length === 0 ||
                !targetGrades.every(
                    (g) =>
                        typeof g === "string" &&
                        /^\d+$/.test(g) &&
                        Number(g) > 0
                )
            ) {
                return res.status(400).json({
                    success: false,
                    error: "targetGrades phải là mảng các chuỗi số nguyên dương",
                });
            }
        }
        // Validate ngày nếu có
        let start = existed.scheduledDate;
        let end = existed.deadline;
        if (scheduledDate !== undefined) {
            start = new Date(scheduledDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Ngày bắt đầu không hợp lệ",
                });
            }
            if (start < new Date().setHours(0, 0, 0, 0)) {
                return res.status(400).json({
                    success: false,
                    error: "Ngày bắt đầu phải ít nhất kể từ hôm nay",
                });
            }
        }
        if (deadline !== undefined) {
            end = new Date(deadline);
            if (isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Deadline không hợp lệ",
                });
            }
        }
        if (scheduledDate !== undefined || deadline !== undefined) {
            if (end - start < 7 * 24 * 60 * 60 * 1000) {
                return res.status(400).json({
                    success: false,
                    error: "Deadline phải cách ngày bắt đầu ít nhất 1 tuần.",
                });
            }
        }
        const data = {};
        if (typeof name === "string" && name.trim() !== "")
            data.name = name.trim();
        if (typeof description === "string") data.description = description;
        if (Array.isArray(targetGrades))
            data.targetGrades = targetGrades
                .map(String)
                .sort((a, b) => Number(a) - Number(b));
        if (status && ["ACTIVE", "FINISHED", "CANCELLED"].includes(status))
            data.status = status;
        if (scheduledDate !== undefined) data.scheduledDate = start;
        if (deadline !== undefined) data.deadline = end;
        const updated = await prisma.medicalCheckCampaign.update({
            where: { id },
            data,
        });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error("Update campaign error:", error);
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

const ALLOWED_STATUS = ["FINISHED", "CANCELLED"];

// Cập nhật tiến độ (status) của chiến dịch khám sức khỏe
export const updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const campaign = await prisma.medicalCheckCampaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }

        if (!status || !ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Trạng thái không hợp lệ. Chỉ cho phép FINISHED hoặc CANCELLED.",
            });
        }

        if (campaign.status === "CANCELLED" || campaign.status === "FINISHED") {
            return res.status(400).json({
                success: false,
                error: "Không thể cập nhật trạng thái của chiến dịch đã kết thúc hoặc đã hủy.",
            });
        }

        const updatedCampaign = await prisma.medicalCheckCampaign.update({
            where: { id },
            data: { status },
        });

        res.status(200).json({
            success: true,
            data: updatedCampaign,
            message: "Cập nhật trạng thái chiến dịch thành công",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Lỗi server khi cập nhật trạng thái chiến dịch",
        });
    }
};

// Gửi thông báo chiến dịch về cho phụ huynh
export const notifyParentsAboutCampaign = async (req, res) => {
    const { id } = req.params;
    try {
        // Lấy thông tin chiến dịch
        const campaign = await prisma.medicalCheckCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chiến dịch",
            });
        }
        // Lấy danh sách học sinh thuộc các lớp targetGrades
        const students = await prisma.student.findMany({
            where: {
                grade: { in: campaign.targetGrades },
            },
            select: { id: true, user: { select: { fullName: true } } },
        });
        if (!students.length) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy học sinh thuộc các khối được chọn",
            });
        }
        // Lấy danh sách phụ huynh của các học sinh này
        const studentIds = students.map((s) => s.id);
        const studentParents = await prisma.studentParent.findMany({
            where: {
                studentId: { in: studentIds },
            },
            include: {
                parent: {
                    include: {
                        user: { select: { id: true, fullName: true } },
                    },
                },
            },
        });
        // Lọc ra userId phụ huynh duy nhất
        const parentUserIds = [
            ...new Set(
                studentParents
                    .filter((sp) => sp.parent && sp.parent.user)
                    .map((sp) => sp.parent.user.id)
            ),
        ];
        if (!parentUserIds.length) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy phụ huynh để gửi thông báo",
            });
        }
        // Gửi thông báo cho từng phụ huynh
        const notifications = [];
        for (const userId of parentUserIds) {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    title: `Thông báo chiến dịch khám sức khỏe: ${campaign.name}`,
                    message: `Nhà trường tổ chức chiến dịch khám sức khỏe "${
                        campaign.name
                    }" từ ngày ${campaign.scheduledDate.toLocaleDateString()} đến ${campaign.deadline.toLocaleDateString()}. Quý phụ huynh vui lòng phối hợp để học sinh tham gia đầy đủ.`,
                    type: "medical_campaign",
                    status: "SENT",
                    sentAt: new Date(),
                    medicalCheckCampaignId: campaign.id,
                },
            });
            notifications.push(notification);
        }
        res.status(200).json({
            success: true,
            message: `Đã gửi thông báo đến ${notifications.length} phụ huynh thành công!`,
        });
    } catch (error) {
        console.error("Error sending campaign notifications:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi server khi gửi thông báo chiến dịch",
        });
    }
};
