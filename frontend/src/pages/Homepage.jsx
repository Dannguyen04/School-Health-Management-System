import { useRef } from "react";
import { useEffect, useState } from "react";
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
    FaChartLine,
    FaUsers,
    FaCalendarCheck,
    FaAward,
    FaStar,
    FaArrowRight,
    FaPlay,
    FaCheckCircle,
    FaRocket,
    FaShieldAlt,
    FaGraduationCap,
    FaChild,
    FaStethoscope,
    FaUserMd,
    FaClipboardCheck,
    FaSchool,
    FaPills,
    FaTruck,
} from "react-icons/fa";
import { useAuth } from "../context/authContext";
import initAllAnimations from "../utils/scrollAnimations";

const Homepage = () => {
    const navigate = useNavigate();
    const { shouldScrollToServices, setScrollToServices } = useAuth();
    const aboutRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

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

    // Initialize animations
    useEffect(() => {
        initAllAnimations();
    }, []);

    // Statistics data - adjusted for Vietnamese primary school context
    const stats = [
        {
            number: "800+",
            label: "Học sinh tiểu học",
            icon: FaChild,
            target: 800,
        },
        {
            number: "25+",
            label: "Giáo viên & nhân viên",
            icon: FaGraduationCap,
            target: 25,
        },
        {
            number: "100%",
            label: "An toàn thông tin",
            icon: FaUserShield,
            target: 100,
        },
        {
            number: "5/7",
            label: "Ngày làm việc",
            icon: FaCalendarCheck,
            target: 5,
        },
    ];

    // Testimonials data - adjusted for Vietnamese primary school context
    const testimonials = [
        {
            name: "Nguyễn Thị Lan",
            role: "Phụ huynh học sinh lớp 3A",
            content:
                "Hệ thống giúp tôi theo dõi sức khỏe con mình một cách dễ dàng. Nhận thông báo tiêm chủng và khám sức khỏe định kỳ rất thuận tiện.",
            rating: 5,
            avatar: "/img/profile-image.jpg",
        },
        {
            name: "Cô Trần Thị Minh",
            role: "Giáo viên chủ nhiệm lớp 2B",
            content:
                "Công cụ quản lý sức khỏe học sinh rất hiệu quả. Giúp chúng tôi phối hợp tốt với phụ huynh trong việc chăm sóc sức khỏe học sinh.",
            rating: 5,
            avatar: "/img/profile-image.jpg",
        },
        {
            name: "Y tá Nguyễn Văn Hùng",
            role: "Nhân viên y tế trường học",
            content:
                "Hệ thống giúp tôi quản lý hồ sơ sức khỏe và lịch khám bệnh một cách khoa học. Tiết kiệm thời gian và nâng cao hiệu quả công việc.",
            rating: 5,
            avatar: "/img/profile-image.jpg",
        },
    ];

    // Hero features
    const heroFeatures = [
        {
            icon: FaStethoscope,
            text: "Khám sức khỏe định kỳ",
            color: "from-red-500 to-pink-500",
        },
        {
            icon: FaClipboardCheck,
            text: "Quản lý tiêm chủng",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: FaPills,
            text: "Gửi thuốc cho trường",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: FaBell,
            text: "Thông báo y tế",
            color: "from-purple-500 to-pink-500",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <HomepageNavbar />
            <main className="flex-1">
                {/* Enhanced Hero Section */}
                <section
                    id="hero"
                    className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#36ae9a] via-[#4fd1c5] to-[#81e6d9] overflow-hidden"
                >
                    {/* Banner background image */}
                    <img
                        src="/img/banner.jpg"
                        alt="Banner"
                        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-80 animate-zoom-in"
                        style={{ filter: "brightness(0.85) blur(0px)" }}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#36ae9a]/80 via-[#4fd1c5]/60 to-[#81e6d9]/70 z-10"></div>

                    {/* Animated background elements */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse animate-float"></div>
                        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000 animate-float"></div>
                        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000 animate-float"></div>
                        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1500 animate-float"></div>
                        <div className="absolute top-1/4 left-1/6 w-8 h-8 bg-white/5 rounded-full animate-pulse delay-500"></div>
                        <div className="absolute bottom-1/3 right-1/6 w-10 h-10 bg-white/5 rounded-full animate-pulse delay-1500"></div>
                    </div>

                    <div className="relative z-30 text-center px-4 py-20 text-white max-w-6xl mx-auto">
                        <div className="mb-8 animate-fade-in-up animate-delay-200">
                            <div className="inline-flex items-center gap-2 glass text-white px-6 py-3 rounded-full text-sm font-medium mb-6 animate-pulse-glow animate-delay-300">
                                <FaRocket className="text-white" />
                                <span>
                                    Hệ thống Quản lý Y tế Trường Tiểu học
                                </span>
                            </div>
                        </div>

                        <h1 className="hero-title font-bold mb-8 leading-tight drop-shadow-lg text-reveal animate-fade-in-up animate-delay-400">
                            Chăm sóc sức khỏe{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#e6fffa]">
                                học sinh tiểu học
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-12 drop-shadow max-w-4xl mx-auto leading-relaxed text-reveal animate-fade-in-up animate-delay-600">
                            Hệ thống quản lý y tế học đường toàn diện cho trường
                            tiểu học Việt Nam. Kết nối nhà trường, phụ huynh và
                            y tế để đảm bảo sự phát triển khỏe mạnh cho học
                            sinh.
                        </p>

                        {/* Hero Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto animate-fade-in-up animate-delay-800">
                            {heroFeatures.map((feature, index) => (
                                <div key={index} className="group">
                                    <div
                                        className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${
                                            feature.color
                                        } flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-bounce-in animate-delay-${
                                            900 + index * 100
                                        }`}
                                    >
                                        <feature.icon
                                            size={20}
                                            className="text-white"
                                        />
                                    </div>
                                    <p className="text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-up animate-delay-1000">
                            <button
                                className="group bg-white text-[#36ae9a] font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg transform hover:scale-105 flex items-center gap-3 btn-primary animate-bounce-in animate-delay-1100"
                                onClick={() => navigate("/auth")}
                                data-original-text="Đăng nhập ngay"
                            >
                                <span>Đăng nhập ngay</span>
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                className="group bg-transparent border-2 border-white text-white font-bold px-10 py-4 rounded-full hover:bg-white hover:text-[#36ae9a] transition-all duration-300 text-lg transform hover:scale-105 flex items-center gap-3 animate-bounce-in animate-delay-1200"
                                onClick={handleLearnMore}
                            >
                                <FaPlay className="group-hover:scale-110 transition-transform" />
                                <span>Tìm hiểu thêm</span>
                            </button>
                        </div>

                        {/* Enhanced Quick stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up animate-delay-1300">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="text-center stagger-item group animate-bounce-in animate-delay-1400"
                                >
                                    <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <stat.icon
                                            size={24}
                                            className="text-white"
                                        />
                                    </div>
                                    <div
                                        className="text-2xl md:text-3xl font-bold mb-1 counter"
                                        data-target={stat.target}
                                    >
                                        {stat.number}
                                    </div>
                                    <div className="text-sm opacity-90">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-12 pt-8 border-t border-white/20 animate-fade-in-up animate-delay-1500">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Được tin tưởng bởi
                                </h3>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm opacity-90">
                                <div className="flex items-center gap-2">
                                    <FaCheckCircle className="text-green-300" />
                                    <span>Tuân thủ quy định Bộ Giáo dục</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-blue-300" />
                                    <span>Bảo mật thông tin tuyệt đối</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaAward className="text-yellow-300" />
                                    <span>Được tin tưởng bởi 100+ trường</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-40">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                                <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute top-1/4 right-10 hidden lg:block z-40">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                    <FaHeartbeat className="text-white" />
                                </div>
                                <div className="text-white">
                                    <div className="font-bold">
                                        Khám sức khỏe
                                    </div>
                                    <div className="text-sm opacity-80">
                                        Định kỳ hàng năm
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-1/4 left-10 hidden lg:block z-40">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float delay-1000">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <FaPills className="text-white" />
                                </div>
                                <div className="text-white">
                                    <div className="font-bold">Gửi thuốc</div>
                                    <div className="text-sm opacity-80">
                                        Cho trường học
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-24 bg-gradient-to-br from-white to-[#f6fcfa] animate-fade-in-up animate-delay-200">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-3 rounded-full text-sm font-medium mb-6 stagger-item">
                                <FaAward className="text-[#36ae9a]" />
                                <span>Lý do chọn chúng tôi</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight stagger-item">
                                Tại sao chọn{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5]">
                                    hệ thống của chúng tôi?
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto stagger-item">
                                Hệ thống được thiết kế đặc biệt cho môi trường
                                giáo dục tiểu học Việt Nam, đáp ứng đầy đủ các
                                yêu cầu và quy định của Bộ Giáo dục.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: FaShieldAlt,
                                    title: "An toàn & Bảo mật",
                                    description:
                                        "Tuân thủ nghiêm ngặt quy định bảo vệ dữ liệu cá nhân học sinh theo Luật An ninh mạng Việt Nam.",
                                    color: "from-blue-500 to-cyan-500",
                                    features: [
                                        "Mã hóa dữ liệu",
                                        "Kiểm soát truy cập",
                                        "Backup tự động",
                                    ],
                                },
                                {
                                    icon: FaRocket,
                                    title: "Dễ sử dụng",
                                    description:
                                        "Giao diện thân thiện, dễ dàng sử dụng cho mọi đối tượng từ giáo viên đến phụ huynh.",
                                    color: "from-green-500 to-emerald-500",
                                    features: [
                                        "Giao diện đơn giản",
                                        "Hướng dẫn chi tiết",
                                        "Hỗ trợ 24/7",
                                    ],
                                },
                                {
                                    icon: FaChartLine,
                                    title: "Hiệu quả cao",
                                    description:
                                        "Tối ưu hóa quy trình y tế học đường, tiết kiệm thời gian và nâng cao chất lượng chăm sóc.",
                                    color: "from-purple-500 to-pink-500",
                                    features: [
                                        "Quy trình tối ưu",
                                        "Báo cáo tự động",
                                        "Phân tích dữ liệu",
                                    ],
                                },
                            ].map((reason, index) => (
                                <div
                                    key={index}
                                    className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 card-hover stagger-item"
                                >
                                    <div
                                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${reason.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <reason.icon
                                            size={28}
                                            className="text-white"
                                        />
                                    </div>
                                    <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-[#36ae9a] transition-colors">
                                        {reason.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {reason.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {reason.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center gap-2 text-sm text-gray-600"
                                            >
                                                <FaCheckCircle className="text-green-500 text-xs" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Enhanced Benefits Section */}
                <section
                    id="features"
                    className="py-24 bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2] animate-fade-in-up animate-delay-400"
                >
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-3 rounded-full text-sm font-medium mb-6 stagger-item">
                                <FaCheckCircle className="text-[#36ae9a]" />
                                <span>Tính năng nổi bật</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight stagger-item">
                                Quản lý y tế học đường{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5]">
                                    toàn diện
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto stagger-item">
                                Hệ thống được thiết kế đặc biệt cho trường tiểu
                                học Việt Nam, hỗ trợ đầy đủ các hoạt động y tế
                                học đường theo quy định của Bộ Giáo dục.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: FaHeartbeat,
                                    title: "Khám sức khỏe định kỳ",
                                    description:
                                        "Quản lý lịch khám sức khỏe, theo dõi chiều cao, cân nặng và các chỉ số sức khỏe của học sinh.",
                                    color: "from-red-500 to-pink-500",
                                },
                                {
                                    icon: FaBell,
                                    title: "Thông báo tiêm chủng",
                                    description:
                                        "Nhắc nhở lịch tiêm chủng, quản lý sổ tiêm chủng và theo dõi tình trạng tiêm chủng của học sinh.",
                                    color: "from-yellow-500 to-orange-500",
                                },
                                {
                                    icon: FaPills,
                                    title: "Gửi thuốc cho trường",
                                    description:
                                        "Quản lý đơn thuốc, theo dõi việc gửi thuốc và đảm bảo học sinh uống thuốc đúng liều lượng.",
                                    color: "from-green-500 to-teal-500",
                                },
                                {
                                    icon: FaUserFriends,
                                    title: "Kết nối phụ huynh",
                                    description:
                                        "Tăng cường liên lạc giữa nhà trường và phụ huynh trong việc chăm sóc sức khỏe học sinh.",
                                    color: "from-blue-500 to-purple-500",
                                },
                            ].map((benefit, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 card-hover stagger-item"
                                >
                                    <div
                                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <benefit.icon
                                            size={28}
                                            className="text-white"
                                        />
                                    </div>
                                    <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-[#36ae9a] transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="py-24 bg-gradient-to-r from-[#36ae9a]/10 to-[#4fd1c5]/10 text-[#222] animate-fade-in-up animate-delay-600">
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 stagger-item">
                                Thống kê hoạt động
                            </h2>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto stagger-item">
                                Những con số thể hiện hiệu quả hoạt động y tế
                                học đường
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="text-center group stagger-item"
                                >
                                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <stat.icon
                                            size={32}
                                            className="text-white"
                                        />
                                    </div>
                                    <div
                                        className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 counter"
                                        data-target={stat.target}
                                    >
                                        {stat.number}
                                    </div>
                                    <div className="text-lg opacity-90">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About */}
                <section
                    id="about"
                    ref={aboutRef}
                    className="animate-fade-in-up animate-delay-800"
                >
                    <About />
                </section>

                {/* Testimonial Section */}
                <section className="py-24 bg-gradient-to-br from-[#e8f5f2] to-[#f6fcfa] animate-fade-in-up animate-delay-1000">
                    <div className="max-w-5xl mx-auto px-5">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-3 rounded-full text-sm font-medium mb-6">
                                <FaStar className="text-[#36ae9a]" />
                                <span>Cảm nhận phụ huynh & giáo viên</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] leading-tight">
                                Phản hồi thực tế
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((t, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center group animate-fade-in-up animate-delay-1200"
                                >
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-[#36ae9a] shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="flex gap-1 mb-2">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className="text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 italic mb-4">
                                        “{t.content}”
                                    </p>
                                    <div className="font-bold text-[#36ae9a]">
                                        {t.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {t.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Blogs */}
                <section
                    id="blog"
                    className="animate-fade-in-up animate-delay-1200"
                >
                    <Blogs />
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Homepage;
