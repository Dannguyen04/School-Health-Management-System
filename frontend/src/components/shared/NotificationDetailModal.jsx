import React, { useState, useEffect } from "react";
import {
    Modal,
    Descriptions,
    Tag,
    Typography,
    Button,
    Spin,
    message,
} from "antd";
import {
    CheckOutlined,
    DeleteOutlined,
    InboxOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { parentAPI } from "../../utils/api.js";

const { Text, Title } = Typography;

const NotificationDetailModal = ({
    visible,
    notification,
    onClose,
    onMarkAsRead,
    onArchive,
    onRestore,
    onDelete,
}) => {
    const [medicalEventDetails, setMedicalEventDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (visible && notification && notification.type === "medical_event") {
            fetchMedicalEventDetails();
        } else {
            setMedicalEventDetails(null);
        }
    }, [visible, notification]);

    const fetchMedicalEventDetails = async () => {
        try {
            setLoadingDetails(true);
            const response = await parentAPI.getNotificationById(
                notification.id
            );
            if (
                response.data.success &&
                response.data.data.medicalEventDetails
            ) {
                setMedicalEventDetails(response.data.data.medicalEventDetails);
            }
        } catch (error) {
            console.error("Error fetching medical event details:", error);
            message.error("Không thể tải chi tiết sự kiện y tế");
        } finally {
            setLoadingDetails(false);
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

    const handleMarkAsRead = () => {
        if (notification && onMarkAsRead) {
            onMarkAsRead(notification.id);
            onClose();
        }
    };

    const handleArchive = () => {
        if (notification && onArchive) {
            onArchive(notification.id);
            onClose();
        }
    };

    const handleRestore = () => {
        if (notification && onRestore) {
            onRestore(notification.id);
            onClose();
        }
    };

    const handleDelete = () => {
        if (notification && onDelete) {
            onDelete(notification.id);
            onClose();
        }
    };

    if (!notification) return null;

    return (
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
                        {getNotificationIcon(notification.type)}
                    </span>
                    <span>Chi tiết thông báo</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
                notification.status !== "READ" &&
                    notification.status !== "ARCHIVED" && (
                        <Button
                            key="mark-read"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={handleMarkAsRead}
                        >
                            Đánh dấu đã đọc
                        </Button>
                    ),
                notification.status === "ARCHIVED" ? (
                    <Button
                        key="restore"
                        type="primary"
                        icon={<UndoOutlined />}
                        onClick={handleRestore}
                    >
                        Khôi phục
                    </Button>
                ) : (
                    <Button
                        key="archive"
                        icon={<InboxOutlined />}
                        onClick={handleArchive}
                    >
                        Lưu trữ
                    </Button>
                ),
                <Button
                    key="delete"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                >
                    Xóa
                </Button>,
            ].filter(Boolean)}
            width={800}
        >
            <div>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Tiêu đề" span={3}>
                        <Text strong>{notification.title}</Text>
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
                            {notification.message}
                        </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Loại thông báo">
                        <Tag color="blue" style={{ fontSize: "12px" }}>
                            {getTypeLabel(notification.type)}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                        <Tag color={getStatusColor(notification.status)}>
                            {notification.status === "READ"
                                ? "Đã đọc"
                                : "Chưa đọc"}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thời gian tạo">
                        {moment(notification.createdAt).format(
                            "DD/MM/YYYY HH:mm:ss"
                        )}
                    </Descriptions.Item>

                    {notification.sentAt && (
                        <Descriptions.Item label="Thời gian gửi">
                            {moment(notification.sentAt).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}
                        </Descriptions.Item>
                    )}

                    {notification.readAt && (
                        <Descriptions.Item label="Thời gian đọc">
                            {moment(notification.readAt).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}
                        </Descriptions.Item>
                    )}

                    {notification.archivedAt && (
                        <Descriptions.Item label="Thời gian lưu trữ">
                            {moment(notification.archivedAt).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {notification.type === "medical_event" && (
                    <div style={{ marginTop: "24px" }}>
                        <Title level={4} style={{ marginBottom: "16px" }}>
                            🏥 Chi tiết sự kiện y tế
                        </Title>

                        {loadingDetails ? (
                            <div
                                style={{ textAlign: "center", padding: "24px" }}
                            >
                                <Spin size="large" />
                                <div style={{ marginTop: "8px" }}>
                                    Đang tải thông tin chi tiết...
                                </div>
                            </div>
                        ) : medicalEventDetails ? (
                            <Descriptions column={2} bordered size="small">
                                <Descriptions.Item label="Học sinh" span={2}>
                                    <Text strong>
                                        {medicalEventDetails.studentName}
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

                                <Descriptions.Item label="Mô tả" span={2}>
                                    <div
                                        style={{
                                            backgroundColor: "#f9f9f9",
                                            padding: "8px",
                                            borderRadius: "4px",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {medicalEventDetails.description}
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

                                <Descriptions.Item label="Triệu chứng" span={2}>
                                    {medicalEventDetails.symptoms &&
                                    medicalEventDetails.symptoms.length > 0 ? (
                                        <div>
                                            {medicalEventDetails.symptoms.map(
                                                (symptom, index) => (
                                                    <Tag
                                                        key={index}
                                                        color="orange"
                                                        style={{
                                                            marginBottom: "4px",
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
                                                backgroundColor: "#e6f7ff",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {medicalEventDetails.treatment}
                                        </div>
                                    </Descriptions.Item>
                                )}

                                {medicalEventDetails.outcome && (
                                    <Descriptions.Item label="Kết quả" span={2}>
                                        <div
                                            style={{
                                                backgroundColor: "#f6ffed",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {medicalEventDetails.outcome}
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
                                Không tìm thấy thông tin chi tiết sự kiện y tế
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NotificationDetailModal;
