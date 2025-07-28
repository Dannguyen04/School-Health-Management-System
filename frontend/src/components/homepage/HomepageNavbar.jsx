import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    FaBars,
    FaTimes,
    FaHeartbeat,
    FaChild,
    FaStethoscope,
    FaPills,
    FaBell,
    FaUsers,
} from "react-icons/fa";

const HomepageNavbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToSection = (sectionId) => {
        document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer gap-3 group"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    >
                        <div className="relative">
                            <img
                                src="/img/logo.png"
                                alt="School Health Logo"
                                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-[#36ae9a]/20 rounded-full group-hover:bg-[#36ae9a]/30 transition-colors duration-300"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 group-hover:text-[#36ae9a] transition-colors duration-300">
                                Quản lý y tế học đường
                            </h1>
                            <p className="text-xs text-gray-500">
                                Hệ thống quản lý y tế học đường
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <a
                            href="#features"
                            className="text-gray-700 hover:text-[#36ae9a] transition-colors duration-300 font-medium flex items-center gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("features");
                            }}
                        >
                            <FaStethoscope className="text-sm" />
                            Tính năng
                        </a>
                        <a
                            href="#about"
                            className="text-gray-700 hover:text-[#36ae9a] transition-colors duration-300 font-medium flex items-center gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("about");
                            }}
                        >
                            <FaUsers className="text-sm" />
                            Giới thiệu
                        </a>
                        <a
                            href="#blog"
                            className="text-gray-700 hover:text-[#36ae9a] transition-colors duration-300 font-medium flex items-center gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("blog");
                            }}
                        >
                            <FaBell className="text-sm" />
                            Blog sức khỏe
                        </a>
                        <button
                            className="bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                            onClick={() => navigate("/auth")}
                        >
                            <FaChild className="text-sm" />
                            Đăng nhập
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-[#36ae9a] transition-colors duration-300 p-2"
                        >
                            {isMenuOpen ? (
                                <FaTimes size={24} />
                            ) : (
                                <FaBars size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg border border-gray-100">
                            <a
                                href="#features"
                                className="block px-3 py-2 text-gray-700 hover:text-[#36ae9a] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium flex items-center gap-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMenuOpen(false);
                                    scrollToSection("features");
                                }}
                            >
                                <FaStethoscope className="text-sm" />
                                Tính năng
                            </a>
                            <a
                                href="#about"
                                className="block px-3 py-2 text-gray-700 hover:text-[#36ae9a] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium flex items-center gap-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMenuOpen(false);
                                    scrollToSection("about");
                                }}
                            >
                                <FaUsers className="text-sm" />
                                Giới thiệu
                            </a>
                            <a
                                href="#blog"
                                className="block px-3 py-2 text-gray-700 hover:text-[#36ae9a] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium flex items-center gap-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMenuOpen(false);
                                    scrollToSection("blog");
                                }}
                            >
                                <FaBell className="text-sm" />
                                Blog sức khỏe
                            </a>
                            <button
                                className="w-full text-left px-3 py-2 bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mt-2"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate("/auth");
                                }}
                            >
                                <FaChild className="text-sm" />
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default HomepageNavbar;
