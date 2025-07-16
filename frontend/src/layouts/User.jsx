import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Blogs from "../components/parent/Blogs";
import Footer from "../components/parent/Footer";
import Navbar from "../components/parent/Navbar";
import Services from "../components/parent/Services";
import NotificationToastList from "../components/shared/NotificationToastList";
import { useAuth } from "../context/authContext";
import { useNotifications } from "../hooks/useNotifications";
import { parentAPI } from "../utils/api";

const User = () => {
    const location = useLocation();
    const { shouldScrollToServices, setScrollToServices, user } = useAuth();
    const isLandingPage = location.pathname === "/parent";
    const [showHealthProfileToast, setShowHealthProfileToast] = useState(false);
    const [missingStudents, setMissingStudents] = useState([]);
    const navigate = useNavigate();
    const { notifications: apiNotifications, markAsRead } = useNotifications(
        user?.id,
        {
            autoRefresh: true,
            refreshInterval: 30000,
        }
    );
    const [toastNotifications, setToastNotifications] = useState([]);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState(
        []
    );

    useEffect(() => {
        if (isLandingPage && location.state?.scrollTo) {
            setTimeout(() => {
                document
                    .getElementById(location.state.scrollTo)
                    ?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [isLandingPage, location]);

    // Effect để scroll xuống services section khi parent đăng nhập thành công
    useEffect(() => {
        if (isLandingPage && shouldScrollToServices) {
            // Đảm bảo component đã được mount
            const checkAndScroll = (retryCount = 0) => {
                const servicesSection = document.getElementById("services");
                if (servicesSection) {
                    // Thử scrollIntoView trước
                    servicesSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });

                    // Nếu scrollIntoView không hoạt động, thử window.scrollTo
                    setTimeout(() => {
                        const rect = servicesSection.getBoundingClientRect();
                        const navbarHeight = 80; // Ước tính chiều cao navbar
                        const targetScrollTop =
                            window.pageYOffset + rect.top - navbarHeight;

                        window.scrollTo({
                            top: targetScrollTop,
                            behavior: "smooth",
                        });
                    }, 100);

                    // Reset flag sau khi scroll hoàn thành
                    setScrollToServices(false);
                } else if (retryCount < 10) {
                    // Giới hạn 10 lần thử
                    // Thử lại sau 100ms nếu chưa tìm thấy
                    setTimeout(() => checkAndScroll(retryCount + 1), 100);
                } else {
                    // Reset flag nếu không tìm thấy sau 10 lần thử
                    setScrollToServices(false);
                }
            };

            // Bắt đầu kiểm tra sau 300ms
            setTimeout(() => checkAndScroll(), 300);
        }
    }, [isLandingPage, shouldScrollToServices, setScrollToServices]);

    useEffect(() => {
        const checkMissingHealthProfiles = async () => {
            if (user?.role === "PARENT") {
                try {
                    const childrenRes = await parentAPI.getChildren();
                    const children = childrenRes.data.data || [];
                    // Gọi song song các API kiểm tra health profile
                    const results = await Promise.all(
                        children.map((child) =>
                            parentAPI
                                .getHealthProfile(child.studentId)
                                .then(() => null)
                                .catch((err) =>
                                    err.response && err.response.status === 404
                                        ? child
                                        : null
                                )
                        )
                    );
                    const missing = results.filter(Boolean);
                    if (missing.length > 0) {
                        setMissingStudents(missing);
                        setShowHealthProfileToast(true);
                        // Điều hướng sang trang khai báo health-profile cho học sinh đầu tiên thiếu
                        navigate(
                            `/parent/health-profile?studentId=${missing[0].studentId}`
                        );
                    } else {
                        setShowHealthProfileToast(false);
                        setMissingStudents([]);
                    }
                } catch (err) {
                    // Có thể log lỗi hoặc bỏ qua
                }
            }
        };
        checkMissingHealthProfiles();
        // eslint-disable-next-line
    }, [user]);

    // Gộp notification API và cảnh báo thiếu khai báo sức khỏe
    useEffect(() => {
        let notiList = apiNotifications.filter(
            (n) =>
                n.status === "SENT" &&
                !dismissedNotificationIds.includes(n.id) &&
                n.type !== "missing_health_profile"
        );
        if (showHealthProfileToast && missingStudents.length > 0) {
            notiList = [
                {
                    id: "missing-health-profile",
                    title: "Cảnh báo thiếu khai báo sức khỏe",
                    message: `Bạn có ${missingStudents.length} con chưa được khai báo sức khỏe. Vui lòng cập nhật thông tin sức khỏe cho các bé!`,
                    type: "medical_check",
                    status: "SENT",
                },
                ...notiList,
            ];
        }
        setToastNotifications(notiList);
    }, [
        apiNotifications,
        showHealthProfileToast,
        missingStudents,
        dismissedNotificationIds,
    ]);

    const handleToastClose = (id) => {
        setDismissedNotificationIds((prev) => [...prev, id]);
        if (id === "missing-health-profile") setShowHealthProfileToast(false);
    };

    const handleToastMarkAsRead = async (id) => {
        if (id === "missing-health-profile") {
            setShowHealthProfileToast(false);
        } else {
            await markAsRead(id);
        }
        setDismissedNotificationIds((prev) => [...prev, id]);
    };

    const addToastNotification = (notification) => {
        setToastNotifications((prev) => [
            {
                ...notification,
                id: `custom-${Date.now()}`,
                status: "SENT",
            },
            ...prev,
        ]);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Hiển thị NotificationToastList duy nhất */}
            <NotificationToastList
                notifications={toastNotifications}
                onClose={handleToastClose}
                onMarkAsRead={handleToastMarkAsRead}
                actionButtons={{
                    "missing-health-profile": (
                        <button
                            style={{
                                background: "#36ae9a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "2px 10px",
                                fontSize: 12,
                                cursor: "pointer",
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (missingStudents[0]) {
                                    navigate(
                                        `/parent/health-profile?studentId=${missingStudents[0].studentId}`
                                    );
                                    setShowHealthProfileToast(false);
                                }
                            }}
                        >
                            Khai báo ngay
                        </button>
                    ),
                }}
                studentIds={{
                    "missing-health-profile": missingStudents[0]?.studentId,
                }}
            />
            <main className="flex-1">
                {isLandingPage ? (
                    <>
                        <div id="services">
                            <Services />
                        </div>
                        <div id="blog">
                            <Blogs />
                        </div>
                    </>
                ) : (
                    <Outlet context={{ addToastNotification }} />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default User;
