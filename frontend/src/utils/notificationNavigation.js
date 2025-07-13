// notificationNavigation.js

export function navigateByNotificationType(
    notification,
    navigate,
    setSelectedNotification,
    setDetailModalVisible,
    currentUser
) {
    // Special case for missing health profile (toast only)
    if (
        notification.id === "missing-health-profile" &&
        notification.studentId
    ) {
        navigate(`/parent/health-profile?studentId=${notification.studentId}`);
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
            navigate("/parent/health-checkup-results");
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
