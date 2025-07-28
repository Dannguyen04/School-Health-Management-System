import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Constants
const HEALTH_STATUS = {
    NORMAL: "NORMAL",
    NEEDS_ATTENTION: "NEEDS_ATTENTION",
    REQUIRES_TREATMENT: "REQUIRES_TREATMENT",
};

const BMI_CATEGORIES = {
    UNDERWEIGHT: { min: 0, max: 18.5, key: "underweight" },
    NORMAL: { min: 18.5, max: 25, key: "normal" },
    OVERWEIGHT: { min: 25, max: 30, key: "overweight" },
    OBESE: { min: 30, max: Infinity, key: "obese" },
};

const VISION_CATEGORIES = {
    NORMAL: { min: 0.8, key: "normal" },
    MILD: { min: 0.6, key: "mild" },
    MODERATE: { min: 0.3, key: "moderate" },
    SEVERE: { min: 0, key: "severe" },
};

// Utility functions
const validateDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
};

const calculatePercentages = (data, total) => {
    if (total === 0) return null;
    const percentages = {};
    Object.keys(data).forEach((key) => {
        if (typeof data[key] === "number") {
            percentages[key] = Math.round((data[key] / total) * 10000) / 100;
        }
    });
    return percentages;
};

const categorizeBMI = (weight, height) => {
    if (!weight || !height || height === 0) return null;
    const bmi = weight / Math.pow(height / 100, 2);
    for (const [categoryName, range] of Object.entries(BMI_CATEGORIES)) {
        if (bmi >= range.min && bmi < range.max) {
            return range.key;
        }
    }
    return "obese"; // fallback
};

const categorizeVision = (rightVision, leftVision) => {
    const right = rightVision || 0;
    const left = leftVision || 0;
    const avgVision = (right + left) / 2;
    const categories = Object.values(VISION_CATEGORIES).sort(
        (a, b) => b.min - a.min
    );
    for (const category of categories) {
        if (avgVision >= category.min) {
            return category.key;
        }
    }
    return "severe"; // fallback
};

// Enhanced filter building with validation
const buildWhereClause = (filter) => {
    const where = {};
    try {
        if (filter.campaignId) {
            where.campaignId = filter.campaignId;
        }
        if (filter.status) {
            where.status = filter.status;
        }
        if (filter.grade || filter.class) {
            where.student = {};
            if (filter.grade) where.student.grade = filter.grade;
            if (filter.class) where.student.class = filter.class;
        }
        if (filter.startDate || filter.endDate) {
            where.completedDate = {};
            if (filter.startDate) {
                where.completedDate.gte = validateDate(filter.startDate);
            }
            if (filter.endDate) {
                where.completedDate.lte = validateDate(filter.endDate);
            }
        }
        return where;
    } catch (error) {
        throw new Error(`Invalid filter parameters: ${error.message}`);
    }
};

const extractFilter = (query) => {
    try {
        return {
            campaignId: query.campaignId || undefined,
            grade: query.grade || undefined,
            class: query.class || undefined,
            status: query.status || undefined,
            startDate: query.startDate || undefined,
            endDate: query.endDate || undefined,
        };
    } catch (error) {
        throw new Error(`Filter extraction failed: ${error.message}`);
    }
};

// Enhanced error handling with more specific error types
const handleError = (error, res, customMessage = "Đã xảy ra lỗi") => {
    console.error(`${customMessage}:`, error);
    let statusCode = 500;
    let message = customMessage;
    if (error.code === "P2002") {
        statusCode = 409;
        message = "Dữ liệu bị trùng lặp";
    } else if (error.code === "P2025") {
        statusCode = 404;
        message = "Không tìm thấy bản ghi";
    } else if (error.code === "P2003") {
        statusCode = 400;
        message = "Lỗi ràng buộc khoá ngoại";
    } else if (error.name === "ValidationError") {
        statusCode = 400;
        message = "Dữ liệu không hợp lệ";
    } else if (error.message.includes("Invalid date")) {
        statusCode = 400;
        message = "Định dạng ngày tháng không hợp lệ";
    } else if (error.message.includes("Invalid filter")) {
        statusCode = 400;
        message = "Tham số lọc không hợp lệ";
    }
    return res.status(statusCode).json({
        success: false,
        error: message,
        details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
    });
};

