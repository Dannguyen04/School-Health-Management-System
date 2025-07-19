import {
    FaHeartbeat,
    FaUsers,
    FaShieldAlt,
    FaChartLine,
    FaChild,
    FaGraduationCap,
    FaPills,
} from "react-icons/fa";

const About = () => {
    const features = [
        {
            icon: FaHeartbeat,
            title: "Khám sức khỏe định kỳ",
            description:
                "Thực hiện khám sức khỏe theo quy định của Bộ Giáo dục, theo dõi chiều cao, cân nặng và các chỉ số sức khỏe",
        },
        {
            icon: FaChild,
            title: "Quản lý tiêm chủng",
            description:
                "Theo dõi lịch tiêm chủng và quản lý sổ tiêm chủng của học sinh tiểu học",
        },
        {
            icon: FaPills,
            title: "Gửi thuốc cho trường",
            description:
                "Quản lý đơn thuốc và đảm bảo học sinh uống thuốc đúng liều lượng theo chỉ định",
        },
        {
            icon: FaChartLine,
            title: "Theo dõi liên tục",
            description:
                "Giám sát sức khỏe và phát hiện sớm các vấn đề sức khỏe của học sinh",
        },
    ];

    return (
        <div className="min-h-[80vh] bg-gradient-to-br from-white to-[#f6fcfa] py-20">
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-3 rounded-full text-sm font-medium">
                                <FaHeartbeat className="text-[#36ae9a]" />
                                <span>Về hệ thống</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] leading-tight">
                                Hệ thống Quản lý Y tế Trường Tiểu học
                            </h2>

                            <p className="text-xl text-[#36ae9a] font-semibold">
                                Chăm sóc sức khỏe học sinh - Nền tảng tương lai
                            </p>

                            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                                <p>
                                    Hệ thống Quản lý Y tế Trường Tiểu học được
                                    thiết kế đặc biệt cho các trường tiểu học
                                    Việt Nam, hỗ trợ đầy đủ các hoạt động y tế
                                    học đường theo quy định của Bộ Giáo dục và
                                    Đào tạo.
                                </p>
                                <p>
                                    Chúng tôi cung cấp các dịch vụ khám sức khỏe
                                    định kỳ, quản lý tiêm chủng, gửi thuốc cho
                                    trường học, theo dõi chiều cao cân nặng và
                                    nhiều hoạt động y tế học đường khác phù hợp
                                    với lứa tuổi học sinh tiểu học (6-11 tuổi).
                                </p>
                                <p>
                                    Đội ngũ y tế trường học chuyên nghiệp, tận
                                    tâm luôn đồng hành cùng nhà trường và gia
                                    đình để đảm bảo sự phát triển toàn diện cho
                                    học sinh tiểu học.
                                </p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon
                                            size={24}
                                            className="text-white"
                                        />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-[#36ae9a] transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                className="rounded-2xl shadow-2xl w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                                src="/img/about.jpg"
                                alt="Hệ thống Quản lý Y tế Trường Tiểu học"
                                style={{ aspectRatio: "4/3" }}
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-[#4fd1c5] to-[#36ae9a] rounded-full opacity-20 animate-pulse delay-1000"></div>

                        {/* Stats overlay */}
                        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] rounded-full flex items-center justify-center">
                                    <FaGraduationCap
                                        size={20}
                                        className="text-white"
                                    />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        800+
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Học sinh tiểu học
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
