import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import validator from "validator";

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
  const maxDate = new Date(now.getFullYear() - 3, 11, 31);

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
      message: `Đã gán phụ huynh ${parent.user.fullName} cho học sinh ${studentParent.student.user.fullName}`,
      data: {
        studentName: studentParent.student.user.fullName,
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

// Auto-generate student code in the format STU0001, STU0002, ...
const generateStudentCode = async () => {
  // Count all students in the DB
  const count = await prisma.student.count();
  // Next student number (1-based)
  const nextNumber = count + 1;
  // Pad with leading zeros to 4 digits
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

const addStudent = async (req, res) => {
  try {
    console.log("📝 Bắt đầu tạo học sinh mới...");
    console.log("📋 Dữ liệu nhận được:", req.body);

    const {
      fullName,
      password,
      email,
      phone,
      dateOfBirth,
      gender,
      grade,
      class: studentClass,
      emergencyContact,
      emergencyPhone,
      parentName,
      bloodType,
    } = req.body;

    const requiredFields = [
      "fullName",
      "email",
      "password",
      "dateOfBirth",
      "gender",
      "studentClass",
      "grade",
      "emergencyContact",
      "emergencyPhone",
      "parentName",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field === "studentClass" ? "class" : field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      return res.status(422).json({
        success: false,
        error: `Thiếu trường bắt buộc: ${missingFields.join(", ")}`,
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

    if (!validateDateOfBirth(dateOfBirth)) {
      return res.status(422).json({
        success: false,
        error: "Ngày sinh không hợp lệ",
      });
    }

    if (!validateGrade(grade)) {
      return res.status(422).json({
        success: false,
        error: "Khối lớp phải từ 1 đến 5",
      });
    }

    // Validate gender
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender.toLowerCase())) {
      return res.status(422).json({
        success: false,
        error: `Giới tính phải là: ${validGenders.join(", ")}`,
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(422).json({
        success: false,
        error: `Email đã tồn tại cho người dùng ${existingUser.fullName}`,
      });
    }

    console.log("✅ Validation thành công, bắt đầu tạo học sinh...");

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          role: "STUDENT",
          phone: phone?.trim(),
          isActive: true,
        },
      });

      console.log("✅ Tạo user thành công:", user.id);

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentCode: await generateStudentCode(),
          dateOfBirth: new Date(dateOfBirth),
          gender: gender.toLowerCase(),
          grade: grade.toString(),
          class: studentClass.trim(),
          emergencyContact: emergencyContact?.trim(),
          emergencyPhone: emergencyPhone?.trim(),
          ...(bloodType && { bloodType: bloodType.trim() }),
        },
      });

      console.log("✅ Tạo student profile thành công:", student.id);

      const parentResult = await assignParentToStudent(
        student.id,
        parentName,
        "guardian",
        true,
        tx
      );

      if (!parentResult.success) {
        console.log("⚠️ Không thể gán phụ huynh:", parentResult.error);
        // Không throw error, chỉ log warning
      }

      await createAuditLog(
        tx,
        user.id,
        "create",
        "student",
        student.id,
        {
          Name: fullName,
          Email: email,
          "Mã học sinh": student.studentCode,
          "Khối lớp": grade,
          Lớp: studentClass,
          "Phụ huynh": parentResult?.data?.parentName || null,
        },
        req
      );

      return { user, student, parent: parentResult.data };
    });

    console.log("🎉 Tạo học sinh thành công!");

    return res.status(201).json({
      success: true,
      message: "Tạo học sinh thành công",
      data: {
        id: result.student.id,
        fullName: result.user.fullName,
        email: result.user.email,
        studentCode: result.student.studentCode,
        parent: result.parent,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo học sinh:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Lỗi máy chủ nội bộ",
    });
  }
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
          not: "STUDENT",
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
const getAllStudents = async (req, res) => {
  try {
    console.log("🔍 Đang tìm tất cả học sinh...");

    const students = await prisma.users.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
      },
    });

    console.log(`📊 Tìm thấy ${students.length} học sinh`);

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Không có học sinh nào trong hệ thống",
      });
    }

    const cleanedStudents = students.map(cleanUserProfiles);
    console.log("✅ Dữ liệu học sinh đã được xử lý");

    res.status(200).json({ success: true, data: cleanedStudents });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách học sinh:", error);
    return res.status(500).json({ success: false, error: error.message });
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

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    phone,
    dateOfBirth,
    gender,
    class: studentClass,
    grade,
    bloodType,
    emergencyContact,
    emergencyPhone,
  } = req.body;

  try {
    const requiredFields = [
      "fullName",
      "email",
      "dateOfBirth",
      "gender",
      "studentClass",
      "grade",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field === "studentClass" ? "class" : field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      return res.status(422).json({
        success: false,
        error: `Thiếu trường bắt buộc: ${missingFields.join(", ")}`,
      });
    }

    if (!validateEmail(email)) {
      return res.status(422).json({
        success: false,
        error: "Email không hợp lệ",
      });
    }

    if (!validateDateOfBirth(dateOfBirth)) {
      return res.status(422).json({
        success: false,
        error: "Ngày sinh không hợp lệ",
      });
    }

    if (!validateGrade(grade)) {
      return res.status(422).json({
        success: false,
        error: "Khối lớp phải từ 1 đến 5",
      });
    }

    // Validate gender
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender.toLowerCase())) {
      return res.status(422).json({
        success: false,
        error: `Giới tính phải là: ${validGenders.join(", ")}`,
      });
    }

    const user = await prisma.users.findUnique({
      where: { id },
      include: { studentProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    if (user.role !== "STUDENT") {
      return res.status(400).json({
        success: false,
        error: "Người dùng không phải là học sinh",
      });
    }

    if (!user.studentProfile) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy hồ sơ học sinh",
      });
    }

    const existingEmailUser = await findUserByEmail(email);
    if (existingEmailUser && existingEmailUser.id !== id) {
      return res.status(400).json({
        success: false,
        error: "Email đã được đăng ký bởi người dùng khác",
      });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const userUpdate = await tx.users.update({
        where: { id },
        data: {
          email: email.toLowerCase().trim(),
          fullName: fullName.trim(),
          ...(phone && { phone: phone.trim() }),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.student.update({
        where: { userId: id },
        data: {
          dateOfBirth: new Date(dateOfBirth),
          gender: gender.toLowerCase(),
          class: studentClass.trim(),
          grade: grade.toString(),
          ...(emergencyContact && {
            emergencyContact: emergencyContact.trim(),
          }),
          ...(emergencyPhone && {
            emergencyPhone: emergencyPhone.trim(),
          }),
          ...(bloodType && { bloodType: bloodType.trim() }),
          updatedAt: new Date(),
        },
      });

      await createAuditLog(
        tx,
        id,
        "update",
        "student",
        id,
        {
          changes: {
            fullName,
            email,
            dateOfBirth,
            gender,
            class: studentClass,
            grade,
            bloodType,
            emergencyContact,
            emergencyPhone,
          },
        },
        req
      );

      return userUpdate;
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật học sinh thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật học sinh:", error);
    if (error.code === "P2002") {
      return res.status(422).json({
        success: false,
        error: "Vi phạm ràng buộc duy nhất (giá trị trùng lặp)",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Lỗi máy chủ nội bộ",
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🗑️ Bắt đầu xóa user với ID: ${id}`);

    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        parentProfile: true,
        nurseProfile: true,
        managerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      console.log(`❌ Không tìm thấy user với ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    console.log(`📋 Tìm thấy user: ${user.fullName} (${user.role})`);

    // Nếu là student, xóa tất cả dữ liệu liên quan trước
    if (user.role === "STUDENT" && user.studentProfile) {
      console.log(
        `🎓 Xóa tất cả dữ liệu liên quan đến student: ${user.studentProfile.studentCode}`
      );

      const studentId = user.studentProfile.id;

      try {
        // Xóa tất cả dữ liệu liên quan đến student
        await prisma.$transaction(async (tx) => {
          // Xóa StudentParent relationships
          await tx.studentParent.deleteMany({
            where: { studentId: studentId },
          });
          console.log("✅ Đã xóa StudentParent relationships");

          // Xóa StudentMedication
          await tx.studentMedication.deleteMany({
            where: { studentId: studentId },
          });
          console.log("✅ Đã xóa StudentMedication");

          // Xóa MedicalEvent
          await tx.medicalEvent.deleteMany({
            where: { studentId: studentId },
          });
          console.log("✅ Đã xóa MedicalEvent");

          // Xóa MedicalCheck
          await tx.medicalCheck.deleteMany({
            where: { studentId: studentId },
          });
          console.log("✅ Đã xóa MedicalCheck");

          // Xóa HealthProfile
          await tx.healthProfile.deleteMany({
            where: { studentId: studentId },
          });
          console.log("✅ Đã xóa HealthProfile");

          // Xóa Vaccination
          await tx.vaccination.deleteMany({
            where: { studentId: studentId },
          });
          console.log("✅ Đã xóa Vaccination");
        });
      } catch (studentError) {
        console.log(
          "⚠️ Lỗi khi xóa dữ liệu student, tiếp tục xóa user:",
          studentError.message
        );
      }
    }

    // Xóa user và profile
    await prisma.$transaction(async (tx) => {
      // Tạo audit log trước khi xóa user
      try {
        await createAuditLog(
          tx,
          req.user.id, // Sử dụng ID của admin đang thực hiện xóa
          "delete",
          "user",
          id,
          {
            role: user.role,
            email: user.email,
            fullName: user.fullName,
          },
          req
        );
        console.log("✅ Đã tạo audit log");
      } catch (auditError) {
        console.log("⚠️ Lỗi khi tạo audit log:", auditError.message);
        // Không throw error vì vẫn tiếp tục xóa user
      }

      // Xóa tất cả audit logs liên quan đến user này trước
      try {
        console.log("🗑️ Xóa audit logs liên quan");
        await tx.auditLog.deleteMany({
          where: { userId: id },
        });
        console.log("✅ Đã xóa audit logs");
      } catch (auditDeleteError) {
        console.log("⚠️ Lỗi khi xóa audit logs:", auditDeleteError.message);
        // Tiếp tục xóa user
      }

      // Xóa profile tương ứng với role
      const tableName = roleToTable[user.role];
      if (tableName && user[roleToModel[user.role]]) {
        console.log(`🗑️ Xóa ${tableName} profile`);
        await tx[tableName].delete({ where: { userId: id } });
        console.log(`✅ Đã xóa ${tableName} profile`);
      }

      // Xóa user cuối cùng
      console.log("🗑️ Xóa user record");
      await tx.users.delete({
        where: { id: id },
      });
      console.log("✅ Đã xóa user record");
    });

    console.log(`✅ Xóa user ${user.fullName} thành công`);

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa người dùng:", error);
    console.error("❌ Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    // Xử lý các lỗi cụ thể
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bản ghi cần xóa",
        code: error.code,
      });
    } else if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Không thể xóa do có dữ liệu liên quan",
        code: error.code,
      });
    } else if (error.code === "P2014") {
      return res.status(400).json({
        success: false,
        error: "Không thể xóa do vi phạm ràng buộc quan hệ bắt buộc",
        code: error.code,
      });
    } else if (error.code === "P2034") {
      return res.status(409).json({
        success: false,
        error: "Xung đột dữ liệu. Vui lòng thử lại sau.",
        code: error.code,
      });
    }

    res.status(500).json({
      success: false,
      error: "Lỗi máy chủ nội bộ",
      code: error.code || "UNKNOWN",
    });
  }
};

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

const filterStudents = async (req, res) => {
  try {
    const { studentCode, name, class: studentClass } = req.query;
    const where = {
      role: "STUDENT",
    };

    if (studentCode && studentCode.trim() !== "") {
      where.studentProfile = {
        studentCode: {
          contains: studentCode.trim(),
          mode: "insensitive",
        },
      };
    }
    if (name && name.trim() !== "") {
      where.fullName = { contains: name.trim(), mode: "insensitive" };
    }
    if (studentClass && studentClass.trim() !== "") {
      if (!where.studentProfile) where.studentProfile = {};
      where.studentProfile.class = {
        contains: studentClass.trim(),
        mode: "insensitive",
      };
    }

    const students = await prisma.users.findMany({
      where,
      include: {
        studentProfile: true,
      },
    });

    const cleanedStudents = students.map(cleanUserProfiles);
    res.status(200).json({ success: true, data: cleanedStudents });
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

    const students = await prisma.users.count({
      where: {
        role: "STUDENT",
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
  addStudent,
  deleteUser,
  filterStudents,
  filterUsers,
  getAllStudents,
  getAllUsers,
  getDashboardStats,
  updateRole,
  updateStudent,
};
