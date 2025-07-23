import xlsx from "xlsx";
import { prisma } from "../db/db.js";
import validator from "validator";

const validateEmail = (email) => validator.isEmail(email);
const validateDate = (date) => !isNaN(new Date(date).getTime());
const validateGender = (gender) =>
    ["Nam", "Nữ", "nam", "nữ", "male", "female"].includes(
        (gender || "").toLowerCase()
    );
const validatePhone = (phone) => /^0\d{8,14}$/.test(phone || "");

// Hàm tự động thêm số 0 ở đầu số điện thoại nếu chưa có
const normalizePhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.toString().replace(/\D/g, ""); // Chỉ giữ lại số
    if (cleanPhone.length >= 9 && cleanPhone.length <= 15) {
        return cleanPhone.startsWith("0") ? cleanPhone : `0${cleanPhone}`;
    }
    return phone; // Trả về nguyên bản nếu không hợp lệ
};

const validateSchoolYear = (schoolYear) => {
    if (!schoolYear) return false;
    const pattern = /^\d{4}-\d{4}$/;
    if (!pattern.test(schoolYear)) return false;

    const [startYear, endYear] = schoolYear.split("-");
    // Kiểm tra năm học hợp lý (năm sau = năm trước + 1)
    return parseInt(endYear) === parseInt(startYear) + 1;
};

// Hàm tìm key gần đúng theo tên cột (bỏ qua khoảng trắng, không phân biệt hoa thường)
function getColKey(row, colName) {
    return Object.keys(row).find(
        (k) =>
            k.replace(/\s/g, "").toLowerCase() ===
            colName.replace(/\s/g, "").toLowerCase()
    );
}
// Hàm làm sạch chuỗi: loại bỏ dấu phẩy, dấu cách, dấu /, ký tự xuống dòng ở đầu/cuối
function cleanString(str) {
    return (
        String(str || "")
            .replace(/[\s,\/\n\r]+$/g, "") // Xóa ở cuối
            .replace(/^[\s,\/\n\r]+/g, "") // Xóa ở đầu
            // Không cần xóa dấu ' nữa vì cột đã được format thành text
            .trim()
    );
}

// Hàm chuẩn hóa chuỗi ngày về yyyy-MM-dd
function normalizeDateString(dateStr) {
    if (!dateStr) return "";
    // Nếu là số serial Excel
    if (!isNaN(dateStr) && typeof dateStr === "number") {
        // Excel serial to JS date
        const utc_days = Math.floor(dateStr - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        const day = String(date_info.getUTCDate()).padStart(2, "0");
        const month = String(date_info.getUTCMonth() + 1).padStart(2, "0");
        const year = date_info.getUTCFullYear();
        return `${year}-${month}-${day}`;
    }
    // Nếu là chuỗi yyyy-MM-dd (đúng chuẩn)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Nếu là chuỗi dd/MM/yyyy hoặc MM/dd/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [d1, d2, y] = dateStr.split("/");
        // Nếu d1 > 12 thì chắc chắn là dd/MM/yyyy
        if (parseInt(d1, 10) > 12) {
            return `${y}-${d2.padStart(2, "0")}-${d1.padStart(2, "0")}`;
        }
        // Nếu d2 > 12 thì chắc chắn là MM/dd/yyyy
        if (parseInt(d2, 10) > 12) {
            return `${y}-${d1.padStart(2, "0")}-${d2.padStart(2, "0")}`;
        }
        // Mặc định coi là dd/MM/yyyy
        return `${y}-${d2.padStart(2, "0")}-${d1.padStart(2, "0")}`;
    }
    // Nếu là chuỗi khác, trả về như cũ
    return dateStr;
}

