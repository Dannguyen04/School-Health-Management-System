import {
  BarChartOutlined,
  CalendarOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/nurse",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/nurse/campaigns",
    icon: <CalendarOutlined />,
    label: "Campaigns",
  },
  {
    key: "/nurse/medical-inventory",
    icon: <MedicineBoxOutlined />,
    label: "Medical Inventory",
  },
  {
    key: "/nurse/student-treatment",
    icon: <TeamOutlined />,
    label: "Student Treatment",
  },
  {
    key: "/nurse/vaccination",
    icon: <ExperimentOutlined />,
    label: "Vaccination",
  },
  {
    key: "/nurse/health-checkups",
    icon: <UserOutlined />,
    label: "Health Checkups",
  },
  {
    key: "/nurse/confirmed-medicines",
    icon: <MedicineBoxOutlined />,
    label: "Confirmed Medicines",
  },
  {
    key: "/nurse/reports",
    icon: <BarChartOutlined />,
    label: "Reports",
  },
];

const SidebarMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(key);
    }
  };

  return (
    <Sider className="bg-blue-900 shadow-md h-screen">
      <div className="h-16 flex items-center justify-center">
        <h1 className="text-xl font-bold text-white">School Health</h1>
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
  );
};

export default SidebarMenu;
