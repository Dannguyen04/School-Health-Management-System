import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Space,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const { Header } = Layout;

const Headers = () => {
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
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={<MenuOutlined />}
          className="mr-4"
          onClick={() => {
            // Handle menu toggle
          }}
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm..."
          style={{ width: 300 }}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Badge>
          <Button
            type="text"
            icon={<BellOutlined />}
            className="flex items-center justify-center"
          />
        </Badge>

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span>{user?.fullName || "User"}</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Headers;
