import {
    Badge,
    Dropdown,
    List,
    Button,
    message,
    Spin,
    Modal,
    Descriptions,
    Tag,
    Typography,
} from "antd";
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    EyeOutlined,
    UndoOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNotifications } from "../../hooks/useNotifications";
import { parentAPI } from "../../utils/api.js";
import NotificationItem from "./NotificationItem.jsx";
import VaccinationDetailModal from "../parent/VaccinationDetailModal";

const { Text } = Typography;
const { Title } = Typography;

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [medicalEventDetails, setMedicalEventDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [vaccinationDetail, setVaccinationDetail] = useState(null);
    const [vaccinationModalVisible, setVaccinationModalVisible] =
        useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        archiveNotification,
        restoreNotification,
    } = useNotifications(user?.id, {
        autoRefresh: true,
        refreshInterval: 5000, // 5 seconds
    });

    const handleViewDetail = async (notification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
        setDropdownVisible(false);

        if (
            notification.status !== "READ" &&
            notification.status !== "ARCHIVED"
        ) {
            markAsRead(notification.id);
        }

        if (notification.type === "vaccination_completed") {
            try {
                const response = await parentAPI.getVaccinationDetail(
                    notification.vaccinationCampaignId,
                    notification.studentId
                );
                if (response.data.success) {
                    setVaccinationDetail(response.data.data);
                    setVaccinationModalVisible(true);
                }
            } catch (error) {
                console.error("Error fetching vaccination details:", error);
            }
        } else if (notification.type === "medical_event") {
            try {
                setLoadingDetails(true);
                const response = await parentAPI.getNotificationById(
                    notification.id
                );
                if (
                    response.data.success &&
                    response.data.data.medicalEventDetails
                ) {
                    setMedicalEventDetails(
                        response.data.data.medicalEventDetails
                    );
                }
            } catch (error) {
                console.error("Error fetching medical event details:", error);
            } finally {
                setLoadingDetails(false);
            }
        } else {
            setMedicalEventDetails(null);
        }
    };

    const handleNotificationClick = (notification) => {
        console.log("CLICKED NOTI:", notification);
        // Đánh dấu đã đọc nếu chưa đọc
        if (notification.status !== "READ") {
            markAsRead(notification.id);
        }

        // Đóng dropdown notification trước khi điều hướng
        setDropdownVisible(false);

        // Navigation dựa trên loại thông báo
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
                navigate("/parent/medicine-info");
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
                // Chuyển hướng sang trang medical-events và truyền notificationId
                navigate("/parent/medical-events", {
                    state: { notificationId: notification.id },
                });
                break;
            case "medical_consultation":
                navigate("/parent/health-checkup-results");
                break;
            default:
                setSelectedNotification(notification);
                setDetailModalVisible(true);
                break;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "medical_event":
                return "🏥";
            case "vaccination":
                return "💉";
            case "vaccination_consent":
                return "📋";
            case "vaccination_consent_update":
                return "✅";
            case "vaccination_campaign_created":
            case "vaccination_campaign_updated":
            case "vaccination_campaign_deleted":
            case "vaccine_created":
            case "vaccine_updated":
            case "vaccine_deleted":
                return "📋";
            case "medical_check":
                return "👨‍⚕️";
            case "medication":
                return "💊";
            default:
                return "📢";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "READ":
                return "green";
            case "SENT":
                return "blue";
            case "DELIVERED":
                return "orange";
            default:
                return "default";
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "medical_event":
                return "Sự kiện y tế";
            case "vaccination":
                return "Tiêm chủng";
            case "vaccination_consent":
                return "Phiếu đồng ý tiêm chủng";
            case "vaccination_consent_update":
                return "Cập nhật phiếu đồng ý";
            case "vaccination_campaign_created":
                return "Chiến dịch tiêm chủng";
            case "vaccination_campaign_updated":
                return "Cập nhật chiến dịch";
            case "vaccination_campaign_deleted":
                return "Xóa chiến dịch";
            case "vaccine_created":
                return "Vaccine mới";
            case "vaccine_updated":
                return "Cập nhật vaccine";
            case "vaccine_deleted":
                return "Xóa vaccine";
            case "medical_check":
                return "Khám sức khỏe";
            case "medication":
                return "Thuốc";
            default:
                return "Thông báo chung";
        }
    };

    const getMedicalEventTypeLabel = (type) => {
        switch (type) {
            case "ACCIDENT":
                return "Tai nạn";
            case "FEVER":
                return "Sốt";
            case "FALL":
                return "Ngã";
            case "EPIDEMIC":
                return "Dịch bệnh";
            case "ALLERGY_REACTION":
                return "Phản ứng dị ứng";
            case "CHRONIC_DISEASE_EPISODE":
                return "Đợt cấp bệnh mãn tính";
            case "OTHER":
                return "Khác";
            default:
                return type;
        }
    };

    const getMedicalEventStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "IN_PROGRESS":
                return "Đang xử lý";
            case "RESOLVED":
                return "Đã giải quyết";
            case "REFERRED":
                return "Đã chuyển viện";
            default:
                return status;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case "critical":
                return "red";
            case "high":
                return "orange";
            case "medium":
                return "yellow";
            case "low":
                return "green";
            default:
                return "blue";
        }
    };

    const getSeverityLabel = (severity) => {
        switch ((severity || "").toLowerCase()) {
            case "critical":
                return "Nguy kịch";
            case "high":
                return "Cao";
            case "medium":
                return "Trung bình";
            case "low":
                return "Thấp";
            default:
                return severity;
        }
    };

    // Tạo notificationItems mới với phần scroll chỉ ở danh sách
    const notificationList =
        notifications.length > 0 ? (
            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onViewDetail={handleViewDetail}
                        onMarkAsRead={markAsRead}
                        onDelete={async (id) => await deleteNotification(id)}
                        onNotificationClick={handleNotificationClick}
                        getNotificationIcon={getNotificationIcon}
                        getStatusColor={getStatusColor}
                        getTypeLabel={getTypeLabel}
                        getSeverityLabel={getSeverityLabel}
                        getMedicalEventStatusLabel={getMedicalEventStatusLabel}
                        getMedicalEventTypeLabel={getMedicalEventTypeLabel}
                    />
                ))}
            </div>
        ) : null;

    const notificationItems = [
        {
            key: "header",
            label: (
                <div
                    style={{
                        padding: "8px 16px",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <strong>Thông báo gần đây</strong>
                    {unreadCount > 0 && (
                        <Badge
                            count={unreadCount}
                            style={{
                                marginLeft: 8,
                                backgroundColor: "#52c41a",
                            }}
                        />
                    )}
                </div>
            ),
            disabled: true,
        },
        {
            key: "list",
            label: notificationList,
            disabled: true,
        },
        {
            key: "empty",
            label:
                notifications.length === 0 ? (
                    <div
                        style={{
                            padding: "16px",
                            textAlign: "center",
                            color: "#999",
                        }}
                    >
                        {loading ? (
                            <Spin size="small" />
                        ) : (
                            "Không có thông báo nào"
                        )}
                    </div>
                ) : null,
            disabled: true,
        },
    ].filter(Boolean);

    // Khi mở dropdown chuông, đánh dấu tất cả là đã đọc
    const handleDropdownOpenChange = async (open) => {
        setDropdownVisible(open);
        if (open && unreadCount > 0) {
            await markAllAsRead();
        }
    };

    return (
        <>
            <Dropdown
                menu={{ items: notificationItems }}
                placement="bottomRight"
                trigger={["click"]}
                open={dropdownVisible}
                onOpenChange={handleDropdownOpenChange}
            >
                <Badge count={unreadCount} size="small">
                    <Button
                        type="text"
                        icon={<BellOutlined style={{ fontSize: "18px" }} />}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                        }}
                    />
                </Badge>
            </Dropdown>

            <VaccinationDetailModal
                visible={vaccinationModalVisible}
                vaccination={vaccinationDetail}
                onClose={() => setVaccinationModalVisible(false)}
            />
        </>
    );
};

export default NotificationBell;
