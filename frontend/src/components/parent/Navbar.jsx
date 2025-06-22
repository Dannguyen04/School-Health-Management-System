import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/user";

  const handleNav = (section) => {
    if (isLandingPage) {
      // Scroll tới section
      setMenu(false);
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Về landing page và truyền state
      navigate("/user", { state: { scrollTo: section } });
    }
  };

  const handleLogout = () => {
    navigate("/auth");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      onClick: () => navigate("/user/profile"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <div className=" fixed w-full z-50 text-white">
      <div>
        <div className=" flex flex-row justify-between p-5 md:px-32 px-5 bg-[#36ae9a] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
          <div className=" flex flex-row items-center cursor-pointer">
            <span onClick={() => handleNav("home")}>
              <h1 className=" text-2xl font-semibold">Sức Khỏe Học Đường</h1>
            </span>
          </div>
          <nav className=" hidden lg:flex flex-row items-center text-lg font-medium gap-8">
            <Link to="/user/home" className="hover:text-brightColor transition-all cursor-pointer">Trang chủ</Link>
            <Link to="/user/about" className="hover:text-brightColor transition-all cursor-pointer">Về chúng tôi</Link>
            <Link to="/user/services" className="hover:text-brightColor transition-all cursor-pointer">Dịch vụ</Link>
            <Link to="/user/doctors" className="hover:text-brightColor transition-all cursor-pointer">Đội ngũ bác sĩ</Link>
            <Link to="/user/blog" className="hover:text-brightColor transition-all cursor-pointer">Tin tức</Link>
            <Link to="/user/my-children" className="hover:text-brightColor transition-all cursor-pointer">Các con của tôi</Link>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
            </Dropdown>
          </nav>
        </div>
        <div
          className={`${
            menu ? "translate-x-0" : "-translate-x-full"
          } lg:hidden flex flex-col absolute bg-backgroundColor text-white left-0 top-16 font-semibold text-2xl text-center pt-8 pb-4 gap-8 w-full h-fit transition-transform duration-300`}
        >
          <Link to="/user/home" className="hover:text-brightColor transition-all cursor-pointer">Trang chủ</Link>
          <Link to="/user/about" className="hover:text-brightColor transition-all cursor-pointer">Về chúng tôi</Link>
          <Link to="/user/services" className="hover:text-brightColor transition-all cursor-pointer">Dịch vụ</Link>
          <Link to="/user/doctors" className="hover:text-brightColor transition-all cursor-pointer">Đội ngũ bác sĩ</Link>
          <Link to="/user/blog" className="hover:text-brightColor transition-all cursor-pointer">Tin tức</Link>
          <Link to="/user/my-children" className="hover:text-brightColor transition-all cursor-pointer">Các con của tôi</Link>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
