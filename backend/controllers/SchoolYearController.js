import { prisma } from "../db/db.js";

// Cấp tiểu học chỉ tới lớp 5
const FINAL_GRADE = "5";

// Lấy năm học hiện tại
const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-based

    // Năm học bắt đầu từ tháng 9 (tháng 9-12 thuộc năm học mới)
    if (month >= 9) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

// Xem trước danh sách học sinh sẽ chuyển lớp
const previewPromotion = async (req, res) => {
    try {
        const allStudents = await prisma.student.findMany({
            where: { status: "active" },
        });

        // Học sinh lớp 5 sẽ tốt nghiệp
        const graduating = allStudents.filter((s) => s.grade === FINAL_GRADE);
        // Học sinh lớp 1,2,3,4 sẽ lên lớp
        const promoting = allStudents.filter((s) => s.grade !== FINAL_GRADE);

        // Lấy năm học hiện tại từ học sinh đầu tiên hoặc tính toán
        let currentAcademicYear = null;
        if (allStudents.length > 0) {
            currentAcademicYear = allStudents[0].academicYear;
        }
        if (!currentAcademicYear) {
            currentAcademicYear = getCurrentAcademicYear();
        }

        res.json({
            graduating,
            promoting,
            currentAcademicYear,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hàm tăng grade ("1" -> "2")
function nextGrade(grade) {
    return (parseInt(grade, 10) + 1).toString();
}

// Hàm tăng class ("1A" -> "2A", "1B" -> "2B")
function nextClass(currentClass) {
    const match = currentClass.match(/^([0-9]+)([A-Za-z]*)$/);
    if (!match) return currentClass;
    const newNumber = parseInt(match[1], 10) + 1;
    return newNumber + (match[2] || "");
}

// Thực hiện chuyển lớp
const promoteStudents = async (req, res) => {
    try {
        const { graduateIds, promoteIds } = req.body; // Nhận từ frontend
        const newAcademicYear = getCurrentAcademicYear();

        // 1. Cập nhật học sinh tốt nghiệp (lớp 5)
        if (graduateIds && graduateIds.length > 0) {
            await prisma.student.updateMany({
                where: { id: { in: graduateIds } },
                data: { status: "graduated" },
            });
        }

        // 2. Tăng lớp và khối cho học sinh còn lại (lớp 1,2,3,4), cập nhật năm học
        if (promoteIds && promoteIds.length > 0) {
            for (const id of promoteIds) {
                const student = await prisma.student.findUnique({
                    where: { id },
                });
                if (student) {
                    await prisma.student.update({
                        where: { id },
                        data: {
                            grade: nextGrade(student.grade),
                            class: nextClass(student.class),
                            academicYear: newAcademicYear,
                        },
                    });
                }
            }
        }

        res.json({ message: "Chuyển lớp thành công!", newAcademicYear });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy danh sách năm học
const getAcademicYears = async (req, res) => {
    try {
        const academicYears = await prisma.student.findMany({
            select: { academicYear: true },
            where: { academicYear: { not: null } },
            distinct: ["academicYear"],
            orderBy: { academicYear: "desc" },
        });

        const years = academicYears
            .map((ay) => ay.academicYear)
            .filter(Boolean);
        res.json({ academicYears: years });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy thống kê theo năm học
const getStatsByAcademicYear = async (req, res) => {
    try {
        const { academicYear } = req.params;

        const stats = await prisma.student.groupBy({
            by: ["grade"],
            where: {
                academicYear: academicYear,
                status: "active",
            },
            _count: {
                id: true,
            },
        });

        res.json({ stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    previewPromotion,
    promoteStudents,
    getAcademicYears,
    getStatsByAcademicYear,
};
