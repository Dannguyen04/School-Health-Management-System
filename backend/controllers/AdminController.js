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
const VALID_GENDERS = ["MALE", "FEMALE"];

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
    const {
      fullName,
      email,
      phone,
      password,
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
      "phone",
      "password",
      "dateOfBirth",
      "gender",
      "grade",
      "studentClass",
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

    if (!VALID_GENDERS.includes(gender.toUpperCase())) {
      return res.status(422).json({
        success: false,
        error: `Giới tính phải là: ${VALID_GENDERS.join(", ")}`,
      });
    }

    const [existingUser, existingStudent] = await Promise.all([
      findUserByEmail(email),
      studentCode
        ? prisma.student.findUnique({ where: { studentCode } })
        : null,
    ]);

    if (existingUser) {
      return res.status(422).json({
        success: false,
        error: `Email đã tồn tại cho người dùng ${existingUser.fullName}`,
      });
    }

    if (existingStudent) {
      return res.status(422).json({
        success: false,
        error: "Mã học sinh đã tồn tại",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: password,
          role: "STUDENT",
          isActive: true,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentCode: await generateStudentCode(),
          dateOfBirth: new Date(dateOfBirth),
          gender: gender.toUpperCase(),
          grade: grade.toString(),
          class: studentClass.trim(),
          emergencyContact: emergencyContact?.trim(),
          emergencyPhone: emergencyPhone?.trim(),
          ...(bloodType && { bloodType: bloodType.trim() }),
        },
      });

      const parentResult = await assignParentToStudent(
        student.id,
        parentName,
        "guardian",
        true,
        tx
      );

      if (!parentResult.success) {
        throw new Error(parentResult.error);
      }

      await createAuditLog(
        tx,
        user.id,
        "create",
        "student",
        student.id,
        {
          fullName,
          email,
          studentCode,
          grade,
          class: studentClass,
          parentAssigned: parentResult.data.parentName,
        },
        req
      );

      return { user, student, parent: parentResult.data };
    });

    return res.status(201).json({
      success: true,
      message: "Tạo học sinh và gán phụ huynh thành công",
      data: {
        id: result.student.id,
        fullName: result.user.fullName,
        email: result.user.email,
        studentCode: result.student.studentCode,
        parent: result.parent,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo học sinh:", error);
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

    if (!users || users.length === 0) {
      console.log("Không có nhân viên nào trong hệ thống");
      return res
        .status(404)
        .json({ message: "Không có nhân viên nào trong hệ thống" });
    }

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//getAllStudent
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.users.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
      },
    });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Không có học sinh nào trong hệ thống",
      });
    }

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.log(error.message);
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

      // If role is changing, delete old profile and create new one
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

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: updatedUser,
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
    studentCode,
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
      "studentCode",
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

    if (!VALID_GENDERS.includes(gender.toUpperCase())) {
      return res.status(422).json({
        success: false,
        error: `Giới tính phải là: ${VALID_GENDERS.join(", ")}`,
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

    const existingStudent = await prisma.student.findUnique({
      where: { studentCode },
    });
    if (existingStudent && existingStudent.userId !== id) {
      return res.status(400).json({
        success: false,
        error: "Mã học sinh đã được sử dụng",
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
          studentCode: studentCode.trim(),
          dateOfBirth: new Date(dateOfBirth),
          gender: gender.toUpperCase(),
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
            studentCode,
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
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    await prisma.$transaction(async (tx) => {
      const tableName = roleToTable[user.role];
      if (tableName && user[roleToModel[user.role]]) {
        await tx[tableName].delete({ where: { userId: id } });
      }

      await tx.users.delete({
        where: { id: id },
      });

      await createAuditLog(
        tx,
        id,
        "delete",
        "user",
        id,
        { role: user.role, email: user.email, fullName: user.fullName },
        req
      );
    });

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
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
  getAllStudents,
  getAllUsers,
  updateRole,
  updateStudent,
};
