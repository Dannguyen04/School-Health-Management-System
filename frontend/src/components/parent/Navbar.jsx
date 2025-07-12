import { CloseOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationBell from "../shared/NotificationBell";

const Navbar = () => {
    const [menu, setMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [toastNotifications, setToastNotifications] = useState([]);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState(
        []
    );
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isLandingPage = location.pathname === "/parent";

    const { notifications, markAsRead } = useNotifications(user?.id, {
        autoRefresh: true,
        refreshInterval: 30000,
    });

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hiển thị toast cho tất cả thông báo mới (SENT) chưa bị đóng, loại bỏ cảnh báo thiếu khai báo sức khỏe đặc biệt
    useEffect(() => {
        if (notifications.length > 0) {
            const newToasts = notifications.filter(
                (n) =>
                    n.status === "SENT" &&
                    n.id !== "missing-health-profile" && // Bỏ qua cảnh báo đặc biệt
                    !toastNotifications.some((t) => t.id === n.id) &&
                    !dismissedNotificationIds.includes(n.id)
            );
            if (newToasts.length > 0) {
                setToastNotifications((prev) => [...newToasts, ...prev]);
            }
        }
        // eslint-disable-next-line
    }, [notifications, toastNotifications, dismissedNotificationIds]);

    const handleNav = (section) => {
        if (isLandingPage) {
            // Scroll tới section
            setMenu(false);
            document
                .getElementById(section)
                ?.scrollIntoView({ behavior: "smooth" });
        } else {
            // Về landing page và truyền state
            navigate("/parent", { state: { scrollTo: section } });
        }
    };

    const handleLogout = () => {
        navigate("/auth");
    };

    const handleToastClose = (id) => {
        setDismissedNotificationIds((prev) => [...prev, id]);
        setToastNotifications((prev) => prev.filter((t) => t.id !== id));
    };

    const handleToastMarkAsRead = async (id) => {
        await markAsRead(id);
        setToastNotifications((prev) => prev.filter((t) => t.id !== id));
    };

    const userMenuItems = [
        {
            key: "profile",
            label: "Hồ sơ cá nhân",
            onClick: () => navigate("/parent/profile"),
        },
        {
            key: "logout",
            label: "Đăng xuất",
            onClick: handleLogout,
        },
    ];

    return (
        <>
            <div
                className={`fixed w-full z-50 transition-all duration-300 ${
                    scrolled
                        ? "bg-white/95 backdrop-blur-md shadow-lg"
                        : "bg-[#36ae9a]"
                }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-row justify-between items-center p-4 lg:px-8">
                        {/* Logo */}
                        <div
                            className="flex items-center cursor-pointer group"
                            onClick={() => handleNav("services")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-300">
                                    <img
                                        src="/img/logo.png"
                                        alt="School Health Logo"
                                        style={{
                                            width: 32,
                                            height: 32,
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1
                                        className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                                            scrolled
                                                ? "text-[#36ae9a]"
                                                : "text-white"
                                        }`}
                                    >
                                        Sức Khỏe Học Đường
                                    </h1>
                                    <p
                                        className={`text-xs lg:text-sm transition-colors duration-300 ${
                                            scrolled
                                                ? "text-gray-600"
                                                : "text-white/80"
                                        }`}
                                    >
                                        Hệ thống quản lý y tế học đường
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex flex-row items-center gap-8">
                            {/* Notification Bell */}
                            <div className="flex items-center gap-4">
                                {/* User Avatar */}
                                <Dropdown
                                    menu={{ items: userMenuItems }}
                                    placement="bottomRight"
                                    arrow
                                >
                                    <div className="flex items-center gap-2 cursor-pointer group">
                                        <Avatar
                                            size={40}
                                            className="border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"
                                            icon={<UserOutlined />}
                                        />
                                        <div className="hidden xl:block text-left">
                                            <p
                                                className={`text-sm font-medium transition-colors duration-300 ${
                                                    scrolled
                                                        ? "text-gray-700"
                                                        : "text-white"
                                                }`}
                                            >
                                                {user?.fullName || "Phụ huynh"}
                                            </p>
                                            <p
                                                className={`text-xs transition-colors duration-300 ${
                                                    scrolled
                                                        ? "text-gray-500"
                                                        : "text-white/70"
                                                }`}
                                            >
                                                Phụ huynh
                                            </p>
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center gap-3">
                            <button
                                onClick={() => setMenu(!menu)}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                    scrolled
                                        ? "bg-gray-100 text-gray-700"
                                        : "bg-white/20 text-white"
                                }`}
                            >
                                {menu ? <CloseOutlined /> : <MenuOutlined />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`lg:hidden transition-all duration-300 ease-in-out ${
                            menu
                                ? "max-h-96 opacity-100 visible"
                                : "max-h-0 opacity-0 invisible"
                        } overflow-hidden`}
                    >
                        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50">
                            <div className="flex flex-col py-4 px-6 space-y-4">
                                {/* Mobile User Menu */}
                                <div className="border-t border-gray-200/50 pt-4">
                                    <div className="flex items-center gap-3 py-2 px-4">
                                        <Avatar
                                            size={40}
                                            icon={<UserOutlined />}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                {user?.fullName || "Phụ huynh"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Phụ huynh
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <button
                                            className="w-full text-left text-gray-700 py-2 px-4 rounded-lg hover:bg-[#36ae9a]/10 hover:text-[#36ae9a] transition-all duration-300"
                                            onClick={() =>
                                                navigate("/parent/profile")
                                            }
                                        >
                                            Hồ sơ cá nhân
                                        </button>
                                        <button
                                            className="w-full text-left text-gray-700 py-2 px-4 rounded-lg hover:bg-[#36ae9a]/10 hover:text-[#36ae9a] transition-all duration-300"
                                            onClick={handleLogout}
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
