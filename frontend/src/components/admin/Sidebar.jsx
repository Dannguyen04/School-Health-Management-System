import {
  DashboardOutlined,
  FormOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

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

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    navigate(key);
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

export default Sidebar;
