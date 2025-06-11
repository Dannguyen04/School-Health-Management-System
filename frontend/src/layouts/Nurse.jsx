import { BellOutlined } from "@ant-design/icons";
import { Button, Input, Layout, Space } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Search } = Input;

const Nurse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/nurse",
      label: "Tổng quan",
      icon: "📊",
    },
    {
      key: "/nurse/medical-campaigns",
      label: "💉 Quản lý Chiến dịch Y tế",
    },
    {
      key: "/nurse/medical-records",
      label: "🧾 Hồ sơ Y tế",
    },
    {
      key: "/nurse/medicine-management",
      label: "💊 Quản lý Thuốc",
    },
    {
      key: "/nurse/parent-tasks",
      label: "📤 Tác vụ với Phụ huynh",
    },
    {
      key: "/nurse/notifications",
      label: "🔔 Thông báo",
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard Y Tế Học Đường</h1>
          <Space>
            <Search placeholder="Tìm kiếm..." className="w-64" />
            <Button type="primary" icon={<BellOutlined />}>
              Thông báo
            </Button>
          </Space>
        </div>
      </Header>

      <Content className="p-6">
        <div className="flex gap-4">
          <div className="w-64 bg-white p-4 rounded-lg shadow">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.key
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 bg-white p-6 rounded-lg shadow">
            <Outlet />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Nurse;
