import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// Thêm validation middleware
const validateMedicalCheckData = (req, res, next) => {
  const { studentId, campaignId, scheduledDate } = req.body;
  if (!studentId || !campaignId || !scheduledDate) {
    return res.status(400).json({
      success: false,
      error: "Thiếu thông tin bắt buộc: studentId, campaignId, scheduledDate",
    });
  }
  const date = new Date(scheduledDate);
  if (isNaN(date.getTime())) {
    return res
      .status(400)
      .json({ success: false, error: "Ngày hẹn không hợp lệ" });
  }
  next();
};

const checkNursePermission = async (req, res, next) => {
  try {
    // Lấy nurseId từ token (req.user)
    const user = req.user;
    if (!user || user.role !== "nurse") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền thực hiện chức năng này (chỉ dành cho y tá)",
      });
    }
    const nurseId = user.id; // hoặc user.nurseId nếu token lưu như vậy
    const nurse = await prisma.schoolNurse.findUnique({
      where: { id: nurseId },
    });
    if (!nurse) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thông tin y tá",
      });
    }
    if (!nurse.isActive) {
      return res.status(403).json({
        success: false,
        error: "Tài khoản y tá không còn hoạt động",
      });
    }
    req.nurse = nurse;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi kiểm tra quyền truy cập",
    });
  }
};

// Cập nhật kết quả kiểm tra (từng bước một cách cẩn thận)
const updateMedicalCheckResults = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      visionResult,
      hearingResult,
      dentalResult,
      heightWeight,
      generalHealth,
      recommendations,
      requiresFollowUp,
      followUpDate,
      notes,
      nurseId,
    } = req.body;

    // Validate dữ liệu đầu vào
    if (
      visionResult &&
      !["normal", "needs_glasses", "refer_specialist"].includes(visionResult)
    ) {
      return res.status(400).json({
        success: false,
        error: "Kết quả kiểm tra thị lực không hợp lệ",
      });
    }
    if (
      hearingResult &&
      !["normal", "impaired", "refer_specialist"].includes(hearingResult)
    ) {
      return res.status(400).json({
        success: false,
        error: "Kết quả kiểm tra thính lực không hợp lệ",
      });
    }
    if (
      dentalResult &&
      !["good", "needs_treatment", "refer_dentist"].includes(dentalResult)
    ) {
      return res.status(400).json({
        success: false,
        error: "Kết quả kiểm tra răng miệng không hợp lệ",
      });
    }

    const medicalCheck = await prisma.medicalCheck.findUnique({
      where: { id },
      include: {
        student: true,
        campaign: true,
      },
    });

    if (!medicalCheck) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy báo cáo kiểm tra",
      });
    }

    // Kiểm tra quyền cập nhật
    if (medicalCheck.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        error:
          "Báo cáo đã hoàn thành, không thể chỉnh sửa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Validate height/weight nếu có
    if (heightWeight) {
      if (
        heightWeight.height &&
        (heightWeight.height < 50 || heightWeight.height > 250)
      ) {
        return res.status(400).json({
          success: false,
          error: "Chiều cao không hợp lệ (50-250cm)",
        });
      }
      if (
        heightWeight.weight &&
        (heightWeight.weight < 10 || heightWeight.weight > 150)
      ) {
        return res.status(400).json({
          success: false,
          error: "Cân nặng không hợp lệ (10-150kg)",
        });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      nurseId,
      notes,
    };

    // Chỉ cập nhật kết quả nếu có dữ liệu
    if (visionResult) updateData.visionResult = visionResult;
    if (hearingResult) updateData.hearingResult = hearingResult;
    if (dentalResult) updateData.dentalResult = dentalResult;
    if (heightWeight) updateData.heightWeight = heightWeight;
    if (generalHealth) updateData.generalHealth = generalHealth;
    if (recommendations) updateData.recommendations = recommendations;

    updateData.requiresFollowUp = requiresFollowUp || false;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    // Kiểm tra xem có đủ kết quả để hoàn thành không
    const campaign = medicalCheck.campaign;
    const hasAllResults = campaign.checkTypes.every((type) => {
      switch (type) {
        case "vision":
          return visionResult || medicalCheck.visionResult;
        case "hearing":
          return hearingResult || medicalCheck.hearingResult;
        case "dental":
          return dentalResult || medicalCheck.dentalResult;
        case "height_weight":
          return heightWeight || medicalCheck.heightWeight;
        case "general":
          return generalHealth || medicalCheck.generalHealth;
        default:
          return true;
      }
    });

    if (hasAllResults) {
      updateData.status = "COMPLETED";
      updateData.completedDate = new Date();
    } else {
      updateData.status = "IN_PROGRESS";
    }

    const updatedCheck = await prisma.medicalCheck.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            class: true,
            studentCode: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            checkTypes: true,
          },
        },
        nurse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log hoạt động (có thể thêm audit trail)
    console.log(
      `Medical check updated for student ${updatedCheck.student.name} by nurse ${nurseId}`
    );

    res.json({
      success: true,
      message: `Cập nhật kết quả kiểm tra cho học sinh ${updatedCheck.student.name} thành công`,
      data: updatedCheck,
      isCompleted: updateData.status === "COMPLETED",
    });
  } catch (error) {
    console.error("Error updating medical check:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi hệ thống khi cập nhật kết quả kiểm tra",
    });
  }
};

