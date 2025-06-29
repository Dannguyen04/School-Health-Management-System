import React, { useState, useEffect } from "react";
import {
    Badge,
    Dropdown,
    Button,
    Modal,
    Tabs,
    Typography,
    Space,
    message,
    Spin,
    Card,
} from "antd";
import { BellOutlined, ReloadOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import NotificationDetailModal from "./NotificationDetailModal";

const { Title } = Typography;

const NotificationCenter = ({ maxDropdownItems = 10 }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        refresh,
        markAsRead,
        deleteNotification,
        archiveNotification,
        restoreNotification,
    } = useNotifications(user?.id, {
        autoRefresh: true,
        refreshInterval: 30000,
    });

    // Filter notifications based on active tab
    const getFilteredNotifications = () => {
        switch (activeTab) {
            case "medical_event":
                return notifications.filter((n) => n.type === "medical_event");
            case "vaccination":
                return notifications.filter((n) => n.type === "vaccination");
            case "medical_check":
                return notifications.filter((n) => n.type === "medical_check");
            case "medication":
                return notifications.filter((n) => n.type === "medication");
            case "archived":
                return notifications.filter((n) => n.status === "ARCHIVED");
            default:
                return notifications;
        }
    };

    const filteredNotifications = getFilteredNotifications();

    const handleNotificationClick = (notification) => {
        // Đánh dấu đã đọc nếu chưa đọc
        if (
            notification.status !== "READ" &&
            notification.status !== "ARCHIVED"
        ) {
            markAsRead(notification.id);
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
            case "medical_event":
                // Mở modal chi tiết cho medical event
                handleViewDetail(notification);
                break;
            default:
                // Mở modal chi tiết cho các loại thông báo khác
                handleViewDetail(notification);
                break;
        }

        // Đóng dropdown nếu đang mở
        if (dropdownVisible) {
            setDropdownVisible(false);
        }
    };

    const handleViewDetail = (notification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
    };

    const handleRefresh = () => {
        refresh();
        message.success("Đã làm mới thông báo");
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

    // Tab items for dropdown
    const tabItems = [
        {
            key: "all",
            label: (
                <span>
                    Tất cả
                    {unreadCount > 0 && (
                        <Badge
                            count={unreadCount}
                            style={{
                                marginLeft: 4,
                                backgroundColor: "#52c41a",
                            }}
                        />
                    )}
                </span>
            ),
            children: (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {filteredNotifications.map((item) => (
                        <NotificationItem
                            key={item.id}
                            notification={item}
                            onViewDetail={handleViewDetail}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            onNotificationClick={handleNotificationClick}
                            getNotificationIcon={getNotificationIcon}
                            getStatusColor={getStatusColor}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                    {filteredNotifications.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "24px",
                                color: "#999",
                            }}
                        >
                            {loading ? (
                                <Spin size="small" />
                            ) : (
                                "Không có thông báo nào"
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "medical_event",
            label: <span>🏥</span>,
            children: (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {filteredNotifications.map((item) => (
                        <NotificationItem
                            key={item.id}
                            notification={item}
                            onViewDetail={handleViewDetail}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            onNotificationClick={handleNotificationClick}
                            getNotificationIcon={getNotificationIcon}
                            getStatusColor={getStatusColor}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                </div>
            ),
        },
        {
            key: "vaccination",
            label: <span>💉</span>,
            children: (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {filteredNotifications.map((item) => (
                        <NotificationItem
                            key={item.id}
                            notification={item}
                            onViewDetail={handleViewDetail}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            onNotificationClick={handleNotificationClick}
                            getNotificationIcon={getNotificationIcon}
                            getStatusColor={getStatusColor}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                </div>
            ),
        },
        {
            key: "medical_check",
            label: <span>👨‍⚕️</span>,
            children: (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {filteredNotifications.map((item) => (
                        <NotificationItem
                            key={item.id}
                            notification={item}
                            onViewDetail={handleViewDetail}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            onNotificationClick={handleNotificationClick}
                            getNotificationIcon={getNotificationIcon}
                            getStatusColor={getStatusColor}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                </div>
            ),
        },
        {
            key: "medication",
            label: <span>💊</span>,
            children: (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {filteredNotifications.map((item) => (
                        <NotificationItem
                            key={item.id}
                            notification={item}
                            onViewDetail={handleViewDetail}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            onNotificationClick={handleNotificationClick}
                            getNotificationIcon={getNotificationIcon}
                            getStatusColor={getStatusColor}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                </div>
            ),
        },
        {
            key: "archived",
            label: <span>📁</span>,
            children: (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {filteredNotifications.map((item) => (
                        <NotificationItem
                            key={item.id}
                            notification={item}
                            onViewDetail={handleViewDetail}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            onNotificationClick={handleNotificationClick}
                            getNotificationIcon={getNotificationIcon}
                            getStatusColor={getStatusColor}
                            getTypeLabel={getTypeLabel}
                        />
                    ))}
                </div>
            ),
        },
    ];

    // Dropdown content with tabs
    const dropdownContent = (
        <div style={{ minWidth: "400px", maxWidth: "500px" }}>
            <div
                style={{
                    padding: "8px 16px",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <strong>Thông báo</strong>
                </div>
            </div>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="small"
                style={{ padding: "8px" }}
                tabBarStyle={{ marginBottom: "8px" }}
            />
        </div>
    );

    return (
        <>
            <Dropdown
                overlay={dropdownContent}
                placement="bottomRight"
                trigger={["click"]}
                open={dropdownVisible}
                onOpenChange={setDropdownVisible}
                overlayStyle={{ maxHeight: "600px", overflow: "auto" }}
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

            {/* Detail modal */}
            <NotificationDetailModal
                visible={detailModalVisible}
                notification={selectedNotification}
                onClose={() => {
                    setDetailModalVisible(false);
                    setSelectedNotification(null);
                }}
                onMarkAsRead={markAsRead}
                onArchive={archiveNotification}
                onRestore={restoreNotification}
                onDelete={deleteNotification}
            />
        </>
    );
};

export default NotificationCenter;
