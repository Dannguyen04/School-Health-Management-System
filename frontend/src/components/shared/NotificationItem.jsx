import React, { useState } from "react";
import {
    Button,
    Badge,
    Tag,
    Typography,
    Space,
    Tooltip,
    Modal,
    message,
} from "antd";
import {
    CheckOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text } = Typography;

const NotificationItem = ({
    notification,
    onViewDetail,
    onMarkAsRead,
    onDelete,
    onNotificationClick,
    getNotificationIcon,
    getStatusColor,
    getTypeLabel,
    getSeverityLabel,
    getMedicalEventStatusLabel,
    getMedicalEventTypeLabel,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        onNotificationClick(notification);
    };

    const handleMarkAsRead = (e) => {
        e.stopPropagation();
        onMarkAsRead(notification.id);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setDeleting(true);
        const success = await onDelete(notification.id);
        setDeleting(false);
        if (success) {
            message.success("Đã xóa thông báo!");
        } else {
            message.error("Xóa thông báo thất bại!");
        }
    };

    const handleViewDetail = (e) => {
        e.stopPropagation();
        onViewDetail(notification);
    };

    const getTimeAgo = (date) => {
        const now = moment();
        const notificationTime = moment(date);
        const diffMinutes = now.diff(notificationTime, "minutes");
        const diffHours = now.diff(notificationTime, "hours");
        const diffDays = now.diff(notificationTime, "days");

        if (diffMinutes < 1) return "Vừa xong";
        if (diffMinutes < 60) return `${diffMinutes}p`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return notificationTime.format("DD/MM");
    };

    const getIconBgColor = (type) => {
        switch (type) {
            case "medical_event":
                return "#ff7875"; // đỏ nhạt
            case "vaccination":
                return "#40a9ff"; // xanh dương
            case "vaccination_consent":
                return "#36cfc9"; // xanh ngọc
            case "vaccination_consent_update":
                return "#ffd666"; // vàng
            case "medication":
                return "#9254de"; // tím
            default:
                return "#bfbfbf"; // xám
        }
    };

    return (
        <div
            id={`notification-${notification.id}`}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                backgroundColor:
                    notification.status === "READ" ? "#fafafa" : "#fff",
                border:
                    notification.status === "READ"
                        ? "1px solid #f0f0f0"
                        : isHovered
                        ? "1px solid #1890ff"
                        : "1px solid #d9d9d9",
                borderRadius: "8px",
                marginBottom: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                boxShadow: isHovered
                    ? "0 2px 8px rgba(24, 144, 255, 0.15)"
                    : "0 1px 3px rgba(0, 0, 0, 0.05)",
                minWidth: 0,
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Icon nhỏ hơn */}
            <div
                style={{
                    fontSize: "16px",
                    minWidth: 28,
                    minHeight: 28,
                    opacity: notification.status === "READ" ? 0.7 : 1,
                    background: getIconBgColor(notification.type),
                    color: "#fff",
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #fff",
                    flexShrink: 0,
                }}
            >
                {getNotificationIcon(notification.type)}
            </div>

            {/* Nội dung chính */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}
            >
                <Tooltip title={notification.title} placement="topLeft">
                    <div
                        style={{
                            fontWeight:
                                notification.status !== "READ" ? 600 : 500,
                            fontSize: "13px",
                            color:
                                notification.status !== "READ"
                                    ? "#1890ff"
                                    : "#333",
                            lineHeight: "1.3",
                            marginBottom: 1,
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {notification.title}
                    </div>
                </Tooltip>

                {/* Thông tin phụ gọn gàng */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "#666",
                    }}
                >
                    <Space size={6}>
                        <span style={{ display: "flex", alignItems: "center" }}>
                            <ClockCircleOutlined
                                style={{ marginRight: 2, fontSize: 10 }}
                            />
                            {getTimeAgo(notification.createdAt)}
                        </span>
                        <span style={{ color: "#999" }}>
                            {getTypeLabel(notification.type)}
                        </span>
                    </Space>

                    <Tooltip title="Xóa thông báo">
                        <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                            onClick={handleDelete}
                            danger
                            style={{
                                border: "none",
                                padding: "1px 4px",
                                height: "auto",
                                minHeight: "auto",
                            }}
                            loading={deleting}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
