import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Thêm hàm sinh mã studentCode tự động
async function generateStudentCode() {
  const count = await prisma.student.count();
  const nextNumber = count + 1;
  return `STU${nextNumber.toString().padStart(4, "0")}`;
}

// Tạo học sinh mới
export const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      class: studentClassFromClass,
      studentClass: studentClassFromStudentClass,
      grade,
      academicYear,
      // studentCode, // Không nhận từ FE nữa
    } = req.body;
    const studentClass = studentClassFromClass || studentClassFromStudentClass;

    // Thêm log kiểm tra giá trị thực tế
    console.log("DEBUG - Giá trị nhận được:", {
      fullName,
      dateOfBirth,
      gender,
      studentClass,
      grade,
      academicYear,
    });

    // Validate các trường bắt buộc (bỏ studentCode)
    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !studentClass ||
      !grade ||
      !academicYear
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu trường bắt buộc" });
    }

    // Sinh mã studentCode tự động
    const studentCode = await generateStudentCode();

    // Kiểm tra trùng mã học sinh
    const existing = await prisma.student.findUnique({
      where: { studentCode },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Mã học sinh đã tồn tại" });
    }

    const student = await prisma.student.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        class: studentClass,
        grade: String(grade),
        academicYear,
        studentCode,
        // status sẽ mặc định là 'active', chỉ truyền nếu muốn override
      },
    });
    return res.status(201).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy danh sách học sinh (có thể filter qua query)
export const getAllStudents = async (req, res) => {
  try {
    const {
      studentCode,
      fullName,
      class: studentClass,
      grade,
      academicYear,
    } = req.query;
    const where = {};
    if (studentCode)
      where.studentCode = { contains: studentCode, mode: "insensitive" };
    if (fullName) where.fullName = { contains: fullName, mode: "insensitive" };
    if (studentClass)
      where.class = { contains: studentClass, mode: "insensitive" };
    if (grade) where.grade = grade;
    if (academicYear) where.academicYear = academicYear;

    const students = await prisma.student.findMany({ where });
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy chi tiết học sinh theo id
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student)
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy học sinh" });
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật học sinh
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      dateOfBirth,
      gender,
      class: studentClassFromClass,
      studentClass: studentClassFromStudentClass,
      grade,
      academicYear,
      status,
    } = req.body;
    const studentClass = studentClassFromClass || studentClassFromStudentClass;

    // Không cho phép cập nhật mã học sinh trùng
    // (nếu muốn cho phép thì giữ lại đoạn kiểm tra này)

    const data = {
      ...(fullName && { fullName }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender && { gender }),
      ...(studentClass && { class: studentClass }),
      ...(grade && { grade: String(grade) }),
      ...(academicYear && { academicYear }),
      ...(status && { status }),
    };

    const student = await prisma.student.update({ where: { id }, data });
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Xóa học sinh
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { id } });
    return res
      .status(200)
      .json({ success: true, message: "Xóa học sinh thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
