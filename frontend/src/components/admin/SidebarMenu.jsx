import {
  BarChartOutlined,
  BellOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarTitle = () => (
  <div style={{ padding: "32px 0 24px 32px" }}>
    <span
      style={{
        fontWeight: 700,
        fontSize: 24,
        color: "#fff",
        fontFamily: "inherit",
        letterSpacing: 1,
      }}
    >
      School Health System
    </span>
  </div>
);

const SidebarMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/students",
      icon: <TeamOutlined />,
      label: "Student Records",
    },
    {
      key: "/admin/medical-events",
      icon: <BellOutlined />,
      label: "Medical Events",
    },
    {
      key: "/admin/vaccinations",
      icon: <MedicineBoxOutlined />,
      label: "Vaccinations",
    },
    {
      key: "/admin/reports",
      icon: <BarChartOutlined />,
      label: "Reports & Statistics",
    },
    {
      key: "/admin/medical-supplies",
      icon: <MedicineBoxOutlined />,
      label: "Medical Supplies",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(e.key);
    }
  };

  return (
    <>
      <SidebarTitle />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ height: "100%" }}
        onClick={handleMenuClick}
      />
    </>
  );
};

export default SidebarMenu;
