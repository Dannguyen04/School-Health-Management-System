import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/user";

  const handleNav = (section) => {
    if (isLandingPage) {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/user", { state: { scrollTo: section } });
    }
  };

  return (
    <div className=" bg-[#36ae9a] text-white rounded-t-3xl mt-8 md:mt-0">
      <div className="flex flex-col md:flex-row justify-between p-8 md:px-32 px-5">
        <div className=" w-full md:w-1/4">
          <h1 className=" font-semibold text-xl pb-4">Sức Khỏe Học Đường</h1>
          <p className=" text-sm">
            Đội ngũ bác sĩ tận tâm của chúng tôi, mỗi người đều chuyên sâu trong
            các lĩnh vực như chỉnh hình, tim mạch, nhi khoa, thần kinh, da liễu
            và nhiều chuyên ngành khác.
          </p>
        </div>
        <div>
          <h1 className=" font-medium text-xl pb-4 pt-5 md:pt-0">Giới thiệu</h1>
          <nav className=" flex flex-col gap-2">
            <span
              className=" hover:text-[#FFC000] transition-all cursor-pointer"
              onClick={() => handleNav("about")}
            >
              Về chúng tôi
            </span>
            <span
              className=" hover:text-[#FFC000] transition-all cursor-pointer"
              onClick={() => handleNav("services")}
            >
              Dịch vụ
            </span>
            <span
              className=" hover:text-[#FFC000] transition-all cursor-pointer"
              onClick={() => handleNav("doctors")}
            >
              Đội ngũ bác sĩ
            </span>
          </nav>
        </div>
        <div>
          <h1 className=" font-medium text-xl pb-4 pt-5 md:pt-0">Dịch vụ</h1>
          <nav className=" flex flex-col gap-2">
            <span
              className=" hover:text-[#FFC000] transition-all cursor-pointer"
              onClick={() => handleNav("services")}
            >
              Lịch tiêm & khám
            </span>
            <span
              className=" hover:text-[#FFC000] transition-all cursor-pointer"
              onClick={() => handleNav("services")}
            >
              Hồ sơ sức khỏe
            </span>
            <span
              className=" hover:text-[#FFC000] transition-all cursor-pointer"
              onClick={() => handleNav("services")}
            >
              Gửi thuốc
            </span>
          </nav>
        </div>
        <div className=" w-full md:w-1/4">
          <h1 className=" font-medium text-xl pb-4 pt-5 md:pt-0">Liên hệ</h1>
          <nav className=" flex flex-col gap-2">
            <span>Trường THCS/THPT ABC, Quận XYZ, TP. HCM</span>
            <span>hotro@suckhoehocduong.vn</span>
            <span>0123-456-789</span>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Footer;
