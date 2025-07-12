import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space, message } from "antd";
import { ChevronsLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { useAuth } from "../context/authContext";
import NotificationToastList from "../components/shared/NotificationToastList";
import { useNotifications } from "../hooks/useNotifications";
import { useEffect, useState } from "react";

export const Header = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [toastNotifications, setToastNotifications] = useState([]);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState(
        []
    );

    const { notifications, markAsRead } = useNotifications(user?.id, {
        autoRefresh: true,
        refreshInterval: 30000,
    });

    // Hiển thị toast cho tất cả thông báo mới (SENT) chưa bị đóng
    useEffect(() => {
        if (notifications.length > 0) {
            const newToasts = notifications.filter(
                (n) =>
                    n.status === "SENT" &&
                    !toastNotifications.some((t) => t.id === n.id) &&
                    !dismissedNotificationIds.includes(n.id)
            );
            if (newToasts.length > 0) {
                setToastNotifications((prev) => [...newToasts, ...prev]);
            }
        }
        // eslint-disable-next-line
    }, [notifications, toastNotifications, dismissedNotificationIds]);

    const handleLogout = async () => {
        try {
            await logout();
            message.success("Đăng xuất thành công");
            navigate("/auth");
        } catch {
            message.error("Đăng xuất thất bại");
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
            navigate("/parent/profile");
        }
    };

    const handleToastClose = (id) => {
        setDismissedNotificationIds((prev) => [...prev, id]);
        setToastNotifications((prev) => prev.filter((t) => t.id !== id));
    };

    const handleToastMarkAsRead = async (id) => {
        await markAsRead(id);
        setToastNotifications((prev) => prev.filter((t) => t.id !== id));
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
                    {/* Hiển thị NotificationBell cho tất cả user roles */}

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

            {/* Hiển thị NotificationToastList */}
            <NotificationToastList
                notifications={toastNotifications}
                onClose={handleToastClose}
                onMarkAsRead={handleToastMarkAsRead}
            />
        </>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
