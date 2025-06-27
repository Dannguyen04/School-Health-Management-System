import { useNavigate } from "react-router-dom";

const HomepageNavbar = () => {
  const navigate = useNavigate();

  // Scroll tới section trên homepage
  const handleNav = (section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 text-white">
      <div className="flex flex-row justify-between p-5 md:px-32 px-5 bg-[#36ae9a] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
        <div className="flex flex-row items-center cursor-pointer">
          <span onClick={() => handleNav("home")}>
            <h1 className="text-2xl font-semibold">Sức Khỏe Học Đường</h1>
          </span>
        </div>
        <nav className="flex flex-row items-center text-lg font-medium gap-5 whitespace-nowrap">
          <span
            className="hover:text-[#FFC000] transition-all cursor-pointer whitespace-nowrap"
            onClick={() => handleNav("home")}
          >
            Trang chủ
          </span>
          <span
            className="hover:text-[#FFC000] transition-all cursor-pointer whitespace-nowrap"
            onClick={() => handleNav("about")}
          >
            Giới thiệu
          </span>
          <span
            className="hover:text-[#FFC000] transition-all cursor-pointer whitespace-nowrap"
            onClick={() => handleNav("services")}
          >
            Dịch vụ
          </span>
          <span
            className="hover:text-[#FFC000] transition-all cursor-pointer whitespace-nowrap"
            onClick={() => handleNav("blog")}
          >
            Tin tức
          </span>
          <button
            className="ml-4 py-2 px-6 rounded-md bg-white text-[#36ae9a] font-semibold text-base transition-colors hover:bg-[#ade9dc]"
            onClick={() => navigate("/auth")}
          >
            Đăng nhập
          </button>
        </nav>
      </div>
    </div>
  );
};

export default HomepageNavbar;
