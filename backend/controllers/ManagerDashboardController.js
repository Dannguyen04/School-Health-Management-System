import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
    try {
        // Tổng số học sinh
        const totalStudents = await prisma.student.count();

        // Số chiến dịch tiêm chủng và khám sức khỏe riêng biệt
        const vaccinationCampaigns = await prisma.vaccinationCampaign.count();
        const medicalCheckCampaigns = await prisma.medicalCheckCampaign.count();
        const totalCampaigns = vaccinationCampaigns + medicalCheckCampaigns;

        // Tổng số khám sức khỏe (MedicalCheck)
        const healthCheckups = await prisma.medicalCheck.count();

        // Tổng số phiếu đồng ý, đồng ý, từ chối
        const campaigns = await prisma.vaccinationCampaign.findMany({
            include: { consents: true },
        });
        let totalConsents = 0,
            agreedConsents = 0,
            declinedConsents = 0;
        campaigns.forEach((c) => {
            totalConsents += c.consents.length;
            agreedConsents += c.consents.filter(
                (x) => x.consent === true
            ).length;
            declinedConsents += c.consents.filter(
                (x) => x.consent === false
            ).length;
        });

        // Số học sinh đã tiêm chủng (unique studentId trong vaccinations, status = COMPLETED)
        const vaccinatedStudents = await prisma.vaccine.aggregate({
            _count: { studentId: true },
            where: { status: "COMPLETED", studentId: { not: null } },
        });

        // Số sự cố (MedicalEvent)
        const incidents = await prisma.medicalEvent.count();

        // Số học sinh cần chú ý (overallHealth != 'NORMAL')
        const needsAttention = await prisma.medicalCheck.count({
            where: {
                OR: [
                    { overallHealth: "NEEDS_ATTENTION" },
                    { overallHealth: "REQUIRES_TREATMENT" },
                ],
            },
        });

        // Bảng thống kê theo lớp
        const grades = await prisma.student.groupBy({
            by: ["grade"],
            _count: { id: true },
        });

        // Số đã tiêm chủng, đã khám, số thuốc theo từng lớp
        const allGrades = await prisma.student.findMany({
            select: { grade: true, class: true, id: true },
        });
        const gradeMap = {};
        allGrades.forEach((s) => {
            if (!gradeMap[s.grade]) gradeMap[s.grade] = [];
            gradeMap[s.grade].push(s.id);
        });
        const vaccinations = await prisma.vaccine.findMany({
            where: { status: "COMPLETED", studentId: { not: null } },
            select: { studentId: true },
        });
        const vaccinatedByGrade = {};
        vaccinations.forEach((v) => {
            for (const grade in gradeMap) {
                if (gradeMap[grade].includes(v.studentId)) {
                    vaccinatedByGrade[grade] =
                        (vaccinatedByGrade[grade] || 0) + 1;
                }
            }
        });
        const medicalChecks = await prisma.medicalCheck.findMany({
            where: { status: "COMPLETED" },
            select: { studentId: true },
        });
        const checkedByGrade = {};
        medicalChecks.forEach((m) => {
            for (const grade in gradeMap) {
                if (gradeMap[grade].includes(m.studentId)) {
                    checkedByGrade[grade] = (checkedByGrade[grade] || 0) + 1;
                }
            }
        });
        const meds = await prisma.studentMedication.findMany({
            select: { studentId: true },
        });
        const medsByGrade = {};
        meds.forEach((m) => {
            for (const grade in gradeMap) {
                if (gradeMap[grade].includes(m.studentId)) {
                    medsByGrade[grade] = (medsByGrade[grade] || 0) + 1;
                }
            }
        });
        const gradeStats = grades.map((g) => ({
            grade: g.grade,
            totalStudents: g._count.id,
            vaccinated: vaccinatedByGrade[g.grade] || 0,
            healthCheckups: checkedByGrade[g.grade] || 0,
            medications: medsByGrade[g.grade] || 0,
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    totalCampaigns,
                    vaccinationCampaigns,
                    medicalCheckCampaigns,
                    totalConsents,
                    agreedConsents,
                    declinedConsents,
                    healthCheckups,
                    vaccinatedStudents: vaccinatedStudents._count.studentId,
                    incidents,
                    needsAttention,
                },
                gradeStats,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
