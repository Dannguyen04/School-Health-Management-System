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
    if (!user || user.role !== "SCHOOL_NURSE") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền thực hiện chức năng này (chỉ dành cho y tá)",
      });
    }
    const nurseId = user.id; // hoặc user.nurseId nếu token lưu như vậy
    const nurse = await prisma.schoolNurse.findFirst({
      where: { userId: nurseId },
      include: { user: true },
    });
    if (!nurse) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thông tin y tá",
      });
    }
    if (!nurse.user.isActive) {
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
    if (!user || user.role !== "SCHOOL_NURSE") {
      return res.status(403).json({
        success: false,
        error: "Chỉ y tá mới được phép tạo báo cáo kiểm tra sức khỏe",
      });
    }
    const nurseId = user.id;
    // Kiểm tra nurse tồn tại và active
    const nurse = await prisma.schoolNurse.findUnique({
      where: { userId: nurseId },
      include: { user: true },
    });
    if (!nurse || !nurse.user.isActive) {
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
      parentNotified,
      parentResponse,
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
    // Validate các trường thị lực và thính lực (có thể là số hoặc string)
    const visionHearingFields = [
      visionRightNoGlasses,
      visionLeftNoGlasses,
      visionRightWithGlasses,
      visionLeftWithGlasses,
      hearingLeftNormal,
      hearingLeftWhisper,
      hearingRightNormal,
      hearingRightWhisper,
    ];

    // Kiểm tra kiểu dữ liệu
    if (
      visionHearingFields.some(
        (f) => typeof f !== "number" && typeof f !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        error: "Các trường thị lực/thính lực phải là số hoặc chuỗi",
      });
    }

    // Validate thị lực (có thể là số hoặc string)
    const visionFields = [
      visionRightNoGlasses,
      visionLeftNoGlasses,
      visionRightWithGlasses,
      visionLeftWithGlasses,
    ];
    visionFields.forEach((field, index) => {
      if (typeof field === "string") {
        // Nếu là string số, validate range
        const numValue = parseFloat(field);
        if (!isNaN(numValue)) {
          if (numValue < 0) {
            return res.status(400).json({
              success: false,
              error: "Thị lực không được là số âm",
            });
          }
          if (numValue > 20) {
            return res.status(400).json({
              success: false,
              error: "Giá trị thị lực quá cao",
            });
          }
        }
      }
    });

    // Validate thính lực (có thể là số hoặc string)
    const hearingFields = [
      hearingLeftNormal,
      hearingLeftWhisper,
      hearingRightNormal,
      hearingRightWhisper,
    ];
    hearingFields.forEach((field, index) => {
      if (typeof field === "string") {
        // Nếu là string số, validate range
        const numValue = parseFloat(field);
        if (!isNaN(numValue)) {
          if (numValue < 0) {
            return res.status(400).json({
              success: false,
              error: "Thính lực không được là số âm",
            });
          }
          if (numValue > 10) {
            return res.status(400).json({
              success: false,
              error: "Giá trị thính lực quá cao",
            });
          }
        }
      }
    });
    // Validate các trường răng miệng và ghi chú
    if (
      typeof dentalUpperJaw !== "string" ||
      typeof dentalLowerJaw !== "string" ||
      typeof clinicalNotes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Kết quả khám hàm và ghi chú phải là chuỗi",
      });
    }

    // Validate độ dài và nội dung cho răng miệng
    if (dentalUpperJaw.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Kết quả răng hàm trên phải có ít nhất 2 ký tự",
      });
    }
    if (dentalUpperJaw.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Kết quả răng hàm trên không được quá 100 ký tự",
      });
    }
    if (dentalLowerJaw.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Kết quả răng hàm dưới phải có ít nhất 2 ký tự",
      });
    }
    if (dentalLowerJaw.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Kết quả răng hàm dưới không được quá 100 ký tự",
      });
    }
    if (clinicalNotes.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Ghi chú lâm sàng phải có ít nhất 3 ký tự",
      });
    }
    if (clinicalNotes.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Ghi chú lâm sàng không được quá 500 ký tự",
      });
    }

    // Kiểm tra không được chỉ chứa số cho răng miệng
    const onlyNumbersRegex = /^[0-9\s]+$/;
    if (onlyNumbersRegex.test(dentalUpperJaw)) {
      return res.status(400).json({
        success: false,
        error: "Kết quả răng hàm trên phải là text, không được chỉ chứa số",
      });
    }
    if (onlyNumbersRegex.test(dentalLowerJaw)) {
      return res.status(400).json({
        success: false,
        error: "Kết quả răng hàm dưới phải là text, không được chỉ chứa số",
      });
    }
    if (onlyNumbersRegex.test(clinicalNotes)) {
      return res.status(400).json({
        success: false,
        error: "Ghi chú lâm sàng phải là text, không được chỉ chứa số",
      });
    }
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
    // Validate ngày khám phải nằm trong thời gian của chiến dịch
    const checkDate = new Date(scheduledDate);
    const campaignStart = new Date(campaign.scheduledDate);
    const campaignEnd = new Date(campaign.deadline);
    if (checkDate < campaignStart || checkDate > campaignEnd) {
      return res.status(400).json({
        success: false,
        error: "Ngày khám phải nằm trong thời gian của chiến dịch",
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
        status: "COMPLETED",
      },
      include: {
        student: true,
        campaign: {
          select: {
            id: true,
            name: true,
            deadline: true,
          },
        },
        nurse: { include: { user: true } },
      },
    });
    // Tính trung bình thị lực và thính lực (chỉ khi là số)
    let avgVision = "N/A";
    let avgHearing = "N/A";

    const visionRightNum = parseFloat(visionRightWithGlasses);
    const visionLeftNum = parseFloat(visionLeftWithGlasses);
    const hearingLeftNum = parseFloat(hearingLeftNormal);
    const hearingRightNum = parseFloat(hearingRightNormal);

    if (!isNaN(visionRightNum) && !isNaN(visionLeftNum)) {
      avgVision = ((visionRightNum + visionLeftNum) / 2).toFixed(1);
    }

    if (!isNaN(hearingLeftNum) && !isNaN(hearingRightNum)) {
      avgHearing = ((hearingLeftNum + hearingRightNum) / 2).toFixed(1);
    }

    try {
      await prisma.healthProfile.update({
        where: { studentId },
        data: {
          height,
          weight,
          vision: avgVision,
          hearing: avgHearing,
          lastUpdatedBy: nurseId,
        },
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: "Hồ sơ sức khỏe của học sinh chưa được phụ huynh tạo!",
      });
    }
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
      updateData.followUpDate = followUpDate
        ? new Date(followUpDate)
        : medicalCheck.followUpDate;
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
        student: true,
        campaign: {
          select: { id: true, name: true },
        },
        nurse: { include: { user: true } },
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
            studentCode: true,
            fullName: true,
            grade: true,
            class: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        nurse: {
          include: {
            user: true,
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
            scheduledDate: true,
          },
        },
        nurse: {
          include: {
            user: true,
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
