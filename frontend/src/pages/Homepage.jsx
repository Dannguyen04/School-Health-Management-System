import { Link } from "react-router-dom";
import Students from "../assets/students.svg";

const Homepage = () => {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-center">
      <div className="flex flex-col md:flex-row w-full h-screen">
        <div className="flex-1 flex items-center justify-center bg-white">
          <img
            src={Students}
            alt="students"
            className="w-full max-w-[700px] object-contain"
          />
        </div>
        <div className="flex-1 flex items-start justify-center bg-white">
          <div className="w-full max-w-xl px-6 md:px-12 py-10 flex flex-col items-start">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-left leading-tight">
              Hệ Thống Quản Lý
              <br />Y Tế Trường Học
            </h1>
            <p className="text-gray-700 text-left md:text-lg mb-8 max-w-md">
              Tối ưu hóa quản lý y tế trường học bằng cách tổ chức hồ sơ y tế
              học sinh, theo dõi khám sức khỏe, và quản lý lịch trình của bác sĩ
              và y tá. Giám sát liền mạch tình trạng sức khỏe học sinh, hồ sơ
              tiêm chủng, và các bệnh mãn tính.
            </p>
            <div className="w-full flex justify-center mb-4">
              <Link to="/auth">
                <button className="py-3 px-8 rounded-md bg-purple-600 hover:bg-purple-800 text-white font-bold text-lg transition-colors">
                  ĐĂNG NHẬP
                </button>
              </Link>
            </div>
            <div className="w-full text-center mt-2">
              <span className="text-gray-700 text-base">
                Chưa có tài khoản?{" "}
              </span>
              <Link
                to="/auth"
                className="text-purple-700 font-semibold hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
