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
import { parentAPI } from "../../utils/api.js";

const { Text } = Typography;
const { Title } = Typography;

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [medicalEventDetails, setMedicalEventDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        fetchRecentNotifications();
    }, []);

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

    const fetchRecentNotifications = async () => {
        try {
            setLoading(true);
            const response = await parentAPI.getNotifications({ limit: 5 });
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await parentAPI.updateNotificationStatus(notificationId, "READ");
            fetchUnreadCount();
            fetchRecentNotifications();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleArchiveNotification = async (notificationId) => {
        try {
            await parentAPI.archiveNotification(notificationId);
            setDetailModalVisible(false);
            setSelectedNotification(null);
            setMedicalEventDetails(null);
            fetchUnreadCount();
            fetchRecentNotifications();
        } catch (error) {
            console.error("Error archiving notification:", error);
        }
    };

    const handleRestoreNotification = async (notificationId) => {
        try {
            await parentAPI.restoreNotification(notificationId);
            setDetailModalVisible(false);
            setSelectedNotification(null);
            setMedicalEventDetails(null);
            fetchUnreadCount();
            fetchRecentNotifications();
        } catch (error) {
            console.error("Error restoring notification:", error);
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
            case "medical_check":
                return "Kiểm tra y tế";
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
        ...notifications.map((notification) => ({
            key: notification.id,
            label: (
                <div style={{ padding: "8px 16px", minWidth: 300 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                        }}
                    >
                        <div style={{ fontSize: "20px", marginTop: "2px" }}>
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    fontWeight:
                                        notification.status !== "READ"
                                            ? "bold"
                                            : "normal",
                                    marginBottom: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleViewDetail(notification)}
                            >
                                {notification.title}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    marginBottom: "4px",
                                    lineHeight: "1.4",
                                }}
                            >
                                {notification.message}
                            </div>
                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#999",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span>
                                    {moment(notification.createdAt).format(
                                        "DD/MM HH:mm"
                                    )}
                                </span>
                                <div>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetail(notification);
                                        }}
                                        title="Xem chi tiết"
                                    />
                                    {notification.status !== "READ" && (
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CheckOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(
                                                    notification.id
                                                );
                                            }}
                                            title="Đánh dấu đã đọc"
                                        />
                                    )}
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNotification(
                                                notification.id
                                            );
                                        }}
                                        title="Xóa thông báo"
                                        danger
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        })),
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

    return (
        <>
            <Dropdown
                menu={{ items: notificationItems }}
                placement="bottomRight"
                trigger={["click"]}
                overlayStyle={{ maxHeight: "400px", overflow: "auto" }}
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

export default NotificationBell;