export const importParentsStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        let successCount = 0;
        let errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // +2 vì header là dòng 1
            // Mapping từ cột Excel mẫu sang key hệ thống, tự động nhận diện tên cột
            const getVal = (col) => {
                const key = getColKey(row, col);
                return typeof key !== "undefined" ? row[key] : "";
            };
            // Xử lý ngày sinh học sinh
            let rawStudentDOB = getVal("Ngày sinh");
            let studentDOB = normalizeDateString(rawStudentDOB);
            // Xử lý ngày sinh phụ huynh nếu có
            let rawParentDOB = getVal("Ngày sinh phụ huynh");
            let parentDOB = normalizeDateString(rawParentDOB);
            const parentName = cleanString(getVal("Tên phụ huynh"));
            const rawParentPhone = cleanString(getVal("SĐT phụ huynh"));
            const parentPhone = normalizePhoneNumber(rawParentPhone);
            const parentEmail = cleanString(getVal("Email phụ huynh"));
            const parentAddress = cleanString(getVal("Địa chỉ phụ huynh"));
            const parentGender = cleanString(getVal("Giới tính phụ huynh"));
            const studentName = cleanString(getVal("Họ và tên"));
            // const studentCode = cleanString(getVal("Mã học sinh")); // Bỏ mã học sinh
            const studentGender = cleanString(getVal("Giới tính"));
            const studentClass = cleanString(getVal("Lớp"));
            const studentGrade = cleanString(getVal("Khối"));
            const studentAcademicYear = cleanString(getVal("Năm học"));
            const studentAddress = cleanString(getVal("Địa chỉ"));

            // Validate bắt buộc
            if (
                !parentName ||
                !parentEmail ||
                !parentPhone ||
                !studentName ||
                // !studentCode || // Bỏ mã học sinh
                !studentDOB ||
                !studentGender ||
                !studentClass ||
                !studentGrade ||
                !studentAcademicYear
            ) {
                errors.push(`Dòng ${rowNum}: Thiếu trường bắt buộc.`);
                continue;
            }
            if (!validateEmail(parentEmail)) {
                errors.push(`Dòng ${rowNum}: Email phụ huynh không hợp lệ.`);
                continue;
            }
            if (!validatePhone(parentPhone)) {
                errors.push(
                    `Dòng ${rowNum}: Số điện thoại phụ huynh không hợp lệ. Hệ thống đã tự động thêm số 0 ở đầu nếu cần.`
                );
                continue;
            }
            if (parentGender && !validateGender(parentGender)) {
                errors.push(
                    `Dòng ${rowNum}: Giới tính phụ huynh không hợp lệ.`
                );
                continue;
            }
            if (parentDOB && !validateDate(parentDOB)) {
                errors.push(
                    `Dòng ${rowNum}: Ngày sinh phụ huynh không hợp lệ.`
                );
                continue;
            }
            if (!validateGender(studentGender)) {
                errors.push(`Dòng ${rowNum}: Giới tính học sinh không hợp lệ.`);
                continue;
            }
            if (!validateDate(studentDOB)) {
                errors.push(`Dòng ${rowNum}: Ngày sinh học sinh không hợp lệ.`);
                continue;
            }

            // Validate năm học
            if (!validateSchoolYear(studentAcademicYear)) {
                errors.push(
                    `Dòng ${rowNum}: Năm học không đúng định dạng (VD: 2024-2025)`
                );
                continue;
            }

            // Kiểm tra email phụ huynh đã tồn tại chưa
            const existingParentUser = await prisma.users.findUnique({
                where: { email: parentEmail },
            });
            let parentUserId, parentId;
            if (!existingParentUser) {
                // Tạo user và parent profile
                const newParentUser = await prisma.users.create({
                    data: {
                        fullName: parentName,
                        email: parentEmail,
                        phone: parentPhone,
                        address: parentAddress,
                        password: "12345678", // default
                        role: "PARENT",
                        isActive: true,
                    },
                });
                const newParent = await prisma.parent.create({
                    data: { userId: newParentUser.id },
                });
                parentUserId = newParentUser.id;
                parentId = newParent.id;
            } else {
                // Đã có user phụ huynh, lấy parentId
                const parentProfile = await prisma.parent.findFirst({
                    where: { userId: existingParentUser.id },
                });
                if (!parentProfile) {
                    errors.push(
                        `Dòng ${rowNum}: Email phụ huynh đã tồn tại nhưng không có profile parent.`
                    );
                    continue;
                }
                parentUserId = existingParentUser.id;
                parentId = parentProfile.id;
            }

            // Bỏ kiểm tra mã học sinh đã tồn tại
            // const existingStudent = await prisma.student.findFirst({
            //     where: { studentCode },
            // });
            // if (existingStudent) {
            //     errors.push(`Dòng ${rowNum}: Mã học sinh đã tồn tại.`);
            //     continue;
            // }

            // Sinh studentCode đúng format và thứ tự hệ thống (STU0006, STU0007, ...)
            const lastStudent = await prisma.student.findFirst({
                orderBy: { studentCode: "desc" },
                select: { studentCode: true },
            });
            let nextNumber = 1;
            if (lastStudent && lastStudent.studentCode) {
                const match = lastStudent.studentCode.match(/STU(\d+)/);
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }
            const studentCode = `STU${String(nextNumber).padStart(4, "0")}`;

            // Tạo email tự động cho học sinh
            const generateStudentEmail = (fullName) => {
                const normalizedName = fullName
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .replace(/\s+/g, ".");
                const randomNum = Math.floor(Math.random() * 1000);
                return `${normalizedName}${randomNum}@school.edu.vn`;
            };

            const studentEmail = generateStudentEmail(studentName);

            // Tạo user học sinh mới
            const newStudentUser = await prisma.users.create({
                data: {
                    fullName: studentName,
                    email: studentEmail,
                    phone: null,
                    address: studentAddress,
                    password: "12345678", // default
                    role: "STUDENT",
                    isActive: true,
                },
            });
            const studentUserId = newStudentUser.id;
            // Khi tạo student, truyền thêm userId: studentUserId đúng với schema.
            const newStudent = await prisma.student.create({
                data: {
                    userId: studentUserId,
                    studentCode,
                    dateOfBirth: new Date(studentDOB),
                    gender: studentGender,
                    class: studentClass,
                    grade: studentGrade,
                    academicYear: studentAcademicYear,
                    // bloodType: ... (nếu có)
                },
            });
            // Gán phụ huynh cho học sinh
            await prisma.studentParent.create({
                data: {
                    studentId: newStudent.id,
                    parentId: parentId,
                    relationship: "guardian",
                    isPrimary: true,
                },
            });
            successCount++;
        }

        res.json({
            message: `Import thành công: ${successCount} bản ghi.`,
            count: successCount,
            errors,
        });
    } catch (error) {
        res.status(500).json({
            error: "Import thất bại!",
            details: error.message,
        });
    }
};
