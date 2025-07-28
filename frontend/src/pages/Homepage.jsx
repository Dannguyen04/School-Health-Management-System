import { useEffect, useRef, useState } from "react";
import {
    FaArrowRight,
    FaAward,
    FaBell,
    FaCalendarCheck,
    FaChartLine,
    FaCheckCircle,
    FaChild,
    FaClipboardCheck,
    FaGraduationCap,
    FaHeartbeat,
    FaPills,
    FaPlay,
    FaRocket,
    FaShieldAlt,
    FaStethoscope,
    FaUserFriends,
    FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HomepageNavbar from "../components/homepage/HomepageNavbar";
import About from "../components/parent/About";
import Blogs from "../components/parent/Blogs";
import Footer from "../components/parent/Footer";
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
        <div className="min-h-screen flex flex-col  bg-gradient-to-br from-[#f6fcfa] to-[#e0f7fa]">
            <HomepageNavbar />
            <main className="flex-1">
                {/* Enhanced Hero Section */}
                <section
                    id="hero"
                    className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
                >
                    {/* Banner background image */}
                    <img
                        src="/img/banner.jpg"
                        alt="Banner"
                        className="absolute inset-0 w-full h-full object-cover object-center z-0 animate-zoom-in"
                        style={{ filter: "brightness(1.0) contrast(1.1)" }}
                    />
                    {/* Subtle overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/20 z-10"></div>

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
                        <div className="mb-10"></div>

                        <h1 className="font-extrabold text-4xl md:text-6xl mb-8 leading-tight drop-shadow-lg text-reveal animate-fade-in-up animate-delay-400">
                            Chăm sóc sức khỏe{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#e6fffa]">
                                học sinh tiểu học
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-12 drop-shadow max-w-3xl mx-auto leading-relaxed text-reveal animate-fade-in-up animate-delay-600">
                            Hệ thống quản lý y tế học đường toàn diện cho trường
                            tiểu học Việt Nam. Kết nối nhà trường, phụ huynh và
                            y tế để đảm bảo sự phát triển khỏe mạnh cho học
                            sinh.
                        </p>

                        {/* Hero Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto animate-fade-in-up animate-delay-800">
                            {heroFeatures.map((feature, index) => (
                                <div key={index} className="group">
                                    <div
                                        className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-r ${
                                            feature.color
                                        } flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-bounce-in animate-delay-${
                                            900 + index * 100
                                        }`}
                                    >
                                        <feature.icon
                                            size={24}
                                            className="text-white"
                                        />
                                    </div>
                                    <p className="text-base font-medium opacity-90 group-hover:opacity-100 transition-opacity text-white drop-shadow">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-up animate-delay-1000">
                            <button
                                className="group bg-white text-[#36ae9a] font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg transform hover:scale-105 flex items-center gap-3 btn-primary animate-bounce-in animate-delay-1100 border-2 border-[#36ae9a]"
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in-up animate-delay-1300">
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
                                    <div className="text-2xl md:text-3xl font-bold mb-1 counter text-white drop-shadow">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm opacity-90 text-white drop-shadow">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust indicators */}
                        <div className="border-t border-white/20 animate-fade-in-up animate-delay-1500">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Được tin tưởng bởi
                                </h3>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-base opacity-90">
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
                                    <span>Được tin tưởng bởi nhiều trường</span>
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
                    <div className="absolute top-1/4 right-40 hidden lg:block z-40">
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

                    <div className="absolute bottom-1/4 left-60 hidden lg:block z-40">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float delay-200">
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
                            <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-md tracking-wide uppercase animate-fade-in-up animate-delay-200">
                                <FaAward className="text-[#36ae9a] text-lg" />
                                <span>Lý do chọn chúng tôi</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight animate-fade-in-up animate-delay-300">
                                Tại sao chọn{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5]">
                                    hệ thống của chúng tôi?
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-fade-in-up animate-delay-400">
                                Hệ thống được thiết kế đặc biệt cho môi trường
                                giáo dục tiểu học Việt Nam, đáp ứng đầy đủ các
                                yêu cầu và quy định của Bộ Giáo dục.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <WhyChooseCard
                                icon={FaShieldAlt}
                                color="from-blue-500 to-cyan-400"
                                title="An toàn & Bảo mật"
                                desc="Tuân thủ nghiêm ngặt quy định bảo vệ dữ liệu cá nhân học sinh theo Luật An ninh mạng Việt Nam."
                                features={[
                                    "Mã hóa dữ liệu",
                                    "Kiểm soát truy cập",
                                    "Backup tự động",
                                ]}
                                delay={0}
                            />
                            <WhyChooseCard
                                icon={FaRocket}
                                color="from-green-500 to-emerald-400"
                                title="Dễ sử dụng"
                                desc="Giao diện thân thiện, dễ dàng sử dụng cho mọi đối tượng từ giáo viên đến phụ huynh."
                                features={[
                                    "Giao diện đơn giản",
                                    "Hướng dẫn chi tiết",
                                    "Hỗ trợ 24/7",
                                ]}
                                delay={100}
                            />
                            <WhyChooseCard
                                icon={FaChartLine}
                                color="from-purple-500 to-pink-400"
                                title="Hiệu quả cao"
                                desc="Tối ưu hóa quy trình y tế học đường, tiết kiệm thời gian và nâng cao chất lượng chăm sóc."
                                features={[
                                    "Quy trình tối ưu",
                                    "Báo cáo tự động",
                                    "Phân tích dữ liệu",
                                ]}
                                delay={200}
                            />
                        </div>
                    </div>
                </section>

                {/* Enhanced Benefits Section */}
                <section
                    id="features"
                    className="py-24 bg-white animate-fade-in-up animate-delay-400"
                >
                    <div className="max-w-6xl mx-auto px-5">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-md tracking-wide uppercase animate-fade-in-up animate-delay-200">
                                <FaCheckCircle className="text-[#36ae9a] text-lg" />
                                <span>Tính năng nổi bật</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight animate-fade-in-up animate-delay-300">
                                Quản lý y tế học đường{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5]">
                                    toàn diện
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-fade-in-up animate-delay-400">
                                Hệ thống được thiết kế đặc biệt cho trường tiểu
                                học Việt Nam, hỗ trợ đầy đủ các hoạt động y tế
                                học đường theo quy định của Bộ Giáo dục.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            <BenefitCard
                                icon={FaHeartbeat}
                                color="from-red-500 to-pink-400"
                                title="Khám sức khỏe định kỳ"
                                desc="Quản lý lịch khám sức khỏe, theo dõi chiều cao, cân nặng và các chỉ số sức khỏe của học sinh."
                                delay={0}
                            />
                            <BenefitCard
                                icon={FaBell}
                                color="from-yellow-400 to-orange-400"
                                title="Thông báo tiêm chủng"
                                desc="Nhắc nhở lịch tiêm chủng, quản lý sổ tiêm chủng và theo dõi tình trạng tiêm chủng của học sinh."
                                delay={100}
                            />
                            <BenefitCard
                                icon={FaPills}
                                color="from-green-500 to-teal-400"
                                title="Gửi thuốc cho trường"
                                desc="Quản lý đơn thuốc, theo dõi việc gửi thuốc và đảm bảo học sinh uống thuốc đúng liều lượng."
                                delay={200}
                            />
                            <BenefitCard
                                icon={FaUserFriends}
                                color="from-blue-500 to-purple-400"
                                title="Kết nối phụ huynh"
                                desc="Tăng cường liên lạc giữa nhà trường và phụ huynh trong việc chăm sóc sức khỏe học sinh."
                                delay={300}
                            />
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

function BenefitCard({ icon: Icon, color, title, desc, delay }) {
    return (
        <div
            className={`group bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 card-hover animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className={`w-20 h-20 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
            >
                <Icon size={36} className="text-white" />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-gray-800 group-hover:text-[#36ae9a] transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-base">{desc}</p>
        </div>
    );
}

function StatCard({ icon: Icon, number, label, delay }) {
    return (
        <div
            className={`text-center group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon size={36} className="text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold mb-2 group-hover:scale-110 transition-transform duration-300 text-[#36ae9a]">
                {number}
            </div>
            <div className="text-lg opacity-90 font-medium">{label}</div>
        </div>
    );
}

function WhyChooseCard({ icon: Icon, color, title, desc, features, delay }) {
    return (
        <div
            className={`group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 card-hover animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className={`w-20 h-20 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
            >
                <Icon size={36} className="text-white" />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-gray-800 group-hover:text-[#36ae9a] transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-base">
                {desc}
            </p>
            <ul className="space-y-2">
                {features.map((feature, idx) => (
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
    );
}
