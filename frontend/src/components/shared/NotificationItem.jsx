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
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return notificationTime.format("DD/MM/YYYY");
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
                flexDirection: "column",
                gap: "8px",
                padding: "14px 18px 12px 18px",
                backgroundColor:
                    notification.status === "READ" ? "#fafafa" : "#fff",
                border:
                    notification.status === "READ"
                        ? "1px solid #f0f0f0"
                        : isHovered
                        ? "1px solid #1890ff"
                        : "1px solid #d9d9d9",
                borderRadius: "12px",
                marginBottom: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHovered
                    ? "0 4px 12px rgba(24, 144, 255, 0.10)"
                    : "0 2px 8px rgba(0, 0, 0, 0.04)",
                minWidth: 0,
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                    style={{
                        fontSize: "28px",
                        minWidth: 40,
                        minHeight: 40,
                        opacity: notification.status === "READ" ? 0.7 : 1,
                        background: getIconBgColor(notification.type),
                        color: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #fff",
                    }}
                >
                    {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Tooltip title={notification.title} placement="topLeft">
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: "14px",
                                color:
                                    notification.status !== "READ"
                                        ? "#1890ff"
                                        : "#222",
                                lineHeight: "1.5",
                                marginBottom: 2,
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
                    <Tooltip title={notification.message} placement="topLeft">
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#666",
                                lineHeight: "1.6",
                                marginBottom: 0,
                                whiteSpace: "pre-line",
                                wordBreak: "break-word",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {notification.message}
                        </div>
                    </Tooltip>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 2,
                }}
            >
                <Space size={8}>
                    <Tooltip
                        title={moment(notification.createdAt).format(
                            "DD/MM/YYYY HH:mm"
                        )}
                    >
                        <span
                            style={{
                                fontSize: 10,
                                color: "#999",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ClockCircleOutlined
                                style={{ marginRight: 2, fontSize: 12 }}
                            />
                            {getTimeAgo(notification.createdAt)}
                        </span>
                    </Tooltip>
                    <span style={{ fontSize: 10, color: "#b0b0b0" }}>
                        {getTypeLabel(notification.type)}
                        {notification.severity &&
                            ` - ${getSeverityLabel(notification.severity)}`}
                    </span>
                </Space>
                <Tooltip title="Xóa thông báo">
                    <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined style={{ fontSize: 13 }} />}
                        onClick={handleDelete}
                        danger
                        style={{ border: "none", padding: "2px 6px" }}
                        loading={deleting}
                    />
                </Tooltip>
            </div>
        </div>
    );
};

export default NotificationItem;
