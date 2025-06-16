import {
  AlertOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Headers from "../components/shared/Header";

const { Content, Sider } = Layout;

const menuItems = [
  {
    key: "/manager",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/manager/students",
    icon: <TeamOutlined />,
    label: "Student Lists",
  },
  {
    key: "/manager/health-reports",
    icon: <FileTextOutlined />,
    label: "Health Reports",
  },
  {
    key: "/manager/vaccination-campaigns",
    icon: <MedicineBoxOutlined />,
    label: "Vaccination Campaigns",
  },
  {
    key: "/manager/health-checkup-campaigns",
    icon: <MedicineBoxOutlined />,
    label: "Health Checkup Campaigns",
  },
  {
    key: "/manager/alerts-events",
    icon: <AlertOutlined />,
    label: "Alerts & Events",
  },
];

const ManagerLayout = () => {
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
          <h1 className="text-xl font-bold text-white">Manager Dashboard</h1>
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

export default ManagerLayout;
