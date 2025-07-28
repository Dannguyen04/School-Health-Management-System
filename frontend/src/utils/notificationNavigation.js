// notificationNavigation.js

export function navigateByNotificationType(
    notification,
    navigate,
    setSelectedNotification,
    setDetailModalVisible,
    currentUser
) {
    // Special case for missing health profile (toast hoặc notification DB)
    if (
        notification.id === "missing-health-profile" ||
        notification.type === "missing_health_profile"
    ) {
        navigate(`/parent/health-profile`);
        return;
    }
    switch (notification.type) {
        case "update_phone":
            navigate("/parent/profile");
            break;
        case "vaccination_consent":
            navigate("/parent/consent-forms");
            break;
        case "vaccination_consent_update":
            navigate("/manager/vaccination-campaigns");
            break;
        case "vaccination":
            navigate("/parent/medical-schedule");
            break;
        case "medical_check":
            navigate("/parent/health-checkup-results");
            break;
        case "medical_campaign":
            navigate("/parent/medical-schedule", {
                state: { scrollToMedicalTab: true },
            });
            break;
        case "medication":
        case "medication_request":
            // For nurses: navigate to confirmed medicines for approval
            if (currentUser?.role === "SCHOOL_NURSE") {
                navigate("/nurse/confirmed-medicines");
            } else {
                navigate("/parent/medicine-info");
            }
            break;
        case "vaccination_campaign_created":
        case "vaccination_campaign_updated":
        case "vaccination_campaign_deleted":
        case "vaccine_created":
        case "vaccine_updated":
        case "vaccine_deleted":
            navigate("/manager/vaccination-campaigns");
            break;
        case "medical_event":
            navigate("/parent/medical-events", {
                state: { notificationId: notification.id },
            });
            break;
        case "medical_consultation":
            // Xử lý thông báo lịch tư vấn sức khỏe
            // Tìm studentName và studentCode từ nội dung thông báo
            const studentNameMatch = notification.message.match(
                /^([^(]+) \(Mã học sinh: ([^)]+)\) đã có vấn đề về sức khỏe/
            );
            if (
                studentNameMatch &&
                studentNameMatch[1] &&
                studentNameMatch[2]
            ) {
                const studentName = studentNameMatch[1].trim();
                const studentCode = studentNameMatch[2].trim();
                // Điều hướng đến trang health-checkup-results với thông tin học sinh
                navigate("/parent/health-checkup-results", {
                    state: {
                        selectedStudentName: studentName,
                        selectedStudentCode: studentCode,
                        scrollToConsultation: true,
                    },
                });
            } else {
                // Fallback: tìm chỉ tên học sinh nếu không có studentCode
                const fallbackMatch = notification.message.match(
                    /^([^đ]+) đã có vấn đề về sức khỏe/
                );
                if (fallbackMatch && fallbackMatch[1]) {
                    const studentName = fallbackMatch[1].trim();
                    navigate("/parent/health-checkup-results", {
                        state: {
                            selectedStudentName: studentName,
                            scrollToConsultation: true,
                        },
                    });
                } else {
                    // Fallback: điều hướng đến trang health-checkup-results
                    navigate("/parent/health-checkup-results");
                }
            }
            break;
        case "medical_check_campaign":
            navigate("/nurse/health-checkups");
            break;
        default:
            // Fallback: show detail modal if available, else do nothing
            if (setSelectedNotification && setDetailModalVisible) {
                setSelectedNotification(notification);
                setDetailModalVisible(true);
            }
            break;
    }
}
