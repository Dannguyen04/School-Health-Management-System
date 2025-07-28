import { useLocation, useNavigate } from "react-router-dom";
import {
    FaHeartbeat,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaChild,
    FaGraduationCap,
} from "react-icons/fa";

const contactInfo = [
    {
        icon: FaMapMarkerAlt,
        text: "Trường Tiểu học ABC, Quận 1, TP.HCM",
        link: "#",
    },
    {
        icon: FaEnvelope,
        text: "yte@truongtieuhochoc.edu.vn",
        link: "mailto:yte@truongtieuhochoc.edu.vn",
    },
    {
        icon: FaPhone,
        text: "028 1234 5678",
        link: "tel:02812345678",
    },
];

const quickLinks = [
    { name: "Giới thiệu", href: "#about" },
    { name: "Blog sức khỏe", href: "#blog" },
    { name: "Dịch vụ y tế", href: "#services" },
    { name: "Liên hệ", href: "#contact" },
];

const services = [
    "Khám sức khỏe định kỳ",
    "Quản lý tiêm chủng",
    "Gửi thuốc cho trường học",
    "Quản lý hồ sơ sức khỏe",
    "Thông báo y tế học đường",
];

const Footer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isLandingPage = location.pathname === "/parent";

    const handleNav = (section) => {
        if (isLandingPage) {
            document
                .getElementById(section)
                ?.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/parent", { state: { scrollTo: section } });
        }
    };

    const handleParentNav = (path) => {
        navigate(`/parent/${path}`);
    };

    return (
        <footer className="w-full bg-gradient-to-br from-[#36ae9a] via-[#4fd1c5] to-[#81e6d9] text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <img
                                    src="/img/logo.png"
                                    alt="School Health Logo"
                                    className="w-12 h-12 object-contain"
                                />
                                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">
                                    Hệ thống Quản lý Y tế Trường Tiểu học
                                </h3>
                                <p className="text-sm opacity-90">
                                    Chăm sóc sức khỏe học sinh tiểu học
                                </p>
                            </div>
                        </div>
                        <p className="text-lg mb-6 leading-relaxed opacity-90">
                            Hệ thống quản lý y tế học đường toàn diện cho trường
                            tiểu học Việt Nam. Kết nối nhà trường, phụ huynh và
                            y tế để đảm bảo sự phát triển khỏe mạnh cho học sinh
                            tiểu học.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xl font-bold mb-6">
                            Liên kết nhanh
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-white/90 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (link.href.startsWith("#")) {
                                                document
                                                    .getElementById(
                                                        link.href.substring(1)
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: "smooth",
                                                    });
                                            }
                                        }}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-xl font-bold mb-6">Dịch vụ y tế</h4>
                        <ul className="space-y-3">
                            {services.map((service, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <FaChild className="text-sm opacity-70" />
                                    <span className="text-white/90">
                                        {service}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-12 pt-8 border-t border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactInfo.map((info, index) => (
                            <a
                                key={index}
                                href={info.link}
                                className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300 group"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <info.icon className="text-white" />
                                </div>
                                <span className="text-white/90 group-hover:text-white transition-colors">
                                    {info.text}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#2d8a7a] py-6">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-white/90">
                                © 2024 Hệ thống Quản lý Y tế Trường Tiểu học.
                                Tất cả quyền được bảo lưu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
