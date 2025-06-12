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
  Menu,
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

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );
  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        height: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20 }} />}
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Input
          prefix={<SearchOutlined style={{ color: "#7b8191" }} />}
          placeholder="Search or type command..."
          style={{
            maxWidth: 420,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#f5f6fa",
          }}
          suffix={
            <span
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: "2px 10px",
                fontSize: 14,
                color: "#7b8191",
                border: "1px solid #e0e0e0",
              }}
            >
              ⌘ K
            </span>
          }
        />
      </div>
      <Space size={24}>
        <Badge dot offset={[-2, 2]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 20 }} />}
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Badge>
        <Space size={12}>
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span className="ml-2">{user?.fullName || "Admin"}</span>
            </div>
          </Dropdown>
        </Space>
      </Space>
    </Header>
  );
};

export default Headers;
