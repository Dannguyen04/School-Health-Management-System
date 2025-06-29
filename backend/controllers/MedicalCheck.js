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
    const {
      studentId,
      campaignId,
      scheduledDate,
      height,
      weight,
      pulse,
      systolicBP,
      diastolicBP,
      physicalClassification,
      visionRightNoGlasses,
      visionLeftNoGlasses,
      visionRightWithGlasses,
      visionLeftWithGlasses,
      hearingLeftNormal,
      hearingLeftWhisper,
      hearingRightNormal,
      hearingRightWhisper,
      dentalUpperJaw,
      dentalLowerJaw,
      clinicalNotes,
      overallHealth,
      recommendations,
      requiresFollowUp,
      followUpDate,
      notes,
    } = req.body;
    // Validate bắt buộc
    const requiredFields = [
      studentId,
      campaignId,
      scheduledDate,
      height,
      weight,
      pulse,
      systolicBP,
      diastolicBP,
      physicalClassification,
      visionRightNoGlasses,
      visionLeftNoGlasses,
      visionRightWithGlasses,
      visionLeftWithGlasses,
      hearingLeftNormal,
      hearingLeftWhisper,
      hearingRightNormal,
      hearingRightWhisper,
      dentalUpperJaw,
      dentalLowerJaw,
      clinicalNotes,
      overallHealth,
    ];
    if (requiredFields.some((v) => v === undefined || v === null || v === "")) {
      return res.status(400).json({
        success: false,
        error:
          "Thiếu thông tin bắt buộc cho báo cáo kiểm tra sức khỏe. Vui lòng nhập đầy đủ tất cả các trường khám thể lực và lâm sàng!",
      });
    }
    // Validate kiểu dữ liệu và giá trị
    if (typeof height !== "number" || height < 50 || height > 250)
      return res.status(400).json({
        success: false,
        error: "Chiều cao không hợp lệ (50-250cm)",
      });
    if (typeof weight !== "number" || weight < 10 || weight > 200)
      return res.status(400).json({
        success: false,
        error: "Cân nặng không hợp lệ (10-200kg)",
      });
    if (typeof pulse !== "number" || pulse < 40 || pulse > 200)
      return res
        .status(400)
        .json({ success: false, error: "Mạch không hợp lệ (40-200)" });
    if (typeof systolicBP !== "number" || systolicBP < 60 || systolicBP > 250)
      return res.status(400).json({
        success: false,
        error: "Huyết áp tâm thu không hợp lệ (60-250)",
      });
    if (
      typeof diastolicBP !== "number" ||
      diastolicBP < 30 ||
      diastolicBP > 150
    )
      return res.status(400).json({
        success: false,
        error: "Huyết áp tâm trương không hợp lệ (30-150)",
      });
    if (
      !["EXCELLENT", "GOOD", "AVERAGE", "WEAK"].includes(physicalClassification)
    )
      return res.status(400).json({
        success: false,
        error: "Phân loại thể lực không hợp lệ",
      });
    // Validate các trường float lâm sàng
    const floatFields = [
      visionRightNoGlasses,
      visionLeftNoGlasses,
      visionRightWithGlasses,
      visionLeftWithGlasses,
      hearingLeftNormal,
      hearingLeftWhisper,
      hearingRightNormal,
      hearingRightWhisper,
    ];
    if (floatFields.some((f) => typeof f !== "number"))
      return res.status(400).json({
        success: false,
        error: "Các trường thị lực/thính lực phải là số",
      });
    if (
      typeof dentalUpperJaw !== "string" ||
      typeof dentalLowerJaw !== "string" ||
      typeof clinicalNotes !== "string"
    )
      return res.status(400).json({
        success: false,
        error: "Kết quả khám hàm và ghi chú phải là chuỗi",
      });
    // Validate enum overallHealth
    if (
      !["NORMAL", "NEEDS_ATTENTION", "REQUIRES_TREATMENT"].includes(
        overallHealth
      )
    )
      return res.status(400).json({
        success: false,
        error: "Trạng thái sức khỏe tổng thể không hợp lệ",
      });
    // Validate recommendations
    if (typeof recommendations !== "string")
      return res
        .status(400)
        .json({ success: false, error: "Khuyến nghị phải là chuỗi" });
    // Validate campaign, student
    const campaign = await prisma.medicalCheckCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign || !campaign.isActive) {
      return res.status(404).json({
        success: false,
        error: "Chiến dịch kiểm tra không tồn tại hoặc đã kết thúc",
      });
    }
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy học sinh" });
    }
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
        height,
        weight,
        pulse,
        systolicBP,
        diastolicBP,
        physicalClassification,
        visionRightNoGlasses,
        visionLeftNoGlasses,
        visionRightWithGlasses,
        visionLeftWithGlasses,
        hearingLeftNormal,
        hearingLeftWhisper,
        hearingRightNormal,
        hearingRightWhisper,
        dentalUpperJaw,
        dentalLowerJaw,
        clinicalNotes,
        overallHealth,
        recommendations,
        requiresFollowUp: requiresFollowUp || false,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        notes: notes || "",
        parentNotified: parentNotified || false,
        parentResponse: parentResponse || null,
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
        nurse: { select: { id: true, name: true } },
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