// Optimized main summary function with better data processing
const getOverallSummaryReport = async (filter) => {
    const whereClause = buildWhereClause(filter);
    try {
        const [
            totalChecks,
            statusCounts,
            completedChecks,
            gradeDistribution,
            healthDistribution,
            bmiData,
            visionData,
        ] = await Promise.all([
            prisma.medicalCheck.count({ where: whereClause }),
            prisma.medicalCheck.groupBy({
                by: ["status"],
                where: whereClause,
                _count: { id: true },
            }),
            prisma.medicalCheck.findMany({
                where: { ...whereClause, status: "COMPLETED" },
                select: {
                    id: true,
                    overallHealth: true,
                    height: true,
                    weight: true,
                    visionRightNoGlasses: true,
                    visionLeftNoGlasses: true,
                    student: {
                        select: { grade: true, class: true },
                    },
                },
            }),
            prisma.medicalCheck.findMany({
                where: whereClause,
                select: {
                    student: {
                        select: { grade: true, class: true },
                    },
                },
            }),
            prisma.medicalCheck.groupBy({
                by: ["overallHealth"],
                where: { ...whereClause, status: "COMPLETED" },
                _count: { id: true },
            }),
            prisma.medicalCheck.findMany({
                where: {
                    ...whereClause,
                    status: "COMPLETED",
                    height: { not: null, gt: 0 },
                    weight: { not: null, gt: 0 },
                },
                select: { height: true, weight: true },
            }),
            prisma.medicalCheck.findMany({
                where: {
                    ...whereClause,
                    status: "COMPLETED",
                    OR: [
                        { visionRightNoGlasses: { not: undefined } },
                        { visionLeftNoGlasses: { not: undefined } },
                    ],
                },
                select: {
                    visionRightNoGlasses: true,
                    visionLeftNoGlasses: true,
                },
            }),
        ]);

        // Process status counts
        const statusMap = statusCounts.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item._count.id;
            return acc;
        }, {});

        // Process grade and class distribution
        const gradeCount = {};
        const classCount = {};
        gradeDistribution.forEach((item) => {
            if (item.student?.grade) {
                gradeCount[item.student.grade] =
                    (gradeCount[item.student.grade] || 0) + 1;
            }
            if (item.student?.class) {
                classCount[item.student.class] =
                    (classCount[item.student.class] || 0) + 1;
            }
        });

        // Process health status distribution
        const healthStats = {
            normal: 0,
            needsAttention: 0,
            requiresTreatment: 0,
        };
        healthDistribution.forEach((item) => {
            switch (item.overallHealth) {
                case HEALTH_STATUS.NORMAL:
                    healthStats.normal = item._count.id;
                    break;
                case HEALTH_STATUS.NEEDS_ATTENTION:
                    healthStats.needsAttention = item._count.id;
                    break;
                case HEALTH_STATUS.REQUIRES_TREATMENT:
                    healthStats.requiresTreatment = item._count.id;
                    break;
            }
        });

        // Process BMI data
        const bmiStats = {
            underweight: 0,
            normal: 0,
            overweight: 0,
            obese: 0,
            total: bmiData.length,
        };
        bmiData.forEach((check) => {
            const category = categorizeBMI(check.weight, check.height);
            if (category && bmiStats.hasOwnProperty(category)) {
                bmiStats[category]++;
            }
        });

        // Process vision data
        const visionStats = {
            normal: 0,
            mild: 0,
            moderate: 0,
            severe: 0,
            total: visionData.length,
        };
        visionData.forEach((check) => {
            const category = categorizeVision(
                check.visionRightNoGlasses,
                check.visionLeftNoGlasses
            );
            if (category && visionStats.hasOwnProperty(category)) {
                visionStats[category]++;
            }
        });

        // Calculate participation rate
        const completedCount = statusMap.completed || 0;
        const participationRate =
            totalChecks > 0
                ? Math.round((completedCount / totalChecks) * 10000) / 100
                : 0;

        // Build final summary
        const summary = {
            overview: {
                totalChecks,
                completedChecks: completedCount,
                pendingChecks: statusMap.pending || 0,
                cancelledChecks: statusMap.cancelled || 0,
                participationRate,
            },
            distribution: {
                byGrade: gradeCount,
                byClass: classCount,
            },
            healthStatus: {
                ...healthStats,
                total: Object.values(healthStats).reduce(
                    (sum, count) => sum + count,
                    0
                ),
            },
            bmi: {
                ...bmiStats,
                percentages: calculatePercentages(bmiStats, bmiStats.total),
            },
            vision: {
                ...visionStats,
                percentages: calculatePercentages(
                    visionStats,
                    visionStats.total
                ),
            },
        };

        return summary;
    } catch (error) {
        throw new Error(`Failed to generate summary report: ${error.message}`);
    }
};

