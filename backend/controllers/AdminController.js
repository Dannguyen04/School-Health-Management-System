import { PrismaClient } from "@prisma/client";
import validator from "validator";

const prisma = new PrismaClient();

const VALID_ROLES = ["PARENT", "SCHOOL_NURSE", "MANAGER", "ADMIN"];
const VALID_GENDERS = ["NAM", "NỮ"];

const roleToModel = {
  STUDENT: "studentProfile",
  PARENT: "parentProfile",
  SCHOOL_NURSE: "nurseProfile",
  MANAGER: "managerProfile",
  ADMIN: "adminProfile",
};

const roleToTable = {
  STUDENT: "student",
  PARENT: "parent",
  SCHOOL_NURSE: "schoolNurse",
  MANAGER: "manager",
  ADMIN: "admin",
};

const normalizeRole = (role) => {
  return role.toUpperCase().trim().replace(/\s+/g, "_");
};

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const validateGrade = (grade) => {
  const gradeNum = parseInt(grade);
  return !isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 5;
};

const validateDateOfBirth = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 100, 0, 1);
  const maxDate = new Date(now.getFullYear() - 6, 11, 31);

  return !isNaN(dob.getTime()) && dob >= minDate && dob <= maxDate;
};

const findUserByEmail = async (email) => {
  try {
    return await prisma.users.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

const findParentByName = async (parentName, tx = prisma) => {
  try {
    return await tx.parent.findFirst({
      where: {
        user: {
          fullName: {
            contains: parentName,
            mode: "insensitive",
          },
          role: "PARENT",
          isActive: true,
        },
      },
      include: {
        user: true,
      },
    });
  } catch (error) {
    throw new Error(`Error finding parent: ${error.message}`);
  }
};
// Hàm loại bỏ các trường profile null khỏi user
function cleanUserProfiles(user) {
  const cleaned = { ...user };
  if (cleaned.parentProfile === null) delete cleaned.parentProfile;
  if (cleaned.nurseProfile === null) delete cleaned.nurseProfile;
  if (cleaned.managerProfile === null) delete cleaned.managerProfile;
  if (cleaned.adminProfile === null) delete cleaned.adminProfile;
  if (cleaned.studentProfile === null) delete cleaned.studentProfile;
  return cleaned;
}

const assignParentToStudent = async (
  studentId,
  parentName,
  relationship = "guardian",
  isPrimary = false,
  tx
) => {
  try {
    const parent = await findParentByName(parentName, tx);
    if (!parent) {
      return { success: false, error: "Không tìm thấy phụ huynh" };
    }

    const existingRelationship = await tx.studentParent.findFirst({
      where: { studentId, parentId: parent.id },
    });

    if (existingRelationship) {
      return {
        success: false,
        error: "Phụ huynh đã được gán cho học sinh này",
      };
    }

    if (isPrimary) {
      await tx.studentParent.updateMany({
        where: { studentId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const studentParent = await tx.studentParent.create({
      data: {
        studentId,
        parentId: parent.id,
        relationship,
        isPrimary,
      },
      include: {
        parent: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: `Đã gán phụ huynh ${parent.user.fullName} cho học sinh ${studentParent.student.fullName}`,
      data: {
        studentName: studentParent.student.fullName,
        parentName: studentParent.parent.user.fullName,
        parentEmail: studentParent.parent.user.email,
        parentPhone: studentParent.parent.user.phone,
        relationship: studentParent.relationship,
        isPrimary: studentParent.isPrimary,
      },
    };
  } catch (error) {
    throw new Error(`Lỗi khi gán phụ huynh cho học sinh: ${error.message}`);
  }
};

const generateStudentCode = async () => {
  // Lấy học sinh mới nhất
  const student = await prisma.student.findFirst({
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  let count = 0;
  if (student && student.studentCode) {
    count = parseInt(student.studentCode.slice(3)) || 0;
  }
  const nextNumber = count + 1;
  return `STU${nextNumber.toString().padStart(4, "0")}`;
};

const createAuditLog = async (
  tx,
  userId,
  action,
  resource,
  resourceId,
  details,
  req
) => {
  return await tx.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent") || "Unknown",
      createdAt: new Date(),
    },
  });
};

const addRole = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(422).json({
        success: false,
        error: "Thiếu trường bắt buộc",
      });
    }

    if (!validateEmail(email)) {
      return res.status(422).json({
        success: false,
        error: "Email không hợp lệ",
      });
    }

    if (!validatePassword(password)) {
      return res.status(422).json({
        success: false,
        error: "Mật khẩu phải có ít nhất 8 ký tự",
      });
    }

    const normalizedRole = normalizeRole(role);
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(422).json({
        success: false,
        error: `Vai trò không hợp lệ. Phải là một trong: ${VALID_ROLES.join(
          ", "
        )}`,
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(422).json({
        success: false,
        error: "Email đã tồn tại",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          fullName: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          role: normalizedRole,
          isActive: true,
        },
      });

      const tableName = roleToTable[normalizedRole];
      const roleProfile = await tx[tableName].create({
        data: {
          userId: user.id,
        },
      });

      await createAuditLog(
        tx,
        user.id,
        "create",
        "user",
        user.id,
        { role: normalizedRole, email, fullName: name },
        req
      );

      return { user, roleProfile };
    });

    const { user, roleProfile } = result;

    res.status(201).json({
      success: true,
      message: `${normalizedRole.toLowerCase()} tạo thành công`,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        [`${normalizedRole.toLowerCase()}Profile`]: roleProfile,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo vai trò:", error);

    if (error.code === "P2002") {
      return res.status(422).json({
        success: false,
        error: "Trùng giá trị cho trường duy nhất",
      });
    }

    res.status(500).json({
      success: false,
      error: "Lỗi máy chủ nội bộ",
    });
  }
};

//get all user
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        role: {
          notIn: ["STUDENT", "PARENT"],
        },
      },
      include: {
        parentProfile: true,
        nurseProfile: true,
        managerProfile: true,
        adminProfile: true,
      },
    });
    const cleanedUsers = users.map(cleanUserProfiles);
    res.status(200).json({ success: true, data: cleanedUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { role, email, password, fullName } = req.body;
  try {
    if (!email || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: "Email, họ tên và vai trò là bắt buộc",
      });
    }
    if (password && !validatePassword(password)) {
      return res.status(422).json({
        success: false,
        error: "Mật khẩu phải có ít nhất 8 ký tự nếu cung cấp",
      });
    }
    if (!validateEmail(email)) {
      return res.status(422).json({
        success: false,
        error: "Email không hợp lệ",
      });
    }
    const normalizedRole = normalizeRole(role);
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(422).json({
        success: false,
        error: `Vai trò không hợp lệ. Phải là một trong: ${VALID_ROLES.join(
          ", "
        )}`,
      });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id !== id) {
      return res.status(400).json({
        success: false,
        error: "Email đã được sử dụng",
      });
    }
    const updatedUser = await prisma.$transaction(async (tx) => {
      const currentUser = await tx.users.findUnique({
        where: { id },
        include: {
          parentProfile: true,
          nurseProfile: true,
          managerProfile: true,
          adminProfile: true,
        },
      });
      if (!currentUser) {
        throw new Error("User not found");
      }
      if (currentUser.role !== normalizedRole) {
        const oldTableName = roleToTable[currentUser.role];
        if (oldTableName && currentUser[roleToModel[currentUser.role]]) {
          await tx[oldTableName].delete({ where: { userId: id } });
        }
        const newTableName = roleToTable[normalizedRole];
        if (newTableName) {
          await tx[newTableName].create({
            data: { userId: id },
          });
        }
      }
      const updateData = {
        role: normalizedRole,
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        updatedAt: new Date(),
      };
      if (password) {
        updateData.password = password;
      }
      const user = await tx.users.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          parentProfile: true,
          nurseProfile: true,
          managerProfile: true,
          adminProfile: true,
        },
      });
      await createAuditLog(
        tx,
        id,
        "update",
        "user",
        id,
        {
          changes: { role: normalizedRole, email, fullName },
          oldRole: currentUser.role,
          passwordChanged: !!password,
        },
        req
      );
      return user;
    });
    const cleanedUser = cleanUserProfiles(updatedUser);
    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: cleanedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng hoặc hồ sơ",
      });
    }
    res.status(500).json({
      success: false,
      error: "Lỗi máy chủ nội bộ",
    });
  }
};

