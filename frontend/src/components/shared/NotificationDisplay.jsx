import {
    Card,
    List,
    message,
    Spin,
    Typography,
    Button,
    Space,
    Badge,
    Modal,
    Descriptions,
    Tag,
} from "antd";
import {
    CheckOutlined,
    DeleteOutlined,
    EyeOutlined,
    InboxOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parentAPI } from "../../utils/api.js";
import NotificationItem from "./NotificationItem.jsx";

const { Text, Title } = Typography;

const NotificationDisplay = ({ userId, type, status, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [medicalEventDetails, setMedicalEventDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            if (!status || status !== "ARCHIVED") {
                fetchUnreadCount();
            }
        }
    }, [userId, type, status]);

    useEffect(() => {
        if (onUnreadCountChange) {
            onUnreadCountChange(unreadCount);
        }
    }, [unreadCount, onUnreadCountChange]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {};
            if (type) {
                params.type = type;
            }
            const response = await parentAPI.getNotifications(params);
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            message.error("Không thể lấy danh sách thông báo");
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await parentAPI.getUnreadNotificationCount();
            if (response.data.success) {
                setUnreadCount(response.data.data.count);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await parentAPI.updateNotificationStatus(
                notificationId,
                "READ"
            );
            if (response.data.success) {
                message.success("Đã đánh dấu đã đọc");
                fetchNotifications();
                fetchUnreadCount();
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
            message.error("Lỗi khi đánh dấu đã đọc");
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await parentAPI.deleteNotification(notificationId);
            if (response.data.success) {
                message.success("Đã xóa thông báo");
                fetchNotifications();
                fetchUnreadCount();
                if (selectedNotification?.id === notificationId) {
                    setDetailModalVisible(false);
                    setSelectedNotification(null);
                }
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
            message.error("Lỗi khi xóa thông báo");
        }
    };

    const handleViewDetail = async (notification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);

        if (
            notification.status !== "READ" &&
            notification.status !== "ARCHIVED"
        ) {
            handleMarkAsRead(notification.id);
        }

        if (notification.type === "medical_event") {
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
                return "Thông báo";
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

    const handleNotificationClick = (notification) => {
        // Đánh dấu đã đọc nếu chưa đọc
        if (
            notification.status !== "READ" &&
            notification.status !== "ARCHIVED"
        ) {
            handleMarkAsRead(notification.id);
        }

        // Navigation dựa trên loại thông báo
        switch (notification.type) {
            case "vaccination_consent":
                navigate("/user/consent-forms");
                break;
            case "vaccination_consent_update":
                navigate("/manager/vaccination-campaigns");
                break;
            case "vaccination":
                navigate("/user/vaccination-schedule");
                break;
            case "medical_check":
                navigate("/user/health-checkup-results");
                break;
            case "medication":
                navigate("/user/medicine-info");
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
                // Mở modal chi tiết cho medical event
                handleViewDetail(notification);
                break;
            default:
                // Mở modal chi tiết cho các loại thông báo khác
                handleViewDetail(notification);
                break;
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "24px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <Card style={{ marginTop: 24 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <Title level={4}>Thông báo của bạn</Title>
                    {unreadCount > 0 && (
                        <Badge
                            count={unreadCount}
                            style={{ backgroundColor: "#52c41a" }}
                        >
                            <span style={{ fontSize: "14px", color: "#666" }}>
                                Chưa đọc
                            </span>
                        </Badge>
                    )}
                </div>

                {notifications.length > 0 ? (
                    <div>
                        {notifications.map((item) => (
                            <NotificationItem
                                key={item.id}
                                notification={item}
                                onViewDetail={handleViewDetail}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDeleteNotification}
                                onNotificationClick={handleNotificationClick}
                                getNotificationIcon={getNotificationIcon}
                                getStatusColor={getStatusColor}
                                getTypeLabel={getTypeLabel}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                        <Text type="secondary">Không có thông báo nào.</Text>
                    </div>
                )}
            </Card>

            <Modal
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "20px" }}>
                            {selectedNotification &&
                                getNotificationIcon(selectedNotification.type)}
                        </span>
                        <span>Chi tiết thông báo</span>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedNotification(null);
                    setMedicalEventDetails(null);
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setDetailModalVisible(false);
                            setSelectedNotification(null);
                            setMedicalEventDetails(null);
                        }}
                    >
                        Đóng
                    </Button>,
                    selectedNotification &&
                        selectedNotification.status !== "READ" &&
                        selectedNotification.status !== "ARCHIVED" && (
                            <Button
                                key="mark-read"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => {
                                    handleMarkAsRead(selectedNotification.id);
                                    setDetailModalVisible(false);
                                    setSelectedNotification(null);
                                    setMedicalEventDetails(null);
                                }}
                            >
                                Đánh dấu đã đọc
                            </Button>
                        ),
                    selectedNotification &&
                    selectedNotification.status === "ARCHIVED" ? (
                        <Button
                            key="restore"
                            type="primary"
                            icon={<UndoOutlined />}
                            onClick={() => {
                                handleRestoreNotification(
                                    selectedNotification.id
                                );
                            }}
                        >
                            Khôi phục
                        </Button>
                    ) : (
                        <Button
                            key="archive"
                            icon={<InboxOutlined />}
                            onClick={() => {
                                if (selectedNotification) {
                                    handleArchiveNotification(
                                        selectedNotification.id
                                    );
                                }
                            }}
                        >
                            Lưu trữ
                        </Button>
                    ),
                ].filter(Boolean)}
                width={800}
            >
                {selectedNotification && (
                    <div>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Tiêu đề" span={3}>
                                <Text strong>{selectedNotification.title}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Nội dung" span={3}>
                                <div
                                    style={{
                                        backgroundColor: "#f5f5f5",
                                        padding: "12px",
                                        borderRadius: "6px",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {selectedNotification.message}
                                </div>
                            </Descriptions.Item>

                            <Descriptions.Item label="Loại thông báo">
                                <Tag color="blue" style={{ fontSize: "12px" }}>
                                    {getTypeLabel(selectedNotification.type)}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={getStatusColor(
                                        selectedNotification.status
                                    )}
                                >
                                    {selectedNotification.status === "READ"
                                        ? "Đã đọc"
                                        : "Chưa đọc"}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Thời gian tạo">
                                {moment(selectedNotification.createdAt).format(
                                    "DD/MM/YYYY HH:mm:ss"
                                )}
                            </Descriptions.Item>

                            {selectedNotification.sentAt && (
                                <Descriptions.Item label="Thời gian gửi">
                                    {moment(selectedNotification.sentAt).format(
                                        "DD/MM/YYYY HH:mm:ss"
                                    )}
                                </Descriptions.Item>
                            )}

                            {selectedNotification.readAt && (
                                <Descriptions.Item label="Thời gian đọc">
                                    {moment(selectedNotification.readAt).format(
                                        "DD/MM/YYYY HH:mm:ss"
                                    )}
                                </Descriptions.Item>
                            )}

                            {selectedNotification.archivedAt && (
                                <Descriptions.Item label="Thời gian lưu trữ">
                                    {moment(
                                        selectedNotification.archivedAt
                                    ).format("DD/MM/YYYY HH:mm:ss")}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {selectedNotification.type === "medical_event" && (
                            <div style={{ marginTop: "24px" }}>
                                <Title
                                    level={4}
                                    style={{ marginBottom: "16px" }}
                                >
                                    🏥 Chi tiết sự kiện y tế
                                </Title>

                                {loadingDetails ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "24px",
                                        }}
                                    >
                                        <Spin size="large" />
                                        <div style={{ marginTop: "8px" }}>
                                            Đang tải thông tin chi tiết...
                                        </div>
                                    </div>
                                ) : medicalEventDetails ? (
                                    <Descriptions
                                        column={2}
                                        bordered
                                        size="small"
                                    >
                                        <Descriptions.Item
                                            label="Học sinh"
                                            span={2}
                                        >
                                            <Text strong>
                                                {
                                                    medicalEventDetails.studentName
                                                }
                                            </Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item
                                            label="Tiêu đề sự kiện"
                                            span={2}
                                        >
                                            <Text strong>
                                                {medicalEventDetails.title}
                                            </Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item
                                            label="Mô tả"
                                            span={2}
                                        >
                                            <div
                                                style={{
                                                    backgroundColor: "#f9f9f9",
                                                    padding: "8px",
                                                    borderRadius: "4px",
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {
                                                    medicalEventDetails.description
                                                }
                                            </div>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Loại sự kiện">
                                            <Tag color="purple">
                                                {getMedicalEventTypeLabel(
                                                    medicalEventDetails.type
                                                )}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Mức độ nghiêm trọng">
                                            <Tag
                                                color={getSeverityColor(
                                                    medicalEventDetails.severity
                                                )}
                                            >
                                                {getSeverityLabel(
                                                    medicalEventDetails.severity
                                                )}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Trạng thái">
                                            <Tag color="blue">
                                                {getMedicalEventStatusLabel(
                                                    medicalEventDetails.status
                                                )}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Địa điểm">
                                            {medicalEventDetails.location ||
                                                "Không xác định"}
                                        </Descriptions.Item>

                                        <Descriptions.Item
                                            label="Triệu chứng"
                                            span={2}
                                        >
                                            {medicalEventDetails.symptoms &&
                                            medicalEventDetails.symptoms
                                                .length > 0 ? (
                                                <div>
                                                    {medicalEventDetails.symptoms.map(
                                                        (symptom, index) => (
                                                            <Tag
                                                                key={index}
                                                                color="orange"
                                                                style={{
                                                                    marginBottom:
                                                                        "4px",
                                                                }}
                                                            >
                                                                {symptom}
                                                            </Tag>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                "Không có triệu chứng"
                                            )}
                                        </Descriptions.Item>

                                        {medicalEventDetails.treatment && (
                                            <Descriptions.Item
                                                label="Điều trị"
                                                span={2}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f7ff",
                                                        padding: "8px",
                                                        borderRadius: "4px",
                                                        whiteSpace: "pre-wrap",
                                                    }}
                                                >
                                                    {
                                                        medicalEventDetails.treatment
                                                    }
                                                </div>
                                            </Descriptions.Item>
                                        )}

                                        {medicalEventDetails.outcome && (
                                            <Descriptions.Item
                                                label="Kết quả"
                                                span={2}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            "#f6ffed",
                                                        padding: "8px",
                                                        borderRadius: "4px",
                                                        whiteSpace: "pre-wrap",
                                                    }}
                                                >
                                                    {
                                                        medicalEventDetails.outcome
                                                    }
                                                </div>
                                            </Descriptions.Item>
                                        )}

                                        <Descriptions.Item label="Thời gian xảy ra">
                                            {moment(
                                                medicalEventDetails.occurredAt
                                            ).format("DD/MM/YYYY HH:mm")}
                                        </Descriptions.Item>

                                        {medicalEventDetails.resolvedAt && (
                                            <Descriptions.Item label="Thời gian giải quyết">
                                                {moment(
                                                    medicalEventDetails.resolvedAt
                                                ).format("DD/MM/YYYY HH:mm")}
                                            </Descriptions.Item>
                                        )}

                                        <Descriptions.Item label="Y tá phụ trách">
                                            {medicalEventDetails.nurseName}
                                        </Descriptions.Item>
                                    </Descriptions>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "24px",
                                            color: "#999",
                                        }}
                                    >
                                        Không tìm thấy thông tin chi tiết sự
                                        kiện y tế
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default NotificationDisplay;
