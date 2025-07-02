import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Blogs from "../components/parent/Blogs";
import Footer from "../components/parent/Footer";
import Navbar from "../components/parent/Navbar";
import Services from "../components/parent/Services";
import { useAuth } from "../context/authContext";
import { parentAPI } from "../utils/api";
import { notification } from "antd";
import NotificationToast from "../components/shared/NotificationToast";

const User = () => {
    const location = useLocation();
    const { shouldScrollToServices, setScrollToServices, user } = useAuth();
    const isLandingPage = location.pathname === "/user";
    const [showHealthProfileToast, setShowHealthProfileToast] = useState(false);
    const [missingStudents, setMissingStudents] = useState([]);
    const navigate = useNavigate();

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
                        // Thông báo antd
                        notification.warning({
                            message: "Cảnh báo thiếu khai báo sức khỏe",
                            description: `Bạn có ${missing.length} con chưa được khai báo sức khỏe. Vui lòng cập nhật thông tin sức khỏe cho các bé!`,
                            duration: 6,
                        });
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

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Hiển thị NotificationToast nếu thiếu health profile */}
            {showHealthProfileToast && missingStudents.length > 0 && (
                <NotificationToast
                    notification={{
                        id: "missing-health-profile",
                        title: "Cảnh báo thiếu khai báo sức khỏe",
                        message: `Bạn có ${missingStudents.length} con chưa được khai báo sức khỏe. Vui lòng cập nhật thông tin sức khỏe cho các bé!`,
                        type: "medical_check",
                        status: "SENT",
                    }}
                    onClose={() => setShowHealthProfileToast(false)}
                    onMarkAsRead={() => setShowHealthProfileToast(false)}
                    actionButton={
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
                                        `/user/health-profile?studentId=${missingStudents[0].studentId}`
                                    );
                                    setShowHealthProfileToast(false);
                                }
                            }}
                        >
                            Khai báo ngay
                        </button>
                    }
                    studentId={missingStudents[0]?.studentId}
                />
            )}
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
                    <Outlet />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default User;
