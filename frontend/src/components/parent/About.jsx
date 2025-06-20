const About = () => {
  return (
    <div className=" min-h-screen flex flex-col lg:flex-row justify-between items-center lg:px-32 px-5 pt-24 lg:pt-16 gap-5">
      <div className=" w-full lg:w-3/4 space-y-4">
        <h1 className=" text-4xl font-semibold text-center lg:text-start">
          Giới thiệu
        </h1>
        <p className=" text-justify lg:text-start">
          Sức Khỏe Học Đường là dự án chăm sóc sức khỏe toàn diện cho học sinh,
          giáo viên và phụ huynh.
        </p>
        <p className="text-justify lg:text-start">
          Chúng tôi cung cấp các dịch vụ khám sức khỏe định kỳ, tư vấn dinh
          dưỡng, tiêm chủng, hỗ trợ tâm lý và nhiều hoạt động nâng cao sức khỏe
          khác.
        </p>
        <p className="text-justify lg:text-start">
          Đội ngũ y tế chuyên nghiệp, tận tâm luôn đồng hành cùng nhà trường và
          gia đình để xây dựng môi trường học tập an toàn, lành mạnh.
        </p>
      </div>
      <div className=" w-full lg:w-3/4">
        <img className=" rounded-lg" src="/img/about.jpg" alt="img" />
      </div>
    </div>
  );
};

export default About;
