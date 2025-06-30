import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space, message } from "antd";
import { ChevronsLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { useAuth } from "../context/authContext";
import NotificationCenter from "../components/shared/NotificationCenter";
import NotificationToast from "../components/shared/NotificationToast";
import { useNotifications } from "../hooks/useNotifications";
import { useEffect, useState } from "react";

export const Header = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [toastNotification, setToastNotification] = useState(null);

    const { notifications, markAsRead } = useNotifications(user?.id, {
        autoRefresh: true,
        refreshInterval: 30000,
    });

    // Hiển thị toast cho thông báo mới
    useEffect(() => {
        if (notifications.length > 0) {
            const latestNotification = notifications[0];
            // Chỉ hiển thị toast cho thông báo mới (SENT) và chưa được hiển thị
            if (
                latestNotification.status === "SENT" &&
                latestNotification.id !== toastNotification?.id
            ) {
                setToastNotification(latestNotification);
            }
        }
    }, [notifications, toastNotification]);

    const handleLogout = async () => {
        try {
            await logout();
            message.success("Logged out successfully");
            navigate("/auth");
        } catch {
            message.error("Failed to logout");
        }
    };

    const handleProfileClick = () => {
        // Navigate to profile based on user role
        if (user?.role === "ADMIN") {
            navigate("/admin/profile");
        } else if (user?.role === "SCHOOL_NURSE") {
            navigate("/nurse/profile");
        } else if (user?.role === "MANAGER") {
            navigate("/manager/profile");
        } else if (user?.role === "PARENT") {
            navigate("/user/profile");
        }
    };

    const handleToastClose = () => {
        setToastNotification(null);
    };

    const handleToastMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
        setToastNotification(null);
    };

    const menuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Hồ sơ",
            onClick: handleProfileClick,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
        },
    ];

    return (
        <>
            <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md border-b border-slate-200 text-slate-900">
                <div className="flex items-center gap-x-3">
                    <button
                        className="btn-ghost size-10"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronsLeft className={collapsed && "rotate-180"} />
                    </button>
                </div>
                <div className="flex items-center gap-x-3">
                    {/* Hiển thị NotificationCenter cho tất cả user roles */}
                    <NotificationCenter mode="bell" />
                    <Dropdown
                        menu={{ items: menuItems }}
                        placement="bottomRight"
                        arrow
                    >
                        <Space className="cursor-pointer">
                            <Avatar icon={<UserOutlined />} />
                            <span>{user?.name || "User"}</span>
                        </Space>
                    </Dropdown>
                </div>
            </header>

            {/* Hiển thị NotificationToast */}
            {toastNotification && (
                <NotificationToast
                    notification={toastNotification}
                    onClose={handleToastClose}
                    onMarkAsRead={handleToastMarkAsRead}
                />
            )}
        </>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
