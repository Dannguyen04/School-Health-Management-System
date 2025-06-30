const About = () => {
    return (
        <div className="min-h-[60vh] flex flex-col lg:flex-row justify-between items-center lg:px-32 px-5 py-16 gap-10 bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2]">
            <div className="w-full lg:w-1/2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-[#36ae9a] mb-4 text-center lg:text-left">
                    Giới thiệu
                </h2>
                <p className="text-gray-700 text-lg text-justify lg:text-left">
                    Sức Khỏe Học Đường là dự án chăm sóc sức khỏe toàn diện cho
                    học sinh, giáo viên và phụ huynh.
                </p>
                <p className="text-gray-700 text-lg text-justify lg:text-left">
                    Chúng tôi cung cấp các dịch vụ khám sức khỏe định kỳ, tư vấn
                    dinh dưỡng, tiêm chủng, hỗ trợ tâm lý và nhiều hoạt động
                    nâng cao sức khỏe khác.
                </p>
                <p className="text-gray-700 text-lg text-justify lg:text-left">
                    Đội ngũ y tế chuyên nghiệp, tận tâm luôn đồng hành cùng nhà
                    trường và gia đình để xây dựng môi trường học tập an toàn,
                    lành mạnh.
                </p>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
                <img
                    className="rounded-xl shadow-lg max-w-xs w-full"
                    src="/img/about.jpg"
                    alt="Giới thiệu"
                />
            </div>
        </div>
    );
};

export default About;
