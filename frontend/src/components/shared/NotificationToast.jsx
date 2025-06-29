import React, { useState, useEffect } from "react";
import { notification, Button, Space } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const NotificationToast = ({
    notification: notificationData,
    onClose,
    onMarkAsRead,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose();
            }, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClick = () => {
        if (notificationData.status !== "READ") {
            onMarkAsRead(notificationData.id);
        }

        // Navigation logic
        switch (notificationData.type) {
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
            default:
                // For medical_event and others, just close the toast
                break;
        }

        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
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

    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 1000,
                transform: isVisible ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.3s ease",
                maxWidth: "400px",
                minWidth: "300px",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    padding: "16px",
                    cursor: "pointer",
                }}
                onClick={handleClick}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                    }}
                >
                    <div style={{ fontSize: "24px" }}>
                        {getNotificationIcon(notificationData.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#1890ff",
                                marginBottom: "4px",
                                lineHeight: "1.4",
                            }}
                        >
                            {notificationData.title}
                        </div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#666",
                                marginBottom: "8px",
                                lineHeight: "1.4",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {notificationData.message}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ fontSize: "11px", color: "#999" }}>
                                {getTypeLabel(notificationData.type)}
                            </span>
                            <Space size="small">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClose();
                                    }}
                                    style={{ padding: "0", border: "none" }}
                                />
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
