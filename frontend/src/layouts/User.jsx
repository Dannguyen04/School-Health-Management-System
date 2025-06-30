import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Blogs from "../components/parent/Blogs";
import Footer from "../components/parent/Footer";
import Navbar from "../components/parent/Navbar";
import Services from "../components/parent/Services";
import { useAuth } from "../context/authContext";

const User = () => {
    const location = useLocation();
    const { shouldScrollToServices, setScrollToServices } = useAuth();
    const isLandingPage = location.pathname === "/user";

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

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
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