// Cập nhật kết quả kiểm tra: chỉ cho phép update notes, overallHealth, recommendations, requiresFollowUp, followUpDate, parentNotified, parentResponse
const updateMedicalCheckResults = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      notes,
      overallHealth,
      recommendations,
      requiresFollowUp,
      followUpDate,
      parentNotified,
      parentResponse,
    } = req.body;
    // Không cho phép update các trường kết quả khám, nếu có sẽ bỏ qua hoặc trả về lỗi (ở đây sẽ bỏ qua)
    const medicalCheck = await prisma.medicalCheck.findUnique({
      where: { id },
      include: { student: true, campaign: true },
    });
    if (!medicalCheck) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy báo cáo kiểm tra",
      });
    }
    if (medicalCheck.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        error:
          "Báo cáo đã hoàn thành, không thể chỉnh sửa. Vui lòng liên hệ quản trị viên.",
      });
    }
    // Chỉ cho phép update các trường sau
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (overallHealth !== undefined) {
      if (
        !["NORMAL", "NEEDS_ATTENTION", "REQUIRES_TREATMENT"].includes(
          overallHealth
        )
      )
        return res.status(400).json({
          success: false,
          error: "Trạng thái sức khỏe tổng thể không hợp lệ",
        });
      updateData.overallHealth = overallHealth;
    }
    if (recommendations !== undefined)
      updateData.recommendations = recommendations;
    if (requiresFollowUp !== undefined)
      updateData.requiresFollowUp = requiresFollowUp;
    if (followUpDate !== undefined)
      updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (parentNotified !== undefined)
      updateData.parentNotified = parentNotified;
    if (parentResponse !== undefined)
      updateData.parentResponse = parentResponse;
    // Nếu không có trường nào hợp lệ để update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Không có trường nào hợp lệ để cập nhật",
      });
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
          select: { id: true, name: true, checkTypes: true },
        },
        nurse: { select: { id: true, name: true } },
      },
    });
    res.json({
      success: true,
      message: `Cập nhật báo cáo kiểm tra cho học sinh ${updatedCheck.student.name} thành công`,
      data: updatedCheck,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy danh sách báo cáo kiểm tra theo campaign
const getMedicalChecksByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const medicalChecks = await prisma.medicalCheck.findMany({
      where: { campaignId },
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
    });

    res.json({
      success: true,
      message: "Lấy danh sách báo cáo thành công",
      data: medicalChecks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy báo cáo kiểm tra của 1 học sinh
const getStudentMedicalChecks = async (req, res) => {
  try {
    const { studentId } = req.params;

    const medicalChecks = await prisma.medicalCheck.findMany({
      where: {
        studentId,
      },
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

export {
  checkNursePermission,
  createMedicalCheck,
  getMedicalCheckDetail,
  getMedicalChecksByCampaign,
  getStudentMedicalChecks,
  updateMedicalCheckResults,
  updateParentNotification,
  validateMedicalCheckData,
};