// Xóa toàn bộ các hàm liên quan đến Student (addStudent, updateStudent, deleteStudent, getAllStudents, filterStudents, và các hàm helper liên quan student)

const filterUsers = async (req, res) => {
  try {
    const { name, email, role } = req.query;
    const where = {};
    if (name && name.trim() !== "") {
      where.fullName = { contains: name.trim(), mode: "insensitive" };
    }
    if (email && email.trim() !== "") {
      where.email = { contains: email.trim(), mode: "insensitive" };
    }
    if (role && role.trim() !== "") {
      where.role = normalizeRole(role);
    } else {
      where.role = { not: "STUDENT" };
    }
    const users = await prisma.users.findMany({
      where,
      include: {
        parentProfile: true,
        nurseProfile: true,
        managerProfile: true,
        adminProfile: true,
      },
    });
    const cleanedUsers = users.map(cleanUserProfiles);
    res.status(200).json({ success: true, data: cleanedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Dashboard statistics functions
const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await prisma.users.count({
      where: { isActive: true },
    });

    const activeUsers = await prisma.users.count({
      where: { isActive: true },
    });

    const nurses = await prisma.users.count({
      where: {
        role: "SCHOOL_NURSE",
        isActive: true,
      },
    });

    const parents = await prisma.users.count({
      where: {
        role: "PARENT",
        isActive: true,
      },
    });

    const students = await prisma.student.count({
      where: {
        isActive: true,
      },
    });

    // Get medication statistics from StudentMedication table
    const totalMedications = await prisma.studentMedication.count();
    const activeMedications = await prisma.studentMedication.count({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
        },
      },
    });
    const completedMedications = await prisma.studentMedication.count({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: new Date(),
        },
      },
    });

    // Get medical events statistics
    const totalMedicalEvents = await prisma.medicalEvent.count();
    const resolvedMedicalEvents = await prisma.medicalEvent.count({
      where: { status: "RESOLVED" },
    });
    const pendingMedicalEvents = await prisma.medicalEvent.count({
      where: { status: "PENDING" },
    });
    const inProgressMedicalEvents = await prisma.medicalEvent.count({
      where: { status: "IN_PROGRESS" },
    });

    // Get vaccination campaign statistics
    const totalVaccinationCampaigns = await prisma.vaccinationCampaign.count({
      where: { isActive: true },
    });
    const upcomingVaccinationCampaigns = await prisma.vaccinationCampaign.count(
      {
        where: {
          isActive: true,
          scheduledDate: {
            gte: new Date(),
          },
        },
      }
    );

    // Get form statistics (using StudentMedication as forms for now)
    const totalForms = await prisma.studentMedication.count();
    const approvedForms = await prisma.studentMedication.count({
      where: { status: "APPROVED" },
    });
    const pendingForms = await prisma.studentMedication.count({
      where: { status: "PENDING_APPROVAL" },
    });
    const rejectedForms = await prisma.studentMedication.count({
      where: { status: "REJECTED" },
    });

    // Get user growth trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowthData = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthYear = date.toISOString().slice(0, 7); // YYYY-MM format

      const userCount = await prisma.users.count({
        where: {
          createdAt: {
            lte: date,
          },
          isActive: true,
        },
      });

      userGrowthData.push({
        date: monthYear,
        users: userCount,
      });
    }

    // Get form status distribution
    const formStatusData = [
      { status: "Đã duyệt", count: approvedForms },
      { status: "Đang chờ", count: pendingForms },
      { status: "Từ chối", count: rejectedForms },
    ];

    // Get medical event status distribution
    const medicalEventStatusData = [
      { status: "Đã giải quyết", count: resolvedMedicalEvents },
      { status: "Đang chờ", count: pendingMedicalEvents },
      { status: "Đang xử lý", count: inProgressMedicalEvents },
    ];

    const stats = {
      userStats: {
        total: totalUsers,
        active: activeUsers,
        nurses,
        parents,
        students,
      },
      formStats: {
        total: totalForms,
        approved: approvedForms,
        pending: pendingForms,
        rejected: rejectedForms,
      },
      medicationStats: {
        total: totalMedications,
        active: activeMedications,
        completed: completedMedications,
      },
      medicalEventStats: {
        total: totalMedicalEvents,
        resolved: resolvedMedicalEvents,
        pending: pendingMedicalEvents,
        inProgress: inProgressMedicalEvents,
      },
      vaccinationCampaignStats: {
        total: totalVaccinationCampaigns,
        upcoming: upcomingVaccinationCampaigns,
      },
      userGrowthData,
      formStatusData,
      medicalEventStatusData,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê dashboard:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi máy chủ nội bộ",
    });
  }
};