// Optimized attention summary
const getAttentionSummary = async (filter) => {
    const whereClause = buildWhereClause(filter);
    try {
        const [attentionCount, followUpCount] = await Promise.all([
            prisma.medicalCheck.count({
                where: {
                    ...whereClause,
                    status: "COMPLETED",
                    OR: [
                        { overallHealth: HEALTH_STATUS.NEEDS_ATTENTION },
                        { overallHealth: HEALTH_STATUS.REQUIRES_TREATMENT },
                        { requiresFollowUp: true },
                    ],
                },
            }),
            prisma.medicalCheck.count({
                where: {
                    ...whereClause,
                    status: "COMPLETED",
                    requiresFollowUp: true,
                },
            }),
        ]);

        return {
            needsAttention: attentionCount,
            requiresFollowUp: followUpCount,
            summary: {
                total: attentionCount,
                followUpRate:
                    attentionCount > 0
                        ? Math.round((followUpCount / attentionCount) * 10000) /
                          100
                        : 0,
            },
        };
    } catch (error) {
        throw new Error(`Failed to get attention summary: ${error.message}`);
    }
};

// Controller functions with enhanced validation
const getOverview = async (req, res) => {
    try {
        const filter = extractFilter(req.query);
        const result = await getOverallSummaryReport(filter);
        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return handleError(error, res, "Failed to get health check overview");
    }
};

const getAttentionSummaryController = async (req, res) => {
    try {
        const filter = extractFilter(req.query);
        const result = await getAttentionSummary(filter);
        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return handleError(error, res, "Failed to get attention summary");
    }
};

const getComparisonSummary = async (req, res) => {
    try {
        const currentFilter = extractFilter(req.query);
        const previousFilter = extractFilter(req.body.previousFilter || {});
        const [currentData, previousData] = await Promise.all([
            getOverallSummaryReport(currentFilter),
            getOverallSummaryReport(previousFilter),
        ]);
        // Calculate percentage changes
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 10000) / 100;
        };
        const comparison = {
            current: currentData,
            previous: previousData,
            changes: {
                totalChecks: {
                    absolute:
                        currentData.overview.totalChecks -
                        previousData.overview.totalChecks,
                    percentage: calculateChange(
                        currentData.overview.totalChecks,
                        previousData.overview.totalChecks
                    ),
                },
                completedChecks: {
                    absolute:
                        currentData.overview.completedChecks -
                        previousData.overview.completedChecks,
                    percentage: calculateChange(
                        currentData.overview.completedChecks,
                        previousData.overview.completedChecks
                    ),
                },
                participationRate: {
                    absolute:
                        currentData.overview.participationRate -
                        previousData.overview.participationRate,
                    percentage: calculateChange(
                        currentData.overview.participationRate,
                        previousData.overview.participationRate
                    ),
                },
                healthStatus: {
                    normal: {
                        absolute:
                            currentData.healthStatus.normal -
                            previousData.healthStatus.normal,
                        percentage: calculateChange(
                            currentData.healthStatus.normal,
                            previousData.healthStatus.normal
                        ),
                    },
                    needsAttention: {
                        absolute:
                            currentData.healthStatus.needsAttention -
                            previousData.healthStatus.needsAttention,
                        percentage: calculateChange(
                            currentData.healthStatus.needsAttention,
                            previousData.healthStatus.needsAttention
                        ),
                    },
                    requiresTreatment: {
                        absolute:
                            currentData.healthStatus.requiresTreatment -
                            previousData.healthStatus.requiresTreatment,
                        percentage: calculateChange(
                            currentData.healthStatus.requiresTreatment,
                            previousData.healthStatus.requiresTreatment
                        ),
                    },
                },
            },
        };
        res.status(200).json({
            success: true,
            data: comparison,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return handleError(error, res, "Failed to get comparison summary");
    }
};

