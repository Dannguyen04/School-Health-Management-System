import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space, message } from "antd";
import { ChevronsLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { useAuth } from "../context/authContext";

export const Header = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Logged out successfully");
      navigate("/auth");
    } catch {
      message.error("Failed to logout");
    }
  };

  const handleProfileClick = () => {
    // Navigate to profile based on user role
    if (user?.role === "ADMIN") {
      navigate("/admin/profile");
    } else if (user?.role === "SCHOOL_NURSE") {
      navigate("/nurse/profile");
    } else if (user?.role === "MANAGER") {
      navigate("/manager/profile");
    } else if (user?.role === "PARENT") {
      navigate("/user/profile");
    }
  };
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: handleProfileClick,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md border-b border-slate-200 text-slate-900">
      <div className="flex items-center gap-x-3">
        <button
          className="btn-ghost size-10"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronsLeft className={collapsed && "rotate-180"} />
        </button>
      </div>
      <div className="flex items-center gap-x-3">
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span>{user?.fullName || "User"}</span>
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};