// Lấy danh sách báo cáo kiểm tra theo campaign
const getMedicalChecksByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 10, status, grade } = req.query;

    const skip = (page - 1) * limit;

    const where = {
      campaignId,
    };

    if (status) {
      where.status = status;
    }

    // Filter by grade if provided
    if (grade) {
      where.student = {
        grade: grade,
      };
    }

    const [medicalChecks, total] = await Promise.all([
      prisma.medicalCheck.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              grade: true,
              class: true,
              studentCode: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              checkTypes: true,
            },
          },
          nurse: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          scheduledDate: "asc",
        },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.medicalCheck.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Lấy danh sách báo cáo thành công",
      data: medicalChecks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy báo cáo kiểm tra của 1 học sinh
const getStudentMedicalChecks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year } = req.query;

    const where = { studentId };

    if (year) {
      where.scheduledDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const medicalChecks = await prisma.medicalCheck.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            checkTypes: true,
            scheduledDate: true,
          },
        },
        nurse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    res.json({
      success: true,
      message: "Lấy lịch sử kiểm tra học sinh thành công",
      data: medicalChecks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy báo cáo chi tiết
const getMedicalCheckDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalCheck = await prisma.medicalCheck.findUnique({
      where: { id },
      include: {
        student: true,
        campaign: true,
        nurse: true,
      },
    });

    if (!medicalCheck) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy báo cáo kiểm tra",
      });
    }

    res.json({
      success: true,
      message: "Lấy chi tiết báo cáo thành công",
      data: medicalCheck,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật trạng thái thông báo phụ huynh
const updateParentNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentNotified, parentResponse } = req.body;

    const updatedCheck = await prisma.medicalCheck.update({
      where: { id },
      data: {
        parentNotified,
        parentResponse,
      },
    });

    res.json({
      success: true,
      message: "Cập nhật thông báo phụ huynh thành công",
      data: updatedCheck,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tạo lịch kiểm tra cho từng học sinh (từng cá nhân)
const scheduleMedicalCheckForStudent = async (req, res) => {
  try {
    const { studentId, campaignId, scheduledDate, notes } = req.body;

    // Kiểm tra campaign có tồn tại và đang active không
    const campaign = await prisma.medicalCheckCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || !campaign.isActive) {
      return res.status(404).json({
        success: false,
        error: "Chiến dịch kiểm tra không tồn tại hoặc đã kết thúc",
      });
    }

    // Kiểm tra thông tin học sinh
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy học sinh" });
    }

    // Kiểm tra xem học sinh có thuộc grade target không
    if (!campaign.targetGrades.includes(student.grade)) {
      return res.status(400).json({
        success: false,
        error: `Học sinh lớp ${student.grade} không thuộc đối tượng kiểm tra của chiến dịch này`,
      });
    }

    // Kiểm tra trùng lặp
    const existingCheck = await prisma.medicalCheck.findFirst({
      where: {
        studentId,
        campaignId,
      },
    });

    if (existingCheck) {
      return res.status(400).json({
        success: false,
        error: "Học sinh đã có lịch kiểm tra cho chiến dịch này",
        existingCheck: {
          id: existingCheck.id,
          status: existingCheck.status,
          scheduledDate: existingCheck.scheduledDate,
        },
      });
    }

    // Tạo lịch kiểm tra
    const medicalCheck = await prisma.medicalCheck.create({
      data: {
        studentId,
        campaignId,
        scheduledDate: new Date(scheduledDate),
        notes: notes || null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            class: true,
            studentCode: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            checkTypes: true,
            deadline: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Đã tạo lịch kiểm tra cho học sinh ${student.name}`,
      data: medicalCheck,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tạo mới báo cáo kiểm tra sức khỏe (MedicalCheck)
const createMedicalCheck = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "nurse") {
      return res.status(403).json({
        success: false,
        error: "Chỉ y tá mới được phép tạo báo cáo kiểm tra sức khỏe",
      });
    }
    const nurseId = user.id;
    // Kiểm tra nurse tồn tại và active
    const nurse = await prisma.schoolNurse.findUnique({
      where: { id: nurseId },
    });
    if (!nurse || !nurse.isActive) {
      return res.status(403).json({
        success: false,
        error: "Tài khoản y tá không hợp lệ hoặc không còn hoạt động",
      });
    }
    const { studentId, campaignId, scheduledDate, notes } = req.body;
    // Validate bắt buộc
    if (!studentId || !campaignId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc: studentId, campaignId, scheduledDate",
      });
    }
    const campaign = await prisma.medicalCheckCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign || !campaign.isActive) {
      return res.status(404).json({
        success: false,
        error: "Chiến dịch kiểm tra không tồn tại hoặc đã kết thúc",
      });
    }
    // Kiểm tra học sinh tồn tại
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy học sinh",
      });
    }
    // Kiểm tra học sinh có thuộc target grade không
    if (!campaign.targetGrades.includes(student.grade)) {
      return res.status(400).json({
        success: false,
        error: `Học sinh lớp ${student.grade} không thuộc đối tượng kiểm tra của chiến dịch này`,
      });
    }
    // Kiểm tra trùng lặp
    const existingCheck = await prisma.medicalCheck.findFirst({
      where: { studentId, campaignId },
    });
    if (existingCheck) {
      return res.status(400).json({
        success: false,
        error: "Học sinh đã có báo cáo kiểm tra cho chiến dịch này",
        existingCheck: {
          id: existingCheck.id,
          status: existingCheck.status,
          scheduledDate: existingCheck.scheduledDate,
        },
      });
    }
    // Tạo mới
    const medicalCheck = await prisma.medicalCheck.create({
      data: {
        studentId,
        campaignId,
        nurseId,
        scheduledDate: new Date(scheduledDate),
        notes: notes || null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            class: true,
            studentCode: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            checkTypes: true,
            deadline: true,
          },
        },
        nurse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(201).json({
      success: true,
      message: `Đã tạo báo cáo kiểm tra cho học sinh ${student.name}`,
      data: medicalCheck,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Thống kê báo cáo theo campaign
const getMedicalCheckStats = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const stats = await prisma.medicalCheck.groupBy({
      by: ["status"],
      where: {
        campaignId,
      },
      _count: {
        status: true,
      },
    });

    // Thống kê kết quả kiểm tra
    const resultStats = await prisma.medicalCheck.aggregate({
      where: {
        campaignId,
        status: "COMPLETED",
      },
      _count: {
        visionResult: true,
        hearingResult: true,
        dentalResult: true,
      },
    });

    // Số lượng cần follow-up
    const followUpCount = await prisma.medicalCheck.count({
      where: {
        campaignId,
        requiresFollowUp: true,
      },
    });

    res.json({
      success: true,
      message: "Lấy thống kê thành công",
      data: {
        statusStats: stats,
        resultStats,
        followUpCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export {
  checkNursePermission,
  createMedicalCheck,
  getMedicalCheckDetail,
  getMedicalChecksByCampaign,
  getMedicalCheckStats,
  getStudentMedicalChecks,
  scheduleMedicalCheckForStudent,
  updateMedicalCheckResults,
  updateParentNotification,
  validateMedicalCheckData,
};