// Enhanced students needing attention with pagination and sorting
const getStudentsNeedingAttention = async (req, res) => {
    try {
        const filter = extractFilter(req.query);
        const whereClause = buildWhereClause(filter);
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        // Sorting parameters
        const sortBy = req.query.sortBy || "completedDate";
        const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
        const [students, total] = await Promise.all([
            prisma.medicalCheck.findMany({
                where: {
                    ...whereClause,
                    status: "COMPLETED",
                    OR: [
                        { overallHealth: HEALTH_STATUS.NEEDS_ATTENTION },
                        { overallHealth: HEALTH_STATUS.REQUIRES_TREATMENT },
                    ],
                },
                include: {
                    student: true,
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.medicalCheck.count({
                where: {
                    ...whereClause,
                    status: "COMPLETED",
                    OR: [
                        { overallHealth: HEALTH_STATUS.NEEDS_ATTENTION },
                        { overallHealth: HEALTH_STATUS.REQUIRES_TREATMENT },
                    ],
                },
            }),
        ]);
        res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    limit,
                    totalRecords: total,
                },
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return handleError(
            error,
            res,
            "Failed to get students needing attention"
        );
    }
};

// Health trend analysis function
const getHealthTrends = async (req, res) => {
    try {
        const filter = extractFilter(req.query);
        const whereClause = buildWhereClause(filter);
        const trends = await prisma.medicalCheck.groupBy({
            by: ["completedDate"],
            where: {
                ...whereClause,
                status: "COMPLETED",
                completedDate: { not: null },
            },
            _count: { id: true },
            _avg: {
                height: true,
                weight: true,
            },
            orderBy: { completedDate: "asc" },
        });
        res.status(200).json({
            success: true,
            data: trends,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return handleError(error, res, "Failed to get health trends");
    }
};

// Đặt lịch tư vấn và gửi notification cho phụ huynh
const scheduleConsultation = async (req, res) => {
    try {
        const { id } = req.params; // medicalCheckId
        const { consultationStart, consultationEnd } = req.body;

        console.log("Schedule consultation request:", {
            id,
            consultationStart,
            consultationEnd,
        });

        if (!consultationStart || !consultationEnd) {
            return res.status(400).json({
                success: false,
                error: "Thiếu thông tin thời gian tư vấn",
            });
        }

        // Validate thời gian
        const startDate = new Date(consultationStart);
        const endDate = new Date(consultationEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Định dạng thời gian không hợp lệ",
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                error: "Thời gian kết thúc phải sau thời gian bắt đầu",
            });
        }

        // Kiểm tra medical check có tồn tại không
        const existingCheck = await prisma.medicalCheck.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        parents: {
                            include: {
                                parent: {
                                    include: { user: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!existingCheck) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy báo cáo khám sức khỏe",
            });
        }

        console.log("Found medical check:", existingCheck.id);
        console.log(
            "Student parents count:",
            existingCheck.student?.parents?.length || 0
        );

        // Update MedicalCheck
        const updatedCheck = await prisma.medicalCheck.update({
            where: { id },
            data: {
                consultationStart: startDate,
                consultationEnd: endDate,
            },
            include: {
                student: {
                    include: {
                        parents: {
                            include: {
                                parent: {
                                    include: { user: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        console.log("Updated medical check successfully");

        // Lấy thông tin phụ huynh
        const parentUsers = (updatedCheck.student.parents || [])
            .map((sp) => sp.parent?.user)
            .filter(Boolean);

        console.log("Parent users found:", parentUsers.length);

        // Tạo nội dung notification chi tiết
        const studentName = updatedCheck.student.fullName;
        const studentCode = updatedCheck.student.studentCode;
        const startStr = startDate.toLocaleString();
        const endStr = endDate.toLocaleString();
        const title = `Lịch tư vấn sức khỏe cho học sinh ${studentName}`;
        const message = `${studentName} (Mã học sinh: ${studentCode}) đã có vấn đề về sức khỏe cần chú ý.\nNhà trường đã đặt lịch tư vấn sức khỏe cho học sinh từ ${startStr} đến ${endStr}.\n\nVui lòng kiểm tra chi tiết trong hệ thống hoặc liên hệ nhà trường để biết thêm thông tin.`;

        // Tạo notifications cho phụ huynh (nếu có)
        if (parentUsers.length > 0) {
            try {
                const notificationPromises = parentUsers.map((parent) =>
                    prisma.notification.create({
                        data: {
                            userId: parent.id,
                            title,
                            message,
                            type: "medical_consultation",
                            status: "SENT",
                            sentAt: new Date(),
                            medicalCheckCampaignId: updatedCheck.campaignId,
                        },
                    })
                );

                await Promise.all(notificationPromises);
                console.log(
                    "Notifications created successfully for",
                    parentUsers.length,
                    "parents"
                );
            } catch (notificationError) {
                console.error(
                    "Error creating notifications:",
                    notificationError
                );
                // Không fail toàn bộ request nếu chỉ lỗi notification
            }
        } else {
            console.log("No parents found for student, skipping notifications");
        }

        return res.status(200).json({
            success: true,
            data: updatedCheck,
            message: "Đặt lịch tư vấn thành công",
        });
    } catch (error) {
        console.error("Schedule consultation error:", error);
        return handleError(error, res, "Đặt lịch tư vấn thất bại");
    }
};

export {
    buildWhereClause,
    // Utility exports
    calculatePercentages,
    categorizeBMI,
    categorizeVision,
    extractFilter,
    getAttentionSummary,
    getAttentionSummaryController,
    getComparisonSummary,
    getHealthTrends,
    getOverallSummaryReport,
    getOverview,
    getStudentsNeedingAttention,
    handleError,
    scheduleConsultation,
    validateDate,
};
