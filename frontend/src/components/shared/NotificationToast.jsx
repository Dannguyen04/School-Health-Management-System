import React, { useState, useEffect } from "react";
import { notification, Button, Space } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const NotificationToast = ({
    notification: notificationData,
    onClose,
    onMarkAsRead,
    actionButton,
    studentId,
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

        if (notificationData.id === "missing-health-profile" && studentId) {
            navigate(`/user/health-profile?studentId=${studentId}`);
            setIsVisible(false);
            setTimeout(() => {
                onClose();
            }, 300);
            return;
        }

        switch (notificationData.type) {
            case "vaccination_consent":
                navigate("/user/consent-forms");
                break;
            case "vaccination_consent_update":
                navigate("/manager/vaccination-campaigns");
                break;
            case "vaccination":
                navigate("/user/medical-schedule");
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
            case "vaccination_campaign_created":
            case "vaccination_campaign_updated":
            case "vaccination_campaign_deleted":
            case "vaccine_created":
            case "vaccine_updated":
            case "vaccine_deleted":
                return "📋";
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
            default:
                return "Thông báo chung";
        }
    };

    const getIconBgColor = (type) => {
        switch (type) {
            case "medical_event":
                return "#ff7875"; // đỏ nhạt
            case "vaccination":
                return "#40a9ff"; // xanh dương
            case "medical_check":
                return "#36cfc9"; // xanh ngọc
            case "medication":
                return "#9254de"; // tím
            case "vaccination_campaign_created":
            case "vaccination_campaign_updated":
            case "vaccination_campaign_deleted":
            case "vaccine_created":
            case "vaccine_updated":
            case "vaccine_deleted":
                return "#ffd666"; // vàng
            default:
                return "#bfbfbf"; // xám
        }
    };

    return (
        isVisible && (
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
                        <div
                            style={{
                                fontSize: "32px",
                                background: getIconBgColor(
                                    notificationData.type
                                ),
                                color: "#fff",
                                borderRadius: "50%",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                                width: 48,
                                height: 48,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid #fff",
                            }}
                        >
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
                                <span
                                    style={{ fontSize: "11px", color: "#999" }}
                                >
                                    {getTypeLabel(notificationData.type)}
                                </span>
                                <Space size="small">
                                    {actionButton}
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
        )
    );
};

export default NotificationToast;
