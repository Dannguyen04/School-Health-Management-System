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
      status = "ACTIVE",
    } = req.body;

    // Validation
    if (!name || !vaccinationId || !scheduledDate || !deadline) {
      return res.status(400).json({
        success: false,
        error:
          "Thiếu thông tin bắt buộc: name, vaccinationId, scheduledDate, deadline",
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
        status,
        isActive: status === "ACTIVE",
      },
    });

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
    });

    // Lấy tất cả vaccinationId
    const vaccineIds = campaigns.map((c) => c.vaccinationId);
    const vaccines = await prisma.vaccinations.findMany({
      where: { id: { in: vaccineIds } },
      select: { id: true, name: true },
    });

    // Map lại để mỗi campaign có trường vaccination (object)
    const campaignsWithVaccine = campaigns.map((c) => ({
      ...c,
      vaccination: vaccines.find((v) => v.id === c.vaccinationId) || null,
    }));

    res.status(200).json({
      success: true,
      data: campaignsWithVaccine,
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
      updateData.targetGrades = targetGrades.map((grade) => String(grade));
    }

    // Update campaign
    const updatedCampaign = await prisma.vaccinationCampaign.update({
      where: { id },
      data: updateData,
    });

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
        error:
          "Không tìm thấy phụ huynh nào cho các học sinh trong các khối đã chọn",
      });
    }

    // Gửi thông báo cho từng phụ huynh
    const notifications = [];
    for (const userId of parentUserIds) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: `Phiếu đồng ý tiêm chủng: ${campaign.name}`,
          message: `Vui lòng xác nhận đồng ý tiêm chủng cho con em bạn trong chiến dịch: ${campaign.name}.`,
          type: "vaccination_consent",
          status: "SENT",
          sentAt: new Date(),
          vaccinationCampaignId: campaign.id,
        },
      });
      notifications.push(notification);
    }

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
        error:
          "Không tìm thấy học sinh hoặc học sinh không thuộc quyền quản lý của bạn",
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
