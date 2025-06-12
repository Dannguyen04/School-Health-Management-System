// ===== constants/enums.js =====
const UserRole = {
    STUDENT: "STUDENT",
    PARENT: "PARENT",
    SCHOOL_NURSE: "SCHOOL_NURSE",
    MANAGER: "MANAGER",
    ADMIN: "ADMIN",
};

const MedicalEventType = {
    ACCIDENT: "ACCIDENT",
    FEVER: "FEVER",
    FALL: "FALL",
    EPIDEMIC: "EPIDEMIC",
    ALLERGY_REACTION: "ALLERGY_REACTION",
    CHRONIC_DISEASE_EPISODE: "CHRONIC_DISEASE_EPISODE",
    OTHER: "OTHER",
};

const MedicalEventStatus = {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    RESOLVED: "RESOLVED",
    REFERRED: "REFERRED",
};

const VaccinationStatus = {
    SCHEDULED: "SCHEDULED",
    COMPLETED: "COMPLETED",
    POSTPONED: "POSTPONED",
    CANCELLED: "CANCELLED",
};

const MedicationStatus = {
    PENDING_APPROVAL: "PENDING_APPROVAL",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
};

const MedicalCheckStatus = {
    SCHEDULED: "SCHEDULED",
    COMPLETED: "COMPLETED",
    RESCHEDULED: "RESCHEDULED",
    CANCELLED: "CANCELLED",
};

const NotificationStatus = {
    SENT: "SENT",
    DELIVERED: "DELIVERED",
    READ: "READ",
    EXPIRED: "EXPIRED",
};