// Lấy tất cả học sinh cho y tá chọn
const getAllStudentsForNurse = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        status: "active",
      },
      include: {
        healthProfile: true,
        parents: {
          where: { isPrimary: true },
          select: { parentId: true },
        },
      },
      orderBy: {
        fullName: "asc",
      },
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      studentCode: student.studentCode,
      fullName: student.fullName,
      grade: student.grade,
      class: student.class,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      healthProfile: student.healthProfile,
      parentId: student.parents?.[0]?.parentId,
    }));

    res.json({
      success: true,
      data: formattedStudents,
    });
  } catch (error) {
    console.error("Error getting students for nurse:", error);
    res.status(500).json({
      success: false,
      error: "Error getting students",
    });
  }
};

// Lấy danh sách phụ huynh
export const getAllParents = async (req, res) => {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        user: true,
      },
    });
    const data = parents.map((parent) => ({
      id: parent.id,
      userId: parent.userId, // Thêm userId để frontend lấy đúng user
      fullName: parent.user.fullName,
      email: parent.user.email,
      phone: parent.user.phone,
      isActive: parent.user.isActive,
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Thêm phụ huynh mới
export const addParent = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu thông tin bắt buộc" });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Email không hợp lệ" });
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email đã tồn tại" });
    }
    // Tạo user và parent profile
    const user = await prisma.users.create({
      data: {
        fullName: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: "12345678", // Có thể random hoặc gửi mail sau
        role: "PARENT",
        isActive: true,
      },
    });
    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
      },
    });
    res.status(201).json({
      success: true,
      data: {
        id: parent.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Sửa thông tin phụ huynh
export const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu thông tin bắt buộc" });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Email không hợp lệ" });
    }
    // Tìm parent và user liên quan
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy phụ huynh" });
    }
    // Kiểm tra email trùng
    if (email !== parent.user.email) {
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, error: "Email đã tồn tại" });
      }
    }
    // Cập nhật user
    const updatedUser = await prisma.users.update({
      where: { id: parent.user.id },
      data: {
        fullName: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
      },
    });
    res.json({
      success: true,
      data: {
        id: parent.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Xóa phụ huynh
export const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy phụ huynh" });
    }
    // Xóa các quan hệ liên quan trước
    await prisma.studentParent.deleteMany({ where: { parentId: id } });
    await prisma.studentMedication.deleteMany({ where: { parentId: id } });
    await prisma.vaccinationConsent.deleteMany({ where: { parentId: id } });
    // Xóa user, parent sẽ tự động bị xóa do onDelete: Cascade
    await prisma.users.delete({ where: { id: parent.userId } });
    res.json({ success: true, message: "Xóa phụ huynh thành công" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// API: Lấy tất cả các khối và số lượng học sinh từng khối
const getAllGradesWithStudentCount = async (req, res) => {
  try {
    const grades = ["1", "2", "3", "4", "5"];
    const counts = await Promise.all(
      grades.map(async (grade) => {
        const count = await prisma.student.count({ where: { grade } });
        return { grade, count };
      })
    );
    res.json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });

    const user = await prisma.users.findUnique({
      where: { id: id },
      select: {
        password: true,
      },
    });

    if (!user)
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });

    return res.status(200).json({
      success: true,
      password: user.password,
      message: "Lấy mật khẩu thành công",
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, cfPassword } = req.body;

    if (!id)
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });

    if (password !== cfPassword)
      return res.status(404).json({
        success: false,
        error: "Mật khảu không khớp",
      });

    const user = await prisma.users.findUnique({
      where: { id: id },
    });

    if (!user)
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });

    const updatePass = await prisma.users.update({
      where: { id: id },
      data: {
        password: password,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        user: updatePass,
        newPassword: password,
      },
      message: "Cập nhật mật khẩu thành công",
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

process.on("SIGTERM", async () => {
  console.log("Shutting down AdminController...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

export {
  addRole,
  filterUsers,
  getAllGradesWithStudentCount,
  getAllStudentsForNurse,
  getAllUsers,
  getDashboardStats,
  updateRole,
};
