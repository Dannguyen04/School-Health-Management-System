import React, { useState } from "react";
import { Button, Badge, Tag, Typography, Space, Tooltip } from "antd";
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

    const handleClick = (e) => {
        e.stopPropagation();
        onNotificationClick(notification);
    };

    const handleMarkAsRead = (e) => {
        e.stopPropagation();
        onMarkAsRead(notification.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification.id);
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

    return (
        <div
            id={`notification-${notification.id}`}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "16px",
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
                    ? "0 4px 12px rgba(24, 144, 255, 0.15)"
                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                style={{
                    fontSize: "28px",
                    marginTop: "4px",
                    opacity: notification.status === "READ" ? 0.7 : 1,
                    transition: "opacity 0.3s ease",
                }}
            >
                {getNotificationIcon(notification.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontWeight:
                            notification.status !== "READ" ? "600" : "400",
                        marginBottom: "6px",
                        color:
                            notification.status !== "READ" ? "#1890ff" : "#000",
                        fontSize: "14px",
                        lineHeight: "1.4",
                        transition: "color 0.3s ease",
                    }}
                >
                    {notification.title}
                </div>
                <div
                    style={{
                        fontSize: "13px",
                        color: "#666",
                        marginBottom: "8px",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {notification.message}
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                    }}
                >
                    <Space size="small">
                        <Tooltip
                            title={moment(notification.createdAt).format(
                                "DD/MM/YYYY HH:mm"
                            )}
                        >
                            <span
                                style={{
                                    fontSize: "11px",
                                    color: "#999",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <ClockCircleOutlined
                                    style={{ marginRight: "4px" }}
                                />
                                {getTimeAgo(notification.createdAt)}
                            </span>
                        </Tooltip>
                        <span style={{ fontSize: "10px" }}>
                            {getTypeLabel(notification.type)}
                        </span>
                    </Space>
                    <Space size="small">
                        <Tooltip title="Xóa thông báo">
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                                danger
                                style={{
                                    border: "none",
                                    padding: "4px 8px",
                                }}
                            />
                        </Tooltip>
                    </Space>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
