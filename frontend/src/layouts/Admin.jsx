import {
  DashboardOutlined,
  FormOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Headers from "../components/shared/Header";

const { Content, Sider } = Layout;

const menuItems = [
  {
    key: "/admin",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/admin/users",
    icon: <UserOutlined />,
    label: "User Management",
  },
  {
    key: "/admin/students",
    icon: <TeamOutlined />,
    label: "Student Management",
  },
  {
    key: "/admin/consent-forms",
    icon: <FormOutlined />,
    label: "Consent Forms",
  },
  {
    key: "/admin/medication-info",
    icon: <MedicineBoxOutlined />,
    label: "Medication Info",
  },
];

const AdminLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        className="bg-blue-900 shadow-md fixed h-screen"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div className="h-16 flex items-center justify-center">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="bg-blue-900"
        />
      </Sider>
      <Layout className="ml-[200px] flex flex-col flex-1">
        <Headers />
        <Content className="flex-1">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              height: "100%",
            }}
            className="flex-1"
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
