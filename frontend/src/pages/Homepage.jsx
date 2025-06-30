import { useRef } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomepageNavbar from "../components/homepage/HomepageNavbar";
import About from "../components/parent/About";
import Blogs from "../components/parent/Blogs";
import Footer from "../components/parent/Footer";
import {
    FaHeartbeat,
    FaUserShield,
    FaBell,
    FaUserFriends,
} from "react-icons/fa";
import { useAuth } from "../context/authContext";

const Homepage = () => {
    const navigate = useNavigate();
    const { shouldScrollToServices, setScrollToServices } = useAuth();
    const aboutRef = useRef(null);

    // Hàm xử lý khi click vào dịch vụ (nếu chưa login)
    const handleServiceClick = (e) => {
        e.preventDefault();
        navigate("/auth");
    };

    // Effect để scroll xuống services section khi cần
    useEffect(() => {
        if (shouldScrollToServices) {
            setScrollToServices(false);
        }
    }, [shouldScrollToServices, setScrollToServices]);

    const handleLearnMore = () => {
        aboutRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <HomepageNavbar />
            <main className="flex-1">
                {/* Hero Section */}
                <section
                    id="hero"
                    className="relative min-h-[60vh] flex items-center justify-center bg-[url('/img/banner.jpg')] bg-no-repeat bg-cover bg-center pt-16"
                >
                    <div className="absolute inset-0 bg-[#36ae9a]/30"></div>
                    <div className="relative z-10 text-center px-4 py-20 text-white max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
                            Đồng hành cùng sức khỏe học đường – Nơi gửi gắm niềm
                            tin của bạn!
                        </h1>
                        <p className="text-lg md:text-xl mb-8 drop-shadow">
                            Chúng tôi cam kết mang đến môi trường học đường an
                            toàn, khỏe mạnh và phát triển toàn diện cho học
                            sinh.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                className="bg-white text-[#36ae9a] font-semibold px-8 py-3 rounded-lg shadow hover:bg-[#ade9dc] transition-colors text-lg"
                                onClick={() => navigate("/auth")}
                            >
                                Đăng nhập
                            </button>
                            <button
                                className="bg-[#36ae9a] border border-white text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-white hover:text-[#36ae9a] transition-colors text-lg"
                                onClick={handleLearnMore}
                            >
                                Tìm hiểu thêm
                            </button>
                        </div>
                    </div>
                </section>
                {/* Lợi ích Section */}
                <section className="py-16 bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2]">
                    <div className="max-w-5xl mx-auto px-5">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#36ae9a] mb-10">
                            Lợi ích khi sử dụng hệ thống
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                                <FaHeartbeat
                                    size={40}
                                    className="text-[#36ae9a] mb-4"
                                />
                                <h3 className="font-semibold text-lg mb-2">
                                    Theo dõi sức khỏe học sinh
                                </h3>
                                <p className="text-gray-600">
                                    Dễ dàng cập nhật, quản lý hồ sơ sức khỏe và
                                    lịch sử khám chữa bệnh của con em.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                                <FaBell
                                    size={40}
                                    className="text-[#36ae9a] mb-4"
                                />
                                <h3 className="font-semibold text-lg mb-2">
                                    Nhận thông báo nhanh chóng
                                </h3>
                                <p className="text-gray-600">
                                    Nhận lịch tiêm chủng, khám sức khỏe, sự kiện
                                    y tế và các thông báo quan trọng.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                                <FaUserShield
                                    size={40}
                                    className="text-[#36ae9a] mb-4"
                                />
                                <h3 className="font-semibold text-lg mb-2">
                                    Bảo mật & an toàn dữ liệu
                                </h3>
                                <p className="text-gray-600">
                                    Thông tin cá nhân và sức khỏe được bảo vệ
                                    tuyệt đối, tuân thủ quy định bảo mật.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                                <FaUserFriends
                                    size={40}
                                    className="text-[#36ae9a] mb-4"
                                />
                                <h3 className="font-semibold text-lg mb-2">
                                    Kết nối nhà trường & phụ huynh
                                </h3>
                                <p className="text-gray-600">
                                    Tăng cường liên lạc, phối hợp giữa nhà
                                    trường, y tế và gia đình trong chăm sóc học
                                    sinh.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* About */}
                <section id="about" ref={aboutRef}>
                    <About />
                </section>
                {/* <div id="services">
          <Services onServiceClick={handleServiceClick} isHomepage />
        </div> */}
                {/* Blogs */}
                <section id="blog">
                    <Blogs />
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Homepage;
