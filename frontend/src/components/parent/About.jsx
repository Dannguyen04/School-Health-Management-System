import {
    FaHeartbeat,
    FaChild,
    FaPills,
    FaChartLine,
    FaGraduationCap,
} from "react-icons/fa";

const About = () => {
    const features = [
        {
            icon: FaHeartbeat,
            title: "Khám sức khỏe định kỳ",
        },
        {
            icon: FaChild,
            title: "Quản lý tiêm chủng",
        },
        {
            icon: FaPills,
            title: "Gửi thuốc cho trường",
        },
        {
            icon: FaChartLine,
            title: "Theo dõi liên tục",
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-white to-[#f6fcfa]">
            <div className="max-w-6xl mx-auto px-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-md uppercase tracking-wide">
                            <FaHeartbeat className="text-[#36ae9a] text-lg" />
                            <span>Về hệ thống</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight mb-2">
                            Hệ thống Y tế Trường Tiểu học
                        </h2>
                        <p className="text-lg text-[#36ae9a] font-semibold mb-4">
                            Chăm sóc sức khỏe học sinh - Nền tảng tương lai
                        </p>
                        <p className="text-gray-700 text-base leading-relaxed mb-6">
                            Nền tảng quản lý y tế học đường toàn diện, kết nối
                            nhà trường, phụ huynh và y tế để đảm bảo sự phát
                            triển khỏe mạnh cho học sinh tiểu học Việt Nam.
                        </p>
                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow">
                                        <feature.icon
                                            size={24}
                                            className="text-white"
                                        />
                                    </div>
                                    <div className="font-semibold text-gray-800 text-center text-base group-hover:text-[#36ae9a] transition-colors">
                                        {feature.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Image */}
                    <div className="relative flex justify-center items-center">
                        <img
                            className="rounded-2xl shadow-2xl w-full max-w-md object-cover object-center transition-transform duration-500 hover:scale-105"
                            src="/img/about.jpg"
                            alt="Hệ thống Quản lý Y tế Trường Tiểu học"
                            style={{ aspectRatio: "4/3" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
