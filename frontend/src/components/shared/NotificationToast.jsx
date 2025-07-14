import React, { useEffect, useState } from "react";
import { notification, Badge, Button, Card, Space, Tag } from "antd";
import {
    BellOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const NotificationToast = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Kiểm tra thông báo mỗi phút
        const interval = setInterval(() => {
            checkMedicationNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkMedicationNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "/api/nurse/scheduled-treatments",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success && response.data.upcoming) {
                response.data.upcoming.forEach((notification) => {
                    // Kiểm tra xem thông báo này đã được hiển thị chưa
                    const notificationKey = `medication-${notification.treatmentId}`;
                    const existingNotification =
                        localStorage.getItem(notificationKey);

                    if (!existingNotification) {
                        // Hiển thị thông báo
                        notification.warning({
                            key: notificationKey,
                            message: "Đến giờ cấp phát thuốc!",
                            description: (
                                <div>
                                    <div>
                                        <strong>
                                            {notification.studentName}
                                        </strong>
                                    </div>
                                    <div>
                                        {notification.medicationName} -{" "}
                                        {notification.dosage}
                                    </div>
                                    <div>
                                        Thời gian: {notification.scheduledTime}
                                    </div>
                                </div>
                            ),
                            duration: 0,
                            icon: <MedicineBoxOutlined />,
                            btn: (
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                        // Mở modal cấp phát thuốc
                                        window.location.href =
                                            "/nurse/student-treatment";
                                    }}
                                >
                                    Cấp phát ngay
                                </Button>
                            ),
                        });

                        // Đánh dấu đã hiển thị
                        localStorage.setItem(notificationKey, "true");

                        // Xóa sau 1 giờ
                        setTimeout(() => {
                            localStorage.removeItem(notificationKey);
                        }, 3600000);
                    }
                });
            }
        } catch (error) {
            console.error("Error checking medication notifications:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "medication":
                return null;
            case "vaccination":
                return null;
            default:
                return null;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case "medication":
                return "red";
            case "vaccination":
                return "blue";
            default:
                return "default";
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="notification-container">
            {/* Thông báo cấp phát thuốc real-time */}
            {notifications
                .filter((n) => n.type === "medication" && !n.isRead)
                .map((notification) => (
                    <Card
                        key={notification.id}
                        size="small"
                        style={{
                            marginBottom: 8,
                            border: `1px solid ${getNotificationColor(
                                notification.type
                            )}`,
                            backgroundColor: `${getNotificationColor(
                                notification.type
                            )}10`,
                        }}
                    >
                        <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    {getNotificationIcon(notification.type)}
                                    <span className="font-medium">
                                        {notification.title}
                                    </span>
                                    <Tag
                                        color={getNotificationColor(
                                            notification.type
                                        )}
                                        size="small"
                                    >
                                        {notification.type === "medication"
                                            ? "Thuốc"
                                            : "Tiêm chủng"}
                                    </Tag>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {dayjs(notification.createdAt).format(
                                        "HH:mm"
                                    )}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {notification.message}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    size="small"
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    Đã đọc
                                </Button>
                                {notification.type === "medication" && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                            window.location.href =
                                                "/nurse/student-treatment";
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                )}
                            </div>
                        </Space>
                    </Card>
                ))}
        </div>
    );
};

export default NotificationToast;
