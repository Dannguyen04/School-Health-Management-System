const About = () => {
    return (
        <div className="min-h-[60vh] flex flex-col lg:flex-row justify-between items-center lg:px-32 px-5 py-16 gap-10 bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2]">
            <div className="w-full lg:w-1/2 space-y-6 flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] mb-2 text-center lg:text-left">
                    Giới thiệu Sức Khỏe Học Đường
                </h2>
                <p className="text-lg text-[#36ae9a] font-semibold text-center lg:text-left mb-2">
                    Nâng tầm sức khỏe - Vững bước tương lai
                </p>
                <p className="text-gray-700 text-lg leading-relaxed text-justify lg:text-left">
                    Sức Khỏe Học Đường là dự án chăm sóc sức khỏe toàn diện cho
                    học sinh, giáo viên và phụ huynh.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed text-justify lg:text-left">
                    Chúng tôi cung cấp các dịch vụ khám sức khỏe định kỳ, tư vấn
                    dinh dưỡng, tiêm chủng, hỗ trợ tâm lý và nhiều hoạt động
                    nâng cao sức khỏe khác.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed text-justify lg:text-left">
                    Đội ngũ y tế chuyên nghiệp, tận tâm luôn đồng hành cùng nhà
                    trường và gia đình để xây dựng môi trường học tập an toàn,
                    lành mạnh.
                </p>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center items-center">
                <img
                    className="rounded-full border-4 border-[#36ae9a] shadow-2xl max-w-lg w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                    src="/img/about.jpg"
                    alt="Giới thiệu"
                />
            </div>
        </div>
    );
};

export default About;
